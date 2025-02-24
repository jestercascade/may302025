"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getProducts } from "@/actions/get/products";

type ProductsContextType = ProductWithUpsellType[] | null;

const ProductsContext = createContext<ProductsContextType>(null);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<ProductsContextType>(null);

  useEffect(() => {
    async function fetchProducts() {
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
      setProducts(fetchedProducts as ProductWithUpsellType[]);
    }
    fetchProducts();
  }, []);

  return (
    <ProductsContext.Provider value={products}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}
