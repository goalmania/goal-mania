/**
 * GALLERIA ORDINI REALI
 * ─────────────────────────────────────────────────────────────────────────────
 * Elenco statico di foto e video di ordini / maglie reali dei clienti.
 * Compare in home, pagine prodotto e in tutte le pagine /shop/*.
 *
 * COME AGGIUNGERE NUOVI CONTENUTI
 *   1. Metti il file dentro  /public/gallery/
 *        foto  ->  public/gallery/ordine-14.jpg, ordine-15.jpg, ...
 *        video ->  public/gallery/video-26.mp4, video-27.mp4, ...
 *   2. I video vanno SENZA audio e compressi per il web. Dal terminale:
 *        ffmpeg -y -i sorgente.mp4 -an \
 *          -vf "scale='min(720,iw)':-2" -c:v libx264 -crf 28 -preset veryfast \
 *          -movflags +faststart public/gallery/video-26.mp4
 *   3. Per ogni video crea il poster (frame di anteprima) con lo stesso nome:
 *        ffmpeg -y -ss 1 -i public/gallery/video-26.mp4 -frames:v 1 -q:v 3 \
 *          public/gallery/video-26.jpg
 *   4. Aggiungi una riga qui sotto nell'array `realOrdersGallery`.
 *
 * NOTE
 *   - I video sono muti in loop; le foto storte vengono raddrizzate
 *     automaticamente (ritaglio uniforme object-cover), non serve editarle.
 *   - `alt` è importante per SEO/accessibilità: descrivi cosa si vede.
 *   - L'ordine dell'array è l'ordine di visualizzazione (foto e video alternati).
 */

export type GalleryMediaItem = {
  type: "image" | "video";
  /** Percorso pubblico del file, es. "/gallery/ordine-01.jpg" */
  src: string;
  /** Solo per i video: immagine di anteprima, es. "/gallery/video-01.jpg" */
  poster?: string;
  /** Testo alternativo / descrizione breve */
  alt?: string;
};

const v = (n: number, alt: string): GalleryMediaItem => ({
  type: "video",
  src: `/gallery/video-${String(n).padStart(2, "0")}.mp4`,
  poster: `/gallery/video-${String(n).padStart(2, "0")}.jpg`,
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
];
