import { API_CONFIG } from "./config";
import { getAccessToken } from "./fetchWithAuth";

export type XhrField = {
  uri: string;
  name: string;
  type: string;
};

/**
 * Multipart POST using XMLHttpRequest.
 *
 * React Native's fetch/Hermes rejects plain { uri, name, type } objects in
 * FormData ("Unsupported FormDataPart implementation"). XHR's native layer
 * handles them correctly, so all file uploads must go through here.
 */
export function xhrUpload<T>(
  endpoint: string,
  fields: Record<string, string | XhrField | undefined>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_CONFIG.BASE_URL}${endpoint}`);
    xhr.withCredentials = true;

    const token = getAccessToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined) continue;
      if (typeof value === "string") {
        form.append(key, value);
      } else {
        // React Native XHR accepts { uri, name, type } natively
        form.append(key, value as unknown as Blob);
      }
    }

    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText) as Record<string, unknown>;
        if (xhr.status >= 200 && xhr.status < 300) {
          if (body.success === false) {
            reject(
              new Error(
                typeof body.message === "string"
                  ? body.message
                  : "Upload failed",
              ),
            );
          } else if (body.success === true && body.data !== undefined) {
            resolve(body.data as T);
          } else {
            resolve(body as unknown as T);
          }
        } else {
          reject(
            new Error(
              typeof body.message === "string"
                ? body.message
                : `Server error ${xhr.status}`,
            ),
          );
        }
      } catch {
        reject(
          new Error(
            xhr.status >= 200 && xhr.status < 300
              ? "Invalid server response"
              : `Server error ${xhr.status}`,
          ),
        );
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });
}
