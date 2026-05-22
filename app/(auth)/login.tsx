import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
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

const ERROR_MESSAGES: Record<string, string> = {
  emailRequired: "Email is required",
  emailInvalid: "Enter a valid email address",
  passwordRequired: "Password is required",
  passwordMin: "Password must be at least 8 characters",
  passwordMax: "Password is too long",
  passwordWeak: "Must contain uppercase, lowercase and a number",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
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

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

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

  const validateField = (field: string, value: string) => {
    if (field === "email") {
      const err = authValidation.validateEmail(value);
      setErrors((prev) => ({ ...prev, email: err ?? "" }));
    }
    if (field === "password") {
      setErrors((prev) => ({
        ...prev,
        password: value ? "" : "passwordRequired",
      }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, field === "email" ? email : password);
  };

  const handleSubmit = async () => {
    setTouched({ email: true, password: true });
    const { isValid, errors: validationErrors } = authValidation.validateLogin({
      email,
      password,
    });

    if (!isValid) {
      setErrors(validationErrors);
      shake();
      return;
    }

    setIsLoading(true);
    setServerError(null);
    Animated.timing(buttonScale, {
      toValue: 0.97,
      duration: 100,
      useNativeDriver: true,
    }).start();

    try {
      await login({ email: email.trim(), password });
      router.replace("/(tabs)" as "/");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Login failed");
      shake();
    } finally {
      setIsLoading(false);
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
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
            <Text style={s.backText}>← Back</Text>
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
            <Text style={s.title}>Welcome back</Text>
            <Text style={s.subtitle}>Sign in to your reading companion</Text>
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
                <Mail color={COLORS.textDisabled} size={18} strokeWidth={1.5} />
              }
              placeholder="Email address"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (touched.email) validateField("email", v);
              }}
              onBlur={() => handleBlur("email")}
              error={touched.email ? errors.email : undefined}
              keyboardType="email-address"
            />

            <InputField
              icon={
                <Lock color={COLORS.textDisabled} size={18} strokeWidth={1.5} />
              }
              placeholder="Password"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (touched.password) validateField("password", v);
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

            <Animated.View
              style={{ transform: [{ scale: buttonScale }], marginTop: 4 }}
            >
              <Pressable onPress={handleSubmit} disabled={isLoading}>
                <LinearGradient
                  colors={
                    isLoading
                      ? ["rgba(201,168,76,0.35)", "rgba(160,124,48,0.35)"]
                      : [COLORS.primary, COLORS.secondary]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.submitBtn}
                >
                  <Text style={s.submitText}>
                    {isLoading ? "Signing in…" : "Sign In"}
                  </Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </Animated.View>

          <Text style={s.footerText}>
            Don't have an account?{"\n"}
            <Text style={s.footerAccent}>Create one on the web dashboard.</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 48 },
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
  subtitle: {
    color: COLORS.textDisabled,
    fontSize: 14,
    fontWeight: "500",
  },
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
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "500",
  },
  inputRight: { marginLeft: 8, padding: 4 },
  fieldError: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  submitBtn: {
    width: width - 96,
    alignSelf: "center",
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  submitText: {
    color: "#0d0d0d",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  footerText: {
    color: COLORS.textDisabled,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 28,
    lineHeight: 22,
  },
  footerAccent: { color: COLORS.textMuted, fontWeight: "600" },
});
