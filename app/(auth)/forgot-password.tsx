import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { CheckCircle, Mail } from "lucide-react-native";
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
import { useT } from "@/contexts/LanguageContext";
import { authService } from "@/lib/api/services/auth.service";
import { authValidation } from "@/validations/auth.validations";

const { width } = Dimensions.get("window");

const COLORS = {
  background: "#0d0d0d",
  surface: "#1a1a1a",
  surfaceAlt: "#141414",
  primary: "#c9a84c",
  secondary: "#a07c30",
  text: "#f5f0e8",
  textMuted: "#c4bdb0",
  textDisabled: "#6b6560",
  error: "#e05c5c",
  success: "#4caf7d",
  border: "rgba(201,168,76,0.15)",
};

export default function ForgotPasswordScreen() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  const validate = (val: string) => {
    const { isValid, error } = authValidation.validateForgotPassword(val);
    setEmailError(isValid ? undefined : error);
    return isValid;
  };

  const handleSubmit = async () => {
    setTouched(true);
    if (!validate(email)) {
      shake();
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email.trim());
    } catch {
      // always show success — anti-enumeration
    } finally {
      setIsLoading(false);
      setSubmitted(true);
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
            <Text style={s.title}>{t.forgot_password_title}</Text>
            <Text style={s.subtitle}>{t.forgot_password_subtitle}</Text>
          </View>

          {submitted ? (
            <View style={s.successCard}>
              <View style={s.successIconWrap}>
                <CheckCircle
                  color={COLORS.success}
                  size={32}
                  strokeWidth={1.5}
                />
              </View>
              <Text style={s.successTitle}>{t.check_your_inbox}</Text>
              <Text style={s.successBody}>{t.reset_link_sent}</Text>
              <TouchableOpacity
                onPress={() => router.back()}
                style={s.backToLoginBtn}
                activeOpacity={0.75}
              >
                <Text style={s.backToLoginText}>{t.back_to_sign_in}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Animated.View
              style={[s.card, { transform: [{ translateX: shakeAnim }] }]}
            >
              <View style={s.fieldWrap}>
                <View
                  style={[
                    s.inputRow,
                    touched && !!emailError && s.inputRowError,
                  ]}
                >
                  <View style={s.inputIcon}>
                    <Mail
                      color={COLORS.textDisabled}
                      size={18}
                      strokeWidth={1.5}
                    />
                  </View>
                  <TextInput
                    style={s.input}
                    placeholder={t.email_address}
                    placeholderTextColor={COLORS.textDisabled}
                    value={email}
                    onChangeText={(v) => {
                      setEmail(v);
                      if (touched) validate(v);
                    }}
                    onBlur={() => {
                      setTouched(true);
                      validate(email);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    selectionColor={COLORS.primary}
                  />
                </View>
                {touched && emailError && (
                  <Text style={s.fieldError}>
                    {emailError === "emailRequired"
                      ? t.email_required
                      : emailError === "emailInvalid"
                        ? t.email_invalid
                        : emailError}
                  </Text>
                )}
              </View>

              <View style={{ marginTop: 4, alignItems: "center" }}>
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
                      {isLoading ? t.sending : t.send_reset_link}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
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
  subtitle: {
    color: COLORS.textDisabled,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
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
  successCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: "rgba(76,175,125,0.2)",
    alignItems: "center",
    gap: 12,
    shadowColor: "#4caf7d",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  successIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(76,175,125,0.1)",
    borderWidth: 1,
    borderColor: "rgba(76,175,125,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  successTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  successBody: {
    color: COLORS.textDisabled,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
  },
  successEmail: { color: COLORS.textMuted, fontWeight: "600" },
  backToLoginBtn: { marginTop: 8, paddingVertical: 10, paddingHorizontal: 24 },
  backToLoginText: { color: COLORS.primary, fontSize: 14, fontWeight: "700" },
});
