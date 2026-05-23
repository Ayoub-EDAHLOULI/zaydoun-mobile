import type { LoginDto, RegisterDto } from "@/types/auth.types";

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

  validateRegister(data: Partial<RegisterDto> & { confirmPassword?: string }): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};
    const name = data.name?.trim() ?? "";
    if (!name) errors.name = "nameRequired";
    else if (name.length < 2) errors.name = "nameMin";
    const emailError = authValidation.validateEmail(data.email ?? "");
    if (emailError) errors.email = emailError;
    const passwordError = authValidation.validatePassword(data.password ?? "");
    if (passwordError) errors.password = passwordError;
    if (!data.confirmPassword) errors.confirmPassword = "confirmRequired";
    else if (data.confirmPassword !== data.password)
      errors.confirmPassword = "confirmMismatch";
    return { isValid: Object.keys(errors).length === 0, errors };
  },

  validateForgotPassword(email: string): { isValid: boolean; error?: string } {
    const err = authValidation.validateEmail(email);
    return err ? { isValid: false, error: err } : { isValid: true };
  },

  validateResetPassword(data: { password: string; confirmPassword: string }): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};
    const passwordError = authValidation.validatePassword(data.password);
    if (passwordError) errors.password = passwordError;
    if (!data.confirmPassword) errors.confirmPassword = "confirmRequired";
    else if (data.confirmPassword !== data.password)
      errors.confirmPassword = "confirmMismatch";
    return { isValid: Object.keys(errors).length === 0, errors };
  },
};
