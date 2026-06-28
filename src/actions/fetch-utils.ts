import { apiClient } from "@/src/lib/api-client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchWithAuth<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = options.method?.toUpperCase() || "GET";
  
  if (method === "GET") {
    return apiClient.get(endpoint, options);
  } else if (method === "POST") {
    // We assume body is a stringified JSON if it's a string, or parse it back
    // apiClient expects an object for body, but fetchWithAuth was receiving JSON.stringify(payload)
    const bodyObj = typeof options.body === "string" ? JSON.parse(options.body) : options.body;
    return apiClient.post(endpoint, bodyObj, options);
  } else if (method === "PATCH") {
    const bodyObj = typeof options.body === "string" ? JSON.parse(options.body) : options.body;
    return apiClient.patch(endpoint, bodyObj, options);
  } else if (method === "PUT") {
    const bodyObj = typeof options.body === "string" ? JSON.parse(options.body) : options.body;
    return apiClient.put(endpoint, bodyObj, options);
  } else if (method === "DELETE") {
    return apiClient.delete(endpoint, options);
  }
  
  throw new Error(`Unsupported method ${method} in fetchWithAuth`);
}
