/**
 * Centralized mapping of country names to high-quality flag URLs (FlagCDN)
 */
export const FLAG_MAPPING: Record<string, string> = {
  nigeria: "https://flagcdn.com/w640/ng.png",
  italy: "https://flagcdn.com/w640/it.png",
  argentina: "https://flagcdn.com/w640/ar.png",
  brazil: "https://flagcdn.com/w640/br.png",
  france: "https://flagcdn.com/w640/fr.png",
  england: "https://flagcdn.com/w640/gb-eng.png",
  usa: "https://flagcdn.com/w640/us.png",
  germany: "https://flagcdn.com/w640/de.png",
  spain: "https://flagcdn.com/w640/es.png",
  portugal: "https://flagcdn.com/w640/pt.png",
  mexico: "https://flagcdn.com/w640/mx.png",
  canada: "https://flagcdn.com/w640/ca.png",
  morocco: "https://flagcdn.com/w640/ma.png",
  japan: "https://flagcdn.com/w640/jp.png",
  "south korea": "https://flagcdn.com/w640/kr.png",
  belgium: "https://flagcdn.com/w640/be.png",
  netherlands: "https://flagcdn.com/w640/nl.png",
  croatia: "https://flagcdn.com/w640/hr.png",
  senegal: "https://flagcdn.com/w640/sn.png",
  ghana: "https://flagcdn.com/w640/gh.png",
  uruguay: "https://flagcdn.com/w640/uy.png",
  switzerland: "https://flagcdn.com/w640/ch.png",
  denmark: "https://flagcdn.com/w640/dk.png",
  cameroon: "https://flagcdn.com/w640/cm.png"
};

/**
 * Returns a flag URL for a given country name, or a fallback URL.
 */
export function getFlagUrl(countryName: string, fallbackUrl?: string): string {
  const normalized = countryName.toLowerCase().trim();
  
  if (FLAG_MAPPING[normalized]) {
    return FLAG_MAPPING[normalized];
  }
  
  // Try to use FlagCDN simple pattern if we don't have a manual mapping
  // Note: This matches the rough logic I saw in app/page.tsx but safer
  if (fallbackUrl) return fallbackUrl;
  
  return "/images/placeholder.png";
}
