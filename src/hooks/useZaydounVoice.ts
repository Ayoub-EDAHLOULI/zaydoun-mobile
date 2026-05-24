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

  const modeRef = useRef<VoiceMode>("passive");
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const commandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const booksRef = useRef(books);
  const onStartRef = useRef(onStartRecording);
  const onSendRef = useRef(onSendRecording);
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
    enabledRef.current = enabled;
  }, [enabled]);
  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);
  useEffect(() => {
    commandWindowRef.current = commandWindowMs;
  }, [commandWindowMs]);

  // -------------------------------------------------------------------------
  // STT helpers (called from event handlers and effects — stable via refs)
  // -------------------------------------------------------------------------

  const startListening = () => {
    if (isListeningRef.current || isSpeakingRef.current || !enabledRef.current)
      return;
    ExpoSpeechRecognitionModule.requestPermissionsAsync().then(
      ({ granted }) => {
        if (!granted) {
          setError("Microphone permission denied");
          return;
        }
        try {
          ExpoSpeechRecognitionModule.start({
            lang: "en-US",
            continuous: true,
            interimResults: true,
          });
          isListeningRef.current = true;
          setIsListening(true);
          setError(null);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Voice start failed");
        }
      },
    );
  };

  const abortListening = () => {
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {
      /* ignore */
    }
    isListeningRef.current = false;
    setIsListening(false);
  };

  // -------------------------------------------------------------------------
  // Timers
  // -------------------------------------------------------------------------

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

  // -------------------------------------------------------------------------
  // State transitions
  // -------------------------------------------------------------------------

  const setModeRef = (m: VoiceMode) => {
    modeRef.current = m;
    setMode(m);
  };

  const returnToPassive = () => {
    clearCommandTimer();
    setModeRef("passive");
    scheduleRestart(300);
  };

  const openCommandWindow = () => {
    setModeRef("command");
    clearCommandTimer();
    startListening();
    commandTimerRef.current = setTimeout(
      returnToPassive,
      commandWindowRef.current,
    );
  };

  const handleWakeWord = () => {
    if (modeRef.current !== "passive") return;
    setModeRef("acknowledging");
    clearCommandTimer();
    abortListening();

    isSpeakingRef.current = true;
    Speech.speak(`Yes, ${userNameRef.current}?`, {
      language: "en-US",
      pitch: 1.05,
      rate: 0.92,
      onDone: () => {
        isSpeakingRef.current = false;
        openCommandWindow();
      },
      onStopped: () => {
        isSpeakingRef.current = false;
        openCommandWindow();
      },
      onError: () => {
        isSpeakingRef.current = false;
        openCommandWindow();
      },
    });
  };

  const handleCommand = (transcript: string) => {
    const t = transcript.toLowerCase().trim();

    if (STOP_RE.test(t)) {
      returnToPassive();
      return;
    }
    if (RECORD_RE.test(t)) {
      onStartRef.current?.();
      returnToPassive();
      return;
    }
    if (SEND_RE.test(t)) {
      onSendRef.current?.();
      returnToPassive();
      return;
    }

    const m = OPEN_RE.exec(t);
    if (m) {
      const book = bestBookMatch(m[1].trim(), booksRef.current);
      if (book) {
        clearCommandTimer();
        abortListening();
        setModeRef("passive");
        router.push(`/conversation?bookId=${book.id}` as "/");
        scheduleRestart(2000);
        return;
      }
    }
    // No match — keep the command window open
  };

  // -------------------------------------------------------------------------
  // expo-speech-recognition events
  // -------------------------------------------------------------------------

  useSpeechRecognitionEvent("result", (event) => {
    if (isSpeakingRef.current) return;
    const transcript = event.results[0]?.transcript ?? "";
    if (!transcript) return;
    setLastTranscript(transcript);
    if (modeRef.current === "passive") {
      if (containsWakeWord(transcript)) handleWakeWord();
    } else if (modeRef.current === "command") {
      handleCommand(transcript);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    const code = String(event.error ?? "");
    const benign = code === "no-speech" || code === "aborted";
    if (!benign) setError(code);
    isListeningRef.current = false;
    setIsListening(false);
    if (
      enabledRef.current &&
      (modeRef.current === "passive" || modeRef.current === "command")
    ) {
      scheduleRestart(benign ? 400 : 800);
    }
  });

  useSpeechRecognitionEvent("end", () => {
    isListeningRef.current = false;
    setIsListening(false);
    if (
      enabledRef.current &&
      (modeRef.current === "passive" || modeRef.current === "command")
    ) {
      scheduleRestart(200);
    }
  });

  // -------------------------------------------------------------------------
  // Mount: start listening + cleanup
  // -------------------------------------------------------------------------

  useEffect(() => {
    startListening();
    return () => {
      clearCommandTimer();
      clearRestartTimer();
      Speech.stop();
      isSpeakingRef.current = false;
      ExpoSpeechRecognitionModule.abort();
      isListeningRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to enabled toggling
  useEffect(() => {
    if (!enabled) {
      Speech.stop();
      isSpeakingRef.current = false;
      clearCommandTimer();
      clearRestartTimer();
      abortListening();
      modeRef.current = "passive";
      setMode("passive");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { mode, lastTranscript, isListening, error };
}
