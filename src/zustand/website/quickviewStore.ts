import { create } from "zustand";

type QuickviewStoreType = {
  isVisible: boolean;
  selectedProduct: ProductWithUpsellType | null;
  cart: CartType | null;
  showOverlay: () => void;
  hideOverlay: () => void;
  setSelectedProduct: (product: ProductWithUpsellType, cart: CartType | null) => void;
};

export const useQuickviewStore = create<QuickviewStoreType>((set) => ({
  isVisible: false,
  selectedProduct: null,
  cart: null,
  showOverlay: () => set({ isVisible: true }),
  hideOverlay: () => set({ isVisible: false }),
  setSelectedProduct: (product: ProductWithUpsellType, cart: CartType | null) =>
    set({
      selectedProduct: product,
      cart,
    }),
}));
