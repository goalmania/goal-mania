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
    <div
      className="sticky top-20 z-30 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200"
    >
      <form
        onSubmit={handleSearch}
        className="max-w-3xl font-munish mx-auto my-2 py-3"
      >
        <div className="relative mx-3">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca prodotti, articoli..."
            className="block w-full rounded-full border-0 py-3 bg-[#F0F0F0] pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset sm:text-sm sm:leading-6"
          />
          <button
            type="submit"
            className="absolute border-black hidden items-center md:flex inset-y-0 mr-4 right-0 border rounded-full m-1.5 px-4 py-2 bg-transparent text-[#0A1A2F] hover:bg-gray-100 focus:outline-none focus:ring-1"
          >
            Cerca
            <ArrowRight className="inline-flex mr-1.5 w-4 items-center h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
