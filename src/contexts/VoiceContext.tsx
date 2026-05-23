/**
 * VoiceContext
 *
 * Mounts useZaydounVoice globally so the wake word is always active
 * while the app is in the foreground, regardless of which screen is shown.
 *
 * Usage anywhere in the tree:
 *   const { mode, isListening } = useVoice();
 *   const { setVoiceEnabled } = useVoice(); // pause during modals / recordings
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import { BookSummary } from "@/types/books.types";
import { booksService } from "@/lib/api/services/books.service";
import { useAuth } from "@/contexts/AuthContext";
import { ZaydounVoiceState, useZaydounVoice } from "@/hooks/useZaydounVoice";

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface VoiceContextType extends ZaydounVoiceState {
  /** Disable the voice listener (e.g. while a recording modal is open). */
  setVoiceEnabled: (enabled: boolean) => void;
  /** Expose the current enabled flag so consumers can read it. */
  voiceEnabled: boolean;
  /** Inject recording callbacks from the active screen. */
  setRecordingCallbacks: (
    onStart: (() => void) | null,
    onSend: (() => void) | null,
  ) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Inner component that actually calls the hook
// (Needed so hooks run inside the provider tree)
// ---------------------------------------------------------------------------

function VoiceController({
  books,
  enabled,
  onStartRecording,
  onSendRecording,
  onStateChange,
  userName,
}: {
  books: BookSummary[];
  enabled: boolean;
  onStartRecording: (() => void) | null;
  onSendRecording: (() => void) | null;
  onStateChange: (s: ZaydounVoiceState) => void;
  userName: string;
}) {
  const state = useZaydounVoice({
    books,
    enabled,
    onStartRecording: onStartRecording ?? undefined,
    onSendRecording: onSendRecording ?? undefined,
    userName: userName,
    commandWindowMs: 7000,
  });

  // Bubble state up to the provider without a second context
  const prevRef = useRef<ZaydounVoiceState | null>(null);
  useEffect(() => {
    const prev = prevRef.current;
    if (
      !prev ||
      prev.mode !== state.mode ||
      prev.isListening !== state.isListening ||
      prev.error !== state.error ||
      prev.lastTranscript !== state.lastTranscript
    ) {
      prevRef.current = state;
      onStateChange(state);
    }
  });

  return null; // renders nothing
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  const [books, setBooks] = useState<BookSummary[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [onStartRecording, setOnStartRecording] = useState<(() => void) | null>(
    null,
  );
  const [onSendRecording, setOnSendRecording] = useState<(() => void) | null>(
    null,
  );
  const [voiceState, setVoiceState] = useState<ZaydounVoiceState>({
    mode: "passive",
    lastTranscript: "",
    isListening: false,
    error: null,
  });

  // Pause voice when app goes to background; resume when foregrounded
  useEffect(() => {
    const sub = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") {
          setVoiceEnabled(true);
        } else if (nextState === "background" || nextState === "inactive") {
          setVoiceEnabled(false);
        }
      },
    );
    return () => sub.remove();
  }, []);

  // Fetch book list once authenticated (and refresh when auth state changes)
  useEffect(() => {
    if (!isAuthenticated) {
      setBooks([]);
      return;
    }
    booksService
      .list()
      .then((list) => setBooks(list.filter((b) => b.status === "READY")))
      .catch(() => {});
  }, [isAuthenticated]);

  const setRecordingCallbacks = useCallback(
    (onStart: (() => void) | null, onSend: (() => void) | null) => {
      // useState setters accept functions, so wrap in an outer function to
      // prevent React treating them as updater functions.
      setOnStartRecording(() => onStart);
      setOnSendRecording(() => onSend);
    },
    [],
  );

  // Don't mount the Voice listener until authenticated — no point waking
  // up on login / onboarding screens
  const active = isAuthenticated && voiceEnabled;

  return (
    <VoiceContext.Provider
      value={{
        ...voiceState,
        voiceEnabled,
        setVoiceEnabled,
        setRecordingCallbacks,
      }}
    >
      {active && (
        <VoiceController
          books={books}
          enabled={active}
          onStartRecording={onStartRecording}
          onSendRecording={onSendRecording}
          onStateChange={setVoiceState}
          userName={user?.name?.split(" ")[0] || "my friend"}
        />
      )}
      {children}
    </VoiceContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------

export function useVoice(): VoiceContextType {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error("useVoice must be used within <VoiceProvider>");
  return ctx;
}
