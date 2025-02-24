"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ProductCard } from "./ProductCard";
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
  const [isShuffling, setIsShuffling] = useState(true); // Initialize to true
  const pathname = usePathname();

  useEffect(() => {
    if (!allProducts) return;

    // Shuffling logic
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
    setIsShuffling(false); // Set to false after shuffling
  }, [allProducts, excludeIds, page, pathname]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 h-8 md:w-[calc(100%-20px)] md:mx-auto">
        <h2 className="font-semibold line-clamp-3 md:text-xl">{heading}</h2>
      </div>
      <div className="select-none w-full flex flex-wrap gap-2 md:gap-0">
        {isShuffling
          ? Array.from({ length: 3 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))
          : shuffledProducts.map((product) => (
              <ProductCard key={product.id} product={product} cart={cart} />
            ))}
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="flex justify-center w-full md:w-[calc(33.33%-8px)] p-[10px] rounded-2xl bg-white">
      <div className="w-full">
        <div className="w-full aspect-square rounded-xl overflow-hidden bg-neutral-200 animate-pulse"></div>
        <div className="pt-2 flex flex-col gap-[6px]">
          <div className="h-4 bg-neutral-200 animate-pulse rounded-md w-3/4"></div>
          <div className="h-4 w-1/2 bg-neutral-200 animate-pulse rounded-md"></div>
        </div>
      </div>
    </div>
  );
}
