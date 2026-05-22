import AuthProvider from "@/contexts/AuthContext";
import { setBackgroundColorAsync } from "expo-system-ui";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast, { BaseToast, ErrorToast, ToastConfig } from "react-native-toast-message";

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

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0d0d0d" },
            animation: "fade",
          }}
        />
        <Toast config={toastConfig} topOffset={60} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
