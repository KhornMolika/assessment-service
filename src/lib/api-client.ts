const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const CLIENT_ID = process.env.API_CLIENT_ID;
const CLIENT_SECRET = process.env.API_CLIENT_SECRET;

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Authenticates with the backend using the client_credentials grant
 * and caches the token in memory.
 */
async function authenticate(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('API_CLIENT_ID and API_CLIENT_SECRET are required in environment variables');
  }

  const response = await fetch(`${API_URL}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to authenticate: ${response.statusText}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  // Subtracting 10 seconds for safety buffer
  tokenExpiresAt = Date.now() + (data.expires_in - 10) * 1000;

  return cachedToken as string;
}

/**
 * Wrapper for native fetch that automatically injects the Bearer token.
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await authenticate();
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  
  if (!headers.has('Content-Type') && options.method !== 'GET' && options.method !== 'DELETE') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Request failed: [${response.status}] ${response.statusText}`);
  }

  if (response.status === 204) {
    return null as any;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) => apiFetch<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: any, options?: RequestInit) => apiFetch<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: any, options?: RequestInit) => apiFetch<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: RequestInit) => apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
