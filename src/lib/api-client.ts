const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const CLIENT_ID = process.env.API_CLIENT_ID;
const CLIENT_SECRET = process.env.API_CLIENT_SECRET;

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;
let authPromise: Promise<string> | null = null;

// Map to deduplicate concurrent identical GET requests
const requestCache = new Map<string, Promise<any>>();

/**
 * Authenticates with the backend using the client_credentials grant,
 * deduplicates concurrent requests, and caches the token in memory.
 */
async function authenticate(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  if (authPromise) {
    return authPromise;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('API_CLIENT_ID and API_CLIENT_SECRET are required in environment variables');
  }

  authPromise = fetch(`${API_URL}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
    cache: 'no-store',
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to authenticate: ${response.statusText}`);
      }
      const data = await response.json();
      cachedToken = data.access_token;
      tokenExpiresAt = Date.now() + (data.expires_in - 10) * 1000;
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
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isGet = !options.method || options.method === 'GET';
  const cacheKey = endpoint; // Safe because options rarely vary for the same endpoint in this app

  if (isGet && requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey) as Promise<T>;
  }

  const doFetch = async () => {
    let token = await authenticate();
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    
    if (!headers.has('Content-Type') && options.method !== 'GET' && options.method !== 'DELETE') {
      headers.set('Content-Type', 'application/json');
    }

    let response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      cachedToken = null;
      tokenExpiresAt = 0;
      token = await authenticate();
      headers.set('Authorization', `Bearer ${token}`);
      
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
    }

    if (!response.ok) {
      throw new Error(`API Request failed: [${response.status}] ${response.statusText}`);
    }

    if (response.status === 204) {
      return null as unknown as T;
    }

    return response.json() as Promise<T>;
  };

  const promise = doFetch();

  if (isGet) {
    requestCache.set(cacheKey, promise);
    // Remove from cache shortly after completion to serve as a fast deduplication window
    promise.finally(() => {
      setTimeout(() => requestCache.delete(cacheKey), 2000); 
    }).catch(() => {}); // prevent unhandled rejection warning from the cloned promise
  }

  return promise;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) => apiFetch<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: unknown, options?: RequestInit) => apiFetch<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown, options?: RequestInit) => apiFetch<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: RequestInit) => apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
