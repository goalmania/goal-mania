import React from "react";
import { Calendar, Clock, Eye } from "lucide-react";

// Mock data structure based on your NewsArticle type
const mockArticles = [
  {
    id: 1,
    slug: "gol-spettacolo-prima-giornata",
    title: "Gol e Spettacolo nella Prima Giornata di Campionato",
    summary:
      "Una giornata ricca di emozioni e gol spettacolari che ha dato il via alla nuova stagione calcistica",
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
    category: "Serie A",
    publishedAt: "2024-08-27T10:00:00Z",
    readTime: "5 mins",
    views: 1250,
  },
  {
    id: 2,
    slug: "juventus-prepara-fase-gironi",
    title: "La Juventus si Prepara alla Fase a Gironi",
    summary:
      "I bianconeri si preparano per la fase a gironi della Champions League con nuovi acquisti",
    image:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop",
    category: "Champions League",
    publishedAt: "2024-08-27T09:30:00Z",
    readTime: "4 mins",
    views: 980,
  },
  {
    id: 3,
    slug: "stadio-piu-bello-europa-secondo",
    title: "Lo Stadio Più Bello d'Europa Secondo",
    summary: "Classifica degli stadi più belli e moderni del calcio europeo",
    image:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=600&fit=crop",
    category: "Serie A",
    publishedAt: "2024-08-27T08:45:00Z",
    readTime: "6 mins",
    views: 756,
  },
  {
    id: 4,
    slug: "attori-last-minute-colpi-mercato",
    title: "Attori Last Minute: I Colpi di Fine Mercato",
    summary:
      "Gli ultimi movimenti di mercato prima della chiusura della sessione estiva",
    image:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&h=600&fit=crop",
    category: "Serie A",
    publishedAt: "2024-08-27T07:15:00Z",
    readTime: "7 mins",
    views: 892,
  },
  {
    id: 5,
    slug: "migliori-prestazioni-settimana",
    title: "Le Migliori Prestazioni della Settimana",
    summary: "I giocatori che si sono distinti maggiormente negli ultimi match",
    image:
      "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&h=600&fit=crop",
    category: "Serie A",
    publishedAt: "2024-08-26T18:20:00Z",
    readTime: "5 mins",
    views: 634,
  },
  {
    id: 6,
    slug: "derby-milano-tutti-numeri",
    title: "Derby di Milano: Tutti i Numeri e le Curiosità",
    summary: "Statistiche e curiosità sul derby più atteso della stagione",
    image:
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
    category: "Serie A",
    publishedAt: "2024-08-26T16:30:00Z",
    readTime: "8 mins",
    views: 1456,
  },
];

interface NewsCardProps {
  article: any;
  isLarge?: boolean;
  className?: string;
}

const NewsCard = ({
  article,
  isLarge = false,
  className = "",
}: NewsCardProps) => {
  const getCategoryLabel = (category?: string) => {
    switch (category?.toLowerCase()) {
      case "serie a":
        return "SERIE A";
      case "champions league":
        return "CHAMPIONS LEAGUE";
      default:
        return "SERIE A";
    }
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, "0")} ${d
      .toLocaleDateString("it-IT", {
        month: "short",
      })
      .toUpperCase()}, ${d.getFullYear()}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  if (isLarge) {
    return (
      <div className={`group cursor-pointer ${className}`}>
        <div className="relative overflow-hidden rounded-lg bg-gray-900 shadow-xl">
          {/* Background Image */}
          <div className="relative h-64 sm:h-80">
            <img
              src={article.image}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div>
                <span className="inline-block px-3 py-1.5 bg-[#FFFFFF]/30 backdrop-blur-lg text-white text-xs font-bold uppercase rounded tracking-wide shadow-lg">
                  {getCategoryLabel(article.category)}
                </span>
              </div>
              <h3 className="text-white text-lg sm:text-xl font-bold leading-tight mb-2 group-hover:text-orange-400 transition-colors duration-300">
                {article.title}
              </h3>

              <div className="flex items-center justify-between text-xs text-gray-300 uppercase tracking-wide">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(article.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`group cursor-pointer ${className}`}>
      <div className="relative overflow-hidden rounded-lg bg-gray-900 shadow-lg hover:shadow-xl transition-shadow duration-300">
        {/* Background Image */}
        <div className="relative h-48">
          <img
            src={article.image}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="">
              <span className="inline-block px-2 py-1 bg-[#FFFFFF4D] text-white text-xs font-bold uppercase rounded tracking-wide">
                {getCategoryLabel(article.category)}
              </span>
            </div>
            <h3 className="text-white text-sm font-bold leading-tight mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors duration-300">
              {article.title}
            </h3>

            <div className="flex items-center justify-between text-xs text-gray-300 uppercase tracking-wide">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(article.publishedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.readTime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NewsCardsGrid = () => {
  const popularArticles = mockArticles.slice(0, 4);
  const recentArticles = mockArticles;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Popular News */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header */}
            <div className="relative max-w-lg">
              <div className="absolute -top-6 left-0 bg-gray-900 rounded-[6px] text-white font-semibold py-2 px-6  slanted-card  shadow-md z-10">
                Notizie Più Popolari
              </div>
              <div className="pt-8 border-t-2  border-[#DFDFDF]"></div>{" "}
            </div>

            {/* Featured Article */}
            <NewsCard
              article={popularArticles[0]}
              isLarge={true}
              className="mb-8"
            />

            {/* Grid of smaller articles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularArticles.slice(1).map((article, index) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </div>

          {/* Right Column - Recent Posts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}

            <div className="relative max-w-lg">
              <div className="absolute -top-6 left-0 bg-gray-900 rounded-[6px] text-white font-semibold py-2 px-6  slanted-card  shadow-md z-10">
                Post Recenti
              </div>
              <div className="pt-8 border-t-2  border-[#DFDFDF]"></div>{" "}
            </div>

            {/* Recent Posts List */}
            <div className="space-y-4">
              {recentArticles.map((article, index) => (
                <div key={article.id} className="group cursor-pointer">
                  <div className="flex gap-3 p-3 bg-white  transition-shadow duration-200 ">
                    {/* Small Image */}
                    <div className="flex-shrink-0">
                      <div className="relative w-16 h-full rounded overflow-hidden">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        <p className="px-5 py-2 whitespace-nowrap border-[1.33px] h-[29px] flex items-center w-[90px] border-[#B8C1CD] text-[#6D757F] my-2 rounded-[3.99px] uppercase text-[13px]">
                          SERIE A
                        </p>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors duration-200 mb-1">
                        {article.title}
                      </h4>

                      {/* Meta */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{article.publishedAt}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCardsGrid;
