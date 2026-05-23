/**
 * useZaydounVoice
 *
 * Hands-free Siri-style voice controller for Zaydoun.
 * Uses expo-speech-recognition (SDK 54) + expo-speech for TTS.
 *
 * State machine:
 *   passive  ──(wake word)──▶  acknowledging  ──(TTS done)──▶  command
 *   command  ──(action | stop | timeout)──▶  passive
 *
 * Requires a development build — does NOT run in Expo Go.
 * Build: npx expo run:android  /  npx expo run:ios
 */

import * as Speech from "expo-speech";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookSummary } from "@/types/books.types";

// ---------------------------------------------------------------------------
// Lazy native module load
//
// expo-speech-recognition calls requireNativeModule() at the top of its own
// index.js, which throws synchronously in Expo Go before any try/catch in
// application code can catch it. We must avoid triggering that module
// evaluation at all when the native side isn't present.
//
// Solution: dynamic require() inside a try/catch so Metro only evaluates the
// package when we explicitly ask — and we catch the throw here rather than
// letting it propagate up through the layout tree.
// ---------------------------------------------------------------------------

type SpeechRecognitionModule =
  typeof import("expo-speech-recognition").ExpoSpeechRecognitionModule;
type ResultEvent =
  import("expo-speech-recognition").ExpoSpeechRecognitionResultEvent;
type ErrorEvent =
  import("expo-speech-recognition").ExpoSpeechRecognitionErrorEvent;

let STT: SpeechRecognitionModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = require("expo-speech-recognition") as typeof import("expo-speech-recognition");
  STT = pkg.ExpoSpeechRecognitionModule ?? null;
} catch {
  // Native module not registered — running in Expo Go.
  // Voice features are silently disabled; the app continues normally.
}

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
  /** Last error message, if any. Clears on the next successful start. */
  error: string | null;
  /** True after the user granted mic + speech-recognition permissions. */
  hasPermission: boolean;
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

function bestBookMatch(query: string, books: BookSummary[]): BookSummary | null {
  if (!books.length || !query.trim()) return null;
  const q = query.toLowerCase().trim();
  let best: BookSummary | null = null;
  let bestScore = Infinity;
  for (const book of books) {
    const t = book.title.toLowerCase();
    if (t.includes(q) || q.includes(t)) return book;
    const score = levenshtein(q, t) / Math.max(q.length, t.length);
    if (score < bestScore) { bestScore = score; best = book; }
  }
  return bestScore <= 0.5 ? best : null;
}

// ---------------------------------------------------------------------------
// Command regexes
// ---------------------------------------------------------------------------

