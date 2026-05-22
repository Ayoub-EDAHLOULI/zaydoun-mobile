import { Tabs } from "expo-router";
import { BookOpen, MessageCircle, User } from "lucide-react-native";

const COLORS = {
  background: "#0d0d0d",
  surface: "#1a1a1a",
  primary: "#c9a84c",
  textDisabled: "#6b6560",
  border: "rgba(201,168,76,0.1)",
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textDisabled,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color, size }) => (
            <BookOpen color={color} size={size} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={size} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} strokeWidth={1.8} />
          ),
        }}
      />
    </Tabs>
  );
}
