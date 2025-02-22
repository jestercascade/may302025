import { create } from "zustand";

type ScrollStoreProps = {
  productInfoWrapperHeight: number;
  scrollPosition: number;
  shouldShowStickyBar: boolean;
  setProductInfoWrapperHeight: (height: number) => void;
  setScrollPosition: (position: number) => void;
  setShouldShowStickyBar: (show: boolean) => void;
};

export const useScrollStore = create<ScrollStoreProps>((set) => ({
  productInfoWrapperHeight: 0,
  scrollPosition: 0,
  shouldShowStickyBar: false,

  setProductInfoWrapperHeight: (height) =>
    set({ productInfoWrapperHeight: height }),

  setScrollPosition: (position) => set({ scrollPosition: position }),

  setShouldShowStickyBar: (show) => set({ shouldShowStickyBar: show }),
}));
