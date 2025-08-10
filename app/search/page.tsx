import { Metadata } from "next";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Article from "@/lib/models/Article";
import SearchClient from "./SearchClient";

export const metadata: Metadata = {
  title: "Cerca | Goal Mania",
  description: "Cerca prodotti e notizie su Goal Mania",
};

// Pure client page: pre-render statically for fastest TTFB
export const dynamic = "force-static";

export default function SearchPage() {
  return <SearchClient initialProducts={[]} initialArticles={[]} query="" />;
}
