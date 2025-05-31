import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import toast from "react-hot-toast";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  team: string;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
}

// Ensure image path has proper format
const normalizeImagePath = (imagePath: string): string => {
  if (!imagePath) return "/images/image.png";
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/")) return imagePath;
  return `/${imagePath}`;
};

// Check if window is defined (browser) or not (server/SSR)
const isWindowDefined = typeof window !== "undefined";

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            toast.success(`${item.name} is already in your wishlist`);
            return state;
          }

          // Ensure image path is properly formatted
          const normalizedItem = {
            ...item,
            image: normalizeImagePath(item.image),
          };

          toast.success(`${item.name} added to your wishlist`);
          return {
            items: [...state.items, normalizedItem],
          };
        });
      },
      removeItem: (id) => {
        const itemName = get().items.find((item) => item.id === id)?.name;
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
        if (itemName) {
          toast.success(`${itemName} removed from your wishlist`);
        }
      },
      clearWishlist: () => {
        set({ items: [] });
        toast.success("Wishlist cleared");
      },
      isInWishlist: (id) => {
        const state = get();
        return state.items.some((item) => item.id === id);
      },
    }),
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() => {
        return isWindowDefined
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            };
      }),
    }
  )
);
