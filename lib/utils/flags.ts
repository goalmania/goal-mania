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
  cameroon: "https://flagcdn.com/w640/cm.png",
  czechia: "https://flagcdn.com/w640/cz.png",
  "south africa": "https://flagcdn.com/w640/za.png",
  "bosnia and herzegovina": "https://flagcdn.com/w640/ba.png",
  qatar: "https://flagcdn.com/w640/qa.png",
  poland: "https://flagcdn.com/w640/pl.png",
  sweden: "https://flagcdn.com/w640/se.png",
  serbia: "https://flagcdn.com/w640/rs.png",
  ecuador: "https://flagcdn.com/w640/ec.png",
  wales: "https://flagcdn.com/w640/gb-wls.png",
  tunisia: "https://flagcdn.com/w640/tn.png",
  australia: "https://flagcdn.com/w640/au.png"
};

/**
 * Returns a flag URL for a given country name, preferring the manual mapping
 */
export function getFlagUrl(countryName: string, apiFallback?: string): string {
  if (!countryName) return apiFallback || "/images/placeholder.png";
  
  const normalized = countryName.toLowerCase().trim();
  
  // 1. Check manual mapping for known high-quality flags
  if (FLAG_MAPPING[normalized]) {
    return FLAG_MAPPING[normalized];
  }
  
  // 2. Use API fallback if provided and looks valid
  if (apiFallback && apiFallback.startsWith('http')) {
    return apiFallback;
  }
  
  // 3. Final default placeholder
  return "/images/placeholder.png";
}
