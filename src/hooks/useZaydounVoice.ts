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
 * Setup (one-time):
 *   npx expo install expo-speech-recognition expo-speech
 *   expo-speech-recognition is auto-added to app.json plugins by expo install.
 *   Requires a development build — does NOT run in Expo Go.
 */

import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";
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
  /** Last error message, if any. Clears on the next successful start. */
  error: string | null;
  /** True after the user has granted mic + speech-recognition permissions. */
  hasPermission: boolean;
}

// ---------------------------------------------------------------------------
// Wake-word patterns
// Covers common STT mis-transcriptions of the Arabic name "Zaydoun".
// ---------------------------------------------------------------------------

const WAKE_PATTERNS = [
  /\bzaydou?n\b/i, // zaydoun, zaydon
  /\bzaidoo?n\b/i, // zaidoon, zaidon
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
  const [hasPermission, setHasPermission] = useState(false);

  // Refs keep callbacks always up-to-date inside event handlers
  // without needing to re-subscribe every render.
  const modeRef = useRef<VoiceMode>("passive");
  const isListeningRef = useRef(false);
  const commandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const booksRef = useRef(books);
  const onStartRef = useRef(onStartRecording);
  const onSendRef = useRef(onSendRecording);
  const enabledRef = useRef(enabled);
  const hasPermissionRef = useRef(false);

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
  // Permission
  // -------------------------------------------------------------------------

  useEffect(() => {
    ExpoSpeechRecognitionModule.requestPermissionsAsync().then((res) => {
      const granted = res.granted;
      hasPermissionRef.current = granted;
      setHasPermission(granted);
    });
  }, []);

  // -------------------------------------------------------------------------
  // STT start / stop
  // -------------------------------------------------------------------------

  const startListening = useCallback(() => {
    if (
      isListeningRef.current ||
      !enabledRef.current ||
      !hasPermissionRef.current
    )
      return;

    isListeningRef.current = true;
    setIsListening(true);
    setError(null);

    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      continuous: true,
      // Bias the recogniser toward Zaydoun so it's less likely to mishear
      contextualStrings: [
        "Zaydoun",
        "Zaidoun",
        "Zaydon",
        "open",
        "record",
        "send",
        "stop",
      ],
    });
  }, []);

  const stopListening = useCallback(() => {
    if (!isListeningRef.current) return;
    isListeningRef.current = false;
    setIsListening(false);
    ExpoSpeechRecognitionModule.abort();
  }, []);

  // -------------------------------------------------------------------------
  // Timer helpers
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
          hasPermissionRef.current &&
          !isListeningRef.current &&
          (modeRef.current === "passive" || modeRef.current === "command")
        ) {
          startListening();
        }
      }, delayMs);
    },
    [clearRestartTimer, startListening],
  );

  // -------------------------------------------------------------------------
  // State transitions
  // -------------------------------------------------------------------------

  const returnToPassive = useCallback(() => {
    clearCommandTimer();
    setModeSync("passive");
    if (!isListeningRef.current) {
      scheduleRestart(100);
    }
  }, [clearCommandTimer, setModeSync, scheduleRestart]);

  const openCommandWindow = useCallback(() => {
    setModeSync("command");
    clearCommandTimer();
    // The recogniser may already be running (continuous mode).
    // If it was stopped for TTS, restart it now.
    if (!isListeningRef.current) {
      startListening();
    }
    commandTimerRef.current = setTimeout(returnToPassive, commandWindowMs);
  }, [
    setModeSync,
    clearCommandTimer,
    startListening,
    returnToPassive,
    commandWindowMs,
  ]);

  // -------------------------------------------------------------------------
  // Wake word handling
  // -------------------------------------------------------------------------

  const handleWakeWord = useCallback(() => {
    if (modeRef.current !== "passive") return;
    setModeSync("acknowledging");
    clearCommandTimer();

    // Stop STT so it doesn't transcribe the TTS reply
    stopListening();

    Speech.speak(`Yes, ${userName}?`, {
      language: "en-US",
      pitch: 1.0,
      rate: 0.9,
      onDone: openCommandWindow,
      onStopped: openCommandWindow,
      onError: openCommandWindow,
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
    (transcript: string) => {
      if (STOP_RE.test(transcript)) {
        returnToPassive();
        return;
      }

      if (RECORD_RE.test(transcript)) {
        onStartRef.current?.();
        returnToPassive();
        return;
      }

      if (SEND_RE.test(transcript)) {
        onSendRef.current?.();
        returnToPassive();
        return;
      }

      const bookMatch = OPEN_RE.exec(transcript);
      if (bookMatch) {
        const query = bookMatch[1].trim();
        const book = bestBookMatch(query, booksRef.current);
        if (book) {
          clearCommandTimer();
          stopListening();
          setModeSync("passive");
          router.push(`/conversation/index?bookId=${book.id}` as "/");
          // Give the navigation animation time before restarting
          scheduleRestart(2000);
        }
        // No match → stay in command window until timeout
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
  // Subscribe to ExpoSpeechRecognitionModule events
  // -------------------------------------------------------------------------

  useEffect(() => {
    const resultSub = ExpoSpeechRecognitionModule.addListener(
      "result",
      (event) => {
        const transcript = event.results[0]?.transcript ?? "";
        if (!transcript) return;
        setLastTranscript(transcript);

        if (modeRef.current === "passive") {
          if (containsWakeWord(transcript)) handleWakeWord();
        } else if (modeRef.current === "command") {
          // Act on final results only to avoid acting on half-phrases
          if (event.isFinal) handleCommand(transcript);
          else if (STOP_RE.test(transcript)) returnToPassive();
        }
      },
    );

    const errorSub = ExpoSpeechRecognitionModule.addListener(
      "error",
      (event) => {
        // "no-speech" and "aborted" are normal operational events, not real errors.
        const benign =
          event.error === "no-speech" ||
          event.error === "aborted" ||
          event.error === "speech-timeout";

        if (!benign) {
          setError(event.message);
        }

        isListeningRef.current = false;
        setIsListening(false);

        // Auto-restart after benign stops; back off 600 ms on real errors
        if (
          enabledRef.current &&
          (modeRef.current === "passive" || modeRef.current === "command")
        ) {
          scheduleRestart(benign ? 200 : 600);
        }
      },
    );

    const endSub = ExpoSpeechRecognitionModule.addListener("end", () => {
      isListeningRef.current = false;
      setIsListening(false);
      // Restart in passive/command mode to keep the loop alive
      if (
        enabledRef.current &&
        (modeRef.current === "passive" || modeRef.current === "command")
      ) {
        scheduleRestart(150);
      }
    });

    return () => {
      resultSub.remove();
      errorSub.remove();
      endSub.remove();
    };
  }, [handleWakeWord, handleCommand, returnToPassive, scheduleRestart]);

  // -------------------------------------------------------------------------
  // Start / stop based on `enabled` prop and permission
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
    // Only re-run when the enabled flag or permission status changes.
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
      ExpoSpeechRecognitionModule.abort();
    };
  }, [clearCommandTimer, clearRestartTimer]);

  return { mode, lastTranscript, isListening, error, hasPermission };
}
