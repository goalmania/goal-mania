// Foto piu leggere: Cloudinary serve il formato migliore (webp/avif) alla larghezza che serve.
// Le foto originali pesano anche 1-3 MB; a 520px diventano ~40 KB.
export function cld(url: string | undefined | null, width = 520): string {
  if (!url) return "/images/placeholder.png";
  const marker = "/image/upload/";
  const i = url.indexOf(marker);
  if (i === -1 || !url.includes("res.cloudinary.com")) return url;
  const rest = url.slice(i + marker.length);
  if (/^(f_|q_|w_|c_)/.test(rest)) return url; // gia trasformata
  return `${url.slice(0, i + marker.length)}f_auto,q_auto,w_${width},c_limit/${rest}`;
}
