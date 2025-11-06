import ShopClient from "./ShopClient";
import { getBaseUrl } from "@/lib/utils/baseUrl";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  team: string;
  availablePatches?: string[];
  videos?: string[];
}

async function fetchSeason2025Products(): Promise<Product[]> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/products?category=2025%2F26&noPagination=true`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );
    if (!response.ok) {
      throw new Error(`Error fetching products: ${response.status}`);
    }
    const data = await response.json();
    let productsData = [];
    if (data.products && Array.isArray(data.products)) {
      productsData = data.products;
    } else if (Array.isArray(data)) {
      productsData = data;
    } else {
      throw new Error("Invalid data format received from API");
    }
    return productsData.map((product: any) => ({
      id: product._id || "",
      name: product.title || "Unknown Product",
      price: product.basePrice || 0,
      image: product.images?.[0] || "/images/image.png",
      category: product.category || "Uncategorized",
      team: product.title ? product.title.split(" ")[0] : "Unknown",
      availablePatches: product.availablePatches || [],
      videos: product.videos || [], // Include videos for showcase
    }));
  } catch (error) {
    console.error("Error fetching 2025/26 products:", error);
    return [];
  }
}

async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/products?feature=true`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    if (!response.ok) {
      throw new Error(`Error fetching featured products: ${response.status}`);
    }
    const data = await response.json();
    let productsData = [];
    if (data.products && Array.isArray(data.products)) {
      productsData = data.products;
    } else if (Array.isArray(data)) {
      productsData = data;
    } else {
      throw new Error("Invalid data format received from API");
    }
    return productsData.map((product: any) => ({
      id: product._id || "",
      name: product.title || "Featured Product",
      price: product.basePrice || 0,
      image: product.images?.[0] || "/images/image.png",
      category: product.category || "Uncategorized",
      team: product.title ? product.title.split(" ")[0] : "Unknown",
      availablePatches: product.availablePatches || [],
      videos: product.videos || [], // Include videos for showcase
    }));
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

async function fetchMysteryBoxProducts(): Promise<Product[]> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/products?type=mysteryBox&noPagination=true`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );
    if (!response.ok) {
      throw new Error(
        `Error fetching Mystery Box products: ${response.status}`
      );
    }
    const data = await response.json();
    let productsData = [];
    if (data.products && Array.isArray(data.products)) {
      productsData = data.products;
    } else if (Array.isArray(data)) {
      productsData = data;
    } else {
      throw new Error("Invalid data format received from API");
    }
    return productsData.map((product: any) => ({
      id: product._id || "",
      name: product.title || "Mystery Box",
      price: product.basePrice || 0,
      image: product.images?.[0] || "/images/image.png",
      category: product.category || "Mystery Box",
      team: "Mystery",
      availablePatches: product.availablePatches || [],
      videos: product.videos || [], // Include videos for showcase
    }));
  } catch (error) {
    console.error("Error fetching Mystery Box products:", error);
    return [];
  }
}

async function fetchVideoProducts(): Promise<Product[]> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/products?limit=100&noPagination=true`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
        cache: 'no-store', // Don't cache during build
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const products = data.products || data || [];
    
    // Filter products with videos
    const productsWithVideos = products
      .filter((product: any) => product.videos && Array.isArray(product.videos) && product.videos.length > 0)
      .map((product: any) => ({
        id: product._id || "",
        name: product.title || "Product",
        price: product.basePrice || 0,
        image: product.images?.[0] || "/images/image.png",
        category: product.category || "Uncategorized",
        team: product.title ? product.title.split(" ")[0] : "Unknown",
        availablePatches: product.availablePatches || [],
        videos: product.videos || [],
      }));
    
    return productsWithVideos;
  } catch (error) {
    // Silently fail during build
    return [];
  }
}

export default async function ShopClientWrapper() {
  const [season2025Products, featuredProducts, mysteryBoxProducts, videoProducts] =
    await Promise.all([
      fetchSeason2025Products(),
      fetchFeaturedProducts(),
      fetchMysteryBoxProducts(),
      fetchVideoProducts(),
    ]);
  return (
    <ShopClient
      season2025Products={season2025Products}
      featuredProducts={featuredProducts}
      mysteryBoxProducts={mysteryBoxProducts}
      videoProducts={videoProducts}
    />
  );
}
