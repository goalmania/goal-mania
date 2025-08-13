import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Patch } from "@/lib/types/product";
import toast from "react-hot-toast";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  customization?: {
    name?: string;
    number?: string;
    selectedPatches: Patch[];
    includeShorts: boolean;
    includeSocks: boolean;
    isPlayerEdition: boolean;
    size: string;
    isKidSize: boolean;
    hasCustomization: boolean;
    excludedShirts?: string[];
  };
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

// Check if window is defined (browser) or not (server/SSR)
const isWindowDefined = typeof window !== "undefined";

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const safePrice =
          typeof item.price === "string"
            ? parseFloat(item.price)
            : Number(item.price);

        const safeItem = {
          ...item,
          price: isNaN(safePrice) ? 0 : safePrice,
        };

        set((state) => {
          const existingItem = state.items.find((i) => i.id === safeItem.id);
          if (existingItem) {
            toast.success(`${safeItem.name} quantity increased`);
            return {
              items: state.items.map((i) =>
                i.id === safeItem.id
                  ? { ...i, quantity: i.quantity + (safeItem.quantity || 1) }
                  : i
              ),
            };
          }

          toast.success(`${safeItem.name} added to your cart`);
          return {
            items: [
              ...state.items,
              { ...safeItem, quantity: safeItem.quantity || 1 },
            ],
          };
        });
      },
      removeItem: (id) => {
        const itemName = get().items.find((item) => item.id === id)?.name;
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
        if (itemName) {
          toast.success(`${itemName} removed from your cart`);
        }
      },
      updateQuantity: (id, quantity) => {
        const item = get().items.find((item) => item.id === id);
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
        if (item) {
          toast.success(`${item.name} quantity updated`);
        }
      },
      clearCart: () => {
        set({ items: [] });
        toast.success("Cart cleared");
      },
      getTotal: () => {
        const state = get();
        return state.items.reduce(
          (total, item) => total + Number(item.price) * item.quantity,
          0
        );
      },
      getItemCount: () => {
        const state = get();
        return state.items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
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
