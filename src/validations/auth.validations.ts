import type { LoginDto } from "@/types/auth.types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export const authValidation = {
  validateEmail(email: string): string | null {
    const val = email.trim();
    if (!val) return "emailRequired";
    if (!emailPattern.test(val)) return "emailInvalid";
    return null;
  },

  validatePassword(password: string): string | null {
    if (!password) return "passwordRequired";
    if (password.length < 8) return "passwordMin";
    if (password.length > 100) return "passwordMax";
    if (!passwordPattern.test(password)) return "passwordWeak";
    return null;
  },

  validateLogin(data: Partial<LoginDto>): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};
    const emailError = authValidation.validateEmail(data.email ?? "");
    if (emailError) errors.email = emailError;
    if (!data.password) errors.password = "passwordRequired";
    return { isValid: Object.keys(errors).length === 0, errors };
  },
};
