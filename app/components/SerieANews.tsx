"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";

interface NewsItem {
  _id: string;
  title: string;
  summary: string;
  image: string;
  publishedAt: string;
  slug: string;
  featured?: boolean;
}

// Mock news data for fallback
const mockNews: NewsItem[] = [
  {
    _id: "1",
    title:
      "Inter, la stella di Lautaro continua a brillare: doppietta contro il Milan",
    summary:
      "L'attaccante argentino segna due gol nel derby e si conferma capocannoniere della Serie A",
    publishedAt: "2024-05-22T10:00:00.000Z",
    image: "https://placehold.co/600x400/indigo/white?text=Serie+A+News",
    slug: "inter-lautaro-derby",
    featured: true,
  },
  {
    _id: "2",
    title:
      "Napoli, Conte prepara una rivoluzione tattica per la prossima stagione",
    summary:
      "Il tecnico vuole passare alla difesa a quattro per valorizzare i nuovi acquisti",
    publishedAt: "2024-05-21T09:00:00.000Z",
    image: "https://placehold.co/600x400/indigo/white?text=Serie+A+News",
    slug: "napoli-conte-tattica",
  },
  {
    _id: "3",
    title:
      "Juventus, pronto un grande colpo a centrocampo: i dettagli dell'operazione",
    summary:
      "La dirigenza bianconera sta lavorando per portare a Torino un top player internazionale",
    publishedAt: "2024-05-20T14:30:00.000Z",
    image: "https://placehold.co/600x400/indigo/white?text=Serie+A+News",
    slug: "juventus-centrocampo-mercato",
  },
  {
    _id: "4",
    title: "Milan, Leao verso il rinnovo: cifre e dettagli del nuovo contratto",
    summary:
      "Il talento portoghese pronto a legarsi ai rossoneri fino al 2028 con un importante adeguamento salariale",
    publishedAt: "2024-05-19T11:45:00.000Z",
    image: "https://placehold.co/600x400/indigo/white?text=Serie+A+News",
    slug: "milan-leao-rinnovo",
  },
];

export function SerieANews() {
  const [news, setNews] = useState<NewsItem[]>(mockNews);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/news/serie-a?limit=4");

        if (
          response.data &&
          response.data.articles &&
          response.data.articles.length > 0
        ) {
          setNews(response.data.articles);
        } else {
          // Use mock data as fallback
          setError("Nessuna notizia trovata. Mostrando contenuto di esempio.");
        }
      } catch (err) {
        console.error("Error fetching Serie A news:", err);
        setError(
          "Impossibile caricare le notizie. Mostrando contenuto di esempio."
        );
        // Keep using mock data
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-gray-100 animate-pulse h-64 rounded-lg"
            ></div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-gray-100 animate-pulse h-24 rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-amber-800 bg-amber-50 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {news.slice(0, 2).map((article) => (
          <Link
            key={article._id}
            href={`/serieA/${article.slug}`}
            className="group"
          >
            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="relative h-48 w-full">
                <Image
                  src={article.image}
                  alt={article.title}
                  className="object-cover"
                  fill
                  unoptimized
                />
                {article.featured && (
                  <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                    In Evidenza
                  </div>
                )}
                <div className="absolute top-2 right-2 text-xs bg-black bg-opacity-70 text-white px-2 py-1 rounded">
                  {new Date(article.publishedAt).toLocaleDateString("it-IT")}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="mt-2 text-gray-600 text-sm line-clamp-3">
                  {article.summary}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {news.slice(2).map((article) => (
          <Link
            key={article._id}
            href={`/serieA/${article.slug}`}
            className="group"
          >
            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col sm:flex-row h-full">
              <div className="relative h-32 sm:h-auto sm:w-1/3 flex-shrink-0">
                <Image
                  src={article.image}
                  alt={article.title}
                  className="object-cover"
                  fill
                  unoptimized
                />
              </div>
              <div className="p-3 flex-1">
                <div className="flex justify-between items-start mb-1">
                  {article.featured && (
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                      In Evidenza
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(article.publishedAt).toLocaleDateString("it-IT")}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="mt-1 text-gray-600 text-xs line-clamp-2">
                  {article.summary}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/serieA"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
        >
          Vedi tutte le notizie
          <svg
            className="ml-1 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
