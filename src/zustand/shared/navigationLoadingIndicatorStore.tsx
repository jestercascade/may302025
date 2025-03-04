import { create } from "zustand";

type OverlayStoreType = {
  isVisible: boolean;
  showOverlay: () => void;
  hideOverlay: () => void;
};

export const useNavigationLoadingIndicatorStore = create<OverlayStoreType>(
  (set) => ({
    isVisible: false,
    showOverlay: () => set({ isVisible: true }),
    hideOverlay: () => set({ isVisible: false }),
  })
);
