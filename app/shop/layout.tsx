import { FooterSecond } from "@/components/layout/FooterSecond";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="mt-4">   {children}  <FooterSecond/>   </div>;
}