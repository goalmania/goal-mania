import ShopClientWrapper from "@/app/_components/ShopClientWrapper";

// Force dynamic rendering for shop page
export const dynamic = 'force-dynamic';
export const revalidate = 300;

export default async function ShopPage() {
  return (
    <div className="">
      <ShopClientWrapper />
    </div>
  );
}
