"use client";

import { useAlertStore } from "@/zustand/shared/alertStore";
import { useOptionsStore } from "@/zustand/website/optionsStore";
import { useTransition, useEffect, useState, useRef } from "react";
import { ShowAlertType } from "@/lib/sharedTypes";
import { AddToCartAction } from "@/actions/cart";
import { UpsellReviewButton } from "../UpsellReviewOverlay";
import { useUpsellReviewStore } from "@/zustand/website/upsellReviewStore";
import { useQuickviewStore } from "@/zustand/website/quickviewStore";
import { capitalizeFirstLetter } from "@/lib/utils/common";
import { usePathname, useRouter } from "next/navigation";
import { Spinner } from "@/ui/Spinners/Default";
import styles from "./styles.module.css";
import clsx from "clsx";

type SelectedOptionType = {
  value: string;
  optionDisplayOrder: number;
  groupDisplayOrder: number;
};

type CartProductItemType = {
  type: "product";
  baseProductId: string;
  selectedOptions: Record<string, SelectedOptionType>;
  variantId: string;
  index: number;
};

type CartType = {
  id: string;
  device_identifier: string;
  items: CartProductItemType[];
  createdAt: string;
  updatedAt: string;
};

// This interface tracks what configurations have been added to the cart
interface CartTrackingItem {
  productId: string;
  options: Record<string, string>;
}

