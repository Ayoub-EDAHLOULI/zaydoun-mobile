import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Locale, TRANSLATIONS, Translations } from "@/i18n/translations";

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

const REPLY_LANG_KEY = "zaydoun_reply_language";
const UI_LANG_KEY = "zaydoun_ui_language";

interface LanguageContextType {
  replyLanguage: Language;
  setReplyLanguage: (lang: Language) => void;
  uiLanguage: Language;
  setUiLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [replyLanguage, setReplyLanguageState] = useState<Language>(
    LANGUAGES[0],
  );
  const [uiLanguage, setUiLanguageState] = useState<Language>(LANGUAGES[0]);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(REPLY_LANG_KEY),
      AsyncStorage.getItem(UI_LANG_KEY),
    ]).then(([reply, ui]) => {
      if (reply) {
        const found = LANGUAGES.find((l) => l.code === reply);
        if (found) setReplyLanguageState(found);
      }
      if (ui) {
        const found = LANGUAGES.find((l) => l.code === ui);
        if (found) setUiLanguageState(found);
      }
    });
  }, []);

  const setReplyLanguage = useCallback((lang: Language) => {
    setReplyLanguageState(lang);
    AsyncStorage.setItem(REPLY_LANG_KEY, lang.code);
  }, []);

  const setUiLanguage = useCallback((lang: Language) => {
    setUiLanguageState(lang);
    AsyncStorage.setItem(UI_LANG_KEY, lang.code);
  }, []);

  const t = TRANSLATIONS[uiLanguage.code as Locale] ?? TRANSLATIONS.en;

  return (
    <LanguageContext.Provider
      value={{ replyLanguage, setReplyLanguage, uiLanguage, setUiLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

/** Shorthand — returns only the translations object */
export function useT(): Translations {
  return useLanguage().t;
}
