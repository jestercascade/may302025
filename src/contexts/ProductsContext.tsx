"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getProducts } from "@/actions/get/products";

// Create a singleton store outside of React's component lifecycle
// This will persist across component mounts/unmounts
const globalProductsStore = {
  products: null as ProductWithUpsellType[] | null,
  isLoading: false,
  lastFetched: null as number | null,
  hasInitialized: false,
};

type ProductsContextType = {
  products: ProductWithUpsellType[] | null;
  isLoading: boolean;
  lastFetched: number | null;
};

const ProductsContext = createContext<ProductsContextType>({
  products: null,
  isLoading: false,
  lastFetched: null,
});

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProductsContextType>({
    products: globalProductsStore.products,
    isLoading: globalProductsStore.isLoading,
    lastFetched: globalProductsStore.lastFetched,
  });

  useEffect(() => {
    // If we've already initialized the store or are currently loading, don't fetch again
    if (globalProductsStore.hasInitialized || globalProductsStore.isLoading) {
      // Still sync local state with global store in case it changed elsewhere
      setState({
        products: globalProductsStore.products,
        isLoading: globalProductsStore.isLoading,
        lastFetched: globalProductsStore.lastFetched,
      });
      return;
    }

    async function fetchProducts() {
      // Set loading state both locally and globally
      globalProductsStore.isLoading = true;
      setState((prev) => ({ ...prev, isLoading: true }));

      // console.log("🔄 Fetching products...");

      try {
        const productFields = [
          "id",
          "name",
          "slug",
          "description",
          "pricing",
          "images",
          "options",
          "upsell",
          "highlights",
        ];

        const fetchedProducts = await getProducts({ fields: productFields });
        // console.log("✅ Products fetched:", fetchedProducts?.length);

        // Update both global store and local state
        globalProductsStore.products =
          fetchedProducts as ProductWithUpsellType[];
        globalProductsStore.isLoading = false;
        globalProductsStore.lastFetched = Date.now();
        globalProductsStore.hasInitialized = true;

        setState({
          products: fetchedProducts as ProductWithUpsellType[],
          isLoading: false,
          lastFetched: Date.now(),
        });
      } catch (error) {
        // console.error("❌ Error fetching products:", error);

        // Reset loading state on error
        globalProductsStore.isLoading = false;
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }

    // Only run on client side
    if (typeof window !== "undefined") {
      fetchProducts();
    }
  }, []);

  return (
    <ProductsContext.Provider value={state}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  return context.products;
}

export function useProductsState() {
  return useContext(ProductsContext);
}

// For debugging - allows checking the global store from anywhere
export function getGlobalProductsStore() {
  return { ...globalProductsStore };
}
