const API_URL = process.env.API_URL;
const CLIENT_ID = process.env.API_CLIENT_ID;
const CLIENT_SECRET = process.env.API_CLIENT_SECRET;

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;
let authPromise: Promise<string> | null = null;

// Map to deduplicate concurrent identical GET requests
const requestCache = new Map<string, Promise<any>>();

import { unstable_noStore as noStore } from "next/cache";

/**
 * Authenticates with the backend using the client_credentials grant,
 * deduplicates concurrent requests, and caches the token in memory.
 */
export async function getAccessToken(): Promise<string> {
  if (cachedToken) {
    return cachedToken;
  }

  if (authPromise) {
    return authPromise;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      "API_CLIENT_ID and API_CLIENT_SECRET are required in environment variables",
    );
  }

  authPromise = fetch(`${API_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to authenticate: ${response.statusText}`);
      }
      const json = await response.json();
      cachedToken = json.data.access_token;
      return cachedToken as string;
    })
    .finally(() => {
      authPromise = null;
    });

  return authPromise;
}

/**
 * Wrapper for native fetch that automatically injects the Bearer token
 * and deduplicates concurrent identical GET requests to avoid 429 errors.
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const isGet = !options.method || options.method === "GET";
  const cacheKey = endpoint; // Safe because options rarely vary for the same endpoint in this app

  if (isGet && requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey) as Promise<T>;
  }

  const doFetch = async () => {
    let token = await getAccessToken();
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${token}`);

    if (
      !headers.has("Content-Type") &&
      options.method !== "GET" &&
      options.method !== "DELETE"
    ) {
      headers.set("Content-Type", "application/json");
    }

    let response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      cachedToken = null;
      tokenExpiresAt = 0;
      token = await getAccessToken();
      headers.set("Authorization", `Bearer ${token}`);

      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
    }

    if (!response.ok) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      try {
        const errBody = await response.json();
        const extractedMessage = errBody?.error?.message || errBody?.message;
        if (extractedMessage) {
          errorMessage = Array.isArray(extractedMessage) ? extractedMessage[0] : extractedMessage;
        }
      } catch (e) {
        // ignore parse error
      }
      
      console.error(`[${response.status}] ${response.statusText} at ${endpoint}: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return null as unknown as T;
    }

    return response.json() as Promise<T>;
  };

  const promise = doFetch();

  if (isGet) {
    requestCache.set(cacheKey, promise);
    promise
      .finally(() => {
        requestCache.delete(cacheKey);
      })
      .catch(() => {});
  }

  return promise;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),
  put: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),
  patch: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};
