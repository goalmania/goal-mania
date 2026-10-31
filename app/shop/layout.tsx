// Niente force-dynamic qui: sovrascriveva il revalidate=300 di ogni
// pagina figlia (serieA, retro, jackets, ecc.), costringendo OGNI singola
// visita a rifare query DB + render completo invece di servire la cache
// ISR da 5 minuti già configurata. RealOrdersGallery è "use client" e fa
// il proprio fetch lato browser, quindi non serve forzare la pagina dinamica.
import { Footer } from "@/components/layout/footer";
import RealOrdersGallery from "@/components/shared/RealOrdersGallery";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      {children}
      <RealOrdersGallery />
      <Footer />
    </div>
  );
}
