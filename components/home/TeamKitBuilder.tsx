"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Users,
  Shirt,
  Search,
  ChevronDown,
  MessageCircle,
  Check,
  Loader2,
} from "lucide-react";
import {
  calculateKitPrice,
  KIT_TYPE_LABELS,
  STANDARD_TEAM_SIZES,
  type KitType,
} from "@/lib/teamKitPricing";

const WHATSAPP_NUMBER = "393334218596";

// Squadre di La Liga / Bundesliga / Ligue 1 — usate per isolare "Resto del Mondo"
// dal pool di maglie attuali, dato che quella categoria in DB è quasi vuota
// (stesso approccio usato in app/_components/RestOfWorldClient.tsx)
const REST_OF_WORLD_TEAMS = [
  "Real Madrid", "Barcelona", "Atletico", "Valencia", "Sevilla", "Villarreal",
  "Athletic Bilbao", "Real Betis", "Real Sociedad", "Getafe", "Osasuna",
  "Bayern", "Dortmund", "Leipzig", "Leverkusen", "Frankfurt", "Schalke",
  "Wolfsburg", "Stuttgart", "Hoffenheim", "Monchengladbach",
  "PSG", "Lyon", "Marseille", "Monaco", "Lille", "Rennes", "Nice", "Lens",
];

interface CategoryTab {
  id: string;
  label: string;
  /** Valori reali del campo `category` a DB da interrogare (uniti con $in) */
  categories: string[];
  /** Se presente, filtra ulteriormente lato client per nome squadra nel titolo */
  teamNames?: string[];
}

// I valori usati qui rispecchiano i valori REALI presenti a DB (verificati via API),
// che in alcuni casi differiscono dalle label mostrate nel menu dello shop
// (es. "SerieA"/"PremierLeague" senza spazio, non "Serie A"/"Premier League").
const CATEGORY_TABS: CategoryTab[] = [
  { id: "attuali", label: "Attuali", categories: ["2024/25", "2025/26"] },
  { id: "retro", label: "Retro", categories: ["Retro"] },
  { id: "serieA", label: "Serie A", categories: ["SerieA", "Serie A"] },
  { id: "premierLeague", label: "Premier League", categories: ["PremierLeague", "Premier League"] },
  { id: "champions", label: "Champions League", categories: ["Champions"] },
  {
    id: "restoDelMondo",
    label: "Resto del Mondo",
    categories: ["2025/26", "World Cup 2026", "Resto del Mondo"],
    teamNames: REST_OF_WORLD_TEAMS,
  },
  { id: "worldCup", label: "Mondiali 2026", categories: ["World Cup 2026"] },
];

interface JerseyOption {
  id: string;
  title: string;
  image: string;
  isRetro: boolean;
  slug?: string;
}

function mapJersey(p: any): JerseyOption {
  return {
    id: p._id,
    title: p.title || "Maglia",
    image: p.images?.[0] || "/images/placeholder.png",
    // Il flag isRetro a DB è incoerente per molti prodotti "Retro": la categoria è la fonte affidabile
    isRetro: !!p.isRetro || p.category === "Retro",
    slug: p.slug,
  };
}

function matchesTeamNames(title: string, teamNames: string[]): boolean {
  const t = title.toLowerCase();
  return teamNames.some((name) => t.includes(name.toLowerCase()));
}

