import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Language = "en" | "it";

interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
}

// Check if window is defined (browser) or not (server/SSR)
const isWindowDefined = typeof window !== "undefined";

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: "it",
      setLanguage: (language) => {
        console.log('🌍 Language store: setting language to', language)
        set({ language })
      },
      toggleLanguage: () => {
        const currentLanguage = get().language
        const newLanguage = currentLanguage === "en" ? "it" : "en"
        console.log('🔄 Language store: toggling language from', currentLanguage, 'to', newLanguage)
        set({ language: newLanguage })
      },
      _hasHydrated: false,
      setHasHydrated: (hasHydrated) => {
        console.log('🌍 Language store: setting hydration to', hasHydrated)
        set({ _hasHydrated: hasHydrated })
      },
    }),
    {
      name: "language-storage",
      storage: createJSONStorage(() => {
        return isWindowDefined
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            };
      }),
      onRehydrateStorage: () => (state) => {
        console.log('🌍 Language store: rehydrated with', state?.language)
        if (state) {
          state.setHasHydrated(true)
        }
      },
    }
  )
);

// Debug store subscriptions
if (typeof window !== 'undefined') {
  useLanguageStore.subscribe((state) => {
    console.log('🌍 Language store: state changed to', state.language)
  })
}
