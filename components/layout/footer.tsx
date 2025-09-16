import Link from "next/link";

import { Facebook, Instagram, Twitter, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="pt-16 pb-5 md:pt-24 bg-white text-center">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Title and Description */}
        <h2 className="text-xl lg:text-[32] font-bold text-[#0A1A2F] mb-4">
          Resta informato. Rimani un passo avanti.
        </h2>
        <p className="text-[18px] font-munish font-normal text-[#333333] mb-12 max-w-3xl mx-auto">
          Iscriviti alla nostra newsletter per ricevere direttamente nella tua
          casella di posta gli ultimi aggiornamenti sulle partite, le notizie di
          mercato, interviste esclusive e offerte speciali da Goal-Mania.
        </p>

        {/* Newsletter Form */}
        <div className="flex justify-center mb-16 font-munish">
          <div className="w-full max-w-2xl bg-gray-200 rounded-full p-2 flex items-center shadow-inner">
            <input
              type="email"
              placeholder="Inserisci la tua email"
              className="w-full bg-transparent text-gray-700 px-6 py-3 focus:outline-none placeholder-gray-500"
            />
            <button
              type="submit"
              className="bg-orange-500 text-[#131228] px-8 py-3 rounded-full font-medium cursor-pointer hover:bg-orange-600 transition-colors"
            >
              Iscriviti
            </button>
          </div>
        </div>

        <div className=" flex flex-row gap-2 mx-auto  justify-center items-center">
          <nav className="flex flex-wrap justify-center space-x-4 md:space-x-8 text-[#333333] font-munish font-medium mb-6">
            <Link
              href="/about"
              className="hover:text-[#333333] transition-colors"
            >
              About
            </Link>
            <Link
              href="/news"
              className="hover:text-[#333333] transition-colors"
            >
              News
            </Link>
            <Link
              href="/contact"
              className="hover:text-[#333333] transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/privacy"
              className="hover:text-[#333333] transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-[#333333] transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/account/orders"
              className="hover:text-[#333333] transition-colors"
            >
              Orders
            </Link>
          </nav>

          <div className="flex justify-center space-x-4 md:space-x-6 text-[#333333] pl-4 border-l border-[#333333] mb-6">
            <Link
              href="https://www.tiktok.com/@goalmania_"
              aria-label="Globe"
              className="hover:text-gray-800 transition-colors"
            >
              <Globe size={24} />
            </Link>
            <Link
              href="https://x.com/goalmania_"
              aria-label="Twitter"
              className="hover:text-gray-800 transition-colors"
            >
              <Twitter size={24} />
            </Link>
            <Link
              href="https://www.instagram.com/goalmaniaofficial/"
              aria-label="Instagram"
              className="hover:text-gray-800 transition-colors"
            >
              <Instagram size={24} />
            </Link>
            {/* <Link
              href="#"
              aria-label="Facebook"
              className="hover:text-gray-800 transition-colors"
            >
              <Facebook size={24} />
            </Link> */}
          </div>
        </div>
        <div className="font-munish text-[#333333] text-[14px] mt-10">
          &copy; 2025 Goal Mania. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
