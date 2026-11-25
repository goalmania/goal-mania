// Foto che non vanno mostrate come sono: con persone che indossano la maglia, grafiche senza maglia, vecchio logo al posto della foto.
// Elenco compilato guardando le foto una per una. Restano nel database: si tolgono solo dalla vetrina.

// Prodotti nascosti al pubblico perche hanno solo foto con persone o senza maglia
export const HIDDEN_IDS = new Set<string>([
  "68f257a9d53b215e2b115164", "69e8d125a328650a1ef31c67", "69e8cdbea328650a1ef31c43", "69e8cd38d952799b7c73ca1a",
  "6a183f369c32404d2d40de76", "6a183f399c32404d2d40de7f", "6a183f3c9c32404d2d40de84", "6a183f3d9c32404d2d40de87",
  "6a183f419c32404d2d40de90", "6a183f429c32404d2d40de93", "6a183f449c32404d2d40de99", "6a183f459c32404d2d40de9a",
  "6a183f469c32404d2d40de9d",
]);

// Prodotti che hanno una foto senza persone tra quelle caricate: questa passa in prima posizione
export const PHOTO_FIRST: Record<string, string> = {
  "6a47c190bd9544724b4a6edf": "https://res.cloudinary.com/do04e87p5/image/upload/v1783087499/mblqlkzakcdksix7lcgz.webp",
  "69ca8160aa566f8b7645f7b9": "https://res.cloudinary.com/dj5p3cwir/image/upload/v1774879068/IMG_5126_mtus9c.jpg",
  "6a183f399c32404d2d40de7e": "https://res.cloudinary.com/do04e87p5/image/upload/v1780145837/eynqwzvudivbtbfrzam4.jpg",
  "6a183f429c32404d2d40de94": "https://res.cloudinary.com/do04e87p5/image/upload/v1787481000/llddvlewa0chknjwdvko.jpg",
};

export const isPlaceholderImage = (u?: string | null) => !u || u.startsWith("/images/");

// Mostrabile in vetrina: non nascosto e con una foto vera (non il vecchio logo)
export const isShowable = (id: string | undefined, image?: string | null) => !(id && HIDDEN_IDS.has(String(id))) && !isPlaceholderImage(image);

// Sistema l'elenco foto di un prodotto: toglie i segnaposto e mette per prima la foto scelta
export function fixProductImages<T extends { _id?: any; images?: string[] }>(p: T): T {
  if (!p || !Array.isArray(p.images)) return p;
  let imgs = p.images.filter((u) => !isPlaceholderImage(u));
  const first = p._id ? PHOTO_FIRST[String(p._id)] : undefined;
  if (first) imgs = [first, ...imgs.filter((u) => u !== first)];
  if (imgs.length !== p.images.length || imgs[0] !== p.images[0]) p.images = imgs;
  return p;
}
