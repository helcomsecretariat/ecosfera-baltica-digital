import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {},
    fallbackLng: "en",
    detection: {
      order: ["navigator"],
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

const loadLocale = async (language: string) => {
  try {
    const translations = await import(`@/locales/${language}/translation.json`);
    i18n.addResourceBundle(language, "translation", translations.default);
  } catch (error) {
    console.error(`Failed to load ${language} translations:`, error);
  }
};

// Load initial language
const currentLang = i18n.language || "en";
loadLocale(currentLang);

// Load fallback language if different from current
if (currentLang !== "en") {
  loadLocale("en");
}

// Handle language changes
i18n.on("languageChanged", (lng) => {
  loadLocale(lng);
});

export default i18n;
