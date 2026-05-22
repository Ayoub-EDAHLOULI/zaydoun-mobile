// Replace the fallback IP with your actual computer's local Wi-Fi IP!
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.XX:5000/api";

export const API_CONFIG = {
  BASE_URL: API_URL,
  ENDPOINTS: {
    AUTH: "/auth",
  },
};
