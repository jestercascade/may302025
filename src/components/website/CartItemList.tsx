"use client";

import React, { useEffect, useState } from "react";
import { formatThousands } from "@/lib/utils/common";
import { PiShieldCheckBold } from "react-icons/pi";
import { TbLock, TbTruck } from "react-icons/tb";
import { PayPalButton } from "@/components/website/PayPalButton";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { Check, Gift } from "lucide-react";
import { RemoveFromCartButton } from "./RemoveFromCartButton";

// Type Definitions
type SelectedOptionType = {
  value: string;
  optionDisplayOrder: number;
  groupDisplayOrder: number;
};

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
  selectedOptions: Record<string, SelectedOptionType>;
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
    selectedOptions: Record<string, SelectedOptionType>;
  }>;
};

type CartItemType = CartProductItemType | CartUpsellItemType;

interface OrderSummaryProps {
  selectedItems: Set<string>;
  getSelectedCartItems: () => CartItemType[];
  calculateTotal: () => number;
  toggleAll: () => void;
  cartItems: CartItemType[];
}

interface MobileOrderSummaryProps extends OrderSummaryProps {}

export function CartItemList({ cartItems }: { cartItems: CartItemType[] }) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(cartItems.map((item) => item.variantId)));
  const [deselectedItems, setDeselectedItems] = useState<Set<string>>(new Set());
  const [manuallySelectedItems, setManuallySelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedItems((prevSelected) => {
      const newSelected = new Set<string>();

      cartItems.forEach((item) => {
        const variantId = item.variantId;
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

  const formatOptions = (options: Record<string, SelectedOptionType>, type: "product" | "upsell" = "product") => {
    const entries = Object.entries(options || {});
    if (entries.length === 0) return null;

    const sortedEntries = entries.sort(([, a], [, b]) => a.groupDisplayOrder - b.groupDisplayOrder);

    const getClassNames = () => {
      if (type === "upsell") {
        return "inline-flex text-xs px-1.5 py-0.5 rounded border border-blue-200/70 text-gray bg-blue-50";
      }
      return "inline-flex text-xs px-1.5 py-0.5 rounded bg-[#F7F7F7] text-neutral-500";
    };

    return (
      <div className="flex flex-wrap gap-1 mt-1 max-w-72">
        {sortedEntries.map(([key, option]) => {
          const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
          const id = `${key}:${option.value}`;
          return (
            <span key={id} className={getClassNames()}>
              {formattedKey}: {option.value}
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
                  "w-[18px] h-[18px] cursor-pointer rounded-full flex items-center justify-center ease-in-out duration-200 transition",
                  selectedItems.size === cartItems.length ? "bg-black" : "border border-neutral-400"
                )}
              >
                {selectedItems.size === cartItems.length && <Check color="#ffffff" size={12} strokeWidth={2} />}
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
                          "w-[18px] h-[18px] cursor-pointer rounded-full flex items-center justify-center ease-in-out duration-200 transition",
                          isSelected ? "bg-black" : "border border-neutral-400"
                        )}
                      >
                        {isSelected && <Check color="#ffffff" size={12} strokeWidth={2} />}
                      </div>
                    </div>
                    <div className="relative flex flex-col min-[580px]:flex-row gap-4 w-[calc(100%-32px)] p-5 rounded-lg border border-gray-200/80">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center absolute right-3 top-3">
                        <RemoveFromCartButton type="product" variantId={item.variantId} />
                      </div>
                      <div className="aspect-square h-[160px] min-[580px]:h-[128px]">
                        <div className="min-[580px]:hidden flex items-center justify-center h-full w-max mx-auto overflow-hidden rounded-lg">
                          <Image src={item.mainImage} alt={item.name} width={160} height={160} priority />
                        </div>
                        <div className="hidden min-[580px]:flex items-center justify-center min-[580px]:min-w-[128px] min-[580px]:max-w-[128px] min-[580px]:min-h-[128px] min-[580px]:max-h-[128px] overflow-hidden rounded-lg">
                          <Image src={item.mainImage} alt={item.name} width={128} height={128} priority />
                        </div>
                      </div>
                      <div className="w-full flex flex-col gap-1">
                        <div className="min-w-full h-5 flex items-center justify-between gap-3">
                          <Link
                            href={`${item.slug}-${item.baseProductId}`}
                            target="_blank"
                            className="text-xs line-clamp-1 min-[580px]:w-[calc(100%-28px)] hover:underline"
                          >
                            {item.name}
                          </Link>
                          {/* <RemoveFromCartButton type="product" variantId={item.variantId} /> */}
                        </div>
                        {formatOptions(item.selectedOptions)}
                        <div className="mt-1 w-max flex items-center justify-center">
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
                  </div>
                );
              } else if (item.type === "upsell") {
                return (
                  <div key={item.index} className="flex gap-3">
                    <div className="flex items-center">
                      <div
                        onClick={() => toggleItem(item.variantId)}
                        className={clsx(
                          "w-[18px] h-[18px] cursor-pointer rounded-full flex items-center justify-center ease-in-out duration-200 transition",
                          isSelected ? "bg-black" : "border border-neutral-400"
                        )}
                      >
                        {isSelected && <Check color="#ffffff" size={12} strokeWidth={2} />}
                      </div>
                    </div>
                    <div className="relative w-[calc(100%-32px)] p-5 rounded-lg bg-blue-50 border border-blue-200/50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="min-w-full h-5 flex gap-5 items-center justify-center">
                          <div className="w-max flex items-center justify-center">
                            {Number(item.pricing.salePrice) ? (
                              <div className="flex items-center gap-[6px]">
                                <div className="flex items-baseline text-[rgb(168,100,0)]">
                                  <span className="text-[0.813rem] leading-3 font-semibold">$</span>
                                  <span className="text-lg font-bold">
                                    {Math.floor(Number(item.pricing.salePrice))}
                                  </span>
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
                      </div>
                      <div className="space-y-3">
                        {item.products.map((product) => (
                          <div
                            key={product.id}
                            className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-3 border border-blue-200/50 shadow-sm transition-all duration-200 hover:shadow-md hover:bg-opacity-100"
                          >
                            <div className="flex flex-col gap-4">
                              <div className="aspect-square h-[160px] min-[580px]:h-[128px]">
                                <div className="min-[580px]:hidden flex items-center justify-center h-full w-max mx-auto overflow-hidden rounded-lg">
                                  <Image src={product.mainImage} alt={product.name} width={160} height={160} priority />
                                </div>
                                <div className="hidden min-[580px]:flex items-center justify-center min-[580px]:min-w-[128px] min-[580px]:max-w-[128px] min-[580px]:min-h-[128px] min-[580px]:max-h-[128px] overflow-hidden rounded-lg">
                                  <Image src={product.mainImage} alt={product.name} width={128} height={128} priority />
                                </div>
                              </div>
                              <div className="space-y-3">
                                <Link
                                  href={`${product.slug}-${product.id}`}
                                  target="_blank"
                                  className="text-xs line-clamp-1 hover:underline"
                                >
                                  {product.name}
                                </Link>
                                {formatOptions(product.selectedOptions, "upsell")}
                              </div>
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

      <OrderSummary
        selectedItems={selectedItems}
        getSelectedCartItems={getSelectedCartItems}
        calculateTotal={calculateTotal}
        toggleAll={toggleAll}
        cartItems={cartItems}
      />
      <MobileOrderSummary
        selectedItems={selectedItems}
        getSelectedCartItems={getSelectedCartItems}
        calculateTotal={calculateTotal}
        toggleAll={toggleAll}
        cartItems={cartItems}
      />
    </div>
  );
}

function OrderSummary({
  selectedItems,
  getSelectedCartItems,
  calculateTotal,
  toggleAll,
  cartItems,
}: OrderSummaryProps) {
  const totalPrice = calculateTotal();

  return (
    <div className="hidden md:flex flex-col gap-3 h-max min-w-[276px] max-w-[276px] lg:min-w-[344px] lg:max-w-[344px] sticky top-16 select-none bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
      <div className="text-lg font-semibold mb-2">Order Summary</div>

      {selectedItems.size > 0 ? (
        <>
          <div className="space-y-1">
            <div className="text-sm text-gray-600">
              You're getting ({selectedItems.size} {selectedItems.size === 1 ? "item" : "items"})
            </div>
            <div className="text-sm font-medium text-green">FREE shipping</div>
          </div>

          <div className="py-3 border-b border-gray-200">
            <div className="flex justify-between items-center font-semibold">
              <span>Total</span>
              <div className="flex items-baseline">
                <span className="text-sm">$</span>
                <span className="text-xl">{Math.floor(totalPrice)}</span>
                <span className="text-sm">{(totalPrice % 1).toFixed(2).substring(1)}</span>
              </div>
            </div>
          </div>

          <div className="py-4 space-y-4">
            <div className="grid grid-cols-5 gap-1 items-center">
              <Image
                src="/images/payment-methods/visa.svg"
                alt="Visa"
                width={34}
                height={20}
                className="object-contain"
              />
              <Image
                src="/images/payment-methods/mastercard.svg"
                alt="Mastercard"
                width={34}
                height={20}
                className="object-contain"
              />
              <Image
                src="/images/payment-methods/american-express.png"
                alt="American Express"
                width={34}
                height={20}
                className="object-contain"
              />
              <Image
                src="/images/payment-methods/discover.svg"
                alt="Discover"
                width={34}
                height={20}
                className="object-contain"
              />
              <Image
                src="/images/payment-methods/diners-club-international.svg"
                alt="Diners Club"
                width={34}
                height={20}
                className="object-contain"
              />
            </div>
            <div className="h-[45px]">
              <PayPalButton showLabel={true} cart={getSelectedCartItems()} />
            </div>
          </div>

          <div className="pt-2 space-y-2 text-xs">
            <div className="flex gap-2 items-center text-gray-600">
              <TbLock size={16} className="text-green" />
              <span>Secure checkout with SSL encryption</span>
            </div>
            <div className="flex gap-2 items-center text-gray-600">
              <PiShieldCheckBold size={14} className="text-green" />
              <span>Safe and trusted payment methods</span>
            </div>
            <div className="flex gap-2 items-center text-gray-600">
              <TbTruck size={16} className="text-green" />
              <span>Free shipping on all orders</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center py-6 space-y-4">
          <div className="bg-gray-100 p-3 rounded-full">
            <Gift size={24} className="text-gray" />
          </div>
          <div className="text-center">
            <h3 className="font-medium">Your cart is waiting</h3>
            <p className="text-sm text-gray mt-1">Select items to complete your purchase</p>
          </div>
          <button
            onClick={toggleAll}
            className="w-full py-2.5 rounded-full text-blue cursor-pointer flex items-center justify-center border border-[#d9d8d6] shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear-gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.1)]"
          >
            Select all items
          </button>
        </div>
      )}
    </div>
  );
}

function MobileOrderSummary({
  selectedItems,
  getSelectedCartItems,
  calculateTotal,
  toggleAll,
  cartItems,
}: MobileOrderSummaryProps) {
  const totalPrice = calculateTotal();
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md z-50">
      <div className="max-w-[499px] mx-auto px-4 pt-3 pb-8 space-y-2">
        {selectedItems.size > 0 ? (
          <>
            <div className="w-[calc(100%-40px)] mx-auto flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Order Summary</span>
                <span className="text-gray">
                  ({selectedItems.size} {selectedItems.size === 1 ? "item" : "items"})
                </span>
              </div>
              <div className="flex items-baseline font-semibold">
                <span className="text-sm">$</span>
                <span className="text-lg">{Math.floor(totalPrice)}</span>
                <span className="text-sm">{(totalPrice % 1).toFixed(2).substring(1)}</span>
              </div>
            </div>
            <div className="h-[45px] max-w-[499px]">
              <PayPalButton showLabel={true} cart={getSelectedCartItems()} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-gray-100 p-3 rounded-full">
              <Gift size={24} className="text-gray-500" />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-sm">Your cart is waiting</h3>
              <p className="text-xs text-gray-600 mt-1">Select items to complete your purchase</p>
            </div>
            <button
              onClick={toggleAll}
              className="w-full py-2 rounded-full text-blue-600 cursor-pointer flex items-center justify-center border border-[#d9d8d6] shadow-[inset_0px_1px_0px_0px_#ffffff] bg-gradient-to-b from-[#faf9f8] to-[#eae8e6] hover:from-[#eae8e6] hover:to-[#faf9f8] active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.1)] text-sm"
            >
              Select all items
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
