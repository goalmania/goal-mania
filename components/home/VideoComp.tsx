"use client";

import { Play } from "lucide-react";
import React, { useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  team: string;
  videos?: string[];
}

interface VideoCompProps {
  products?: Product[];
}

const VideoComp = ({ products = [] }: VideoCompProps) => {
  const [playingVideo, setPlayingVideo] = useState<string | number | null>(null);

  // Debug: Check if products have videos
  useEffect(() => {
    console.log("🎬 VideoComp received products:", products);
    console.log("🎬 Products with videos:", products.filter(p => p.videos && p.videos.length > 0));
  }, [products]);

  // Demo videos as fallback
  const demoVideos = [
    {
      id: 1,
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&h=200&fit=crop&crop=center",
      alt: "Soccer match action shot",
      title: "Giovani talenti in evidenza",
      isDemo: true,
    },
    {
      id: 2,
      videoUrl: "https://www.w3schools.com/html/movie.mp4",
      thumbnail: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=300&h=200&fit=crop&crop=center",
      alt: "Team training session",
      title: "Highlights della partita",
      isDemo: true,
    },
    {
      id: 3,
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnail: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop&crop=center",
      alt: "Soccer coach portrait",
      title: "Allenamento intensivo",
      isDemo: true,
    },
    {
      id: 4,
      videoUrl: "https://www.w3schools.com/html/movie.mp4",
      thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&h=200&fit=crop&crop=center",
      alt: "Match action",
      title: "Intervista esclusiva",
      isDemo: true,
    },
  ];

  // Filter products with videos (EXACT same logic as ProductDetailClient)
  const productVideos = products
    .filter((product) => {
      const hasVideos = product.videos && Array.isArray(product.videos) && product.videos.length > 0;
      console.log(`Product "${product.name}" has videos:`, hasVideos, product.videos);
      return hasVideos;
    })
    .slice(-4)
    .map((product) => ({
      id: product.id,
      videoUrl: product.videos![0],
      thumbnail: product.image,
      alt: product.name,
      title: product.name,
      isDemo: false,
    }));

  console.log("🎥 Product videos to display:", productVideos);

  const displayVideos = productVideos.length > 0 ? productVideos : demoVideos;

  const toggleVideo = (id: string | number) => {
    setPlayingVideo(playingVideo === id ? null : id);
  };

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

      {/* Show demo badge if using demo videos */}
      {productVideos.length === 0 && (
        <div className="text-center mb-4">
          <span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
            🎬 Video Demo - I prodotti con video saranno disponibili presto
          </span>
        </div>
      )}

      {/* Video Gallery - Original Design */}
      <div className="px-4 md:px-8 lg:px-16">
        <div className="flex justify-center gap-2 max-w-7xl mx-auto">
          {displayVideos.map((video, index) => (
            <div
              key={video.id}
              className={`
                relative overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer
                ${index === 0 ? "w-72 h-80" : "w-48 md:w-56 h-72 md:h-80"}
              `}
            >
              {playingVideo === video.id ? (
                <video
                  src={video.videoUrl}
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                  onEnded={() => setPlayingVideo(null)}
                />
              ) : (
                <>
                  <video
                    src={video.videoUrl}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    poster={video.thumbnail}
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-center justify-center"
                    onClick={() => toggleVideo(video.id)}
                  >
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all hover:scale-110">
                      <Play
                        className="w-6 h-6 text-[#FF7A00] ml-1"
                        fill="currentColor"
                      />
                    </div>
                  </div>
                  <div
                    className="absolute bottom-4 left-4 right-4 text-white"
                    onClick={() => toggleVideo(video.id)}
                  >
                    {/* <div className="bg-blue-600 text-xs px-2 py-1 rounded mb-2 inline-block">
                      CALCIO
                    </div> */}
                    <h3 className="font-semibold text-sm">{video.title}</h3>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoComp;
