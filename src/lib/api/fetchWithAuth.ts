import { DeviceEventEmitter } from "react-native";
import { API_CONFIG } from "./config";

export const TOKEN_REFRESHED_EVENT = "auth:token-refreshed";
const REFRESH_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}/refresh-token`;

let _accessToken: string | null = null;
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

export function setAccessTokenStore(token: string | null) {
  _accessToken = token;
}

async function refreshAccessToken(): Promise<string> {
  const response = await fetch(REFRESH_URL, {
    method: "POST",
    credentials: "include", // React Native natively handles HTTP-only cookies!
  });
  if (!response.ok) throw new Error("Session expired. Please login again.");
  const json = (await response.json()) as { data: { accessToken: string } };
  return json.data.accessToken;
}

export async function fetchWithAuth<T>(
  input: string,
  options: RequestInit,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (_accessToken && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${_accessToken}`;
  }

  const init: RequestInit = { ...options, headers, credentials: "include" };
  const response = await fetch(input, init);

  if (response.status === 401) {
    const isAuthRoute =
      input.includes("/login") ||
      input.includes("/register") ||
      input.includes("/refresh-token") ||
      input.includes("/logout");

    if (isAuthRoute) {
      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      throw new Error(body.message || "Authentication failed");
    }

    try {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshAccessToken()
          .then((newToken) => {
            // 🚀 THE MOBILE FIX: Native Event Emitter
            DeviceEventEmitter.emit(TOKEN_REFRESHED_EVENT, {
              accessToken: newToken,
            });
            return newToken;
          })
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;
      const retryResponse = await fetch(input, {
        ...init,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
      });

      if (!retryResponse.ok) {
        const body = (await retryResponse.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(
          body.message ?? `Request failed with status ${retryResponse.status}`,
        );
      }

      return parseResponse<T>(retryResponse);
    } catch (err) {
      DeviceEventEmitter.emit("auth:logout");
      const message =
        err instanceof Error
          ? err.message
          : "Session expired. Please login again.";
      throw new Error(message);
    }
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    try {
      const body = JSON.parse(text) as { message?: string };
      throw new Error(body.message || response.statusText);
    } catch {
      throw new Error(text || response.statusText);
    }
  }

  return parseResponse<T>(response);
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return null as unknown as T;

  const text = await response.text();
  if (!text) return null as unknown as T;

  const body = JSON.parse(text) as Record<string, unknown>;

  if (body.success === false) {
    throw new Error(
      typeof body.message === "string" ? body.message : "An error occurred",
    );
  }

  if (body.success === true && body.data !== undefined) {
    return body.data as T;
  }

  return body as unknown as T;
}
