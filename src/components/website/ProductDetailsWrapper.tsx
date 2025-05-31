"use client";

import { ProductDetailsOptions } from "./Options/ProductDetailsOptions";
import { useOptionsStore } from "@/zustand/website/optionsStore";
import { useScrollStore } from "@/zustand/website/scrollStore";
import React, { useRef, useEffect, useCallback } from "react";
import { StickyBar } from "./ProductDetails/StickyBar";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function ProductDetailsWrapper({
  children,
  cart,
  productInfo,
}: {
  readonly children: React.ReactNode;
  cart: CartType | null;
  productInfo: ProductInfoType;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const setScrollPosition = useScrollStore((state) => state.setScrollPosition);
  const resetOptions = useOptionsStore((state) => state.resetOptions);

  const itemsInCart = cart?.items.length || 0;

  useEffect(() => resetOptions(), [productInfo.id, resetOptions]);

  const handleScroll = useCallback(() => {
    if (wrapperRef.current) {
      setScrollPosition(wrapperRef.current.scrollTop);
    }
  }, [setScrollPosition]);

  useEffect(() => {
    const wrapperElement = wrapperRef.current;
    if (!wrapperElement) return;

    wrapperElement.addEventListener("scroll", handleScroll);
    return () => wrapperElement.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div
      id="product-details-wrapper"
      ref={wrapperRef}
      className="h-screen overflow-x-hidden overflow-y-auto md:custom-scrollbar"
    >
      <nav className="w-full border-b bg-white">
        <div className="hidden md:flex w-full max-w-[1080px] mx-auto px-6 py-2 flex-col md:flex-row justify-between gap-1 relative">
          <div className="flex items-center gap-7">
            <Link href="/">
              <Image src="/cherlygood/logo.svg" alt="Cherlygood" width={220} height={27} priority className="mt-1" />
            </Link>
            <div className="flex gap-3 h-10">
              <Link
                href="/new-arrivals"
                className="active:bg-lightgray lg:hover:bg-lightgray h-10 text-sm font-semibold px-2 rounded-full flex items-center transition duration-300 ease-in-out"
              >
                New Arrivals
              </Link>
              <Link
                href="/track"
                className="active:bg-lightgray lg:hover:bg-lightgray h-10 text-sm font-semibold px-2 rounded-full flex items-center transition duration-300 ease-in-out"
              >
                Track Order
              </Link>
            </div>
          </div>
          <div className="absolute right-4 top-2 md:relative md:right-auto md:top-auto w-max h-10 flex items-center justify-end">
            <Link
              href="/cart"
              className="relative h-11 w-11 rounded-full flex items-center justify-center ease-in-out transition duration-300 active:bg-lightgray lg:hover:bg-lightgray"
              aria-label="View cart"
              title="View cart"
            >
              <ShoppingCart strokeWidth={2.5} />
              {itemsInCart > 0 && (
                <span className="absolute top-[4px] left-[30px] min-w-5 w-max h-5 px-1 rounded-full text-sm font-medium flex items-center justify-center text-white bg-red">
                  {itemsInCart}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>
      {children}
      <StickyBar
        productInfo={productInfo}
        optionsComponent={
          <ProductDetailsOptions
            hideDetailedSelections={true}
            options={productInfo.options}
            isStickyBarInCartIndicator={false}
          />
        }
        cart={cart}
      />
    </div>
  );
}

// -- Type Definitions --

type ProductInfoType = {
  id: string;
  name: string;
  pricing: {
    basePrice: number;
    salePrice: number;
    discountPercentage: number;
  };
  images: {
    main: string;
    gallery: string[];
  };
  options: ProductType["options"];
  upsell: {
    id: string;
    mainImage: string;
    pricing: {
      basePrice: number;
      salePrice: number;
      discountPercentage: number;
    };
    visibility: "DRAFT" | "PUBLISHED" | "HIDDEN";
    createdAt: string;
    updatedAt: string;
    products: Array<{
      id: string;
      name: string;
      slug: string;
      basePrice: number;
      images: {
        main: string;
        gallery: string[];
      };
      options: ProductType["options"];
    }>;
  };
};
