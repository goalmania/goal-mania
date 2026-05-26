// src/components/CallToAction.tsx
import React from 'react';
import { Instagram, Globe } from 'lucide-react';

const CallToAction: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-[#111] text-center">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Title and Description */}
        <h2 className="text-4xl md:text-5xl font-bold text-white/80 mb-4">
          Resta informato. Rimani un passo avanti.
        </h2>
        <p className="text-lg text-white/60 mb-12 max-w-3xl mx-auto">
          Iscriviti alla nostra newsletter per ricevere direttamente nella tua casella di posta gli ultimi aggiornamenti sulle partite, le notizie di mercato, interviste esclusive e offerte speciali da Goal-Mania.
        </p>

        {/* Newsletter Form */}
        <div className="flex justify-center mb-16">
          <div className="w-full max-w-2xl bg-[#1a1a1a] rounded-full p-2 flex items-center shadow-inner">
            <input
              type="email"
              placeholder="Inserisci la tua email"
              className="w-full bg-transparent text-white/70 px-6 py-3 focus:outline-none placeholder-gray-500"
            />
            <button
              type="submit"
              className="bg-[#c8f000] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#c8f000] transition-colors"
            >
              Iscriviti
            </button>
          </div>
        </div>

        {/* Footer Links and Icons */}
        <div className="border-t border-white/10 pt-8">
          <nav className="flex flex-wrap justify-center space-x-4 md:space-x-8 text-white/60 font-medium mb-6">
            <a href="/about" className="hover:text-white/80 transition-colors">Chi Siamo</a>
            <a href="/news" className="hover:text-white/80 transition-colors">News</a>
            <a href="/contact" className="hover:text-white/80 transition-colors">Contatti</a>
            <a href="/privacy" className="hover:text-white/80 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white/80 transition-colors">Termini</a>
            <a href="/shipping" className="hover:text-white/80 transition-colors">Spedizioni</a>
          </nav>
          
          <div className="flex justify-center space-x-5 md:space-x-7 text-white/60 mb-6">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/goalmania.it/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Goal Mania"
              className="hover:text-[#c8f000] transition-colors duration-200"
            >
              <Instagram size={24} />
            </a>
            {/* TikTok — custom SVG (non è in lucide) */}
            <a
              href="https://www.tiktok.com/@goalmania.it"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok Goal Mania"
              className="hover:text-[#c8f000] transition-colors duration-200"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.79a8.18 8.18 0 0 0 4.78 1.52V6.85a4.85 4.85 0 0 1-1.01-.16z"/>
              </svg>
            </a>
            {/* Sito web */}
            <a
              href="https://goal-mania.it"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Goal Mania website"
              className="hover:text-[#c8f000] transition-colors duration-200"
            >
              <Globe size={24} />
            </a>
          </div>

          <p className="text-sm text-white/50">
            © 2025 Goal Mania. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;