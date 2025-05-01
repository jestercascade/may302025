import { create } from "zustand";

type UpsellReviewStoreType = {
  isVisible: boolean;
  selectedProduct: UpsellReviewProductType | null;
  selectedOptions: { [productId: string]: { [groupId: number]: number } };
  readyProducts: string[];
  showOverlay: () => void;
  hideOverlay: () => void;
  setSelectedProduct: (product: UpsellReviewProductType) => void;
  setSelectedOptions: (options: { [productId: string]: { [groupId: number]: number } }) => void;
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
  setSelectedProduct: (product: UpsellReviewProductType) => set({ selectedProduct: product }),
  setSelectedOptions: (options) => set({ selectedOptions: options }),
  setReadyProducts: (products) => set({ readyProducts: products }),
}));
