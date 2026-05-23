import { apiClient } from "@/lib/api/client";
import { API_CONFIG } from "@/lib/api/config";
import {
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  UpdateProfileDto,
  AuthResponse,
  User,
} from "@/types/auth.types";

const AUTH = API_CONFIG.ENDPOINTS.AUTH;
const BASE_URL = API_CONFIG.BASE_URL;

export const authService = {
  login(data: LoginDto): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${AUTH}/login`, data);
  },

  register(data: RegisterDto): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${AUTH}/register`, data);
  },

  forgotPassword(email: string): Promise<void> {
    return apiClient.post<void>(`${AUTH}/forgot-password`, { email });
  },

  resetPassword(token: string, newPassword: string): Promise<void> {
    return apiClient.post<void>(`${AUTH}/reset-password`, {
      token,
      newPassword,
    });
  },

  async refreshToken(): Promise<{ accessToken: string }> {
    const response = await fetch(`${BASE_URL}${AUTH}/refresh-token`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Session expired. Please login again.");
    const json = (await response.json()) as { data: { accessToken: string } };
    return json.data;
  },

  logout(): Promise<void> {
    return apiClient.post<void>(`${AUTH}/logout`, {});
  },

  getProfile(accessToken: string): Promise<User> {
    return apiClient.get<User>(`${AUTH}/profile`, accessToken);
  },

  updateProfile(data: UpdateProfileDto, accessToken: string): Promise<User> {
    return apiClient.patch<User>(`${AUTH}/profile`, data, accessToken);
  },

  changePassword(data: ChangePasswordDto, accessToken: string): Promise<void> {
    return apiClient.patch<void>(`${AUTH}/change-password`, data, accessToken);
  },
};
