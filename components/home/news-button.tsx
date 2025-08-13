"use client";

import { useTranslation } from "@/lib/hooks/useTranslation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewsButton() {
  const { t } = useTranslation();
  return (
    <div className="mt-6 sm:mt-8 text-center">
      <Button asChild variant="outline" size="default">
        <Link href="/news">
          {t("news")}
          <span aria-hidden="true" className="ml-1 sm:ml-2">
            →
          </span>
        </Link>
      </Button>
    </div>
  );
}
