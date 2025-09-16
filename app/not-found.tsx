"use client";
import Link from "next/link";
import { useI18n } from "@/lib/hooks/useI18n";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <main className="grid min-h-full  bg-white px-6 py-24 sm:py-32 lg:px-12 ">
      <div className=" flex justify-between">
        <div className="w-1/2">
          <div className="text-start">
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-black sm:text-7xl">
              {t("notFound.title")}
            </h1>
            <p className="mt-6 text-lg font-medium text-pretty text-[#333333] sm:text-xl/8">
              {t("notFound.description")}
            </p>
            <div className="mt-10 flex items-start justify-start gap-x-6">
              <Link
                href="/"
                className="rounded-full flex items-center  bg-[#FF7A00] px-3.5 py-2.5 text-sm font-medium text-[#0A1A2F] font-munish shadow-xs hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {t("notFound.goHome")}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
        <div className="">
          <div className="relative w-[400px] h-[290px]">
            <Image
              src="/images/aboutimages/notfound.png"
              alt="Not Found"
              fill
              className=" object-cover"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
