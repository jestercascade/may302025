import { create } from "zustand";

type OptionsStoreType = {
  selectedOptions: { [groupId: number]: number | null };
  isInCart: boolean;
  productId: string | null;
  setSelectedOption: (groupId: number, optionId: number | null) => void;
  setIsInCart: (isInCart: boolean) => void;
  setProductId: (productId: string) => void;
  resetOptions: () => void;
};

export const useOptionsStore = create<OptionsStoreType>((set) => ({
  selectedOptions: {},
  isInCart: false,
  productId: null,
  setSelectedOption: (groupId, optionId) =>
    set((state) => ({
      selectedOptions: { ...state.selectedOptions, [groupId]: optionId },
    })),
  setIsInCart: (isInCart) => set({ isInCart }),
  setProductId: (productId) => set({ productId }),
  resetOptions: () =>
    set({
      selectedOptions: {},
      isInCart: false,
      productId: null,
    }),
}));