const OPEN_RE   = /(?:open|start\s+conversation\s+on|discuss)\s+(.+)/i;
const RECORD_RE = /\b(?:start\s+(?:an?\s+)?audio|record(?:ing)?)\b/i;
const SEND_RE   = /\b(?:send\s+(?:the\s+)?(?:audio|message)|send\s+it)\b/i;
const STOP_RE   = /\b(?:stop|cancel|never\s*mind)\b/i;

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
  const [mode, setMode]                     = useState<VoiceMode>("passive");
  const [lastTranscript, setLastTranscript] = useState("");
  const [isListening, setIsListening]       = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [hasPermission, setHasPermission]   = useState(false);

  const modeRef          = useRef<VoiceMode>("passive");
  const isListeningRef   = useRef(false);
  const commandTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const booksRef         = useRef(books);
  const onStartRef       = useRef(onStartRecording);
  const onSendRef        = useRef(onSendRecording);
  const enabledRef       = useRef(enabled);
  const hasPermissionRef = useRef(false);

  useEffect(() => { booksRef.current  = books;             }, [books]);
  useEffect(() => { onStartRef.current = onStartRecording; }, [onStartRecording]);
  useEffect(() => { onSendRef.current  = onSendRecording;  }, [onSendRecording]);
  useEffect(() => { enabledRef.current = enabled;          }, [enabled]);

  const setModeSync = useCallback((m: VoiceMode) => {
    modeRef.current = m;
    setMode(m);
  }, []);

  // -------------------------------------------------------------------------
  // Permission
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!STT) return;
    STT.requestPermissionsAsync().then((res) => {
      hasPermissionRef.current = res.granted;
      setHasPermission(res.granted);
    });
  }, []);

  // -------------------------------------------------------------------------
  // STT control
  // -------------------------------------------------------------------------

  const startListening = useCallback(() => {
    if (!STT || isListeningRef.current || !enabledRef.current || !hasPermissionRef.current) return;
    isListeningRef.current = true;
    setIsListening(true);
    setError(null);
    STT.start({
      lang: "en-US",
      interimResults: true,
      continuous: true,
      contextualStrings: ["Zaydoun", "Zaidoun", "Zaydon", "open", "record", "send", "stop"],
    });
  }, []);

  const stopListening = useCallback(() => {
    if (!STT || !isListeningRef.current) return;
    isListeningRef.current = false;
    setIsListening(false);
    STT.abort();
  }, []);

  // -------------------------------------------------------------------------
  // Timers
  // -------------------------------------------------------------------------

  const clearCommandTimer = useCallback(() => {
    if (commandTimerRef.current) { clearTimeout(commandTimerRef.current); commandTimerRef.current = null; }
  }, []);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) { clearTimeout(restartTimerRef.current); restartTimerRef.current = null; }
  }, []);

  const scheduleRestart = useCallback((delayMs: number) => {
    clearRestartTimer();
    restartTimerRef.current = setTimeout(() => {
      if (
        enabledRef.current &&
        hasPermissionRef.current &&
        !isListeningRef.current &&
        (modeRef.current === "passive" || modeRef.current === "command")
      ) startListening();
    }, delayMs);
  }, [clearRestartTimer, startListening]);

  // -------------------------------------------------------------------------
  // State transitions
  // -------------------------------------------------------------------------

  const returnToPassive = useCallback(() => {
    clearCommandTimer();
    setModeSync("passive");
    if (!isListeningRef.current) scheduleRestart(100);
  }, [clearCommandTimer, setModeSync, scheduleRestart]);

  const openCommandWindow = useCallback(() => {
    setModeSync("command");
    clearCommandTimer();
    if (!isListeningRef.current) startListening();
    commandTimerRef.current = setTimeout(returnToPassive, commandWindowMs);
  }, [setModeSync, clearCommandTimer, startListening, returnToPassive, commandWindowMs]);

  // -------------------------------------------------------------------------
  // Wake word
  // -------------------------------------------------------------------------

  const handleWakeWord = useCallback(() => {
    if (modeRef.current !== "passive") return;
    setModeSync("acknowledging");
    clearCommandTimer();
    stopListening();
    Speech.speak(`Yes, ${userName}?`, {
      language: "en-US",
      pitch: 1.0,
      rate: 0.9,
      onDone: openCommandWindow,
      onStopped: openCommandWindow,
      onError: openCommandWindow,
    });
  }, [setModeSync, clearCommandTimer, stopListening, userName, openCommandWindow]);

  // -------------------------------------------------------------------------
  // Command parsing
  // -------------------------------------------------------------------------

  const handleCommand = useCallback((transcript: string) => {
    if (STOP_RE.test(transcript))   { returnToPassive(); return; }
    if (RECORD_RE.test(transcript)) { onStartRef.current?.(); returnToPassive(); return; }
    if (SEND_RE.test(transcript))   { onSendRef.current?.();  returnToPassive(); return; }
    const m = OPEN_RE.exec(transcript);
    if (m) {
      const book = bestBookMatch(m[1].trim(), booksRef.current);
      if (book) {
        clearCommandTimer();
        stopListening();
        setModeSync("passive");
        router.push(`/conversation/index?bookId=${book.id}` as "/");
        scheduleRestart(2000);
      }
    }
  }, [returnToPassive, clearCommandTimer, stopListening, setModeSync, scheduleRestart]);

  // -------------------------------------------------------------------------
  // Event subscriptions (only when STT module is available)
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!STT) return;

    const resultSub = STT.addListener("result", (event: ResultEvent) => {
      const transcript = event.results[0]?.transcript ?? "";
      if (!transcript) return;
      setLastTranscript(transcript);

      if (modeRef.current === "passive") {
        if (containsWakeWord(transcript)) handleWakeWord();
      } else if (modeRef.current === "command") {
        if (event.isFinal) handleCommand(transcript);
        else if (STOP_RE.test(transcript)) returnToPassive();
      }
    });

    const errorSub = STT.addListener("error", (event: ErrorEvent) => {
      const benign =
        event.error === "no-speech" ||
        event.error === "aborted" ||
        event.error === "speech-timeout";
      if (!benign) setError(event.message);
      isListeningRef.current = false;
      setIsListening(false);
      if (enabledRef.current && (modeRef.current === "passive" || modeRef.current === "command")) {
        scheduleRestart(benign ? 200 : 600);
      }
    });

    const endSub = STT.addListener("end", () => {
      isListeningRef.current = false;
      setIsListening(false);
      if (enabledRef.current && (modeRef.current === "passive" || modeRef.current === "command")) {
        scheduleRestart(150);
      }
    });

    return () => { resultSub.remove(); errorSub.remove(); endSub.remove(); };
  }, [handleWakeWord, handleCommand, returnToPassive, scheduleRestart]);

  // -------------------------------------------------------------------------
  // Start / stop on enabled / permission change
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (enabled && hasPermission) {
      startListening();
    } else if (!enabled) {
      clearCommandTimer();
      clearRestartTimer();
      Speech.stop();
      stopListening();
      setModeSync("passive");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, hasPermission]);

  // -------------------------------------------------------------------------
  // Cleanup on unmount
  // -------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      clearCommandTimer();
      clearRestartTimer();
      Speech.stop();
      STT?.abort();
    };
  }, [clearCommandTimer, clearRestartTimer]);

  return { mode, lastTranscript, isListening, error, hasPermission };
}
