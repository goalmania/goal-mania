import { permanentRedirect } from "next/navigation";

// La pagina retro e diventata l'Archivio (per epoca, squadra e leggenda): stessa merce, navigazione migliore
export default function RetroShopPage() {
  permanentRedirect("/archivio");
}
