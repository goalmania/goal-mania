/**
 * GALLERIA ORDINI REALI
 * ─────────────────────────────────────────────────────────────────────────────
 * Elenco statico di foto e video di ordini / maglie reali dei clienti.
 * Compare in home, pagine prodotto e in tutte le pagine /shop/*.
 *
 * COME AGGIUNGERE NUOVI CONTENUTI
 *   FOTO -> restano in /public/gallery/ (ordine-15.jpg, ordine-16.jpg, ...)
 *           poi aggiungi una riga  img(NN, "alt")  qui sotto.
 *
 *   VIDEO -> vanno su Cloudinary, NON nel repo. Prendi il file ORIGINALE
 *            (meglio non passato da Telegram: la sua compressione li rovina)
 *            e caricalo:
 *
 *        node scripts/upload-gallery-to-cloudinary.mjs /percorso/originale-video-50.mp4
 *
 *            Lo script lo mette come  goalmania/gallery/video-50 .
 *            Poi aggiungi una riga  v(50, "alt")  qui sotto: la compressione
 *            di delivery (q_auto/f_auto) e il poster li fa Cloudinary via URL.
 *
 * NOTE
 *   - I video sono muti in loop; le foto storte vengono raddrizzate
 *     automaticamente (ritaglio uniforme object-cover), non serve editarle.
 *   - `alt` è importante per SEO/accessibilità: descrivi cosa si vede.
 *   - L'ordine dell'array è l'ordine di visualizzazione (foto e video alternati).
 */

export type GalleryMediaItem = {
  type: "image" | "video";
  /** URL del file (foto: locale /gallery/... ; video: Cloudinary) */
  src: string;
  /** Solo per i video: immagine di anteprima (poster Cloudinary) */
  poster?: string;
  /** Testo alternativo / descrizione breve */
  alt?: string;
};

/** Cloud name Cloudinary del progetto */
const CLD = "do04e87p5";
/**
 * Video: compressione adattiva + formato automatico per dispositivo.
 * w_900,c_limit = mai servito piu largo di 900px (i sorgenti nuovi sono 4K,
 * inutile mandarli interi a una card da ~300px; i vecchi restano com'erano).
 */
const CLD_VIDEO = `https://res.cloudinary.com/${CLD}/video/upload/q_auto,f_auto,w_900,c_limit`;
/** Poster: primo secondo del video, largo max 600px */
const CLD_POSTER = `https://res.cloudinary.com/${CLD}/video/upload/so_1,q_auto,f_auto,w_600`;

const v = (n: number, alt: string): GalleryMediaItem => {
  const id = `goalmania/gallery/video-${String(n).padStart(2, "0")}`;
  return {
    type: "video",
    src: `${CLD_VIDEO}/${id}.mp4`,
    poster: `${CLD_POSTER}/${id}.jpg`,
    alt,
  };
};

const img = (n: number, alt: string): GalleryMediaItem => ({
  type: "image",
  src: `/gallery/ordine-${String(n).padStart(2, "0")}.jpg`,
  alt,
});

