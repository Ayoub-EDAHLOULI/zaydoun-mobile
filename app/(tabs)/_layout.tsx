import { Tabs } from "expo-router";
import { BookOpen, MessageCircle, User } from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  surface: "#111111",
  primary: "#c9a84c",
  textDisabled: "#4a4540",
  border: "rgba(201,168,76,0.08)",
};

function TabIcon({ icon, focused }: { icon: React.ReactNode; focused: boolean }) {
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
  const tabBarHeight = 62 + insets.bottom;

  return (
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
              icon={<BookOpen color={color} size={20} strokeWidth={focused ? 2.2 : 1.8} />}
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
              icon={<MessageCircle color={color} size={20} strokeWidth={focused ? 2.2 : 1.8} />}
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
              icon={<User color={color} size={20} strokeWidth={focused ? 2.2 : 1.8} />}
            />
          ),
        }}
      />
    </Tabs>
  );
}
