"use client";

import React from "react";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

const WhatsAppButton = () => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const phoneNumber = "393334218596";
  const message = "Ciao! Vorrei avere informazioni sulle maglie.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="mb-3 bg-white text-[#0A1A2F] px-4 py-2 rounded-xl shadow-2xl border border-gray-100 text-sm font-bold whitespace-nowrap"
          >
            Contattaci direttamente
            <div className="absolute -bottom-1 right-5 w-2 h-2 bg-white border-r border-b border-gray-100 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#20ba5a] transition-colors flex items-center justify-center group"
        aria-label="Contattaci su WhatsApp"
      >
        <IconBrandWhatsapp size={32} stroke={2} />
        
        {/* Mobile only text or persistent text variant if needed */}
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-3 transition-all duration-500 ease-in-out font-black uppercase tracking-tighter text-xs">
          WhatsApp
        </span>
      </motion.a>
    </div>
  );
};

export default WhatsAppButton;