export default function TeamKitBuilder() {
  const [isOpen, setIsOpen] = useState(false);

  // Step 1 — numero giocatori
  const [players, setPlayers] = useState<number | null>(null);
  const [customPlayers, setCustomPlayers] = useState("");

  // Step 2 — tipo kit
  const [kitType, setKitType] = useState<KitType>("completo");

  // Step 3 — maglia
  const [activeTabId, setActiveTabId] = useState(CATEGORY_TABS[0].id);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JerseyOption[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedJersey, setSelectedJersey] = useState<JerseyOption | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeTab = CATEGORY_TABS.find((t) => t.id === activeTabId) ?? CATEGORY_TABS[0];
  const MIN_RESULTS = 16;

  // Recupera una pagina "piena" di risultati per il tab attivo. Se il tab ha
  // teamNames e non c'è ricerca testuale, scorre più pagine server finché non
  // accumula abbastanza maglie che matchano i nomi squadra (filtro client-side),
  // perché la paginazione del server non conosce quel filtro aggiuntivo.
  async function fetchTabPage(startPage: number) {
    const useTeamFilter = !!activeTab.teamNames && !query.trim();
    const collected: any[] = [];
    let page = startPage;
    let serverHasMore = true;

    while (serverHasMore) {
      const params = new URLSearchParams({
        limit: "100",
        page: String(page),
        category: activeTab.categories.join(","),
      });
      if (query.trim()) params.set("search", query.trim());
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = res.ok ? await res.json() : { products: [], pagination: {} };
      const items: any[] = data.products || [];
      collected.push(
        ...(useTeamFilter
          ? items.filter((p) => matchesTeamNames(p.title || "", activeTab.teamNames!))
          : items)
      );
      serverHasMore = !!data.pagination?.hasNextPage;
      page++;
      if (!useTeamFilter) break; // paginazione normale: una richiesta = una pagina
      if (collected.length >= MIN_RESULTS) break;
    }

    return { items: collected, nextPage: page, hasMore: serverHasMore };
  }

  // Carica le maglie del tab attivo (con ricerca opzionale, debounced)
  useEffect(() => {
    if (!isOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const run = () => {
      setIsSearching(true);
      fetchTabPage(1)
        .then(({ items, nextPage, hasMore: more }) => {
          setResults(items.map(mapJersey));
          setPage(nextPage);
          setHasMore(more);
        })
        .catch(() => {
          setResults([]);
          setHasMore(false);
        })
        .finally(() => setIsSearching(false));
    };

    debounceRef.current = setTimeout(run, query.trim() ? 350 : 0);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [isOpen, activeTabId, query]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    fetchTabPage(page)
      .then(({ items, nextPage, hasMore: more }) => {
        setResults((prev) => [...prev, ...items.map(mapJersey)]);
        setPage(nextPage);
        setHasMore(more);
      })
      .catch(() => setHasMore(false))
      .finally(() => setIsLoadingMore(false));
  };

  const effectivePlayers =
    customPlayers.trim() !== "" ? parseInt(customPlayers, 10) || 0 : players;

  const price =
    effectivePlayers && effectivePlayers > 0 && selectedJersey
      ? calculateKitPrice(effectivePlayers, kitType, selectedJersey.isRetro)
      : null;

  const canSubmit = !!effectivePlayers && effectivePlayers > 0 && !!selectedJersey;

  const handleSelectPreset = (n: number) => {
    setPlayers(n);
    setCustomPlayers("");
  };

  const handleWhatsApp = () => {
    if (!canSubmit || price === null) return;
    const lines = [
      "Ciao! Vorrei richiedere un preventivo per un Kit Torneo:",
      "",
      `- Maglia: ${selectedJersey!.title}${selectedJersey!.isRetro ? " (Retro)" : ""}`,
      `- Giocatori: ${effectivePlayers}`,
      `- Tipo kit: ${KIT_TYPE_LABELS[kitType]}`,
      `- Prezzo stimato: €${price.toFixed(2).replace(".", ",")}`,
      "",
      "Attendo indicazioni per personalizzazione taglie/numeri.",
    ];
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      className="py-12 sm:py-16 relative"
      style={{ background: "#080808", borderTop: "0.5px solid rgba(255,255,255,0.05)" }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-4 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
            <span
              className="text-[9px] uppercase tracking-[3px] font-bold"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.6)" }}
            >
              // Per squadre e tornei
            </span>
            <span className="w-4 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
          </div>
          <h2
            className="font-black uppercase text-white mb-3"
            style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", letterSpacing: "-0.5px" }}
          >
            Kit per Tornei
          </h2>
          <p
            className="text-sm max-w-xl mx-auto leading-relaxed"
            style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body, sans-serif)" }}
          >
            Componi il kit per la tua squadra: scegli il numero di giocatori, il tipo di kit e la maglia. Prezzo calcolato al momento.
          </p>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-4 px-6 py-5 rounded-2xl transition-all active:scale-[0.97]"
          style={{
            background: isOpen ? "rgba(200,240,0,0.06)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${isOpen ? "rgba(200,240,0,0.3)" : "rgba(255,255,255,0.08)"}`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#c8f000" }}
            >
              <Users className="w-5 h-5" style={{ color: "#0a0a0a" }} />
            </div>
            <span
              className="font-black text-sm sm:text-base uppercase text-left"
              style={{ fontFamily: "var(--font-display, sans-serif)", color: "white", letterSpacing: "0.5px" }}
            >
              Configura il kit della tua squadra
            </span>
          </div>
          <ChevronDown
            size={20}
            className="flex-shrink-0 transition-transform duration-300"
            style={{ color: "#c8f000", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>

        {/* Panel */}
        <div
          className="overflow-hidden transition-all duration-500"
          style={{ maxHeight: isOpen ? "3000px" : "0px" }}
        >
          <div
            className="mt-4 rounded-2xl p-5 sm:p-7 space-y-8"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* STEP 1 — Giocatori */}
            <div>
              <StepLabel n={1} title="Numero di giocatori" />
              <div className="flex flex-wrap gap-2.5">
                {STANDARD_TEAM_SIZES.map((n) => (
                  <button
                    key={n}
                    onClick={() => handleSelectPreset(n)}
                    className="px-5 py-2.5 rounded-full font-black text-sm transition-all active:scale-[0.97]"
                    style={{
                      fontFamily: "var(--font-display, sans-serif)",
                      background: players === n && customPlayers.trim() === "" ? "#c8f000" : "rgba(255,255,255,0.05)",
                      color: players === n && customPlayers.trim() === "" ? "#0a0a0a" : "white",
                      border: `1px solid ${players === n && customPlayers.trim() === "" ? "#c8f000" : "rgba(255,255,255,0.1)"}`,
                    }}
                  >
                    {n}
                  </button>
                ))}
                <input
                  type="number"
                  min={1}
                  max={200}
                  placeholder="Personalizzato"
                  value={customPlayers}
                  onChange={(e) => {
                    setCustomPlayers(e.target.value);
                    setPlayers(null);
                  }}
                  className="w-32 px-4 py-2.5 rounded-full font-bold text-sm outline-none"
                  style={{
                    fontFamily: "var(--font-display, sans-serif)",
                    background: customPlayers.trim() !== "" ? "#c8f000" : "rgba(255,255,255,0.05)",
                    color: customPlayers.trim() !== "" ? "#0a0a0a" : "white",
                    border: `1px solid ${customPlayers.trim() !== "" ? "#c8f000" : "rgba(255,255,255,0.1)"}`,
                  }}
                />
              </div>
            </div>

            {/* STEP 2 — Tipo kit */}
            <div>
              <StepLabel n={2} title="Cosa vuoi includere" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {(Object.keys(KIT_TYPE_LABELS) as KitType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setKitType(type)}
                    className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl text-left transition-all active:scale-[0.97]"
                    style={{
                      background: kitType === type ? "rgba(200,240,0,0.1)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${kitType === type ? "#c8f000" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: kitType === type ? "#c8f000" : "transparent",
                        border: `1.5px solid ${kitType === type ? "#c8f000" : "rgba(255,255,255,0.25)"}`,
                      }}
                    >
                      {kitType === type && <Check className="w-3 h-3" style={{ color: "#0a0a0a" }} />}
                    </div>
                    <span
                      className="text-xs font-bold leading-snug"
                      style={{
                        fontFamily: "var(--font-display, sans-serif)",
                        color: kitType === type ? "#c8f000" : "rgba(255,255,255,0.75)",
                      }}
                    >
                      {KIT_TYPE_LABELS[type]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 3 — Maglia */}
            <div>
              <StepLabel n={3} title="Scegli la maglia" />

              {selectedJersey ? (
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl mb-3"
                  style={{ background: "rgba(200,240,0,0.08)", border: "1px solid rgba(200,240,0,0.3)" }}
                >
                  <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <Image src={selectedJersey.image} alt={selectedJersey.title} fill className="object-cover" unoptimized />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
                      {selectedJersey.title}
                    </p>
                    {selectedJersey.isRetro && (
                      <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#c8f000", fontFamily: "var(--font-mono, monospace)" }}>
                        Retro
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedJersey(null)}
                    className="text-[11px] uppercase font-bold tracking-wider flex-shrink-0 px-3 py-1.5 rounded-full active:scale-[0.97] transition-all"
                    style={{ color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.06)", fontFamily: "var(--font-mono, monospace)" }}
                  >
                    Cambia
                  </button>
                </div>
              ) : (
                <>
                  {/* Tabs categoria */}
                  <div
                    className="flex gap-2 mb-3 overflow-x-auto pb-1"
                    style={{ scrollbarWidth: "none" } as React.CSSProperties}
                  >
                    {CATEGORY_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                        className="flex-shrink-0 px-3.5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all active:scale-[0.97]"
                        style={{
                          fontFamily: "var(--font-display, sans-serif)",
                          background: activeTabId === tab.id ? "#c8f000" : "rgba(255,255,255,0.05)",
                          color: activeTabId === tab.id ? "#0a0a0a" : "rgba(255,255,255,0.6)",
                          border: `1px solid ${activeTabId === tab.id ? "#c8f000" : "rgba(255,255,255,0.1)"}`,
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative mb-3">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.35)" }} />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={`Cerca in ${activeTab.label} (es. Inter, Real Madrid...)`}
                      className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none text-white placeholder:text-white/30"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "var(--font-body, sans-serif)" }}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[420px] overflow-y-auto pr-0.5">
                    {isSearching && (
                      <div className="col-span-full flex items-center justify-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#c8f000" }} />
                      </div>
                    )}
                    {!isSearching && results.length === 0 && (
                      <p className="col-span-full text-center text-xs py-6" style={{ color: "rgba(255,255,255,0.35)" }}>
                        Nessuna maglia trovata in questa categoria.
                      </p>
                    )}
                    {!isSearching &&
                      results.map((jersey) => (
                        <button
                          key={jersey.id}
                          onClick={() => setSelectedJersey(jersey)}
                          className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all active:scale-[0.97] text-center"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                          <div className="relative w-full aspect-square rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                            <Image src={jersey.image} alt={jersey.title} fill className="object-cover" unoptimized />
                            {jersey.isRetro && (
                              <span
                                className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase"
                                style={{ background: "#c8f000", color: "#0a0a0a" }}
                              >
                                Retro
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-white leading-tight line-clamp-2" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
                            {jersey.title}
                          </span>
                        </button>
                      ))}
                  </div>

                  {!isSearching && hasMore && (
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="w-full mt-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{
                        fontFamily: "var(--font-mono, monospace)",
                        color: "#c8f000",
                        background: "rgba(200,240,0,0.06)",
                        border: "1px solid rgba(200,240,0,0.2)",
                      }}
                    >
                      {isLoadingMore && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Carica altre maglie
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Riepilogo + CTA */}
            <div
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-2xl"
              style={{ background: "rgba(200,240,0,0.05)", border: "1px solid rgba(200,240,0,0.2)" }}
            >
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono, monospace)" }}>
                  Prezzo totale stimato
                </p>
                <p className="font-black leading-none" style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "2.2rem", color: "#c8f000" }}>
                  {price !== null ? `€${price.toFixed(2).replace(".", ",")}` : "—"}
                </p>
                {effectivePlayers ? (
                  <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                    per {effectivePlayers} giocatori
                  </p>
                ) : null}
              </div>
              <button
                onClick={handleWhatsApp}
                disabled={!canSubmit}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-full font-black uppercase transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "#25D366",
                  color: "white",
                  fontFamily: "var(--font-display, sans-serif)",
                  letterSpacing: "1.5px",
                  fontSize: "0.85rem",
                }}
              >
                <MessageCircle className="w-4 h-4" />
                Richiedi il kit su WhatsApp
              </button>
            </div>
            {!canSubmit && (
              <p className="text-[11px] text-center -mt-4" style={{ color: "rgba(255,255,255,0.35)" }}>
                <Shirt className="w-3 h-3 inline mr-1 -mt-0.5" />
                Seleziona giocatori e maglia per vedere il prezzo
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepLabel({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3.5">
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0"
        style={{ background: "#c8f000", color: "#0a0a0a", fontFamily: "var(--font-display, sans-serif)" }}
      >
        {n}
      </span>
      <span
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-mono, monospace)" }}
      >
        {title}
      </span>
    </div>
  );
}
