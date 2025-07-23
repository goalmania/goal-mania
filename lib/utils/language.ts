import { useLanguageStore } from "@/lib/store/language"

/**
 * Custom hook for language functionality
 * Provides consistent language toggle and state management
 */
export function useLanguage() {
  const { language, toggleLanguage, setLanguage, _hasHydrated } = useLanguageStore()
  
  return {
    language,
    toggleLanguage,
    setLanguage,
    isHydrated: _hasHydrated,
    isEnglish: language === "en",
    isItalian: language === "it"
  }
}

/**
 * Utility function to get language display text
 */
export function getLanguageDisplayText(language: "en" | "it") {
  return language === "en" ? "EN" : "IT"
}

/**
 * Utility function to get language full name
 */
export function getLanguageFullName(language: "en" | "it") {
  return language === "en" ? "English" : "Italiano"
} 