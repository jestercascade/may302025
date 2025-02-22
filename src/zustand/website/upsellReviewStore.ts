import { create } from "zustand";

type UpsellReviewStoreType = {
  isVisible: boolean;
  selectedProduct: UpsellReviewProductType | null;
  selectedOptions: { [key: string]: { color?: string; size?: string } };
  readyProducts: string[];
  showOverlay: () => void;
  hideOverlay: () => void;
  setSelectedProduct: (product: UpsellReviewProductType) => void;
  setSelectedOptions: (options: {
    [key: string]: { color?: string; size?: string };
  }) => void;
  setReadyProducts: (products: string[]) => void;
};

export const useUpsellReviewStore = create<UpsellReviewStoreType>((set) => ({
  isVisible: false,
  selectedProduct: null,
  selectedOptions: {},
  readyProducts: [],
  showOverlay: () => set({ isVisible: true }),
  hideOverlay: () =>
    set({
      isVisible: false,
      selectedOptions: {},
      readyProducts: [],
    }),
  setSelectedProduct: (product: UpsellReviewProductType) =>
    set({ selectedProduct: product }),
  setSelectedOptions: (options) => set({ selectedOptions: options }),
  setReadyProducts: (products) => set({ readyProducts: products }),
}));
