import { fetchWithAuth } from "./fetchWithAuth";
import { API_CONFIG } from "./config";

const BASE_URL = API_CONFIG.BASE_URL;

export const apiClient = {
  get<T>(endpoint: string, accessToken?: string): Promise<T> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    return fetchWithAuth<T>(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });
  },

  post<T>(
    endpoint: string,
    body: unknown,
    accessToken?: string,
    isFormData = false,
  ): Promise<T> {
    const headers: HeadersInit = {};
    if (!isFormData) headers["Content-Type"] = "application/json";
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    return fetchWithAuth<T>(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: isFormData ? (body as BodyInit) : JSON.stringify(body),
    });
  },

  patch<T>(
    endpoint: string,
    body: unknown,
    accessToken?: string,
    isFormData = false,
  ): Promise<T> {
    const headers: HeadersInit = {};
    if (!isFormData) headers["Content-Type"] = "application/json";
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    return fetchWithAuth<T>(`${BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers,
      body: isFormData ? (body as BodyInit) : JSON.stringify(body),
    });
  },

  delete<T>(endpoint: string, accessToken?: string): Promise<T> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    return fetchWithAuth<T>(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });
  },
};
