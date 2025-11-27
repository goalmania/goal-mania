import connectDB from "@/lib/db";
import { Category } from "@/lib/models/Category";
import AllCategoriesSection from "./AllCategoriesSection";

export const revalidate = 300; // Revalidate every 5 minutes

async function getAllActiveCategories() {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function AllCategoriesSectionWrapper() {
  const categories = await getAllActiveCategories();
  
  if (categories.length === 0) return null;

  return <AllCategoriesSection categories={categories} />;
}

