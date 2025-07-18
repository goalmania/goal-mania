"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface ShopSearchBarProps {
  initialQuery?: string;
}

export default function ShopSearchBar({ initialQuery = "" }: ShopSearchBarProps) {
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
    <form onSubmit={handleSearch} className="max-w-3xl mx-auto my-1">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cerca prodotti, articoli..."
          className="block w-full rounded-md border-0 py-3 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Cerca
        </button>
      </div>
    </form>
  );
} 