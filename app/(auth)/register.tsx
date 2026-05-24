import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useT } from "@/contexts/LanguageContext";
import { authService } from "@/lib/api/services/auth.service";
import { authValidation } from "@/validations/auth.validations";

const { width } = Dimensions.get("window");

const COLORS = {
  background: "#0d0d0d",
  surface: "#1a1a1a",
  surfaceAlt: "#141414",
  primary: "#c9a84c",
  primaryLight: "#e0c272",
  secondary: "#a07c30",
  text: "#f5f0e8",
  textMuted: "#c4bdb0",
  textDisabled: "#6b6560",
  error: "#e05c5c",
  border: "rgba(201,168,76,0.15)",
};

function FieldError({ message }: { message?: string }) {
  const t = useT();
  if (!message) return null;
  const ERROR_MESSAGES: Record<string, string> = {
    nameRequired: t.name_required,
    nameMin: t.name_min,
    emailRequired: t.email_required,
    emailInvalid: t.email_invalid,
    passwordRequired: t.password_required,
    passwordMin: t.password_min,
    passwordMax: t.password_max,
    passwordWeak: t.password_weak,
    confirmRequired: t.confirm_required,
    confirmMismatch: t.confirm_mismatch,
  };
  return <Text style={s.fieldError}>{ERROR_MESSAGES[message] ?? message}</Text>;
}

function InputField({
  icon,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  secureTextEntry,
  keyboardType,
  rightElement,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: "email-address" | "default";
  rightElement?: React.ReactNode;
}) {
  return (
    <View style={s.fieldWrap}>
      <View style={[s.inputRow, !!error && s.inputRowError]}>
        <View style={s.inputIcon}>{icon}</View>
        <TextInput
          style={s.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textDisabled}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          selectionColor={COLORS.primary}
        />
        {rightElement && <View style={s.inputRight}>{rightElement}</View>}
      </View>
      <FieldError message={error} />
    </View>
  );
}

