import { Metadata } from "next";
import { format } from "date-fns";

import { columns } from "./_components/columns";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Category } from "@/lib/models/Category";
import { connectToDatabase } from "@/lib/db";

export const metadata: Metadata = {
  title: "Categories - Admin",
  description: "Manage shop categories",
};

async function getCategories() {
  await connectToDatabase();
  const categories = await Category.find().sort({ order: 1, name: 1 });
  return categories.map((cat) => ({
    id: cat._id.toString(),
    name: cat.name,
    type: cat.type,
    order: cat.order,
    isActive: cat.isActive,
    createdAt: format(cat.createdAt, "MMMM d, yyyy"),
  }));
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      <div className="mt-6">
        <DataTable columns={columns} data={categories} />
      </div>
    </div>
  );
}