import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Language {
  code: string;
  label: string;
  flag: string;
  nativeLabel: string;
}

export const LANGUAGES: Language[] = [
  { code: "en", label: "English", flag: "🇬🇧", nativeLabel: "English" },
  { code: "ar", label: "Arabic", flag: "🇸🇦", nativeLabel: "العربية" },
  { code: "fr", label: "French", flag: "🇫🇷", nativeLabel: "Français" },
  { code: "es", label: "Spanish", flag: "🇪🇸", nativeLabel: "Español" },
  { code: "zh", label: "Chinese", flag: "🇨🇳", nativeLabel: "中文" },
];

const STORAGE_KEY = "zaydoun_reply_language";

interface LanguageContextType {
  replyLanguage: Language;
  setReplyLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [replyLanguage, setReplyLanguageState] = useState<Language>(
    LANGUAGES[0],
  );

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        const found = LANGUAGES.find((l) => l.code === stored);
        if (found) setReplyLanguageState(found);
      }
    });
  }, []);

  const setReplyLanguage = useCallback((lang: Language) => {
    setReplyLanguageState(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang.code);
  }, []);

  return (
    <LanguageContext.Provider value={{ replyLanguage, setReplyLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
