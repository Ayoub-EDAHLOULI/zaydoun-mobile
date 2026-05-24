import { router } from "expo-router";
import { MessageCircle } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useT } from "@/contexts/LanguageContext";
import { conversationsService } from "@/lib/api/services/conversations.service";

// When the user taps the Chat tab, send them straight to their most recent conversation.
// If none exists, nudge them to the library to start one.
export default function ChatTab() {
  const t = useT();
  const didNavigate = useRef(false);

  useEffect(() => {
    if (didNavigate.current) return;

    (async () => {
      try {
        const list = await conversationsService.list();
        if (list.length > 0) {
          didNavigate.current = true;
          router.push(`/conversation/${list[0].id}` as "/");
        }
        // If empty, fall through to the "no conversations" UI below
      } catch {
        // silent — show the empty state
      }
    })();
  }, []);

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      <View style={s.center}>
        <View style={s.iconWrap}>
          <MessageCircle color="#6b6560" size={40} strokeWidth={1.2} />
        </View>
        <Text style={s.title}>{t.no_conversations_yet}</Text>
        <Text style={s.subtitle}>{t.no_conversations_hint}</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0d0d0d" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    color: "#c4bdb0",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  subtitle: {
    color: "#6b6560",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
  },
  highlight: { color: "#c9a84c", fontWeight: "700" },
});
