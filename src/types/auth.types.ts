export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  name?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  isActive?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
