import { create } from "zustand";

type OptionsStoreType = {
  selectedOptions: { [groupId: number]: number | null };
  productId: string | null;
  setSelectedOption: (groupId: number, optionId: number | null) => void;
  setProductId: (productId: string) => void;
  resetOptions: () => void;
};

export const useOptionsStore = create<OptionsStoreType>((set) => ({
  selectedOptions: {},
  productId: null,
  setSelectedOption: (groupId, optionId) =>
    set((state) => ({
      selectedOptions: { ...state.selectedOptions, [groupId]: optionId },
    })),
  setProductId: (productId) => set({ productId }),
  resetOptions: () =>
    set({
      selectedOptions: {},
      productId: null,
    }),
}));
