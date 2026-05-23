/**
 * useZaydounVoice
 *
 * Siri-style wake-word controller.
 * Uses @react-native-voice/voice for STT + expo-speech for TTS.
 *
 * State machine:
 *   passive  ──(wake word)──▶  acknowledging  ──(TTS done)──▶  command
 *   command  ──(action | stop | timeout)──▶  passive
 *
 * Requires a development build — does NOT run in Expo Go.
 */

import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
} from "@react-native-voice/voice";
import * as Speech from "expo-speech";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { BookSummary } from "@/types/books.types";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type VoiceMode = "passive" | "acknowledging" | "command";

export interface ZaydounVoiceOptions {
  books: BookSummary[];
  onStartRecording?: () => void;
  onSendRecording?: () => void;
  userName?: string;
  commandWindowMs?: number;
  enabled?: boolean;
}

export interface ZaydounVoiceState {
  mode: VoiceMode;
  lastTranscript: string;
  isListening: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Wake-word patterns — common STT mis-transcriptions of "Zaydoun"
// ---------------------------------------------------------------------------

const WAKE_PATTERNS = [
  /\bzaydou?n\b/i,
  /\bzaidoo?n\b/i,
  /\bzaidun\b/i,
  /\bzay\s?dun\b/i,
  /\bthey\s?done\b/i,
  /\bsay\s?down\b/i,
  /\bzey\s?don\b/i,
  /\bzeydun\b/i,
  /\bzie\s?done\b/i,
];

function containsWakeWord(text: string): boolean {
  return WAKE_PATTERNS.some((re) => re.test(text));
}

// ---------------------------------------------------------------------------
// Fuzzy book title matching
// ---------------------------------------------------------------------------

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function bestBookMatch(
  query: string,
  books: BookSummary[],
): BookSummary | null {
  if (!books.length || !query.trim()) return null;
  const q = query.toLowerCase().trim();
  let best: BookSummary | null = null;
  let bestScore = Infinity;
  for (const book of books) {
    const t = book.title.toLowerCase();
    if (t.includes(q) || q.includes(t)) return book;
    const score = levenshtein(q, t) / Math.max(q.length, t.length);
    if (score < bestScore) {
      bestScore = score;
      best = book;
    }
  }
  return bestScore <= 0.5 ? best : null;
}

// ---------------------------------------------------------------------------
// Command regexes
// ---------------------------------------------------------------------------

const OPEN_RE =
  /(?:open|start(?:\s+conversation(?:\s+on)?)?|discuss|talk\s+about)\s+(.+)/i;
const RECORD_RE =
  /\b(?:start\s+(?:an?\s+)?(?:audio|recording?)|record(?:ing)?)\b/i;
const SEND_RE = /\b(?:send(?:\s+(?:the\s+)?(?:audio|message|it))?)\b/i;
const STOP_RE = /\b(?:stop|cancel|never\s*mind|quit|exit)\b/i;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useZaydounVoice({
  books,
  onStartRecording,
  onSendRecording,
  userName = "there",
  commandWindowMs = 7000,
  enabled = true,
}: ZaydounVoiceOptions): ZaydounVoiceState {
  const [mode, setMode] = useState<VoiceMode>("passive");
  const [lastTranscript, setLastTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // All mutable values live in refs so event handlers (registered once) always
  // read the latest value without needing to re-register.
  const modeRef = useRef<VoiceMode>("passive");
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false); // true while TTS is playing — block STT results
  const commandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const booksRef = useRef(books);
  const onStartRef = useRef(onStartRecording);
  const onSendRef = useRef(onSendRecording);
  const enabledRef = useRef(enabled);
  const userNameRef = useRef(userName);
  const commandWindowRef = useRef(commandWindowMs);

  // Keep refs in sync with props
  useEffect(() => {
    booksRef.current = books;
  }, [books]);
  useEffect(() => {
    onStartRef.current = onStartRecording;
  }, [onStartRecording]);
  useEffect(() => {
    onSendRef.current = onSendRecording;
  }, [onSendRecording]);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);
  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);
  useEffect(() => {
    commandWindowRef.current = commandWindowMs;
  }, [commandWindowMs]);

  // -------------------------------------------------------------------------
  // All logic lives inside a single effect that runs once on mount.
  // Functions are defined inside so they close over stable refs only.
  // -------------------------------------------------------------------------
  useEffect(() => {
    // Guard: native module unavailable (Expo Go or missing link)
    if (!Voice || typeof Voice.start !== "function") {
      setError("Voice native module unavailable — use a dev build, not Expo Go");
      return;
    }

    // -- STT control --------------------------------------------------------

    const startListening = async () => {
      if (
        isListeningRef.current ||
        isSpeakingRef.current ||
        !enabledRef.current
      )
        return;
      try {
        await Voice.destroy().catch(() => {});
        isListeningRef.current = true;
        setIsListening(true);
        setError(null);
        await Voice.start("en-US");
      } catch (e) {
        isListeningRef.current = false;
        setIsListening(false);
        setError(e instanceof Error ? e.message : "Voice start failed");
      }
    };

    const stopListening = async () => {
      if (!isListeningRef.current) return;
      try {
        await Voice.stop();
        await Voice.destroy();
      } catch {
        /* already stopped */
      }
      isListeningRef.current = false;
      setIsListening(false);
    };

    // -- Timers -------------------------------------------------------------

    const clearCommandTimer = () => {
      if (commandTimerRef.current) {
        clearTimeout(commandTimerRef.current);
        commandTimerRef.current = null;
      }
    };

    const clearRestartTimer = () => {
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }
    };

    const scheduleRestart = (delayMs: number) => {
      clearRestartTimer();
      restartTimerRef.current = setTimeout(() => {
        if (
          enabledRef.current &&
          !isListeningRef.current &&
          !isSpeakingRef.current &&
          (modeRef.current === "passive" || modeRef.current === "command")
        ) {
          startListening();
        }
      }, delayMs);
    };

    // -- State transitions --------------------------------------------------

    const setModeRef = (m: VoiceMode) => {
      modeRef.current = m;
      setMode(m);
    };

    const returnToPassive = async () => {
      clearCommandTimer();
      setModeRef("passive");
      scheduleRestart(200);
    };

    const openCommandWindow = async () => {
      setModeRef("command");
      clearCommandTimer();
      await startListening();
      commandTimerRef.current = setTimeout(
        returnToPassive,
        commandWindowRef.current,
      );
    };

    // -- Wake word ----------------------------------------------------------

    const handleWakeWord = async () => {
      if (modeRef.current !== "passive") return;
      setModeRef("acknowledging");
      clearCommandTimer();
      await stopListening();

      isSpeakingRef.current = true;
      Speech.speak(`Yes, ${userNameRef.current}?`, {
        language: "en-US",
        pitch: 1.05,
        rate: 0.92,
        onDone: () => {
          isSpeakingRef.current = false;
          void openCommandWindow();
        },
        onStopped: () => {
          isSpeakingRef.current = false;
          void openCommandWindow();
        },
        onError: () => {
          isSpeakingRef.current = false;
          void openCommandWindow();
        },
      });
    };

    // -- Command parsing ----------------------------------------------------

    const handleCommand = async (transcript: string) => {
      const t = transcript.toLowerCase().trim();

      if (STOP_RE.test(t)) {
        await returnToPassive();
        return;
      }
      if (RECORD_RE.test(t)) {
        onStartRef.current?.();
        await returnToPassive();
        return;
      }
      if (SEND_RE.test(t)) {
        onSendRef.current?.();
        await returnToPassive();
        return;
      }

      const m = OPEN_RE.exec(t);
      if (m) {
        const book = bestBookMatch(m[1].trim(), booksRef.current);
        if (book) {
          clearCommandTimer();
          await stopListening();
          setModeRef("passive");
          // /conversation is the index gateway — pushes to the right conversation
          router.push(`/conversation?bookId=${book.id}` as "/");
          scheduleRestart(2000);
          return;
        }
      }
      // No match — keep the command window open, let the user try again
    };

    // -- Voice event handlers -----------------------------------------------

    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (isSpeakingRef.current) return; // ignore TTS echo
      const transcript = e.value?.[0] ?? "";
      if (!transcript) return;
      setLastTranscript(transcript);
      if (modeRef.current === "passive") {
        if (containsWakeWord(transcript)) handleWakeWord();
      } else if (modeRef.current === "command") {
        void handleCommand(transcript);
      }
    };

    Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
      if (isSpeakingRef.current) return; // ignore TTS echo
      const transcript = e.value?.[0] ?? "";
      if (!transcript) return;
      setLastTranscript(transcript);
      if (modeRef.current === "passive" && containsWakeWord(transcript)) {
        void handleWakeWord();
      }
    };

    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      const code = e.error?.code ?? "";
      const msg = e.error?.message ?? "";
      const benign =
        code === "7" || code === "recognition_fail" || msg.includes("No match");
      if (!benign) setError(msg);
      isListeningRef.current = false;
      setIsListening(false);
      if (
        enabledRef.current &&
        (modeRef.current === "passive" || modeRef.current === "command")
      ) {
        scheduleRestart(benign ? 400 : 800);
      }
    };

    Voice.onSpeechEnd = () => {
      isListeningRef.current = false;
      setIsListening(false);
      if (
        enabledRef.current &&
        (modeRef.current === "passive" || modeRef.current === "command")
      ) {
        scheduleRestart(200);
      }
    };

    // Start immediately
    startListening();

    return () => {
      clearCommandTimer();
      clearRestartTimer();
      Speech.stop();
      isSpeakingRef.current = false;
      Voice.onSpeechResults = () => {};
      Voice.onSpeechPartialResults = () => {};
      Voice.onSpeechError = () => {};
      Voice.onSpeechEnd = () => {};
      Voice.destroy().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — all logic reads current values via refs

  // React to enabled toggling at runtime
  useEffect(() => {
    // We can't call startListening/stopListening here since they live inside
    // the mount effect. Signal via enabledRef and let the scheduleRestart
    // logic pick it up, OR use Voice directly for the disable case.
    if (!enabled) {
      Speech.stop();
      isSpeakingRef.current = false;
      if (commandTimerRef.current) {
        clearTimeout(commandTimerRef.current);
        commandTimerRef.current = null;
      }
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }
      Voice.stop().catch(() => {});
      Voice.destroy().catch(() => {});
      isListeningRef.current = false;
      setIsListening(false);
      modeRef.current = "passive";
      setMode("passive");
    }
    // Re-enabling: the next scheduleRestart call inside the Voice handlers
    // will restart listening automatically once enabledRef flips to true.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { mode, lastTranscript, isListening, error };
}
