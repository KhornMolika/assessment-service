const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const CLIENT_ID = process.env.API_CLIENT_ID;
const CLIENT_SECRET = process.env.API_CLIENT_SECRET;

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;
let tokenIssuedAt: number = 0;
let authPromise: Promise<string> | null = null;

/**
 * Authenticates with the backend using the client_credentials grant
 * and caches the token in memory.
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

  authPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          grant_type: 'client_credentials',
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to authenticate: ${response.statusText}`);
      }

      const responseBody = await response.json();
      
      // The backend wraps the response in a generic { success, data: { ... } } payload
      const payload = responseBody.data || responseBody;
      
      if (!payload || !payload.access_token) {
        throw new Error('Failed to parse access_token from authentication response');
      }

      cachedToken = payload.access_token;
      tokenIssuedAt = Date.now();
      // Subtracting 10 seconds for safety buffer
      tokenExpiresAt = Date.now() + ((payload.expires_in || 3600) - 10) * 1000;
      
      return cachedToken as string;
    } finally {
      authPromise = null;
    }
  })();

  return authPromise;
}

/**
 * Wrapper for native fetch that automatically injects the Bearer token.
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

  // If unauthorized AND the token is older than 5 seconds, it might have expired or been revoked.
  // If the token is fresh (< 5s old), it's a permissions/scopes issue on the backend, so don't retry.
  if (response.status === 401 && Date.now() - tokenIssuedAt > 5000) {
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
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) => apiFetch<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: unknown, options?: RequestInit) => apiFetch<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown, options?: RequestInit) => apiFetch<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: RequestInit) => apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
