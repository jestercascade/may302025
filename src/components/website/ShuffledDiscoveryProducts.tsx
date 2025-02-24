"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ProductCard } from "./ProductCard";
import { Spinner } from "@/ui/Spinners/Default";
import { useProducts } from "@/contexts/ProductsContext";

export default function ShuffledDiscoveryProducts({
  heading = "Explore Your Interests",
  page,
  excludeIds = [],
  cart,
}: {
  heading?: string;
  page?: "HOME" | "CART";
  excludeIds?: string[];
  cart: CartType | null;
}) {
  const allProducts = useProducts();
  const [shuffledProducts, setShuffledProducts] = useState<
    ProductWithUpsellType[]
  >([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!allProducts) return;

    setIsShuffling(true);
    const filtered = allProducts.filter((product) =>
      page === "HOME" || page === "CART"
        ? !excludeIds.includes(product.id)
        : true
    );

    // Fisher-Yates shuffle
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setShuffledProducts(shuffled.slice(0, 20));
    setIsShuffling(false);
  }, [allProducts, excludeIds, page, pathname]);

  if (!allProducts || isShuffling) {
    return <Spinner color="gray" />;
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 h-8 md:w-[calc(100%-20px)] md:mx-auto">
        <h2 className="font-semibold line-clamp-3 md:text-xl">{heading}</h2>
      </div>
      <div className="select-none w-full flex flex-wrap gap-2 md:gap-0">
        {shuffledProducts.map((product) => (
          <ProductCard key={product.id} product={product} cart={cart} />
        ))}
      </div>
    </div>
  );
}
