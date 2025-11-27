import { NextResponse } from "next/server";
import { Category } from "@/lib/models/Category";
import { connectToDatabase } from "@/lib/db";

// Disable caching to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectToDatabase();
    
    // First, let's check all categories to debug
    const allCategories = await Category.find({})
      .select("name slug order type isActive")
      .lean();
    console.log(`[Navigation API] Total categories in DB:`, allCategories.length);
    console.log(`[Navigation API] All categories:`, JSON.stringify(allCategories.map((cat: any) => ({
      name: cat.name,
      slug: cat.slug,
      type: cat.type,
      isActive: cat.isActive,
      order: cat.order,
    })), null, 2));

    // Fetch active categories for navigation
    // You can change this to filter by type if needed
    // For now, we'll show all active categories, but you can uncomment the type filter
    const query: any = {
      isActive: true,
      // Uncomment the line below to only show "league" type categories
      // type: "league",
    };
    console.log(`[Navigation API] Query:`, JSON.stringify(query, null, 2));
    
    const categories = await Category.find(query)
      .sort({ order: 1, name: 1 })
      .select("name slug order type isActive customHref")
      .lean();

    console.log(`[Navigation API] Found ${categories.length} active categories`);
    console.log(`[Navigation API] Matching categories:`, JSON.stringify(categories.map((cat: any) => ({
      name: cat.name,
      slug: cat.slug,
      type: cat.type,
      isActive: cat.isActive,
    })), null, 2));

    // Map categories with custom href support
    let mappedCategories = categories
      .filter((cat: any) => cat.slug && cat.name) // Filter out categories without slug or name
      .map((cat: any) => ({
        id: cat._id.toString(),
        name: cat.name,
        slug: cat.slug,
        order: cat.order,
        href: cat.customHref || `/category/${encodeURIComponent(cat.slug)}`, // Use custom href if provided, otherwise default to category page
      }));
    
    // Debug: If no categories found, check what we have
    if (mappedCategories.length === 0 && allCategories.length > 0) {
      console.log(`[Navigation API] WARNING: No league categories found, but ${allCategories.length} total categories exist`);
      console.log(`[Navigation API] Checking for active categories regardless of type...`);
      const activeCategories = allCategories.filter((cat: any) => cat.isActive === true);
      console.log(`[Navigation API] Active categories (any type):`, activeCategories.length);
      activeCategories.forEach((cat: any) => {
        console.log(`  - ${cat.name}: type="${cat.type}", isActive=${cat.isActive}, slug="${cat.slug}"`);
      });
    }
    
    console.log(`[Navigation API] Mapped categories (after filtering):`, mappedCategories);

    const response = NextResponse.json({
      categories: mappedCategories,
    });

    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error: any) {
    console.error("Error fetching navigation categories:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

