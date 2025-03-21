import { create } from "zustand";

type BodyOverflowStoreType = {
  preventBodyOverflowChange: boolean;
  setPreventBodyOverflowChange: (prevent: boolean) => void;
};

export const useBodyOverflowStore = create<BodyOverflowStoreType>((set) => ({
  preventBodyOverflowChange: false,
  setPreventBodyOverflowChange: (prevent) =>
    set({ preventBodyOverflowChange: prevent }),
}));