export const realOrdersGallery: GalleryMediaItem[] = [
  { type: "image", src: "/gallery/ordine-01.jpg", alt: "Maglia Juventus third rosa personalizzata NÚÑEZ ricevuta da un cliente Goal Mania" },
  v(1, "Video di un ordine di maglie da calcio consegnato a un cliente Goal Mania"),
  v(2, "Unboxing di maglie da calcio acquistate su Goal Mania"),

  { type: "image", src: "/gallery/ordine-02.jpg", alt: "Maglia Real Madrid home bianca personalizzata ricevuta da un cliente Goal Mania" },
  v(3, "Maglie da calcio reali ricevute da un cliente Goal Mania"),
  v(4, "Video di maglie da calcio spedite da Goal Mania"),

  { type: "image", src: "/gallery/ordine-03.jpg", alt: "Maglie Como NICO PAZ e Milan B. RAMOS personalizzate, ordine reale Goal Mania" },
  v(5, "Video di un ordine di maglie da calcio consegnato a un cliente Goal Mania"),
  v(6, "Unboxing di maglie da calcio acquistate su Goal Mania"),

  { type: "image", src: "/gallery/ordine-04.jpg", alt: "Maglia Portogallo RONALDO 7 ricevuta da un cliente Goal Mania" },
  v(7, "Maglie da calcio reali ricevute da un cliente Goal Mania"),
  v(8, "Video di maglie da calcio spedite da Goal Mania"),

  { type: "image", src: "/gallery/ordine-05.jpg", alt: "Maglia Napoli home blu Partenopei, ordine reale Goal Mania" },
  v(9, "Video di un ordine di maglie da calcio consegnato a un cliente Goal Mania"),
  v(10, "Unboxing di maglie da calcio acquistate su Goal Mania"),

  { type: "image", src: "/gallery/ordine-06.jpg", alt: "Maglie Roma MALEN 14 e nazionale OPES CABRAL 13 personalizzate, ordine Goal Mania" },
  v(11, "Maglie da calcio reali ricevute da un cliente Goal Mania"),
  v(12, "Video di maglie da calcio spedite da Goal Mania"),

  { type: "image", src: "/gallery/ordine-07.jpg", alt: "Due maglie Portogallo RONALDO 7 Puma retro ricevute da un cliente Goal Mania" },
  v(13, "Video di un ordine di maglie da calcio consegnato a un cliente Goal Mania"),
  v(14, "Unboxing di maglie da calcio acquistate su Goal Mania"),

  { type: "image", src: "/gallery/ordine-08.jpg", alt: "Kit Inter DIOUF con pantaloncini e calzettoni, ordine reale Goal Mania" },
  v(15, "Maglie da calcio reali ricevute da un cliente Goal Mania"),
  v(16, "Video di maglie da calcio spedite da Goal Mania"),

  { type: "image", src: "/gallery/ordine-09.jpg", alt: "Maglia Juventus third rosa personalizzata LOCATELLI 5, ordine reale Goal Mania" },
  v(17, "Video di un ordine di maglie da calcio consegnato a un cliente Goal Mania"),
  v(18, "Unboxing di maglie da calcio acquistate su Goal Mania"),

  { type: "image", src: "/gallery/ordine-10.jpg", alt: "Maglia Inter home personalizzata BARELLA 23 ricevuta da un cliente Goal Mania" },
  v(19, "Maglie da calcio reali ricevute da un cliente Goal Mania"),
  v(20, "Video di maglie da calcio spedite da Goal Mania"),

  { type: "image", src: "/gallery/ordine-11.jpg", alt: "Maglia Real Madrid third bordeaux personalizzata MBAPPÉ 10, ordine Goal Mania" },
  v(21, "Video di un ordine di maglie da calcio consegnato a un cliente Goal Mania"),
  v(22, "Unboxing di maglie da calcio acquistate su Goal Mania"),

  { type: "image", src: "/gallery/ordine-12.jpg", alt: "Maglie Inter terza divisa, ordine reale ricevuto da un cliente Goal Mania" },
  v(23, "Maglie da calcio reali ricevute da un cliente Goal Mania"),
  v(24, "Video di maglie da calcio spedite da Goal Mania"),

  { type: "image", src: "/gallery/ordine-13.jpg", alt: "Maglie Como, Milan e Inter impacchettate, ordine reale Goal Mania" },
  v(25, "Video di un ordine di maglie da calcio consegnato a un cliente Goal Mania"),

  { type: "image", src: "/gallery/ordine-14.jpg", alt: "Collezione di maglie retro personalizzate (Adriano, Ronaldo, Totti, Kaká, Henry, Zanetti, Messi, Ronaldinho, Zidane, Beckham), ordine reale Goal Mania" },
  v(26, "Unboxing di maglie da calcio acquistate su Goal Mania"),
  v(27, "Maglie da calcio reali ricevute da un cliente Goal Mania"),
  v(28, "Video di maglie da calcio spedite da Goal Mania"),
  v(29, "Video di un ordine di maglie da calcio consegnato a un cliente Goal Mania"),
  v(30, "Unboxing di maglie da calcio acquistate su Goal Mania"),
  v(31, "Maglie da calcio reali ricevute da un cliente Goal Mania"),
  v(32, "Video di maglie da calcio spedite da Goal Mania"),
  v(33, "Video di un ordine di maglie da calcio consegnato a un cliente Goal Mania"),

  img(15, "Maglia da calcio vintage indossata da un cliente Goal Mania"),
  img(16, "Outfit con maglia da calcio retro acquistata su Goal Mania"),
  img(17, "Maglia da calcio storica ricevuta da un cliente Goal Mania"),
  img(18, "Look total look con maglia da calcio retro Goal Mania"),
  v(34, "Video di un ordine di maglie da calcio consegnato a un cliente Goal Mania"),
  img(19, "Maglia da calcio vintage indossata da un cliente Goal Mania"),
  img(20, "Outfit con maglia da calcio retro acquistata su Goal Mania"),
  img(21, "Maglia da calcio storica ricevuta da un cliente Goal Mania"),
  img(22, "Look total look con maglia da calcio retro Goal Mania"),
  v(35, "Unboxing di maglie da calcio acquistate su Goal Mania"),
  img(23, "Maglia da calcio vintage indossata da un cliente Goal Mania"),
  img(24, "Outfit con maglia da calcio retro acquistata su Goal Mania"),
  img(25, "Maglia da calcio storica ricevuta da un cliente Goal Mania"),
  img(26, "Look total look con maglia da calcio retro Goal Mania"),
  v(36, "Maglie da calcio reali ricevute da un cliente Goal Mania"),
  img(27, "Maglia da calcio vintage indossata da un cliente Goal Mania"),
  img(28, "Outfit con maglia da calcio retro acquistata su Goal Mania"),
  img(29, "Maglia da calcio storica ricevuta da un cliente Goal Mania"),
  img(30, "Look total look con maglia da calcio retro Goal Mania"),
  v(37, "Video di maglie da calcio spedite da Goal Mania"),
  img(31, "Maglia da calcio vintage indossata da un cliente Goal Mania"),
  v(39, "Unboxing di maglie da calcio acquistate su Goal Mania"),
  img(32, "Outfit con maglia da calcio retro acquistata su Goal Mania"),
  v(40, "Maglie da calcio reali ricevute da un cliente Goal Mania"),
  img(33, "Maglia da calcio storica ricevuta da un cliente Goal Mania"),
  v(38, "Video di un ordine di maglie da calcio consegnato a un cliente Goal Mania"),
  v(41, "Video di maglie da calcio spedite da Goal Mania"),
  v(42, "Unboxing di maglie da calcio acquistate su Goal Mania"),
  v(43, "Video di un ordine di maglie da calcio consegnato a un cliente Goal Mania"),
  v(44, "Maglie da calcio reali ricevute da un cliente Goal Mania"),
  v(45, "Video di maglie da calcio spedite da Goal Mania"),
  v(46, "Unboxing di maglie da calcio acquistate su Goal Mania"),
  v(47, "Video di un ordine di maglie da calcio consegnato a un cliente Goal Mania"),
  v(48, "Maglie da calcio reali ricevute da un cliente Goal Mania"),
  v(49, "Video di maglie da calcio spedite da Goal Mania"),

  // Blocco 6 — originali iPhone 4K caricati direttamente su Cloudinary
  v(50, "Video in alta qualità di una maglia da calcio ricevuta da un cliente Goal Mania"),
  v(51, "Unboxing in alta qualità di una maglia da calcio acquistata su Goal Mania"),
  v(52, "Maglia da calcio reale mostrata da un cliente Goal Mania"),
  v(53, "Video in alta qualità di un ordine di maglie da calcio Goal Mania"),
  v(54, "Maglia da calcio vintage ricevuta da un cliente Goal Mania"),
  v(55, "Unboxing in alta qualità di una maglia da calcio Goal Mania"),

  // Blocco 7 — originali iPhone. video-08..20 sono stati sostituiti in
  // qualità piena (stesso slot Cloudinary), qui solo i contenuti nuovi.
  img(34, "Maglie da calcio retro di un cliente Goal Mania"),
  v(56, "Maglia da calcio Juventus vintage mostrata da un cliente Goal Mania"),

  // Blocco 8 — altri originali iPhone. Diversi hanno sostituito clip
  // esistenti nello stesso slot (video-06..25); qui solo i nuovi.
  v(57, "Maglia da calcio del Brasile mostrata da un cliente Goal Mania"),
  v(58, "Maglia da calcio dell'Inter mostrata da un cliente Goal Mania"),
  v(59, "Maglia da calcio della Juventus vintage mostrata da un cliente Goal Mania"),
  v(60, "Maglia da calcio del Brasile vintage mostrata da un cliente Goal Mania"),
  v(61, "Maglia da calcio del Milan vintage mostrata da un cliente Goal Mania"),

  // Blocco 9 — altri originali iPhone. video-33 (Kakà Milan) sostituito
  // nello stesso slot; qui i nuovi.
  img(35, "Collezione di maglie da calcio retro di un cliente Goal Mania"),
  v(62, "Maglia da calcio del Manchester United mostrata da un cliente Goal Mania"),
  v(63, "Maglia da calcio retro mostrata da un cliente Goal Mania"),
  v(64, "Maglia da calcio del Parma vintage mostrata da un cliente Goal Mania"),
  v(65, "Maglia da calcio del Parma di Crespo mostrata da un cliente Goal Mania"),
  v(66, "Maglia da calcio della Roma di Totti mostrata da un cliente Goal Mania"),
  v(67, "Collezione di maglie da calcio retro di un cliente Goal Mania"),

  // Blocco 10 — altri originali iPhone. video-50/58/63/64 sostituiti nello
  // stesso slot; qui i nuovi.
  img(36, "Collezione di maglie da calcio retro di un cliente Goal Mania"),
  v(68, "Collezione di maglie da calcio vintage di un cliente Goal Mania"),
  v(69, "Maglia da calcio del Manchester United mostrata da un cliente Goal Mania"),
  v(70, "Maglia da calcio del Milan mostrata da un cliente Goal Mania"),
  v(71, "Maglia da calcio del Milan vintage mostrata da un cliente Goal Mania"),
  v(72, "Maglia da calcio dell'Arsenal vintage mostrata da un cliente Goal Mania"),
  v(73, "Maglia da calcio dell'Arsenal di Bergkamp mostrata da un cliente Goal Mania"),
  v(74, "Maglia da calcio del Real Madrid di Roberto Carlos mostrata da un cliente Goal Mania"),
  v(75, "Maglia da calcio vintage mostrata da un cliente Goal Mania"),
  v(76, "Maglia da calcio del Manchester United di Ronaldo mostrata da un cliente Goal Mania"),

  // Blocco 11 — clip "maglia sigillata nella confezione sottovuoto"
  v(77, "Maglia da calcio confezionata e pronta per la spedizione, ordine reale Goal Mania"),
  v(78, "Maglia da calcio sigillata sottovuoto prima della spedizione, Goal Mania"),
  v(79, "Confezione sottovuoto di una maglia da calcio spedita da Goal Mania"),
  v(80, "Maglia da calcio imbustata e pronta per l'invio, ordine reale Goal Mania"),
  v(81, "Maglia da calcio confezionata e pronta per la spedizione, ordine reale Goal Mania"),
  v(82, "Maglia da calcio sigillata sottovuoto prima della spedizione, Goal Mania"),
  v(83, "Confezione sottovuoto di una maglia da calcio spedita da Goal Mania"),
  v(84, "Maglia da calcio imbustata e pronta per l'invio, ordine reale Goal Mania"),
  v(85, "Maglia da calcio confezionata e pronta per la spedizione, ordine reale Goal Mania"),
  v(86, "Maglia da calcio sigillata sottovuoto prima della spedizione, Goal Mania"),
  v(87, "Confezione sottovuoto di una maglia da calcio spedita da Goal Mania"),
  v(88, "Maglia da calcio imbustata e pronta per l'invio, ordine reale Goal Mania"),
  v(89, "Maglia da calcio confezionata e pronta per la spedizione, ordine reale Goal Mania"),
  v(90, "Maglia da calcio sigillata sottovuoto prima della spedizione, Goal Mania"),
  v(91, "Confezione sottovuoto di una maglia da calcio spedita da Goal Mania"),
  v(92, "Maglia da calcio imbustata e pronta per l'invio, ordine reale Goal Mania"),
  v(93, "Maglia da calcio confezionata e pronta per la spedizione, ordine reale Goal Mania"),
  v(94, "Maglia da calcio sigillata sottovuoto prima della spedizione, Goal Mania"),
  v(95, "Confezione sottovuoto di una maglia da calcio spedita da Goal Mania"),
  v(96, "Maglia da calcio imbustata e pronta per l'invio, ordine reale Goal Mania"),
  v(97, "Maglia da calcio confezionata e pronta per la spedizione, ordine reale Goal Mania"),
  v(98, "Maglia da calcio sigillata sottovuoto prima della spedizione, Goal Mania"),
  v(99, "Confezione sottovuoto di una maglia da calcio spedita da Goal Mania"),
];
