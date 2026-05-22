import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatScreen() {
  return (
    <SafeAreaView style={s.container} edges={["top", "left", "right"]}>
      <View style={s.content}>
        <Text style={s.text}>Chat</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0d0d" },
  content: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { color: "#6b6560", fontSize: 16, fontWeight: "600", letterSpacing: 1 },
});
