import { useLocalSearchParams, router } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { conversationsService } from "@/lib/api/services/conversations.service";

// Gateway: given a bookId, find the most recent conversation or create one, then redirect.
export default function ConversationGateway() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();

  useEffect(() => {
    if (!bookId) {
      router.replace("/(tabs)/library" as "/");
      return;
    }

    (async () => {
      try {
        const list = await conversationsService.list(bookId);
        if (list.length > 0) {
          router.replace(`/conversation/${list[0].id}` as "/");
        } else {
          const conv = await conversationsService.create({ bookId });
          router.replace(`/conversation/${conv.id}` as "/");
        }
      } catch {
        router.replace("/(tabs)/library" as "/");
      }
    })();
  }, [bookId]);

  return (
    <View style={s.container}>
      <ActivityIndicator color="#c9a84c" size="large" />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
    alignItems: "center",
    justifyContent: "center",
  },
});
