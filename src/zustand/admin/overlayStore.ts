import { create } from "zustand";

// Base types
type OverlayName = string;
type PageName = string;

interface Overlay {
  name: OverlayName;
  isVisible: boolean;
}

interface OverlayAction {
  pageName: PageName;
  overlayName: OverlayName;
}

// Improved type safety with mapped types
type OverlayConfig = {
  [K in PageName]: {
    name: K;
    overlays: Record<string, Overlay>;
  };
};

interface OverlayStore {
  pages: OverlayConfig;
  showOverlay: (action: OverlayAction) => void;
  hideOverlay: (action: OverlayAction) => void;
}

// Define overlays configuration separately for better maintainability
const createOverlay = (name: string): Overlay => ({
  name,
  isVisible: false,
});

const createOverlays = (names: string[]): Record<string, Overlay> => {
  return names.reduce(
    (acc, name) => ({
      ...acc,
      [name]: createOverlay(name),
    }),
    {}
  );
};

// Centralize overlay configuration
const OVERLAY_CONFIG = {
  home: {
    name: "home",
    overlays: createOverlays(["articleImageSlideshow"]),
  },
  editProduct: {
    name: "editProduct",
    overlays: createOverlays([
      "basicDetails",
      "mainImage",
      "imageGallery",
      "options",
      "sizes",
      "colors",
      "description",
      "highlights",
      "onPageSeo",
      "productSource",
      "upsell",
      "visibility",
    ]),
  },
  products: {
    name: "products",
    overlays: createOverlays(["newProduct"]),
  },
  upsells: {
    name: "upsells",
    overlays: createOverlays(["newUpsell"]),
  },
  editUpsell: {
    name: "editUpsell",
    overlays: createOverlays(["basicDetails", "visibility"]),
  },
  storefront: {
    name: "storefront",
    overlays: createOverlays([
      "newCollection",
      "categories",
      "discoveryProducts",
      "editPageHero",
      "removeProduct",
      "changeProductIndex",
      "changeCollectionIndex",
    ]),
  },
  editCollection: {
    name: "editCollection",
    overlays: createOverlays([
      "basicDetails",
      "bannerImages",
      "campaignDuration",
      "productList",
      "visibility",
      "addProduct",
      "removeProduct",
      "changeProductIndex",
    ]),
  },
  orderDetails: {
    name: "orderDetails",
    overlays: createOverlays([
      "orderConfirmedEmailPreview",
      "orderShippedEmailPreview",
      "orderDeliveredEmailPreview",
    ]),
  },
  newsletter: {
    name: "newsletter",
    overlays: createOverlays([
      "sendNewsletter",
      "createNewsletter",
      "editNewsletter",
    ]),
  },
} as const;

// Helper function to safely update overlay visibility
const updateOverlayVisibility = (
  pages: OverlayConfig,
  pageName: PageName,
  overlayName: OverlayName,
  isVisible: boolean
): OverlayConfig => {
  const page = pages[pageName];
  if (!page?.overlays[overlayName]) return pages;

  return {
    ...pages,
    [pageName]: {
      ...page,
      overlays: {
        ...page.overlays,
        [overlayName]: {
          ...page.overlays[overlayName],
          isVisible,
        },
      },
    },
  };
};

// Create the store
export const useOverlayStore = create<OverlayStore>((set) => ({
  pages: OVERLAY_CONFIG,

  showOverlay: ({ pageName, overlayName }) => {
    set((state) => ({
      pages: updateOverlayVisibility(state.pages, pageName, overlayName, true),
    }));
  },

  hideOverlay: ({ pageName, overlayName }) => {
    set((state) => ({
      pages: updateOverlayVisibility(state.pages, pageName, overlayName, false),
    }));
  },
}));
