"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ProductRow {
  _id: string;
  title: string;
  images: string[];
  newUrl: string;
}

const PLACEHOLDER = "/images/image.png";

export default function FixImagesPage() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/products?limit=500")
      .then((r) => r.json())
      .then((data) => {
        const prods: any[] = data.products || [];
        const bad = prods.filter((p) =>
          (p.images || []).every(
            (img: string) => !img || img === PLACEHOLDER || !img.includes("res.cloudinary.com")
          )
        );
        setRows(bad.map((p) => ({ _id: p._id, title: p.title, images: p.images || [], newUrl: "" })));
        setLoading(false);
      });
  }, []);

  async function saveOne(row: ProductRow) {
    if (!row.newUrl.trim()) return;
    setSaving((s) => ({ ...s, [row._id]: true }));
    try {
      const res = await fetch(`/api/products/${row._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: [row.newUrl.trim()] }),
      });
      if (res.ok) {
        setSaved((s) => ({ ...s, [row._id]: true }));
        setRows((rs) => rs.filter((r) => r._id !== row._id));
      } else {
        alert("Errore salvataggio: " + (await res.text()));
      }
    } finally {
      setSaving((s) => ({ ...s, [row._id]: false }));
    }
  }

  async function saveAll() {
    const toSave = filtered.filter((r) => r.newUrl.trim());
    for (const row of toSave) await saveOne(row);
  }

  function updateUrl(id: string, url: string) {
    setRows((rs) => rs.map((r) => (r._id === id ? { ...r, newUrl: url } : r)));
  }

  const filtered = rows.filter((r) =>
    r.title.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <div className="p-8 text-white">Caricamento...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 text-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-black mb-1" style={{ color: "#c8f000" }}>
          Fix Immagini Prodotti
        </h1>
        <p className="text-white/50 text-sm mb-6">
          {rows.length} prodotti senza immagine Cloudinary · {filtered.filter((r) => r.newUrl.trim()).length} pronti da salvare
        </p>

        <div className="flex gap-3 mb-6">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtra per nome..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#c8f000]"
          />
          <button
            onClick={saveAll}
            disabled={!filtered.some((r) => r.newUrl.trim())}
            className="px-5 py-2 rounded-xl font-black text-sm bg-[#c8f000] text-black disabled:opacity-40"
          >
            Salva tutti ({filtered.filter((r) => r.newUrl.trim()).length})
          </button>
        </div>

        <div className="space-y-2">
          {filtered.map((row) => (
            <div
              key={row._id}
              className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl p-3"
            >
              {/* Preview immagine corrente */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 relative">
                <Image
                  src={row.images[0] || PLACEHOLDER}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              {/* Nome */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{row.title}</p>
                <p className="text-[11px] text-white/30 truncate">{row.images[0] || "nessuna"}</p>
              </div>

              {/* Preview nuova immagine */}
              {row.newUrl.trim() && (
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 relative border border-[#c8f000]/40">
                  <Image src={row.newUrl.trim()} alt="" fill unoptimized className="object-cover" />
                </div>
              )}

              {/* Input URL */}
              <input
                value={row.newUrl}
                onChange={(e) => updateUrl(row._id, e.target.value)}
                placeholder="Incolla URL immagine..."
                className="w-64 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#c8f000] font-mono"
                onKeyDown={(e) => e.key === "Enter" && saveOne(row)}
              />

              {/* Salva */}
              <button
                onClick={() => saveOne(row)}
                disabled={!row.newUrl.trim() || saving[row._id]}
                className="px-4 py-2 rounded-lg text-xs font-black bg-[#c8f000] text-black disabled:opacity-30 flex-shrink-0"
              >
                {saving[row._id] ? "..." : saved[row._id] ? "✓" : "Salva"}
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-white/30 py-16">
            {filter ? "Nessun prodotto trovato" : "✅ Tutti i prodotti hanno immagini Cloudinary!"}
          </div>
        )}
      </div>
    </div>
  );
}
