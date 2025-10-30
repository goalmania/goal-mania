import { CategoryForm } from "../_components/category-form";
import { Category } from "@/lib/models/Category";
import { connectToDatabase } from "@/lib/db";

async function getParentCategories() {
  await connectToDatabase();
  const categories = (await Category.find({ parentId: null })
    .sort({ order: 1, name: 1 })
    .lean()) as any[];
    
  return categories.map((cat: any) => ({
    id: cat._id?.toString?.() ?? "",
    name: cat.name,
    type: cat.type,
    slug: cat.slug,
    description: cat.description,
    order: cat.order,
    isActive: cat.isActive
  }));
}

export default async function NewCategoryPage() {
  const parentCategories = await getParentCategories();
  
  return (
    <div className="container mx-auto py-10">
      <CategoryForm categories={parentCategories} />
    </div>
  );
}