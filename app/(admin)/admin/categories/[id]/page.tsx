import { CategoryForm } from "../_components/category-form";
import { Category } from "@/lib/models/Category";
import { connectToDatabase } from "@/lib/db";
import { notFound } from "next/navigation";

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

async function getCategory(id: string) {
  await connectToDatabase();
  const category = await Category.findById(id).lean();
  if (!category) return null;
  
  return {
    id: category._id.toString(),
    name: category.name,
    type: category.type,
    slug: category.slug,
    description: category.description,
    order: category.order,
    isActive: category.isActive,
    parentId: category.parentId?.toString()
  };
}

async function getParentCategories(id: string) {
  await connectToDatabase();
  const categories = await Category.find({
    _id: { $ne: id },
    parentId: null
  })
    .sort({ order: 1, name: 1 })
    .lean();
    
  return categories.map(cat => ({
    id: cat._id.toString(),
    name: cat.name,
    type: cat.type,
    slug: cat.slug,
    description: cat.description,
    order: cat.order,
    isActive: cat.isActive
  }));
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const [category, parentCategories] = await Promise.all([
    getCategory(params.id),
    getParentCategories(params.id)
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <CategoryForm 
        initialData={JSON.parse(JSON.stringify(category))}
        categories={JSON.parse(JSON.stringify(parentCategories))}
      />
    </div>
  );
}