import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import ar from "./ar.json";

// Get saved language from localStorage or default to 'en'
const savedLanguage = localStorage.getItem("language") || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// Save language preference whenever it changes
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("language", lng);
  document.dir = lng === "ar" ? "rtl" : "ltr";
});

export default i18n;
