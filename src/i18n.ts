import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

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
        console.info(`Using ${baseLanguage} translations for ${language}`);
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
  });

export default i18n;
