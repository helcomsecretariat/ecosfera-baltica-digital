import i18n, { Resources } from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { isDebugging } from "@/hooks/useDebugMode";

const getBaseLanguage = (language: string) => language.split("-")[0];

const loadLocale = async (language: string) => {
  try {
    // Try loading the exact language variant first
    const translations = await import(`@/locales/${language}/translation.json`);
    return translations.default;
  } catch {
    // If the specific variant fails and it's a variant (e.g., en-GB), try the base language (e.g., en)
    if (language.includes("-")) {
      const baseLanguage = getBaseLanguage(language);
      try {
        const translations = await import(`@/locales/${baseLanguage}/translation.json`);
        return translations.default;
      } catch {
        console.info(`Neither ${language} nor ${baseLanguage} translations found, using fallback`);
        return null;
      }
    }
    console.info(`Translation file for ${language} not found, using fallback`);
    return null;
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    backend: {
      loadPath: "{{lng}}",
      request: async (
        _options: unknown,
        url: string,
        _payload: unknown,
        callback: (error: unknown, data: unknown) => void,
      ) => {
        try {
          const lng = url;
          const data = await loadLocale(lng);
          callback(null, {
            status: 200,
            data,
          });
        } catch (e) {
          callback(e, null);
        }
      },
    },
    detection: {
      order: ["navigator"],
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
    debug: isDebugging,
  });

export type TranslationKey = RecursiveKeyOf<Resources["translation"]>;

export type TranslatedString = RecursiveValueOf<Resources["translation"]>;

// Utility type to get all nested key paths
type RecursiveKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends string
          ? K
          : T[K] extends object
            ? `${K}.${RecursiveKeyOf<T[K]>}`
            : never
        : never;
    }[keyof T]
  : never;

// Utility type to get all string values
type RecursiveValueOf<T> = T extends object
  ? T extends { [key: string]: infer U }
    ? U extends string
      ? U
      : RecursiveValueOf<U>
    : never
  : T extends string
    ? T
    : never;

export default i18n;
