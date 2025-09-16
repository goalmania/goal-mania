import { Footer } from "@/components/layout/footer";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      {" "}
      {children} <Footer />{" "}
    </div>
  );
}
