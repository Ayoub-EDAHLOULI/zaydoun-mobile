import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <Text style={s.text}>Login</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020810" },
  content: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { color: "#F0F6FF", fontSize: 20, fontWeight: "600" },
});
