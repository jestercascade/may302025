"use client";

import { useAlertStore } from "@/zustand/shared/alertStore";
import { useOptionsStore } from "@/zustand/website/optionsStore";
import { useTransition, useState, useEffect } from "react";
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

export function CartAndUpgradeButtons({ product, cart }: { product: ProductWithUpsellType; cart: CartType | null }) {
  const [isPending, startTransition] = useTransition();
  const [localIsInCart, setLocalIsInCart] = useState(false);
  const { showAlert } = useAlertStore();
  const { selectedOptions } = useOptionsStore();
  const pathname = usePathname();
  const { push } = useRouter();
  const hideQuickviewOverlay = useQuickviewStore((state) => state.hideOverlay);
  const hideUpsellReviewOverlay = useUpsellReviewStore((state) => state.hideOverlay);

  // Check if product is in cart on initial render and when cart changes
  useEffect(() => {
    setLocalIsInCart(checkIsProductInCart());
  }, [cart, selectedOptions]);

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

  const checkIsProductInCart = (): boolean => {
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
            }
          }
        }

        const result = await AddToCartAction({
          type: "product",
          baseProductId: product.id,
          selectedOptions: readableSelectedOptions,
        });

        console.log("Successful");

        // If the add to cart was successful, update our local in-cart state
        if (result.type !== ShowAlertType.ERROR) {
          setLocalIsInCart(true);
        }

        showAlert({
          message: result.message,
          type: result.type === ShowAlertType.ERROR ? ShowAlertType.ERROR : ShowAlertType.SUCCESS,
        });
      } catch (error) {
        console.error("Add to cart error:", error);
        showAlert({
          message: "An error occurred while adding to cart",
          type: ShowAlertType.ERROR,
        });
      }
    });
  };

  // Use both our local state and the cart check to determine if product is in cart
  const productAlreadyInCart = localIsInCart || checkIsProductInCart();

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
