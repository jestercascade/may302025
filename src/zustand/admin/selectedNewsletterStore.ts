import { create } from "zustand";

type SelectedNewsletterStoreType = {
  selectedNewsletterId: string;
  setSelectedNewsletterId: (visible: string) => void;
};

export const useSelectedNewsletterStore = create<SelectedNewsletterStoreType>(
  (set) => ({
    selectedNewsletterId: "",
    setSelectedNewsletterId: (visible) =>
      set({ selectedNewsletterId: visible }),
  })
);
