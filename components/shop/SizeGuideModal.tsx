"use client";

import { useEffect } from "react";
import { X, Ruler } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SIZE_DATA = [
  { size: "XS", chest: "84-88", waist: "70-74", height: "160-165" },
  { size: "S",  chest: "88-92", waist: "74-78", height: "165-170" },
  { size: "M",  chest: "92-96", waist: "78-82", height: "170-175" },
  { size: "L",  chest: "96-100", waist: "82-86", height: "175-180" },
  { size: "XL", chest: "100-104", waist: "86-90", height: "180-185" },
  { size: "XXL", chest: "104-108", waist: "90-94", height: "185-190" },
  { size: "XXXL", chest: "108-116", waist: "94-102", height: "190-195" },
];

const KIDS_SIZE_DATA = [
  { size: "YXS", chest: "60-64", waist: "52-56", height: "116-122" },
  { size: "YS",  chest: "64-68", waist: "56-60", height: "122-128" },
  { size: "YM",  chest: "68-72", waist: "60-64", height: "128-134" },
  { size: "YL",  chest: "72-76", waist: "64-68", height: "134-140" },
  { size: "YXL", chest: "76-80", waist: "68-72", height: "140-146" },
];

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="bg-[#111] w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        style={{ border: "1px solid rgba(200,240,0,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 sticky top-0 z-10"
          style={{ background: "#111", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(200,240,0,0.12)" }}>
              <Ruler size={16} style={{ color: "#c8f000" }} />
            </div>
            <div>
              <h2
                className="text-base font-black uppercase text-white leading-tight"
                style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "1px" }}
              >
                Guida alle Taglie
              </h2>
              <p className="text-[10px] text-white/40 mt-0.5" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                Misure in centimetri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-8 pt-5 space-y-7">
          {/* How to measure */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: "rgba(200,240,0,0.05)", border: "1px solid rgba(200,240,0,0.12)" }}
          >
            <h3
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: "#c8f000", fontFamily: "var(--font-mono, monospace)" }}
            >
              Come Misurarti
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Petto", desc: "Misura la circonferenza della parte più ampia del petto, tenendo il metro orizzontale sotto le ascelle." },
                { label: "Vita", desc: "Misura la circonferenza della parte più stretta della vita, tenendo il metro orizzontale." },
                { label: "Altezza", desc: "Stai in piedi senza scarpe, appoggiato a una parete. Misura dall'alto della testa ai piedi." },
              ].map(({ label, desc }) => (
                <div key={label}>
                  <p className="text-[11px] font-black text-white mb-1">{label}</p>
                  <p className="text-[10px] text-white/45 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Adult sizes table */}
          <div>
            <h3
              className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3"
              style={{ fontFamily: "var(--font-mono, monospace)" }}
            >
              Taglie Adulto
            </h3>
            <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <table className="w-full text-sm min-w-[360px]">
                <thead>
                  <tr style={{ background: "rgba(200,240,0,0.08)", borderBottom: "1px solid rgba(200,240,0,0.15)" }}>
                    {["Taglia", "Petto (cm)", "Vita (cm)", "Altezza (cm)"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest"
                        style={{ color: "#c8f000", fontFamily: "var(--font-mono, monospace)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SIZE_DATA.map((row, i) => (
                    <tr
                      key={row.size}
                      style={{
                        background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <td className="px-4 py-3 font-black text-white">{row.size}</td>
                      <td className="px-4 py-3 text-white/60" style={{ fontFamily: "var(--font-mono, monospace)" }}>{row.chest}</td>
                      <td className="px-4 py-3 text-white/60" style={{ fontFamily: "var(--font-mono, monospace)" }}>{row.waist}</td>
                      <td className="px-4 py-3 text-white/60" style={{ fontFamily: "var(--font-mono, monospace)" }}>{row.height}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kids sizes table */}
          <div>
            <h3
              className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3"
              style={{ fontFamily: "var(--font-mono, monospace)" }}
            >
              Taglie Bambino / Youth
            </h3>
            <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <table className="w-full text-sm min-w-[360px]">
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    {["Taglia", "Petto (cm)", "Vita (cm)", "Altezza (cm)"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/40"
                        style={{ fontFamily: "var(--font-mono, monospace)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {KIDS_SIZE_DATA.map((row, i) => (
                    <tr
                      key={row.size}
                      style={{
                        background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <td className="px-4 py-3 font-black text-white">{row.size}</td>
                      <td className="px-4 py-3 text-white/60" style={{ fontFamily: "var(--font-mono, monospace)" }}>{row.chest}</td>
                      <td className="px-4 py-3 text-white/60" style={{ fontFamily: "var(--font-mono, monospace)" }}>{row.waist}</td>
                      <td className="px-4 py-3 text-white/60" style={{ fontFamily: "var(--font-mono, monospace)" }}>{row.height}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tip */}
          <p className="text-[10px] text-white/30 text-center leading-relaxed">
            In caso di dubbio tra due taglie, ti consigliamo di optare per la taglia più grande.{" "}
            <span style={{ color: "#c8f000" }}>Hai domande? Contattaci.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
