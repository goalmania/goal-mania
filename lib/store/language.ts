import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Language = "en" | "it";

interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
}

// Check if window is defined (browser) or not (server/SSR)
const isWindowDefined = typeof window !== "undefined";

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: "it",
      setLanguage: (language) => set({ language }),
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
    }
  )
);
