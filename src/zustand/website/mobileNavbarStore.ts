import { create } from "zustand";

type MobileNavbarStoreType = {
  isMobileNavbarOverlayVisible: boolean;
  showMobileNavbarOverlay: () => void;
  hideMobileNavbarOverlay: () => void;
};

export const useMobileNavbarStore = create<MobileNavbarStoreType>((set) => ({
  isMobileNavbarOverlayVisible: false,
  showMobileNavbarOverlay: () => set({ isMobileNavbarOverlayVisible: true }),
  hideMobileNavbarOverlay: () => set({ isMobileNavbarOverlayVisible: false }),
}));
