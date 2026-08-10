const SITE_URL = "https://goal-mania.it";

export interface CollectionSchemaProduct {
  title: string;
  slug?: string;
  _id?: string;
  basePrice?: number;
  images?: string[];
}

export function buildCollectionSchema({
  name,
  url,
  description,
  products,
}: {
  name: string;
  url: string;
  description: string;
  products: CollectionSchemaProduct[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url,
    description,
    hasPart: products.slice(0, 10).map((p) => ({
      "@type": "Product",
      name: p.title,
      url: `${SITE_URL}/products/${p.slug || p._id}`,
      ...(p.images?.[0] ? { image: p.images[0] } : {}),
      offers: {
        "@type": "Offer",
        price: p.basePrice ?? 30,
        priceCurrency: "EUR",
      },
    })),
  };
}
