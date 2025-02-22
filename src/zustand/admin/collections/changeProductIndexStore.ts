import { create } from "zustand";

type SelectedProductType = {
  id: string;
  name?: string;
  index?: string;
  collectionId: string;
};

type ProductStoreType = {
  selectedProduct: SelectedProductType;
  setSelectedProduct: (product: SelectedProductType) => void;
};

export const useChangeProductIndexStore = create<ProductStoreType>((set) => ({
  selectedProduct: {
    id: "",
    index: "",
    name: "",
    collectionId: "",
  },
  setSelectedProduct: (product) => {
    set({ selectedProduct: product });
  },
}));
