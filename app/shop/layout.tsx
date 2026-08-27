export const dynamic = "force-dynamic";

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