export function CartAndUpgradeButtons({ product, cart }: { product: ProductWithUpsellType; cart: CartType | null }) {
  const [isPending, startTransition] = useTransition();
  const { showAlert } = useAlertStore();
  const { selectedOptions, isInCart, setIsInCart } = useOptionsStore();
  // Track cart items locally for overlay state management
  const [cartTracking, setCartTracking] = useState<CartTrackingItem[]>([]);
  const pathname = usePathname();
  const { push } = useRouter();
  const hideQuickviewOverlay = useQuickviewStore((state) => state.hideOverlay);
  const hideUpsellReviewOverlay = useUpsellReviewStore((state) => state.hideOverlay);
  const productIdRef = useRef(product.id);

  // When the component mounts or when the cart updates, initialize our local cart tracking
  useEffect(() => {
    if (cart?.items && product.options?.groups) {
      const initialTracking: CartTrackingItem[] = [];

      cart.items.forEach((item) => {
        if (item.type === "product") {
          const options: Record<string, string> = {};

          // Convert the cart item options to our simplified format
          for (const [key, opt] of Object.entries(item.selectedOptions)) {
            options[key] = opt.value;
          }

          initialTracking.push({
            productId: item.baseProductId,
            options,
          });
        }
      });

      setCartTracking(initialTracking);
    }
  }, [cart, product.id]);

  // Reset in-cart state when product changes
  useEffect(() => {
    if (productIdRef.current !== product.id) {
      setIsInCart(false);
      productIdRef.current = product.id;
    }
  }, [product.id, setIsInCart]);

  // When selected options change, check if current configuration is in cart
  useEffect(() => {
    if (product.options?.groups) {
      const currentInCart = isCurrentSelectionInCart();
      setIsInCart(currentInCart);
    }
  }, [selectedOptions, cartTracking]);

  // Determine if the current selection is already in the cart
  const isCurrentSelectionInCart = (): boolean => {
    if (!product.options?.groups) return false;

    // Build current selection options
    const currentSelectedValues: Record<string, string> = {};
    for (const [groupIdStr, optionId] of Object.entries(selectedOptions)) {
      if (optionId === null || optionId === undefined) continue;

      const groupId = Number(groupIdStr);
      const group = product.options.groups.find((g) => g.id === groupId);

      if (group) {
        const option = group.values.find((v) => v.id === optionId);
        if (option) {
          currentSelectedValues[group.name.toLowerCase()] = option.value;
        }
      }
    }

    // Check if this configuration exists in our tracked cart
    return cartTracking.some((item) => {
      if (item.productId !== product.id) return false;

      const itemKeys = Object.keys(item.options);
      const currentKeys = Object.keys(currentSelectedValues);

      if (itemKeys.length !== currentKeys.length) return false;

      return currentKeys.every((key) => item.options[key] === currentSelectedValues[key]);
    });
  };

  // Check if the product is in the server cart
  const isProductInCart = (): boolean => {
    if (!cart?.items || !product.options?.groups) return false;

    const currentSelectedValues: Record<string, string> = {};

    for (const [groupIdStr, optionId] of Object.entries(selectedOptions)) {
      if (optionId === null || optionId === undefined) continue;

      const groupId = Number(groupIdStr);
      const group = product.options.groups.find((g) => g.id === groupId);

      if (group) {
        const option = group.values.find((v) => v.id === optionId);
        if (option) {
          currentSelectedValues[group.name.toLowerCase()] = option.value;
        }
      }
    }

    return cart.items.some((item) => {
      if (item.type !== "product" || item.baseProductId !== product.id) {
        return false;
      }

      const itemOptionsValues: Record<string, string> = {};
      for (const [key, opt] of Object.entries(item.selectedOptions)) {
        itemOptionsValues[key] = opt.value;
      }

      const currentKeys = Object.keys(currentSelectedValues);
      const itemKeys = Object.keys(itemOptionsValues);
      if (currentKeys.length !== itemKeys.length) return false;

      return currentKeys.every((key) => currentSelectedValues[key] === itemOptionsValues[key]);
    });
  };

  const handleInCartButtonClick = () => {
    if (pathname === "/cart") {
      hideUpsellReviewOverlay();
      hideQuickviewOverlay();

      const scrollableParent = document.getElementById("scrollable-parent");
      if (scrollableParent) {
        scrollableParent.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    } else {
      push("/cart");
    }
  };

  const handleAddToCart = async () => {
    if (!product.options?.groups) {
      return showAlert({
        message: "Product configuration is incomplete",
        type: ShowAlertType.ERROR,
      });
    }

    const activeOptionGroups = product.options.groups.filter((group) => group.values.some((opt) => opt.isActive));
    const unselectedOptions = activeOptionGroups.filter(
      (group) => selectedOptions[group.id] === undefined || selectedOptions[group.id] === null
    );

    if (unselectedOptions.length > 0) {
      const firstMissingOption = unselectedOptions[0].name;
      let message = `${capitalizeFirstLetter(firstMissingOption)} not selected.`;
      if (unselectedOptions.length > 1) {
        message += " Select all options to continue.";
      } else {
        message += " Please select all options.";
      }
      return showAlert({
        message,
        type: ShowAlertType.NEUTRAL,
      });
    }

    startTransition(async () => {
      try {
        const readableSelectedOptions: Record<string, SelectedOptionType> = {};
        const simpleSelectedOptions: Record<string, string> = {};

        for (const [groupIdStr, optionId] of Object.entries(selectedOptions)) {
          if (optionId === null || optionId === undefined) continue;

          const groupId = Number(groupIdStr);
          const group = product.options.groups.find((g) => g.id === groupId);

          if (group) {
            const optionIndex = group.values.findIndex((v) => v.id === optionId);
            if (optionIndex !== -1) {
              const option = group.values[optionIndex];
              const groupNameLower = group.name.toLowerCase();
              readableSelectedOptions[groupNameLower] = {
                value: option.value,
                optionDisplayOrder: optionIndex,
                groupDisplayOrder: group.displayOrder,
              };

              // Also store a simplified version
              simpleSelectedOptions[groupNameLower] = option.value;
            }
          }
        }

        const result = await AddToCartAction({
          type: "product",
          baseProductId: product.id,
          selectedOptions: readableSelectedOptions,
        });

        showAlert({
          message: result.message,
          type: result.type === ShowAlertType.ERROR ? ShowAlertType.ERROR : ShowAlertType.SUCCESS,
        });

        // On success, update our cart tracking
        if (result.type === ShowAlertType.SUCCESS) {
          setCartTracking((prev) => [
            ...prev,
            {
              productId: product.id,
              options: simpleSelectedOptions,
            },
          ]);
          setIsInCart(true);
        }
      } catch (error) {
        console.error("Add to cart error:", error);
        showAlert({
          message: "An error occurred while adding to cart",
          type: ShowAlertType.ERROR,
        });
      }
    });
  };

  const productAlreadyInCart = isCurrentSelectionInCart();

  return (
    <>
      {!productAlreadyInCart && (
        <>
          {!product.upsell ? (
            <button
              onClick={handleAddToCart}
              disabled={isPending}
              className={clsx(
                `flex items-center justify-center w-full md:max-w-60 rounded-full cursor-pointer border border-[#b27100] text-white ${styles.button} font-semibold h-11 min-[896px]:h-12 shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000]`,
                !isPending &&
                  "hover:bg-[#cc8100] hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]",
                isPending && "!cursor-context-menu opacity-50"
              )}
            >
              {isPending ? <Spinner size={28} color="white" /> : "Add to Cart"}
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isPending}
              className={clsx(
                `flex items-center justify-center w-full max-w-60 rounded-full cursor-pointer border border-[#c5c3c0] ${styles.button} font-semibold h-11 min-[896px]:h-12 shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear-gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]`,
                isPending && "cursor-context-menu opacity-50"
              )}
            >
              {isPending ? <Spinner size={28} color="gray" /> : "Add to Cart"}
            </button>
          )}
        </>
      )}
      {productAlreadyInCart && (
        <button
          onClick={handleInCartButtonClick}
          className="flex items-center justify-center w-full md:max-w-60 rounded-full cursor-pointer border border-[#c5c3c0] text-blue font-semibold h-11 min-[896px]:h-12 shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear-gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]"
        >
          In Cart - See Now
        </button>
      )}
      {product.upsell && (
        <UpsellReviewButton
          product={{
            id: product.id,
            upsell: product.upsell,
          }}
        />
      )}
    </>
  );
}
