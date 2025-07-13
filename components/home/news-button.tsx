"use client";

import { useTranslation } from "@/lib/hooks/useTranslation";
import Link from "next/link";

export default function NewsButton() {
  const { t } = useTranslation();
  return (
    <div className="mt-6 sm:mt-8 text-center">
      <Link
        href="/news"
        className="inline-flex items-center rounded-md bg-white px-3 py-2 sm:px-3.5 sm:py-2.5 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-600 hover:bg-indigo-50"
      >
        {t("news")}
        <span aria-hidden="true" className="ml-1 sm:ml-2">
          →
        </span>
      </Link>
    </div>
  );
}
