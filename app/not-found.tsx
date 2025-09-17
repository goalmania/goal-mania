"use client";
import Link from "next/link";
import { useI18n } from "@/lib/hooks/useI18n";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <main className="grid min-h-full  bg-white px-6 py-24 sm:py-32 lg:px-12 ">
      <div className=" flex flex-col md:flex-row justify-between">
        <div className="md:w-1/2 w-full">
          <div className="md:text-start text-center">
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-black sm:text-7xl">
              {t("notFound.title")}
            </h1>
            <p className="mt-6 text-lg font-medium font-munish text-pretty text-[#333333] sm:text-xl/8">
              {t("notFound.description")}
            </p>
            <div className="mt-10 md:flex items-start justify-start gap-x-6 hidden ">
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
          <div className="relative md:w-[400px] w-full mt-5 md:mt-0 h-[290px]">
            <Image
              src="/images/aboutimages/notfound.png"
              alt="Not Found"
              fill
              className=" object-cover"
            />
          </div>
        </div>
        <div className="mt-10 flex items-start justify-center gap-x-6 md:hidden ">
          <Link
            href="/"
            className="rounded-full flex items-center  bg-[#FF7A00] px-3.5 py-2.5 text-sm font-medium text-[#0A1A2F] font-munish shadow-xs hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t("notFound.goHome")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}
