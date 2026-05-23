import { Tabs } from "expo-router";
import {
  BookOpen,
  MessageCircle,
  ShieldAlert,
  User,
} from "lucide-react-native";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { VoiceProvider } from "@/contexts/VoiceContext";
import { useVoice } from "@/contexts/VoiceContext";

function VoiceDebugOverlay() {
  const { mode, isListening, lastTranscript, error } = useVoice();
  const modeColor = mode === "passive" ? "#555" : mode === "acknowledging" ? "#c9a84c" : "#4caf7d";
  return (
    <View style={{
      position: "absolute", top: 50, left: 12, right: 12, zIndex: 9999,
      backgroundColor: "rgba(0,0,0,0.82)", borderRadius: 10, padding: 10,
      borderWidth: 1, borderColor: modeColor, pointerEvents: "none",
    }}>
      <Text style={{ color: modeColor, fontSize: 11, fontWeight: "800" }}>
        VOICE: {mode.toUpperCase()}  {isListening ? "🎙 listening" : "🔇 idle"}
      </Text>
      {lastTranscript ? (
        <Text style={{ color: "#aaa", fontSize: 10, marginTop: 3 }} numberOfLines={2}>
          heard: "{lastTranscript}"
        </Text>
      ) : null}
      {error ? (
        <Text style={{ color: "#e05c5c", fontSize: 10, marginTop: 3 }} numberOfLines={1}>
          err: {error}
        </Text>
      ) : null}
    </View>
  );
}

const COLORS = {
  surface: "#111111",
  primary: "#c9a84c",
  textDisabled: "#4a4540",
  border: "rgba(201,168,76,0.08)",
};

function TabIcon({
  icon,
  focused,
}: {
  icon: React.ReactNode;
  focused: boolean;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 44,
        height: 32,
        borderRadius: 10,
        backgroundColor: focused ? "rgba(201,168,76,0.1)" : "transparent",
      }}
    >
      {icon}
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const tabBarHeight = 62 + insets.bottom;

  return (
    <VoiceProvider>
      <VoiceDebugOverlay />
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textDisabled,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.5,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              icon={
                <BookOpen
                  color={color}
                  size={20}
                  strokeWidth={focused ? 2.2 : 1.8}
                />
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              icon={
                <MessageCircle
                  color={color}
                  size={20}
                  strokeWidth={focused ? 2.2 : 1.8}
                />
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              icon={
                <User
                  color={color}
                  size={20}
                  strokeWidth={focused ? 2.2 : 1.8}
                />
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              icon={
                <ShieldAlert
                  color={color}
                  size={20}
                  strokeWidth={focused ? 2.2 : 1.8}
                />
              }
            />
          ),
        }}
      />
    </Tabs>
    </VoiceProvider>

  );
}
