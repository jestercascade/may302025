"use client";

import React, { useEffect, useState } from "react";
// import { RemoveFromCartButton } from "@/components/website/RemoveFromCartButton";
import { formatThousands } from "@/lib/utils/common";
import { PiShieldCheckBold } from "react-icons/pi";
import { TbLock, TbTruck } from "react-icons/tb";
import { PayPalButton } from "@/components/website/PayPalButton";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { Check } from "lucide-react";
import { RemoveFromCartButton } from "./RemoveFromCartButton";

export function CartItemList({ cartItems }: { cartItems: CartItemType[] }) {
  // Initialize with all items selected by default
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(cartItems.map((item) => item.variantId)));

  // Keep track of manually deselected items
  const [deselectedItems, setDeselectedItems] = useState<Set<string>>(new Set());

  // Keep track of manually selected items
  const [manuallySelectedItems, setManuallySelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Update selections when cart items change
    setSelectedItems((prevSelected) => {
      const newSelected = new Set<string>();

      cartItems.forEach((item) => {
        const variantId = item.variantId;

        // Keep item selected if:
        // 1. It was manually selected previously
        // 2. OR it's a new item AND wasn't manually deselected before
        // 3. OR it was previously selected and not manually deselected
        if (
          manuallySelectedItems.has(variantId) ||
          (!prevSelected.has(variantId) && !deselectedItems.has(variantId)) ||
          (prevSelected.has(variantId) && !deselectedItems.has(variantId))
        ) {
          newSelected.add(variantId);
        }
      });

      return newSelected;
    });
  }, [cartItems, deselectedItems, manuallySelectedItems]);

  const toggleItem = (variantId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(variantId)) {
        newSet.delete(variantId);
        setDeselectedItems(new Set([...deselectedItems, variantId]));
        setManuallySelectedItems(new Set([...manuallySelectedItems].filter((id) => id !== variantId)));
      } else {
        newSet.add(variantId);
        setManuallySelectedItems(new Set([...manuallySelectedItems, variantId]));
        setDeselectedItems(new Set([...deselectedItems].filter((id) => id !== variantId)));
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
      setDeselectedItems(new Set(cartItems.map((item) => item.variantId)));
      setManuallySelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map((item) => item.variantId)));
      setDeselectedItems(new Set());
      setManuallySelectedItems(new Set(cartItems.map((item) => item.variantId)));
    }
  };

  const calculateTotal = () => {
    const totalBasePrice = cartItems.reduce((total, item) => {
      if (!selectedItems.has(item.variantId)) return total;

      const itemPrice = item.pricing.salePrice || item.pricing.basePrice;
      const price = typeof itemPrice === "number" ? itemPrice : parseFloat(itemPrice);
      return isNaN(price) ? total : total + price;
    }, 0);

    return Number(totalBasePrice.toFixed(2));
  };

  const getSelectedCartItems = () => {
    return cartItems.filter((item) => selectedItems.has(item.variantId));
  };

  const formatProductOptions = (options: Record<string, string>) => {
    const entries = Object.entries(options || {});
    if (entries.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-1 w-full">
        {entries.map(([key, value]) => {
          const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
          const id = `${key}:${value}`;
          return (
            <span key={id} className="inline-flex text-xs px-1.5 py-0.5 rounded bg-neutral-100 text-gray-600">
              {formattedKey}: {value}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative flex flex-row gap-10 pt-8 w-full">
      <div className="w-full h-max">
        <div className="flex flex-col gap-5">
          <div className="flex gap-3">
            <div className="flex items-center">
              <div
                onClick={toggleAll}
                className={clsx(
                  "w-5 h-5 cursor-pointer rounded-full flex items-center justify-center ease-in-out duration-200 transition",
                  selectedItems.size === cartItems.length ? "bg-black" : "border border-neutral-400"
                )}
              >
                {selectedItems.size === cartItems.length && <Check color="#ffffff" size={16} strokeWidth={2} />}
              </div>
            </div>
            <span className="font-semibold">
              {selectedItems.size > 0
                ? `Checkout (${selectedItems.size} ${selectedItems.size === 1 ? "Item" : "Items"})`
                : "Select items for checkout"}
            </span>
          </div>
          <div className="flex flex-col gap-5">
            {cartItems.map((item) => {
              const isSelected = selectedItems.has(item.variantId);

              if (item.type === "product") {
                return (
                  <div key={item.index} className="flex gap-3">
                    <div className="flex items-center">
                      <div
                        onClick={() => toggleItem(item.variantId)}
                        className={clsx(
                          "w-5 h-5 cursor-pointer rounded-full flex items-center justify-center ease-in-out duration-200 transition",
                          isSelected ? "bg-black" : "border border-neutral-400"
                        )}
                      >
                        {isSelected && <Check color="#ffffff" size={16} strokeWidth={2} />}
                      </div>
                    </div>
                    <div>
                      <div className="min-[580px]:hidden flex items-center justify-center min-w-[108px] max-w-[108px] min-h-[108px] max-h-[108px] overflow-hidden rounded-lg">
                        <Image src={item.mainImage} alt={item.name} width={108} height={108} priority />
                      </div>
                      <div className="hidden min-[580px]:flex items-center justify-center min-[580px]:min-w-[146px] min-[580px]:max-w-[146px] min-[580px]:min-h-[146px] min-[580px]:max-h-[146px] overflow-hidden rounded-lg">
                        <Image src={item.mainImage} alt={item.name} width={146} height={146} priority />
                      </div>
                    </div>
                    <div className="w-full pr-3 flex flex-col gap-1">
                      <div className="min-w-full h-5 flex items-center justify-between gap-3">
                        <Link
                          href={`${item.slug}-${item.baseProductId}`}
                          target="_blank"
                          className="text-gray text-xs line-clamp-1 hover:underline"
                        >
                          {item.name}
                        </Link>
                        <RemoveFromCartButton type="product" variantId={item.variantId} />
                      </div>
                      {formatProductOptions(item.selectedOptions)}
                      <div className="w-max flex items-center justify-center">
                        {Number(item.pricing.salePrice) ? (
                          <div className="flex items-center gap-[6px]">
                            <div className="flex items-baseline text-[rgb(168,100,0)]">
                              <span className="text-[0.813rem] leading-3 font-semibold">$</span>
                              <span className="text-lg font-bold">{Math.floor(Number(item.pricing.salePrice))}</span>
                              <span className="text-[0.813rem] leading-3 font-semibold">
                                {(Number(item.pricing.salePrice) % 1).toFixed(2).substring(1)}
                              </span>
                            </div>
                            <span className="text-[0.813rem] leading-3 text-gray line-through">
                              ${formatThousands(Number(item.pricing.basePrice))}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-baseline">
                            <span className="text-[0.813rem] leading-3 font-semibold">$</span>
                            <span className="text-lg font-bold">{Math.floor(Number(item.pricing.basePrice))}</span>
                            <span className="text-[0.813rem] leading-3 font-semibold">
                              {(Number(item.pricing.basePrice) % 1).toFixed(2).substring(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              } else if (item.type === "upsell") {
                return (
                  <div key={item.index} className="flex gap-3">
                    <div className="flex items-center">
                      <div
                        onClick={() => toggleItem(item.variantId)}
                        className={clsx(
                          "w-5 h-5 cursor-pointer rounded-full flex items-center justify-center ease-in-out duration-200 transition",
                          isSelected ? "bg-black" : "border border-neutral-400"
                        )}
                      >
                        {isSelected && <Check color="#ffffff" size={16} strokeWidth={2} />}
                      </div>
                    </div>
                    <div className="relative w-[calc(100%-32px)] p-5 pr-0 rounded-lg bg-[#fffbf6] border border-[#fceddf]">
                      <div className="mb-5 min-w-full h-5 flex gap-5 items-center justify-between">
                        <div className="w-max flex items-center justify-center">
                          {Number(item.pricing.salePrice) ? (
                            <div className="flex items-center gap-[6px]">
                              <div className="flex items-baseline text-[rgb(168,100,0)]">
                                <span className="text-[0.813rem] leading-3 font-semibold">$</span>
                                <span className="text-lg font-bold">{Math.floor(Number(item.pricing.salePrice))}</span>
                                <span className="text-[0.813rem] leading-3 font-semibold">
                                  {(Number(item.pricing.salePrice) % 1).toFixed(2).substring(1)}
                                </span>
                              </div>
                              <span className="text-[0.813rem] leading-3 text-gray line-through">
                                ${formatThousands(Number(item.pricing.basePrice))}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-baseline text-[rgb(168,100,0)]">
                              <span className="text-[0.813rem] leading-3 font-semibold">$</span>
                              <span className="text-lg font-bold">{Math.floor(Number(item.pricing.basePrice))}</span>
                              <span className="text-[0.813rem] leading-3 font-semibold">
                                {(Number(item.pricing.basePrice) % 1).toFixed(2).substring(1)}
                              </span>
                              <span className="ml-1 text-[0.813rem] leading-3 font-semibold">today</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="pr-5 flex gap-2 invisible-scrollbar overflow-y-hidden overflow-x-visible">
                        {item.products.map((product) => (
                          <div key={product.id} className="last:mb-0 min-w-[108px] min-[580px]:min-w-[146px]">
                            <div className="min-[580px]:hidden flex items-center justify-center mb-2 w-[108px] h-[108px] rounded-md overflow-hidden border border-[#fceddf] bg-white">
                              <Image src={product.mainImage} alt={product.name} width={108} height={108} priority />
                            </div>
                            <div className="hidden min-[580px]:flex items-center justify-center mb-2 w-[146px] h-[146px] rounded-md overflow-hidden border border-[#fceddf] bg-white">
                              <Image src={product.mainImage} alt={product.name} width={146} height={146} priority />
                            </div>
                            <div className="flex flex-col gap-[2px]">
                              <Link
                                href={`${product.slug}-${product.id}`}
                                target="_blank"
                                className="text-gray text-xs hover:underline w-max"
                              >
                                {product.name.length > 18 ? `${product.name.slice(0, 18)}...` : product.name}
                              </Link>
                              {formatProductOptions(product.selectedOptions)}
                            </div>
                          </div>
                        ))}
                      </div>
                      <RemoveFromCartButton type="upsell" variantId={item.variantId} />
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
      <div className="hidden md:flex flex-col gap-3 h-max min-w-[276px] max-w-[276px] lg:min-w-[300px] lg:max-w-[300px] sticky top-16 select-none">
        <div className="flex flex-col gap-2">
          <div className="flex gap-[6px] items-center">
            <TbLock className="stroke-green -ml-[1px]" size={20} />
            <span className="text-sm text-gray">Secure Checkout with SSL Encryption</span>
          </div>
          <div className="flex gap-[6px] items-center">
            <PiShieldCheckBold className="fill-green" size={18} />
            <span className="text-sm text-gray ml-[1px]">Safe and Trusted Payment Methods</span>
          </div>
          <div className="flex gap-[6px] items-center">
            <TbTruck className="stroke-green" size={20} />
            <span className="text-sm text-gray">Free Shipping for You</span>
          </div>
        </div>
        <div className="mb-2 flex items-baseline gap-1">
          {selectedItems.size > 0 ? (
            <>
              <span className="text-sm font-semibold">
                Total ({selectedItems.size} {selectedItems.size === 1 ? "Item" : "Items"}):
              </span>
              <div className="flex items-baseline">
                <span className="text-sm font-semibold">$</span>
                <span className="text-xl font-bold">{Math.floor(Number(calculateTotal()))}</span>
                <span className="text-sm font-semibold">{(Number(calculateTotal()) % 1).toFixed(2).substring(1)}</span>
              </div>
            </>
          ) : (
            <button
              onClick={toggleAll}
              className="text-sm text-blue px-3 w-max h-8 rounded-full cursor-pointer flex items-center justify-center border border-[#d9d8d6] shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear-gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.1)]"
            >
              Select all items
            </button>
          )}
        </div>
        <div className={clsx(selectedItems.size ? "flex items-center mb-2" : "hidden")}>
          <div className="h-[20px] rounded-[3px] flex items-center justify-center">
            <Image
              src="/images/payment-methods/visa.svg"
              alt="Visa"
              width={34}
              height={34}
              priority={true}
              draggable={false}
            />
          </div>
          <div className="ml-[10px] h-[18px] w-[36px] rounded-[3px] flex items-center justify-center">
            <Image
              className="-ml-[4px]"
              src="/images/payment-methods/mastercard.svg"
              alt="Mastercard"
              width={38}
              height={38}
              priority={true}
              draggable={false}
            />
          </div>
          <div className="ml-[5px] h-[20px] overflow-hidden rounded-[3px] flex items-center justify-center">
            <Image
              src="/images/payment-methods/american-express.png"
              alt="American Express"
              width={60}
              height={20}
              priority={true}
              draggable={false}
            />
          </div>
          <div className="ml-[10px] h-[20px] rounded-[3px] flex items-center justify-center">
            <Image
              src="/images/payment-methods/discover.svg"
              alt="Discover"
              width={64}
              height={14}
              priority={true}
              draggable={false}
            />
          </div>
          <div className="ml-[10px] h-[20px] rounded-[3px] flex items-center justify-center">
            <Image
              src="/images/payment-methods/diners-club-international.svg"
              alt="Diners Club International"
              width={68}
              height={10}
              priority={true}
              draggable={false}
            />
          </div>
        </div>
        {/* {selectedItems.size > 0 && <PayPalButton showLabel={true} cart={getSelectedCartItems()} />} */}
      </div>
      <MobilePriceDetails
        selectedItems={selectedItems}
        getSelectedCartItems={getSelectedCartItems}
        calculateTotal={calculateTotal}
        toggleAll={toggleAll}
      />
    </div>
  );
}

// -- UI Components --

function MobilePriceDetails({
  selectedItems,
  getSelectedCartItems,
  calculateTotal,
  toggleAll,
}: {
  selectedItems: Set<string>;
  getSelectedCartItems: () => CartItemType[];
  calculateTotal: () => number;
  toggleAll: () => void;
}) {
  return (
    <div className="md:hidden pt-[6px] p-2 pb-5 border-t border-[#e6e8ec] bg-white fixed z-10 bottom-0 left-0 right-0">
      <div className="flex gap-4 items-center justify-end mx-auto w-full max-w-[536px]">
        <div className="w-max flex items-center gap-1">
          {selectedItems.size > 0 ? (
            <div className="flex items-baseline">
              <span className="text-sm font-semibold">$</span>
              <span className="text-lg font-bold">{Math.floor(Number(calculateTotal()))}</span>
              <span className="text-sm font-semibold">{(Number(calculateTotal()) % 1).toFixed(2).substring(1)}</span>
            </div>
          ) : (
            <button
              onClick={toggleAll}
              className="text-sm text-blue px-3 w-max h-8 rounded-full cursor-pointer flex items-center justify-center border border-[#d9d8d6] shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear-gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.1)]"
            >
              Select all items
            </button>
          )}
        </div>
        {/* <div className="w-[200px] h-[35px]">
          {selectedItems.size > 0 && <PayPalButton showLabel={false} cart={getSelectedCartItems()} />}
        </div> */}
      </div>
    </div>
  );
}

// -- Type Definitions --

type CartProductItemType = {
  type: "product";
  baseProductId: string;
  name: string;
  slug: string;
  pricing: {
    basePrice: number;
    salePrice: number;
    discountPercentage: number;
  };
  mainImage: string;
  variantId: string;
  selectedOptions: Record<string, string>;
  index: number;
};

type CartUpsellItemType = {
  type: "upsell";
  baseUpsellId: string;
  variantId: string;
  index: number;
  mainImage: string;
  pricing: {
    basePrice: number;
    salePrice: number;
    discountPercentage: number;
  };
  products: Array<{
    id: string;
    name: string;
    slug: string;
    mainImage: string;
    basePrice: number;
    selectedOptions: Record<string, string>;
  }>;
};

type CartItemType = CartProductItemType | CartUpsellItemType;
