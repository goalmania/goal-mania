import { CategoryForm } from "../_components/category-form";
import { Category } from "@/lib/models/Category";
import { connectToDatabase } from "@/lib/db";
import { notFound } from "next/navigation";

interface EditCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getCategory(id: string) {
  await connectToDatabase();
  const category = (await Category.findById(id).lean()) as any | null;
  if (!category) return null;
  
  return {
    id: category._id?.toString?.() ?? "",
    name: category.name,
    type: category.type,
    slug: category.slug,
    description: category.description,
    customHref: category.customHref,
    order: category.order,
    isActive: category.isActive,
  };
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <CategoryForm 
        initialData={JSON.parse(JSON.stringify(category))}
      />
    </div>
  );
}