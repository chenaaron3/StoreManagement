import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enTranslations from "../locales/en.json";
import jaTranslations from "../locales/ja.json";

// Extract language from URL path if present (e.g., /en/manager, /ja/associate)
const getLanguageFromPath = (): string | null => {
  const path = window.location.pathname;
  const match = path.match(/^\/(en|ja)(\/|$)/);
  return match ? match[1] : null;
};

// Get initial language from URL or browser
const getInitialLanguage = (): string => {
  const langFromPath = getLanguageFromPath();
  if (langFromPath) {
    return langFromPath;
  }
  const browserLang = navigator.language.split("-")[0];
  return ["en", "ja"].includes(browserLang) ? browserLang : "en";
};

const initialLanguage = getInitialLanguage();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      ja: {
        translation: jaTranslations,
      },
    },
    lng: initialLanguage,
    fallbackLng: "en",
    supportedLngs: ["en", "ja"],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ["path", "localStorage", "navigator"],
      lookupFromPathIndex: 0,
      caches: ["localStorage"],
    },
  });

export default i18n;
