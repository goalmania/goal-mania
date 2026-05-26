"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { ArrowRight } from "lucide-react";

interface ShopSearchBarProps {
  initialQuery?: string;
}

export default function ShopSearchBar({
  initialQuery = "",
}: ShopSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams?.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(queryParam || initialQuery);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("q", searchQuery);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="max-w-3xl font-munish mx-auto my-4 pt-4"
    >
      <div className="relative mx-3">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon
            className="h-5 w-5 text-white/40"
            aria-hidden="true"
          />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cerca maglie, squadre, articoli..."
          className="block w-full rounded-full py-3 pl-10 pr-3 text-white text-sm outline-none transition-all"
          style={{
            background: "#111",
            border: "1.5px solid rgba(200,240,0,0.2)",
            fontFamily: "var(--font-body, sans-serif)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#c8f000")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(200,240,0,0.2)")}
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 m-1.5 hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full font-black text-[#0a0a0a] text-xs uppercase tracking-wide transition-all hover:opacity-90"
          style={{ background: "#c8f000" }}
        >
          Cerca
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}
