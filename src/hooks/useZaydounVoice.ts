/**
 * useZaydounVoice
 *
 * Hands-free Siri-style voice controller for Zaydoun.
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
import { useCallback, useEffect, useRef, useState } from "react";
import { BookSummary } from "@/types/books.types";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type VoiceMode = "passive" | "acknowledging" | "command";

export interface ZaydounVoiceOptions {
  books: BookSummary[];
  onStartRecording?: () => void;
  onSendRecording?: () => void;
  /** Name spoken in the greeting. Defaults to "Ayoub". */
  userName?: string;
  /** Command window length in ms. Defaults to 7000. */
  commandWindowMs?: number;
  /** Set false to pause the listener entirely. */
  enabled?: boolean;
}

export interface ZaydounVoiceState {
  mode: VoiceMode;
  /** Last raw transcript received (handy for a debug overlay). */
  lastTranscript: string;
  isListening: boolean;
  /** Last error message, if any. */
  error: string | null;
}

// ---------------------------------------------------------------------------
// Wake-word patterns
// Covers common STT mis-transcriptions of the Arabic name "Zaydoun".
// ---------------------------------------------------------------------------

const WAKE_PATTERNS = [
  /\bzaydou?n\b/i,
  /\bzaidoo?n\b/i,
  /\bzaidun\b/i,
  /\bzay\s?dun\b/i,
  /\bthey\s?done\b/i,
  /\bsay\s?down\b/i,
  /\bzey\s?don\b/i,
];

function containsWakeWord(text: string): boolean {
  return WAKE_PATTERNS.some((re) => re.test(text));
}

// ---------------------------------------------------------------------------
// Fuzzy book title matching (normalised Levenshtein)
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

