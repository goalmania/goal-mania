"use client";
import Link from "next/link";
export default function ProductGrid({
  featuredProduct,
  featuredProduct2,
  featuredProduct3,
  featuredProduct4,
}: {
  featuredProduct?: any;
  featuredProduct2?: any;
  featuredProduct3?: any;
  featuredProduct4?: any;
}) {
  const products = [
    {
      id: featuredProduct?.id,
      title: "Qualità Super",
      description:
        "Le nostre maglie sono capi curati nei minimi dettagli con materiali premium. Perfette per i veri appassionati che vogliono collezionare emozioni, non solo tessuto.",
      image: featuredProduct?.image,
    },
    {
      id: featuredProduct2?.id,
      title: "Modelli introvabili",
      description:
        "Associa un testo o un'immagine per dare importanza al prodotto, alla collezione o all'articolo del blog di tua scelta. Aggiungi dettagli sulla disponibilità, sullo stile o fornisci una recensione.",
      image: featuredProduct2?.image,
    },
    {
      id: featuredProduct3?.id,
      title: "Vestibilità perfetta",
      description:
        "Associa un testo o un'immagine per dare importanza al prodotto, alla collezione o all'articolo del blog di tua scelta. Aggiungi dettagli sulla disponibilità, sullo stile o fornisci una recensione.",
      image: featuredProduct3?.image,
    },
    {
      id: featuredProduct4?.id,
      title: "Qualità Super",
      description:
        "Le nostre maglie sono capi curati nei minimi dettagli con materiali premium. Perfette per i veri appassionati che vogliono collezionare emozioni, non solo tessuto.",
      image: featuredProduct4?.image,
    },
  ].filter(Boolean);
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-20">
        <div className="grid gap-8 md:grid-cols-2">
          {products.map((product, i) => (
            <div
              key={i}
              className="relative bg-[#F5F5F5] rounded-2xl shadow-md overflow-hidden flex flex-col md:flex-row items-center p-6 h-[360px]"
            >
              <div className="md:w-1/2 order-2 md:order-1 text-center md:text-left space-y-3">
                <h3 className="text-[30px] font-bold text-[#0A1A2F]">
                  {product.title}
                </h3>
                <p className="text-[#0A1A2F] text-[14px] leading-relaxed">
                  {product.description}
                </p>
                <Link
                  href={`/products/${product.id}`}
                  className="inline-block bg-[#FF7A00] rounded-full text-[#0A1A2F] px-4 py-1.5 font-medium text-sm hover:bg-orange-600 transition-colors"
                >
                  Buy Now →
                </Link>
              </div>
              <div className="md:w-1/2 flex items-center justify-center relative order-1 md:order-2 mt-6 md:mt-0">
               
                <img
                  src={product.image || "/images/jersey1.jpeg"}
                  alt={product.title}
                  className="relative z-20 w-48 md:w-60 object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
