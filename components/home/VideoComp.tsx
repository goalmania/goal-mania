import { Video } from "lucide-react";
import React from "react";

const VideoComp = () => {
  const newsImages = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&h=200&fit=crop&crop=center",
      alt: "Soccer match action shot",
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=300&h=200&fit=crop&crop=center",
      alt: "Team training session",
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop&crop=center",
      alt: "Soccer coach portrait",
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&h=200&fit=crop&crop=center",
      alt: "Match action",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white pt-8">
      {/* Header */}
      <div className="text-center py-12 px-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4">
          Ultime Notizie
        </h1>
        <p className="text-base md:text-lg text-black max-w-2xl mx-auto leading-relaxed">
          Scopri le notizie più fresche e importanti dal mondo del calcio,
          aggiornate in tempo reale
        </p>
      </div>

      {/* Image Gallery */}
      <div className="px-4 md:px-8 lg:px-16">
        <div className="flex  justify-center gap-2 max-w-7xl mx-auto">
          {newsImages.map((image, index) => (
            <div
              key={image.id}
              className={`
                relative overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer
                ${index === 0 ? "w-72 h-80" : "w-48 md:w-56 h-72 md:h-80"}
              `}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="bg-blue-600 text-xs px-2 py-1 rounded mb-2 inline-block">
                  CALCIO
                </div>
                <h3 className="font-semibold text-sm">
                  {index === 0 && "Giovani talenti in evidenza"}
                  {index === 1 && "Highlights della partita"}
                  {index === 2 && "Allenamento intensivo"}
                  {index === 3 && "Intervista esclusiva"}
                  {index === 4 && "Momenti decisivi"}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoComp;
