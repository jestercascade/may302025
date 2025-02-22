import { create } from "zustand";

type ProductColorImageStore = {
  selectedColorImage: string | null;
  setSelectedColorImage: (imageUrl: string) => void;
  resetSelectedColorImage: () => void;
};

export const useProductColorImageStore = create<ProductColorImageStore>(
  (set) => ({
    selectedColorImage: null,
    setSelectedColorImage: (imageUrl) => set({ selectedColorImage: imageUrl }),
    resetSelectedColorImage: () => set({ selectedColorImage: null }),
  })
);
