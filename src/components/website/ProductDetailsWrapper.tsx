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
      <Footer />
    </div>
  );
}

// -- UI Components --

function Footer() {
  return (
    <footer className="w-full pt-6 pb-24 mt-14 bg-neutral-100">
      <div className="md:hidden max-w-[486px] px-5 mx-auto">
        <div className="flex flex-col gap-8">
          <div>
            <h4 className="block text-sm mb-3">
              Subscribe to our newsletter <br /> for exclusive deals and updates
            </h4>
            <div className="relative h-11 w-[270px]">
              <button className="peer w-[104px] h-[40px] absolute left-[164px] top-1/2 -translate-y-1/2 rounded font-semibold text-white">
                Subscribe
              </button>
              <div className="peer-hover:bg-[#cc8100] peer-hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] peer-active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] w-full h-full p-[2px] rounded-lg shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000]">
                <input className="w-40 h-[40px] px-3 rounded-md" type="text" placeholder="Enter your email" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <Link href="/about-us" className="block w-max text-sm text-gray mb-2 hover:underline">
                About us
              </Link>
              <Link href="/privacy-policy" className="block w-max text-sm text-gray mb-2 hover:underline">
                Privacy policy
              </Link>
              <Link href="/terms-of-use" className="block w-max text-sm text-gray mb-2 hover:underline">
                Terms of use
              </Link>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Get Help</h3>
              <Link href="/contact-us" className="block w-max text-sm text-gray mb-2 hover:underline">
                Contact us
              </Link>
              <Link href="/track" className="block w-max text-sm text-gray mb-2 hover:underline">
                Track order
              </Link>
              <Link href="/returns-and-refunds" className="block w-max text-sm text-gray mb-2 hover:underline">
                Returns & refunds
              </Link>
              <Link href="/faq" className="block w-max text-sm text-gray mb-2 hover:underline">
                FAQs
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden md:block w-full max-w-[1040px] px-9 mx-auto">
        <div className="flex gap-10">
          <div className="w-full">
            <h3 className="font-semibold mb-4">Company</h3>
            <Link href="/about-us" className="block w-max text-sm text-gray mb-2 hover:underline">
              About us
            </Link>
            <Link href="/privacy-policy" className="block w-max text-sm text-gray mb-2 hover:underline">
              Privacy policy
            </Link>
            <Link href="/terms-of-use" className="block w-max text-sm text-gray mb-2 hover:underline">
              Terms of use
            </Link>
          </div>
          <div className="w-full">
            <h3 className="font-semibold mb-4">Get Help</h3>
            <Link href="/contact-us" className="block w-max text-sm text-gray mb-2 hover:underline">
              Contact us
            </Link>
            <Link href="/track" className="block w-max text-sm text-gray mb-2 hover:underline">
              Track order
            </Link>
            <Link href="/returns-and-refunds" className="block w-max text-sm text-gray mb-2 hover:underline">
              Returns & refunds
            </Link>
            <Link href="/faq" className="block w-max text-sm text-gray mb-2 hover:underline">
              FAQs
            </Link>
          </div>
          <div className="min-w-[270px]">
            <h4 className="block text-sm mb-3">
              Subscribe to our newsletter <br /> for exclusive deals and updates
            </h4>
            <div className="relative h-11 w-[270px]">
              <button className="peer w-[104px] h-[40px] absolute left-[164px] top-1/2 -translate-y-1/2 rounded font-semibold text-white">
                Subscribe
              </button>
              <div className="peer-hover:bg-[#cc8100] peer-hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] peer-active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] w-full h-full p-[2px] rounded-lg shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000]">
                <input className="w-40 h-[40px] px-3 rounded-md" type="text" placeholder="Enter your email" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
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
