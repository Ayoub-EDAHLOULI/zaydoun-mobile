/**
 * useZaydounVoice
 *
 * Siri-style wake-word controller.
 * Uses expo-speech-recognition for STT + expo-speech for TTS.
 *
 * State machine:
 *   passive  ──(wake word)──▶  acknowledging  ──(TTS done)──▶  command
 *   command  ──(action | stop | timeout)──▶  passive
 */

import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import * as Speech from "expo-speech";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { BookSummary } from "@/types/books.types";

export type VoiceMode = "passive" | "acknowledging" | "command";

export interface ZaydounVoiceOptions {
  books: BookSummary[];
  onStartRecording?: () => void;
  onSendRecording?: () => void;
  onCancelRecording?: () => void;
  onShowKeyboard?: () => void;
  onGoBack?: () => void;
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
// Wake-word patterns
// ---------------------------------------------------------------------------

const WAKE_PATTERNS = [
  /\bzaydou?n\b/i,
  /\bzaidoo?n\b/i,
  /\bzaidun\b/i,
  /\bzay\s?dun\b/i,
  /\bthey\s?done\b/i,
  /\bthey\s?don'?t\b/i,
  /\bsay\s?down\b/i,
  /\bzey\s?don\b/i,
  /\bzeydun\b/i,
  /\bzie\s?done\b/i,
  /\bthey\s?down\b/i,
  /\bthe\s?dawn\b/i,
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
// Command regexes — English + Arabic
// ---------------------------------------------------------------------------

// "open / discuss / talk about X" | "افتح / ابدأ / ناقش / تحدث عن X"
const OPEN_RE =
  /(?:open|start(?:\s+conversation(?:\s+on)?)?|discuss|talk\s+about|افتح(?:\s+كتاب)?|ابدأ(?:\s+(?:محادثة(?:\s+(?:عن|في|حول))?|كتاب))?|ناقش|تحدث\s+عن|حول)\s+(.+)/i;

const RECORD_RE =
  /\b(?:start\s+(?:an?\s+)?(?:audio|recording?)|record(?:ing)?|سجّل|سجل|ابدأ\s+(?:التسجيل|تسجيل))\b/i;

const CANCEL_RECORD_RE =
  /\b(?:cancel\s+(?:the\s+)?recording|stop\s+recording|إلغاء\s+التسجيل|أوقف\s+التسجيل|الغِ\s+التسجيل)\b/i;

const SEND_RE =
  /\b(?:send(?:\s+(?:the\s+)?(?:audio|message|it))?|أرسل(?:\s+(?:الرسالة|الصوت|الصوتية))?)\b/i;

const KEYBOARD_RE =
  /\b(?:open\s+keyboard|show\s+keyboard|type(?:\s+(?:a\s+)?message)?|keyboard|اكتب|افتح\s+لوحة(?:\s+المفاتيح)?|لوحة\s+المفاتيح)\b/i;

const BACK_RE =
  /\b(?:go\s+back|back(?:\s+(?:to\s+)?(?:home|library|previous))?|ارجع|رجوع|العودة)\b/i;

const STOP_RE = /\b(?:stop|cancel|never\s*mind|quit|exit|توقف|إلغاء|اخرج)\b/i;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useZaydounVoice({
  books,
  onStartRecording,
  onSendRecording,
  onCancelRecording,
  onShowKeyboard,
  onGoBack,
  userName = "there",
  commandWindowMs = 7000,
  enabled = true,
}: ZaydounVoiceOptions): ZaydounVoiceState {
  const [mode, setMode] = useState<VoiceMode>("passive");
  const [lastTranscript, setLastTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // All mutable state lives in refs so event callbacks always read current values
  const modeRef = useRef<VoiceMode>("passive");
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const commandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Props in refs so callbacks don't go stale
  const booksRef = useRef(books);
  const onStartRef = useRef(onStartRecording);
  const onSendRef = useRef(onSendRecording);
  const onCancelRef = useRef(onCancelRecording);
  const onKeyboardRef = useRef(onShowKeyboard);
  const onGoBackRef = useRef(onGoBack);
  const enabledRef = useRef(enabled);
  const userNameRef = useRef(userName);
  const commandWindowRef = useRef(commandWindowMs);

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
    onCancelRef.current = onCancelRecording;
  }, [onCancelRecording]);
  useEffect(() => {
    onKeyboardRef.current = onShowKeyboard;
  }, [onShowKeyboard]);
  useEffect(() => {
    onGoBackRef.current = onGoBack;
  }, [onGoBack]);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);
  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);
  useEffect(() => {
    commandWindowRef.current = commandWindowMs;
  }, [commandWindowMs]);

  // ---------------------------------------------------------------------------
  // All logic in refs so useSpeechRecognitionEvent callbacks never go stale
  // ---------------------------------------------------------------------------

  const clearCommandTimer = useRef(() => {
    if (commandTimerRef.current) {
      clearTimeout(commandTimerRef.current);
      commandTimerRef.current = null;
    }
  }).current;

  const clearRestartTimer = useRef(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }).current;

  const startListeningRef = useRef<() => void>(() => {});
  const abortListeningRef = useRef<() => void>(() => {});
  const scheduleRestartRef = useRef<(ms: number) => void>(() => {});
  const setModeR = useRef<(m: VoiceMode) => void>(() => {});
  const returnToPassiveRef = useRef<() => void>(() => {});
  const openCommandWindowRef = useRef<() => void>(() => {});
  const handleWakeWordRef = useRef<() => void>(() => {});
  const handleCommandRef = useRef<(t: string) => void>(() => {});

  const permissionGrantedRef = useRef(false);
  const intentionalAbortRef = useRef(false);
  const mountedRef = useRef(true);

  // Wire up all logic once — these functions close over stable refs only
  useEffect(() => {
    mountedRef.current = true;

    startListeningRef.current = () => {
      if (
        !mountedRef.current ||
        isListeningRef.current ||
        isSpeakingRef.current ||
        !enabledRef.current ||
        !permissionGrantedRef.current
      )
        return;
      try {
        intentionalAbortRef.current = false;
        ExpoSpeechRecognitionModule.start({
          lang: "en-US",
          continuous: false, // more reliable on Android — we restart manually on end
          interimResults: true,
        });
        isListeningRef.current = true;
        setIsListening(true);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Voice start failed");
      }
    };

    abortListeningRef.current = () => {
      intentionalAbortRef.current = true;
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {
        /* ignore */
      }
      isListeningRef.current = false;
      setIsListening(false);
    };

    scheduleRestartRef.current = (delayMs: number) => {
      clearRestartTimer();
      restartTimerRef.current = setTimeout(() => {
        if (
          enabledRef.current &&
          !isListeningRef.current &&
          !isSpeakingRef.current &&
          (modeRef.current === "passive" || modeRef.current === "command")
        ) {
          startListeningRef.current();
        }
      }, delayMs);
    };

    setModeR.current = (m: VoiceMode) => {
      modeRef.current = m;
      setMode(m);
    };

    returnToPassiveRef.current = () => {
      clearCommandTimer();
      setModeR.current("passive");
      scheduleRestartRef.current(100);
    };

    openCommandWindowRef.current = () => {
      setModeR.current("command");
      clearCommandTimer();
      startListeningRef.current();
      commandTimerRef.current = setTimeout(
        () => returnToPassiveRef.current(),
        commandWindowRef.current,
      );
    };

    handleWakeWordRef.current = () => {
      if (modeRef.current !== "passive") return;
      setModeR.current("acknowledging");
      clearCommandTimer();
      abortListeningRef.current();
      isSpeakingRef.current = true;
      Speech.speak(`Yes, ${userNameRef.current}?`, {
        language: "en-US",
        pitch: 1.05,
        rate: 0.92,
        onDone: () => {
          isSpeakingRef.current = false;
          openCommandWindowRef.current();
        },
        onStopped: () => {
          isSpeakingRef.current = false;
          openCommandWindowRef.current();
        },
        onError: () => {
          isSpeakingRef.current = false;
          openCommandWindowRef.current();
        },
      });
    };

    handleCommandRef.current = (transcript: string) => {
      const t = transcript.toLowerCase().trim();
      const raw = transcript.trim();

      // Back
      if (BACK_RE.test(t)) {
        onGoBackRef.current ? onGoBackRef.current() : router.back();
        returnToPassiveRef.current();
        return;
      }
      // Cancel recording
      if (CANCEL_RECORD_RE.test(t)) {
        onCancelRef.current?.();
        returnToPassiveRef.current();
        return;
      }
      // Keyboard
      if (KEYBOARD_RE.test(t)) {
        onKeyboardRef.current?.();
        returnToPassiveRef.current();
        return;
      }
      // Start recording
      if (RECORD_RE.test(t)) {
        onStartRef.current?.();
        returnToPassiveRef.current();
        return;
      }
      // Send
      if (SEND_RE.test(t)) {
        onSendRef.current?.();
        returnToPassiveRef.current();
        return;
      }
      // Stop / cancel
      if (STOP_RE.test(t)) {
        returnToPassiveRef.current();
        return;
      }
      // Open book — try prefix match first, then raw transcript as fallback
      const m = OPEN_RE.exec(raw);
      const query = m ? m[1].trim() : raw;
      const book = bestBookMatch(query, booksRef.current);
      if (book) {
        clearCommandTimer();
        abortListeningRef.current();
        setModeR.current("passive");
        router.push(`/conversation?bookId=${book.id}` as "/");
        scheduleRestartRef.current(2000);
      }
    };

    // Request permission once — all refs are populated by now
    ExpoSpeechRecognitionModule.requestPermissionsAsync().then(
      ({ granted }) => {
        if (!granted) {
          setError("Microphone permission denied");
          return;
        }
        permissionGrantedRef.current = true;
        startListeningRef.current();
      },
    );

    return () => {
      mountedRef.current = false;
      intentionalAbortRef.current = true;
      clearCommandTimer();
      clearRestartTimer();
      Speech.stop();
      isSpeakingRef.current = false;
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {
        /* ignore */
      }
      isListeningRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle enabled toggle
  useEffect(() => {
    if (!enabled) {
      Speech.stop();
      isSpeakingRef.current = false;
      clearCommandTimer();
      clearRestartTimer();
      abortListeningRef.current();
      modeRef.current = "passive";
      setMode("passive");
    } else {
      // Re-enabling: kick off listening
      scheduleRestartRef.current(200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // ---------------------------------------------------------------------------
  // STT events — always read latest logic via refs, never stale
  // ---------------------------------------------------------------------------

  useSpeechRecognitionEvent("result", (event) => {
    if (isSpeakingRef.current) return;
    const transcript = event.results[0]?.transcript ?? "";
    if (!transcript) return;
    setLastTranscript(transcript);
    if (modeRef.current === "passive") {
      if (containsWakeWord(transcript)) handleWakeWordRef.current();
    } else if (modeRef.current === "command") {
      // Only act on final results for commands to avoid partial mismatches
      if (event.isFinal) handleCommandRef.current(transcript);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    const code = String(event.error ?? "");
    const aborted = code === "aborted" || intentionalAbortRef.current;
    if (!aborted && code !== "no-speech") setError(code);
    isListeningRef.current = false;
    setIsListening(false);
    if (!mountedRef.current || intentionalAbortRef.current) return;
    if (
      enabledRef.current &&
      (modeRef.current === "passive" || modeRef.current === "command")
    ) {
      scheduleRestartRef.current(code === "no-speech" ? 800 : 1200);
    }
  });

  useSpeechRecognitionEvent("end", () => {
    isListeningRef.current = false;
    if (!mountedRef.current || intentionalAbortRef.current) {
      setIsListening(false);
      return;
    }
    if (
      enabledRef.current &&
      (modeRef.current === "passive" || modeRef.current === "command")
    ) {
      // Restart after 800ms — long enough to avoid mic icon flickering on Android
      scheduleRestartRef.current(800);
      // Only show "idle" in the UI if we haven't restarted yet after 600ms
      setTimeout(() => {
        if (!isListeningRef.current) setIsListening(false);
      }, 600);
    } else {
      setIsListening(false);
    }
  });

  return { mode, lastTranscript, isListening, error };
}
