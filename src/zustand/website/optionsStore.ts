import { create } from "zustand";

type OptionsStoreType = {
  selectedColor: string;
  selectedSize: string;
  isInCart: boolean;
  productId: string | null;
  setSelectedColor: (color: string) => void;
  setSelectedSize: (size: string) => void;
  setIsInCart: (isInCart: boolean) => void;
  setProductId: (productId: string) => void;
  resetOptions: () => void;
};

export const useOptionsStore = create<OptionsStoreType>((set) => ({
  selectedColor: "",
  selectedSize: "",
  isInCart: false,
  productId: null,
  setSelectedColor: (color) => set({ selectedColor: color }),
  setSelectedSize: (size) => set({ selectedSize: size }),
  setIsInCart: (isInCart) => set({ isInCart }),
  setProductId: (productId) => set({ productId }),
  resetOptions: () =>
    set({
      selectedColor: "",
      selectedSize: "",
      isInCart: false,
      productId: null,
    }),
}));