export default function RegisterScreen() {
  const { login } = useAuth();
  const t = useT();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -6,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const validateField = (field: string) => {
    const result = authValidation.validateRegister({
      name,
      email,
      password,
      confirmPassword,
    });
    setErrors((prev) => ({ ...prev, [field]: result.errors[field] ?? "" }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const handleSubmit = async () => {
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    const { isValid, errors: validationErrors } =
      authValidation.validateRegister({
        name,
        email,
        password,
        confirmPassword,
      });

    if (!isValid) {
      setErrors(validationErrors);
      shake();
      return;
    }

    setIsLoading(true);
    setServerError(null);

    try {
      await authService.register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      await login({ email: email.trim(), password });
      router.replace("/(tabs)/library" as "/");
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Registration failed",
      );
      shake();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <LinearGradient
        colors={[COLORS.background, "#050505"]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backText}>{t.back}</Text>
          </TouchableOpacity>

          <View style={s.header}>
            <View style={s.pill}>
              <LinearGradient
                colors={["rgba(201,168,76,0.3)", "rgba(201,168,76,0.1)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.pillBorder}
              >
                <View style={s.pillInner}>
                  <Text style={s.pillText}>Zaydoun</Text>
                </View>
              </LinearGradient>
            </View>
            <Text style={s.title}>{t.create_account}</Text>
            <Text style={s.subtitle}>{t.start_journey}</Text>
          </View>

          <Animated.View
            style={[s.card, { transform: [{ translateX: shakeAnim }] }]}
          >
            {serverError && (
              <View style={s.serverError}>
                <Text style={s.serverErrorText}>{serverError}</Text>
              </View>
            )}

            <InputField
              icon={
                <User color={COLORS.textDisabled} size={18} strokeWidth={1.5} />
              }
              placeholder={t.full_name}
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (touched.name) validateField("name");
              }}
              onBlur={() => handleBlur("name")}
              error={touched.name ? errors.name : undefined}
            />

            <InputField
              icon={
                <Mail color={COLORS.textDisabled} size={18} strokeWidth={1.5} />
              }
              placeholder={t.email_address}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (touched.email) validateField("email");
              }}
              onBlur={() => handleBlur("email")}
              error={touched.email ? errors.email : undefined}
              keyboardType="email-address"
            />

            <InputField
              icon={
                <Lock color={COLORS.textDisabled} size={18} strokeWidth={1.5} />
              }
              placeholder={t.password}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (touched.password) validateField("password");
              }}
              onBlur={() => handleBlur("password")}
              error={touched.password ? errors.password : undefined}
              secureTextEntry={!showPassword}
              rightElement={
                <TouchableOpacity
                  onPress={() => setShowPassword((p) => !p)}
                  hitSlop={8}
                >
                  {showPassword ? (
                    <EyeOff
                      color={COLORS.textDisabled}
                      size={18}
                      strokeWidth={1.5}
                    />
                  ) : (
                    <Eye
                      color={COLORS.textDisabled}
                      size={18}
                      strokeWidth={1.5}
                    />
                  )}
                </TouchableOpacity>
              }
            />

            <InputField
              icon={
                <Lock color={COLORS.textDisabled} size={18} strokeWidth={1.5} />
              }
              placeholder={t.confirm_password}
              value={confirmPassword}
              onChangeText={(v) => {
                setConfirmPassword(v);
                if (touched.confirmPassword) validateField("confirmPassword");
              }}
              onBlur={() => handleBlur("confirmPassword")}
              error={
                touched.confirmPassword ? errors.confirmPassword : undefined
              }
              secureTextEntry={!showConfirm}
              rightElement={
                <TouchableOpacity
                  onPress={() => setShowConfirm((p) => !p)}
                  hitSlop={8}
                >
                  {showConfirm ? (
                    <EyeOff
                      color={COLORS.textDisabled}
                      size={18}
                      strokeWidth={1.5}
                    />
                  ) : (
                    <Eye
                      color={COLORS.textDisabled}
                      size={18}
                      strokeWidth={1.5}
                    />
                  )}
                </TouchableOpacity>
              }
            />

            <Animated.View style={{ marginTop: 4, alignItems: "center" }}>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.75}
                style={s.submitBtnWrapper}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.submitBtnGradient}
                >
                  {isLoading && <View style={s.submitDim} />}
                  <Text style={s.submitText}>
                    {isLoading ? t.creating_account : t.create_account}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          <TouchableOpacity onPress={() => router.back()} style={s.footerLink}>
            <Text style={s.footerText}>
              {t.already_have_account}{" "}
              <Text style={s.footerAccent}>{t.sign_in_link}</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 16,
  },
  backBtn: { paddingTop: 12, paddingBottom: 4, alignSelf: "flex-start" },
  backText: { color: COLORS.textDisabled, fontSize: 14, fontWeight: "600" },
  header: { alignItems: "center", paddingTop: 28, paddingBottom: 32, gap: 12 },
  pill: { borderRadius: 100 },
  pillBorder: { padding: 1, borderRadius: 100 },
  pillInner: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 100,
  },
  pillText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.3,
    marginTop: 4,
  },
  subtitle: { color: COLORS.textDisabled, fontSize: 14, fontWeight: "500" },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  serverError: {
    backgroundColor: "rgba(224,92,92,0.08)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(224,92,92,0.2)",
  },
  serverErrorText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  fieldWrap: { gap: 6 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 54,
  },
  inputRowError: { borderColor: "rgba(224,92,92,0.45)" },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: COLORS.text, fontSize: 15, fontWeight: "500" },
  inputRight: { marginLeft: 8, padding: 4 },
  fieldError: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  submitBtnWrapper: {
    width: width - 96,
    borderRadius: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  submitDim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 14,
  },
  submitBtnGradient: {
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  submitText: {
    color: "#0d0d0d",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  footerLink: { alignItems: "center", marginTop: 24 },
  footerText: {
    color: COLORS.textDisabled,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  footerAccent: { color: COLORS.textMuted, fontWeight: "600" },
});
