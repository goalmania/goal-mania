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
    hasLongSleeve: boolean;
    isPlayerEdition: boolean;
    size: string;
    isKidSize: boolean;
    hasCustomization: boolean;
    excludedShirts?: string[];
  };
}

export interface AppliedDiscountRule {
  _id: string;
  name: string;
  description: string;
  type: string;
  discountAmount: number;
  discountPercentage?: number;
  appliedToItems: string[];
}

interface CartStore {
  items: CartItem[];
  appliedDiscountRules: AppliedDiscountRule[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  
buyItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  applyDiscountRules: (rules: AppliedDiscountRule[]) => void;
  clearDiscountRules: () => void;
}

// Check if window is defined (browser) or not (server/SSR)
const isWindowDefined = typeof window !== "undefined";

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedDiscountRules: [],
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
            toast.success(`${safeItem.name} quantità aumentata`);
            return {
              items: state.items.map((i) =>
                i.id === safeItem.id
                  ? { ...i, quantity: i.quantity + (safeItem.quantity || 1) }
                  : i
              ),
            };
          }

          toast.success(`${safeItem.name} aggiunto al carrello`);
          return {
            items: [
              ...state.items,
              { ...safeItem, quantity: safeItem.quantity || 1 },
            ],
          };
        });
      },
      

// In the implementation (persist function)
buyItem: (item) => {
  set((state) => {
    const existingItem = state.items.find((i) => i.id === item.id);
    
    // If it exists, we just ensure it's in the cart with quantity 1
    if (existingItem) {
      return {
        items: state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: item.quantity || 1 } : i
        ),
      };
    }

    // If it doesn't exist, add it fresh
    return {
      items: [...state.items, { ...item, quantity: item.quantity || 1 }],
    };
  });
},

      removeItem: (id) => {
        const itemName = get().items.find((item) => item.id === id)?.name;
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
        if (itemName) {
          toast.success(`${itemName} rimosso dal carrello`);
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
        const subtotal = state.items.reduce(
          (total, item) => total + Number(item.price) * item.quantity,
          0
        );
        const discountAmount = state.appliedDiscountRules.reduce(
          (total, rule) => total + rule.discountAmount,
          0
        );
        return subtotal - discountAmount;
      },
      getItemCount: () => {
        const state = get();
        return state.items.reduce((count, item) => count + item.quantity, 0);
      },
      applyDiscountRules: (rules) => {
        set({ appliedDiscountRules: rules });
      },
      clearDiscountRules: () => {
        set({ appliedDiscountRules: [] });
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
