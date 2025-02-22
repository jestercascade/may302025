import { create } from "zustand";

type SeletedItemType = {
  id: string;
  name?: string;
  title?: string;
  index?: string;
};

type StoreType = {
  selectedItem: SeletedItemType;
  setSelectedItem: (item: SeletedItemType) => void;
};

export const useItemSelectorStore = create<StoreType>((set) => ({
  selectedItem: { id: "", index: "", name: "", title: "" },
  setSelectedItem: (item) => {
    set({ selectedItem: item });
  },
}));
