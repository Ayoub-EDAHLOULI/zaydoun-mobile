import {
  useAudioRecorder,
  useAudioPlayer,
  useAudioPlayerStatus,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from "expo-audio";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router } from "expo-router";
import {
  ArrowLeft,
  Check,
  Keyboard,
  Mic,
  MicOff,
  Send,
  Square,
} from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { conversationsService } from "@/lib/api/services/conversations.service";
import { API_CONFIG } from "@/lib/api/config";
import { useLanguage } from "@/contexts/LanguageContext";
import { ConversationDetail, MessageData } from "@/types/conversations.types";

const COLORS = {
  background: "#0d0d0d",
  surface: "#1a1a1a",
  surfaceAlt: "#141414",
  primary: "#c9a84c",
  primaryDim: "rgba(201,168,76,0.15)",
  text: "#f5f0e8",
  textMuted: "#c4bdb0",
  textDisabled: "#6b6560",
  border: "rgba(255,255,255,0.06)",
  userBubble: "#1e1a12",
  userBubbleBorder: "rgba(201,168,76,0.2)",
  aiBubble: "#161616",
  aiBubbleBorder: "rgba(255,255,255,0.06)",
  error: "#e05c5c",
};

type RecordingState = "idle" | "recording" | "processing";

function CopiedPopup({ visible }: { visible: boolean }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 12,
          tension: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacity, translateY]);

  return (
    <Animated.View
      style={[mb.copiedPopup, { opacity, transform: [{ translateY }] }]}
    >
      <LinearGradient
        colors={["#c9a84c", "#a07c30"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={mb.copiedGradient}
      >
        <Check color="#0d0d0d" size={12} strokeWidth={3} />
        <Text style={mb.copiedText}>Copied</Text>
      </LinearGradient>
    </Animated.View>
  );
}

function MessageBubble({ message }: { message: MessageData }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLongPress = async () => {
    await Clipboard.setStringAsync(message.content);
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1800);
  };

  return (
    <View style={[mb.row, isUser ? mb.rowUser : mb.rowAI]}>
      {!isUser && (
        <View style={mb.avatar}>
          <Text style={mb.avatarText}>Z</Text>
        </View>
      )}
      <View style={mb.bubbleWrap}>
        <CopiedPopup visible={copied} />
        <Pressable
          onLongPress={handleLongPress}
          delayLongPress={350}
          android_ripple={null}
          style={({ pressed }) => [
            mb.bubble,
            isUser ? mb.bubbleUser : mb.bubbleAI,
            pressed && { opacity: 0.75 },
          ]}
        >
          <Text style={[mb.text, isUser ? mb.textUser : mb.textAI]}>
            {message.content}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const mb = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  rowUser: { justifyContent: "flex-end" },
  rowAI: { justifyContent: "flex-start", gap: 8 },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.primaryDim,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  avatarText: { color: COLORS.primary, fontSize: 12, fontWeight: "800" },
  bubbleWrap: { maxWidth: "75%", alignItems: "center" },
  bubble: {
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: COLORS.userBubble,
    borderWidth: 1,
    borderColor: COLORS.userBubbleBorder,
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: COLORS.aiBubble,
    borderWidth: 1,
    borderColor: COLORS.aiBubbleBorder,
    borderBottomLeftRadius: 4,
  },
  text: { fontSize: 14, lineHeight: 21, fontWeight: "500" },
  textUser: { color: COLORS.text },
  textAI: { color: COLORS.textMuted },
  copiedPopup: {
    position: "absolute",
    top: -36,
    zIndex: 10,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  copiedGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  copiedText: {
    color: "#0d0d0d",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});

// Maps dBFS (–160..0) to 0..1, biased so quiet still shows minimal movement
function dbToLevel(db: number): number {
  const clamped = Math.max(-60, Math.min(0, db));
  return (clamped + 60) / 60;
}

const BAR_COUNT = 5;
// Stagger heights so the bars look like a natural waveform arch
const BAR_BASE = [0.25, 0.5, 1.0, 0.5, 0.25];

function VoiceBars({ volumeAnim }: { volumeAnim: Animated.Value }) {
  return (
    <View style={viz.row}>
      {BAR_BASE.map((base, i) => (
        <Animated.View
          key={i}
          style={[
            viz.bar,
            {
              backgroundColor: COLORS.primary,
              transform: [
                {
                  scaleY: volumeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [base * 0.3 + 0.05, base * 1.0 + 0.05],
                    extrapolate: "clamp",
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

function PlaybackBars({ isPlaying }: { isPlaying: boolean }) {
  const anims = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.15)),
  ).current;

  useEffect(() => {
    if (!isPlaying) {
      anims.forEach((a) => {
        a.stopAnimation();
        Animated.timing(a, {
          toValue: 0.15,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
      return;
    }
    // Each bar loops with a unique phase offset
    const loops = anims.map((anim, i) => {
      const duration = 400 + i * 80;
      const peak = BAR_BASE[i];
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: peak,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.15,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
    });
    // Stagger start so bars are out of phase
    loops.forEach((loop, i) => setTimeout(() => loop.start(), i * 90));
    return () => loops.forEach((l) => l.stop());
  }, [isPlaying, anims]);

  return (
    <View style={viz.row}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            viz.bar,
            {
              backgroundColor: COLORS.primary,
              opacity: 0.85,
              transform: [{ scaleY: anim }],
            },
          ]}
        />
      ))}
    </View>
  );
}

const viz = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    height: 40,
  },
  bar: {
    width: 4,
    height: 32,
    borderRadius: 3,
  },
});

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { replyLanguage } = useLanguage();
  const [conversation, setConversation] = useState<ConversationDetail | null>(
    null,
  );
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [sending, setSending] = useState(false);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const volumeAnim = useRef(new Animated.Value(0)).current;
  const isPlayingAudio = playerStatus.playing;
  const flatListRef = useRef<FlatList>(null);

  // Load conversation
  useEffect(() => {
    if (!id) return;
    conversationsService
      .get(id)
      .then((conv) => {
        setConversation(conv);
        setMessages(conv.messages);
      })
      .catch(() => {
        Toast.show({ type: "error", text1: "Failed to load conversation" });
        router.back();
      });
  }, [id]);

  // Pulse animation while recording
  useEffect(() => {
    if (recordingState === "recording") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.18,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      volumeAnim.stopAnimation();
      volumeAnim.setValue(0);
    }
  }, [recordingState, pulseAnim, volumeAnim]);

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  const appendMessages = useCallback(
    (...newMsgs: MessageData[]) => {
      setMessages((prev) => [...prev, ...newMsgs]);
      setTimeout(scrollToBottom, 100);
    },
    [scrollToBottom],
  );

  // ── VOICE ──────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        Toast.show({ type: "error", text1: "Microphone permission denied" });
        return;
      }
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecordingState("recording");

      // Poll metering every 80 ms while recording
      const meteringInterval = setInterval(() => {
        const status = recorder.getStatus();
        if (!status.isRecording) {
          clearInterval(meteringInterval);
          return;
        }
        if (status.metering != null) {
          Animated.timing(volumeAnim, {
            toValue: dbToLevel(status.metering),
            duration: 80,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start();
        }
      }, 80);
    } catch {
      Toast.show({ type: "error", text1: "Could not start recording" });
    }
  };

  const stopAndSend = async () => {
    if (!recorder.isRecording || !id) return;
    setRecordingState("processing");
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) throw new Error("No audio URI");

      const result = await conversationsService.talk(
        id,
        uri,
        replyLanguage.code,
      );

      // Show user transcript immediately, then AI reply
      const userMsg: MessageData = {
        id: `u-${Date.now()}`,
        conversationId: id,
        role: "user",
        content: result.userText,
        sourcePage: null,
        audioPath: null,
        createdAt: new Date().toISOString(),
      };
      appendMessages(userMsg, result.aiMessage);

      // Play AI audio response
      const audioUrl = `${API_CONFIG.BASE_URL.replace("/api/v1", "")}${result.audioUrl}`;
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
      player.replace({ uri: audioUrl });
      player.play();
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Failed",
        text2: err instanceof Error ? err.message : "Could not process voice",
      });
    } finally {
      setRecordingState("idle");
    }
  };

  const cancelRecording = async () => {
    if (!recorder.isRecording) return;
    try {
      await recorder.stop();
    } catch {
      /* ignore */
    }
    setRecordingState("idle");
  };

  // ── TEXT FALLBACK ───────────────────────────────────────
  const sendText = async () => {
    const content = textInput.trim();
    if (!content || !id || sending) return;
    setSending(true);
    setTextInput("");

    // Show user bubble immediately
    const tempUserMsg: MessageData = {
      id: `temp-u-${Date.now()}`,
      conversationId: id,
      role: "user",
      content,
      sourcePage: null,
      audioPath: null,
      createdAt: new Date().toISOString(),
    };
    appendMessages(tempUserMsg);

    try {
      const result = await conversationsService.chat(
        id,
        content,
        replyLanguage.code,
      );
      // Replace temp user msg with real one, then append AI reply
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        { ...tempUserMsg, id: `u-${Date.now()}` },
        result.aiMessage,
      ]);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      // Remove the optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
      Toast.show({
        type: "error",
        text1: "Failed",
        text2: err instanceof Error ? err.message : "Could not send message",
      });
    } finally {
      setSending(false);
    }
  };

  const isRecording = recordingState === "recording";
  const isProcessing = recordingState === "processing";
  const bookTitle = conversation?.title ?? "Conversation";

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={8}
          style={s.backBtn}
        >
          <ArrowLeft color={COLORS.textMuted} size={20} strokeWidth={2} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle} numberOfLines={1}>
            {bookTitle}
          </Text>
          <Text style={s.headerSub}>Zaydoun · Voice assistant</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowTextInput((v) => !v)}
          hitSlop={8}
          style={[s.keyboardBtn, showTextInput && s.keyboardBtnActive]}
        >
          <Keyboard
            color={showTextInput ? COLORS.primary : COLORS.textDisabled}
            size={18}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={s.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          ListEmptyComponent={
            <View style={s.emptyChat}>
              <Text style={s.emptyChatText}>
                Hold the mic and ask anything about the book
              </Text>
            </View>
          }
        />

        {/* Text input (toggle) */}
        {showTextInput && (
          <View style={s.textRow}>
            <TextInput
              style={s.textField}
              placeholder="Type a message…"
              placeholderTextColor={COLORS.textDisabled}
              value={textInput}
              onChangeText={setTextInput}
              selectionColor={COLORS.primary}
              multiline
              returnKeyType="send"
              onSubmitEditing={sendText}
            />
            <TouchableOpacity
              style={[
                s.sendBtn,
                (!textInput.trim() || sending) && { opacity: 0.4 },
              ]}
              onPress={sendText}
              disabled={!textInput.trim() || sending}
              activeOpacity={0.75}
            >
              <Send color={COLORS.primary} size={18} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}

        {/* Voice area */}
        <View style={s.voiceArea}>
          {isProcessing ? (
            <View style={s.processingWrap}>
              <Text style={s.processingText}>Zaydoun is thinking…</Text>
            </View>
          ) : isRecording ? (
            <View style={s.recordingRow}>
              {/* Cancel */}
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={cancelRecording}
                activeOpacity={0.75}
              >
                <MicOff color={COLORS.error} size={20} strokeWidth={2} />
              </TouchableOpacity>

              {/* Mic + live waveform */}
              <View style={s.micWithBars}>
                <VoiceBars volumeAnim={volumeAnim} />
                <Animated.View
                  style={[
                    s.micOuter,
                    s.micOuterRecording,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  <TouchableOpacity
                    style={s.micInner}
                    onPress={stopAndSend}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={["#e05c5c", "#b03e3e"]}
                      style={s.micGradient}
                    >
                      <Square
                        color="#fff"
                        size={22}
                        strokeWidth={2.5}
                        fill="#fff"
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
                <VoiceBars volumeAnim={volumeAnim} />
              </View>

              <Text style={s.recordingHint}>Tap to stop</Text>
            </View>
          ) : isPlayingAudio ? (
            <View style={s.idleRow}>
              <PlaybackBars isPlaying={true} />
              <Text style={s.playingHint}>Zaydoun is speaking…</Text>
            </View>
          ) : (
            <View style={s.idleRow}>
              <Text style={s.idleHint}>Hold to talk</Text>
              <Pressable
                onPressIn={startRecording}
                style={({ pressed }) => [
                  s.micOuter,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <View style={s.micInner}>
                  <LinearGradient
                    colors={[COLORS.primary, "#a07c30"]}
                    style={s.micGradient}
                  >
                    <Mic color="#0d0d0d" size={26} strokeWidth={2.5} />
                  </LinearGradient>
                </View>
              </Pressable>
              <Text style={s.idleHint}>with Zaydoun</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1 },
  headerTitle: { color: COLORS.text, fontSize: 15, fontWeight: "700" },
  headerSub: {
    color: COLORS.textDisabled,
    fontSize: 11,
    fontWeight: "500",
    marginTop: 1,
  },
  keyboardBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  keyboardBtnActive: { backgroundColor: COLORS.primaryDim },

  // Messages
  messageList: { paddingTop: 16, paddingBottom: 8 },
  emptyChat: { alignItems: "center", paddingTop: 60, paddingHorizontal: 40 },
  emptyChatText: {
    color: COLORS.textDisabled,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
  },

  // Text input
  textRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  textField: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "500",
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primaryDim,
    alignItems: "center",
    justifyContent: "center",
  },

  // Voice area
  voiceArea: {
    paddingVertical: 28,
    paddingBottom: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  idleRow: { alignItems: "center", gap: 18 },
  idleHint: {
    color: COLORS.textDisabled,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  recordingRow: { alignItems: "center", gap: 16 },
  recordingHint: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  cancelBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(224,92,92,0.1)",
    borderWidth: 1,
    borderColor: "rgba(224,92,92,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  processingWrap: { alignItems: "center", paddingVertical: 20 },
  processingText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  micWithBars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  micOuterRecording: {
    borderColor: "rgba(224,92,92,0.35)",
    backgroundColor: "rgba(224,92,92,0.08)",
  },
  playingHint: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // Mic button
  micOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(201,168,76,0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(201,168,76,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  micInner: { width: 64, height: 64, borderRadius: 32, overflow: "hidden" },
  micGradient: { flex: 1, alignItems: "center", justifyContent: "center" },
});
