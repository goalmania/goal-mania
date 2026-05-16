// src/components/CallToAction.tsx
import React from 'react';
import { Facebook, Instagram, Twitter, Globe } from 'lucide-react';

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
            <a href="#" className="hover:text-white/80 transition-colors">About</a>
            <a href="#" className="hover:text-white/80 transition-colors">Blog</a>
            <a href="#" className="hover:text-white/80 transition-colors">Contact</a>
            <a href="#" className="hover:text-white/80 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/80 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/80 transition-colors">Shipping</a>
          </nav>
          
          <div className="flex justify-center space-x-4 md:space-x-6 text-white/60 mb-6">
            <a href="#" aria-label="Globe" className="hover:text-white/80 transition-colors">
              <Globe size={24} />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-white/80 transition-colors">
              <Twitter size={24} />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-white/80 transition-colors">
              <Instagram size={24} />
            </a>
            <a href="#" aria-label="Facebook" className="hover:text-white/80 transition-colors">
              <Facebook size={24} />
            </a>
          </div>

          <p className="text-sm text-white/50">
            © 2023 Goal Mania. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;