import { create } from "zustand";

type NavbarMenuStoreType = {
  navbarMenuVisible: boolean;
  setNavbarMenu: (visible: boolean) => void;
};

export const useNavbarMenuStore = create<NavbarMenuStoreType>((set) => ({
  navbarMenuVisible: false,
  setNavbarMenu: (visible) => set({ navbarMenuVisible: visible }),
}));
