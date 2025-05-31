import { useLanguageStore } from "@/lib/store/language";
import enMessages from "@/messages/en.json";
import itMessages from "@/messages/it.json";

type Messages = typeof enMessages;

function getNestedValue(obj: any, path: string): string {
  return path.split(".").reduce((acc, part) => acc?.[part], obj) as string;
}

export function useTranslation() {
  const { language } = useLanguageStore();
  const messages = language === "en" ? enMessages : itMessages;

  const t = (key: string) => {
    return getNestedValue(messages, key) || key;
  };

  return { t, language };
}
