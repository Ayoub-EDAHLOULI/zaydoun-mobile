import AuthProvider from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { VoiceProvider } from "@/contexts/VoiceContext";
import { useVoice } from "@/contexts/VoiceContext";
import { setBackgroundColorAsync } from "expo-system-ui";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
} from "react-native-toast-message";

setBackgroundColorAsync("#0d0d0d");

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
  const { mode, isListening, lastTranscript, error } = useVoice();
  const modeColor =
    mode === "passive"
      ? "#555"
      : mode === "acknowledging"
        ? "#c9a84c"
        : "#4caf7d";
  return (
    <View
      style={{
        position: "absolute",
        top: 50,
        left: 12,
        right: 12,
        zIndex: 9999,
        backgroundColor: "rgba(0,0,0,0.82)",
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: modeColor,
        pointerEvents: "none",
      }}
    >
      <Text style={{ color: modeColor, fontSize: 11, fontWeight: "800" }}>
        VOICE: {mode.toUpperCase()} {isListening ? "🎙 listening" : "🔇 idle"}
      </Text>
      {lastTranscript ? (
        <Text
          style={{ color: "#aaa", fontSize: 10, marginTop: 3 }}
          numberOfLines={2}
        >
          heard: "{lastTranscript}"
        </Text>
      ) : null}
      {error ? (
        <Text
          style={{ color: "#e05c5c", fontSize: 10, marginTop: 3 }}
          numberOfLines={1}
        >
          err: {error}
        </Text>
      ) : null}
    </View>
  );
}

export default function RootLayout() {
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
