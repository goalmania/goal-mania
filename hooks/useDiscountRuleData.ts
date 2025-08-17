import { useState, useEffect } from "react";

export interface Product {
  _id: string;
  title: string;
  category: string;
  isActive: boolean;
}

export interface Category {
  value: string;
  label: string;
}

export const useDiscountRuleData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Available categories from the product schema
  const availableCategories: Category[] = [
    { value: "2024/25", label: "2024/25" },
    { value: "2025/26", label: "2025/26" },
    { value: "Retro", label: "Retro" },
    { value: "SerieA", label: "Serie A" },
    { value: "International", label: "International" },
    { value: "Mystery Box", label: "Mystery Box" },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all active products for the dropdown
      const response = await fetch("/api/products?includeInactive=false&limit=1000");
      
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      
      const data = await response.json();
      
      // Filter only active products and map to the required format
      const activeProducts = data.products
        ?.filter((product: any) => product.isActive)
        ?.map((product: any) => ({
          _id: product._id,
          title: product.title,
          category: product.category,
          isActive: product.isActive,
        })) || [];
      
      setProducts(activeProducts);
      setCategories(availableCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      console.error("Error fetching discount rule data:", err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchProducts();
  };

  return {
    products,
    categories,
    loading,
    error,
    refetch,
  };
};
