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
        "Modelli esclusivi e difficili da trovare, selezionati per veri intenditori e collezionisti.",
      image: featuredProduct2?.image,
    },
    {
      id: featuredProduct3?.id,
      title: "Vestibilità perfetta",
      description:
        "Taglie e vestibilità pensate per ogni tifoso, comfort e stile assicurati.",
      image: featuredProduct3?.image,
    },
    {
      id: featuredProduct4?.id,
      title: "Dettagli autentici",
      description:
        "Ogni maglia è arricchita da dettagli originali e patch ufficiali, per un look da vero campione.",
      image: featuredProduct4?.image,
    },
  ].filter(Boolean);

  return (
    <section className="py-6 sm:py-10 md:py-16">
      <div className="container mx-auto px-2 sm:px-4 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          {products.map((product, i) => (
            <div
              key={i}
              className="relative bg-[#E5E5E5] rounded-[22px] shadow-2xl overflow-hidden p-0 w-full h-auto md:h-[380px]"
              style={{
                opacity: 1,
                maxHeight: "300px",
              }}
            >
              {/* Top right accent SVG - positioned at top right */}
              <div className="absolute right-0 top-0 z-0 pointer-events-none">
                <img
                  src="/product-showcase/product_showcase_corner_rt.svg"
                  alt="Accent"
                  className="w-[120px] h-[90px] sm:w-[180px] sm:h-[120px] md:w-[300px] md:h-[190px] object-cover opacity-100"
                  style={{
                    filter: "brightness(0) saturate(100%) invert(14%) sepia(21%) saturate(1812%) hue-rotate(181deg) brightness(97%) contrast(101%)",
                  }}
                />

                {/* Product Image - centered on accent with more top spacing */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 mt-6 md:mt-12">
                  <img
                    src={product.image || "/product-showcase/p_show.png"}
                    alt={product.title}
                    className="w-[130px] h-[170px] sm:w-[180px] sm:h-[240px] md:w-[260px] md:h-[320px] object-contain"
                    style={{
                      background: "transparent",
                    }}
                  />
                </div>
              </div>

              {/* Text Section - top-left aligned */}
              <div className="relative flex flex-col justify-start items-start px-5 sm:px-7 md:px-10 pt-5 sm:pt-6 md:pt-10 pb-3 z-10 md:max-w-[55%]">
                <h3 className="text-[16px] sm:text-[20px] md:text-[28px] font-extrabold text-[#0A1A2F] leading-tight mb-1.5 sm:mb-2 md:mb-3">
                  {product.title}
                </h3>
                <p
                  className="text-[11px] sm:text-[13px] md:text-[16px] text-[#0A1A2F] leading-relaxed font-medium mb-2 sm:mb-3 md:mb-5 overflow-hidden text-ellipsis max-w-[65%] sm:max-w-[75%] md:max-w-full"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {product.description}
                </p>
                <Link
                  href={`/products/${product.id}`}
                  className="inline-block bg-[#FF7A00] rounded-full text-white px-5 py-1.5 sm:px-7 sm:py-2 md:px-10 md:py-3 font-bold text-xs sm:text-sm md:text-lg shadow-lg hover:bg-orange-600 transition-colors"
                >
                  Acquista ora →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}