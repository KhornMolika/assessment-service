import { getAccessToken } from "@/src/lib/session";

const API_URL = process.env.API_URL || "http://localhost:3001/api/v1";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await getAccessToken();
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!headers.has("Content-Type") && options.method && options.method !== "GET" && options.method !== "DELETE") {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  if (res.status === 204) return null;
  return res.json();
}
