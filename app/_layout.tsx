import AuthProvider from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { VoiceProvider } from "@/contexts/VoiceContext";
import { useVoice } from "@/contexts/VoiceContext";
import { setBackgroundColorAsync } from "expo-system-ui";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
} from "react-native-toast-message";

setBackgroundColorAsync("#0d0d0d");

// Keep splash visible until we explicitly hide it
SplashScreen.preventAutoHideAsync();

const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#c9a84c",
        backgroundColor: "#1a1a1a",
        borderRadius: 14,
        borderLeftWidth: 4,
        height: "auto",
        paddingVertical: 12,
      }}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      text1Style={{ color: "#f5f0e8", fontSize: 14, fontWeight: "700" }}
      text2Style={{ color: "#6b6560", fontSize: 12, fontWeight: "500" }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#e05c5c",
        backgroundColor: "#1a1a1a",
        borderRadius: 14,
        borderLeftWidth: 4,
        height: "auto",
        paddingVertical: 12,
      }}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      text1Style={{ color: "#f5f0e8", fontSize: 14, fontWeight: "700" }}
      text2Style={{ color: "#6b6560", fontSize: 12, fontWeight: "500" }}
    />
  ),
};

function VoiceDebugOverlay() {
  const { mode, isListening, lastTranscript, voiceModeEnabled } = useVoice();
  if (!voiceModeEnabled) return null;

  const label =
    mode === "acknowledging"
      ? "Zaydoun is listening…"
      : mode === "command"
        ? "Awaiting your command…"
        : isListening
          ? "Say «Zaydoun» to begin"
          : null;

  if (!label && !lastTranscript) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 52,
        alignSelf: "center",
        zIndex: 9999,
        backgroundColor: "rgba(13,13,13,0.88)",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor:
          mode === "passive" ? "rgba(201,168,76,0.2)" : "rgba(201,168,76,0.5)",
        pointerEvents: "none",
      }}
    >
      {label ? (
        <Text
          style={{
            color: mode === "passive" ? "#6b6560" : "#c9a84c",
            fontSize: 12,
            fontWeight: "600",
            letterSpacing: 0.3,
          }}
        >
          {label}
        </Text>
      ) : null}
      {lastTranscript && mode !== "passive" ? (
        <Text
          style={{
            color: "#c4bdb0",
            fontSize: 11,
            fontWeight: "500",
            marginTop: label ? 2 : 0,
            opacity: 0.8,
          }}
          numberOfLines={1}
        >
          {lastTranscript}
        </Text>
      ) : null}
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <VoiceProvider>
            <VoiceDebugOverlay />
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#0d0d0d" },
                animation: "fade",
              }}
            />
            <Toast config={toastConfig} topOffset={60} />
          </VoiceProvider>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
