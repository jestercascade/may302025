import { create } from "zustand";

type OptionsStoreType = {
  selectedOptions: { [groupId: number]: number | null };
  productId: string | null;
  isInCart: boolean;
  setSelectedOption: (groupId: number, optionId: number | null) => void;
  setProductId: (productId: string) => void;
  setIsInCart: (isInCart: boolean) => void;
  resetOptions: () => void;
};

export const useOptionsStore = create<OptionsStoreType>((set) => ({
  selectedOptions: {},
  productId: null,
  isInCart: false,
  setIsInCart: (isInCart: boolean) => set({ isInCart }),
  setSelectedOption: (groupId, optionId) =>
    set((state) => ({
      selectedOptions: { ...state.selectedOptions, [groupId]: optionId },
    })),
  setProductId: (productId) => set({ productId }),
  resetOptions: () =>
    set({
      selectedOptions: {},
      productId: null,
      isInCart: false,
    }),
}));
