// Replace the fallback IP with your actual computer's local Wi-Fi IP!
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.11.126:5000/api/v1";

export const API_CONFIG = {
  BASE_URL: API_URL,
  ENDPOINTS: {
    AUTH: "/auth",
    BOOKS: "/books",
    CONVERSATIONS: "/conversations",
    USERS: "/users",
  },
};