const OPEN_RE = /(?:open|start\s+conversation\s+on|discuss)\s+(.+)/i;
const RECORD_RE = /\b(?:start\s+(?:an?\s+)?audio|record(?:ing)?)\b/i;
const SEND_RE = /\b(?:send\s+(?:the\s+)?(?:audio|message)|send\s+it)\b/i;
const STOP_RE = /\b(?:stop|cancel|never\s*mind)\b/i;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useZaydounVoice({
  books,
  onStartRecording,
  onSendRecording,
  userName = "Ayoub",
  commandWindowMs = 7000,
  enabled = true,
}: ZaydounVoiceOptions): ZaydounVoiceState {
  const [mode, setMode] = useState<VoiceMode>("passive");
  const [lastTranscript, setLastTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modeRef = useRef<VoiceMode>("passive");
  const isListeningRef = useRef(false);
  const commandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const booksRef = useRef(books);
  const onStartRef = useRef(onStartRecording);
  const onSendRef = useRef(onSendRecording);
  const enabledRef = useRef(enabled);

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

  const setModeSync = useCallback((m: VoiceMode) => {
    modeRef.current = m;
    setMode(m);
  }, []);

  // -------------------------------------------------------------------------
  // STT control
  // -------------------------------------------------------------------------

  const startListening = useCallback(async () => {
    if (isListeningRef.current || !enabledRef.current) return;
    try {
      // Destroy any stale session before starting a new one
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
  }, []);

  const stopListening = useCallback(async () => {
    if (!isListeningRef.current) return;
    try {
      await Voice.stop();
      await Voice.destroy();
    } catch {
      // already stopped
    } finally {
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Timers
  // -------------------------------------------------------------------------

  const clearCommandTimer = useCallback(() => {
    if (commandTimerRef.current) {
      clearTimeout(commandTimerRef.current);
      commandTimerRef.current = null;
    }
  }, []);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const scheduleRestart = useCallback(
    (delayMs: number) => {
      clearRestartTimer();
      restartTimerRef.current = setTimeout(() => {
        if (
          enabledRef.current &&
          !isListeningRef.current &&
          (modeRef.current === "passive" || modeRef.current === "command")
        )
          startListening();
      }, delayMs);
    },
    [clearRestartTimer, startListening],
  );

  // -------------------------------------------------------------------------
  // State transitions
  // -------------------------------------------------------------------------

  const returnToPassive = useCallback(async () => {
    clearCommandTimer();
    setModeSync("passive");
    if (!isListeningRef.current) scheduleRestart(100);
  }, [clearCommandTimer, setModeSync, scheduleRestart]);

  const openCommandWindow = useCallback(async () => {
    setModeSync("command");
    clearCommandTimer();
    if (!isListeningRef.current) await startListening();
    commandTimerRef.current = setTimeout(returnToPassive, commandWindowMs);
  }, [
    setModeSync,
    clearCommandTimer,
    startListening,
    returnToPassive,
    commandWindowMs,
  ]);

  // -------------------------------------------------------------------------
  // Wake word
  // -------------------------------------------------------------------------

  const handleWakeWord = useCallback(async () => {
    if (modeRef.current !== "passive") return;
    setModeSync("acknowledging");
    clearCommandTimer();
    await stopListening();
    Speech.speak(`Yes, ${userName}?`, {
      language: "en-US",
      pitch: 1.0,
      rate: 0.9,
      onDone: () => {
        void openCommandWindow();
      },
      onStopped: () => {
        void openCommandWindow();
      },
      onError: () => {
        void openCommandWindow();
      },
    });
  }, [
    setModeSync,
    clearCommandTimer,
    stopListening,
    userName,
    openCommandWindow,
  ]);

  // -------------------------------------------------------------------------
  // Command parsing
  // -------------------------------------------------------------------------

  const handleCommand = useCallback(
    async (transcript: string) => {
      if (STOP_RE.test(transcript)) {
        await returnToPassive();
        return;
      }
      if (RECORD_RE.test(transcript)) {
        onStartRef.current?.();
        await returnToPassive();
        return;
      }
      if (SEND_RE.test(transcript)) {
        onSendRef.current?.();
        await returnToPassive();
        return;
      }
      const m = OPEN_RE.exec(transcript);
      if (m) {
        const book = bestBookMatch(m[1].trim(), booksRef.current);
        if (book) {
          clearCommandTimer();
          await stopListening();
          setModeSync("passive");
          router.push(`/conversation/index?bookId=${book.id}` as "/");
          scheduleRestart(2000);
        }
      }
    },
    [
      returnToPassive,
      clearCommandTimer,
      stopListening,
      setModeSync,
      scheduleRestart,
    ],
  );

  // -------------------------------------------------------------------------
  // Register Voice event handlers (once on mount)
  // Handlers read current values via refs — no need to re-register on change.
  // -------------------------------------------------------------------------

  useEffect(() => {
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      const transcript = e.value?.[0] ?? "";
      if (!transcript) return;
      setLastTranscript(transcript);
      if (modeRef.current === "passive") {
        if (containsWakeWord(transcript)) handleWakeWord();
      } else if (modeRef.current === "command") {
        handleCommand(transcript);
      }
    };

    Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
      const transcript = e.value?.[0] ?? "";
      if (!transcript) return;
      setLastTranscript(transcript);
      // Check wake word on partials for faster response
      if (modeRef.current === "passive" && containsWakeWord(transcript)) {
        handleWakeWord();
      }
      // Check stop command on partials in command mode
      if (modeRef.current === "command" && STOP_RE.test(transcript)) {
        returnToPassive();
      }
    };

    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      const code = e.error?.code ?? "";
      const msg = e.error?.message ?? "";
      // Code 7 = "No match", common end-of-utterance — not a real error
      const benign =
        code === "7" || code === "recognition_fail" || msg.includes("No match");
      if (!benign) setError(msg);
      isListeningRef.current = false;
      setIsListening(false);
      if (
        enabledRef.current &&
        (modeRef.current === "passive" || modeRef.current === "command")
      ) {
        scheduleRestart(benign ? 300 : 600);
      }
    };

    Voice.onSpeechEnd = () => {
      isListeningRef.current = false;
      setIsListening(false);
      if (
        enabledRef.current &&
        (modeRef.current === "passive" || modeRef.current === "command")
      ) {
        scheduleRestart(150);
      }
    };

    // Start immediately
    if (enabled) startListening();

    return () => {
      clearCommandTimer();
      clearRestartTimer();
      Speech.stop();
      Voice.onSpeechResults = () => {};
      Voice.onSpeechPartialResults = () => {};
      Voice.onSpeechError = () => {};
      Voice.onSpeechEnd = () => {};
      Voice.destroy().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — handlers close over stable refs

  // -------------------------------------------------------------------------
  // React to enabled toggling at runtime
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!enabled) {
      clearCommandTimer();
      clearRestartTimer();
      Speech.stop();
      stopListening();
      setModeSync("passive");
    } else if (!isListeningRef.current) {
      startListening();
    }
  }, [
    enabled,
    clearCommandTimer,
    clearRestartTimer,
    stopListening,
    startListening,
    setModeSync,
  ]);

  return { mode, lastTranscript, isListening, error };
}
