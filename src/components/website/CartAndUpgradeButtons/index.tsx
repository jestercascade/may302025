"use client";

import { useAlertStore } from "@/zustand/shared/alertStore";
import { useOptionsStore } from "@/zustand/website/optionsStore";
import { useTransition, useEffect } from "react";
import { ShowAlertType } from "@/lib/sharedTypes";
import { AddToCartAction } from "@/actions/cart";
import { Spinner } from "@/ui/Spinners/Default";
import { useUpsellReviewStore } from "@/zustand/website/upsellReviewStore";
import { usePathname } from "next/navigation";
import { useQuickviewStore } from "@/zustand/website/quickviewStore";
import { UpsellReviewButton } from "../UpsellReviewOverlay";
import { useNavigation } from "@/components/shared/NavigationLoadingIndicator";
import styles from "./styles.module.css";
import clsx from "clsx";

export function CartAndUpgradeButtons({
  product,
  cart,
  hasColor,
  hasSize,
}: CartAndUpgradeButtonsType) {
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const { push } = useNavigation();
  const showAlert = useAlertStore((state) => state.showAlert);
  const selectedColor = useOptionsStore((state) => state.selectedColor);
  const selectedSize = useOptionsStore((state) => state.selectedSize);
  const isInCart = useOptionsStore((state) => state.isInCart);
  const setIsInCart = useOptionsStore((state) => state.setIsInCart);
  const hideOverlay = useUpsellReviewStore((state) => state.hideOverlay);
  const hideQuickviewOverlay = useQuickviewStore((state) => state.hideOverlay);

  const isSimpleProductInCart =
    !hasColor &&
    !hasSize &&
    cart?.items.some(
      (item) => item.type === "product" && item.baseProductId === product.id
    );

  useEffect(() => {
    setIsInCart(
      cart?.items.some((item) => {
        if (item.type === "product") {
          return (
            item.baseProductId === product.id &&
            item.color === selectedColor &&
            item.size === selectedSize
          );
        }
        return false;
      }) ?? false
    );
  }, [cart, product.id, selectedColor, selectedSize, setIsInCart]);

  const handleAddToCart = async () => {
    if (hasColor && !selectedColor) {
      return showAlert({
        message: "Select a color",
        type: ShowAlertType.NEUTRAL,
      });
    }
    if (hasSize && !selectedSize) {
      return showAlert({
        message: "Select a size",
        type: ShowAlertType.NEUTRAL,
      });
    }

    startTransition(async () => {
      const result = await AddToCartAction({
        type: "product",
        baseProductId: product.id,
        color: selectedColor,
        size: selectedSize,
      });

      showAlert({
        message: result.message,
        type:
          result.type === ShowAlertType.ERROR
            ? ShowAlertType.ERROR
            : ShowAlertType.NEUTRAL,
      });

      if (result.type === ShowAlertType.SUCCESS) {
        setIsInCart(true);
      }
    });
  };

  const handleInCartButtonClick = () => {
    if (pathname === "/cart") {
      hideOverlay();
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

  return (
    <>
      {!isInCart && !isSimpleProductInCart && (
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
      {(isInCart || isSimpleProductInCart) && !hasColor && !hasSize && (
        <button
          onClick={handleInCartButtonClick}
          className="flex items-center justify-center w-max px-9 rounded-full cursor-pointer border border-[#c5c3c0] text-blue font-semibold h-[44px] shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear-gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] min-[896px]:h-12"
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

// -- Type Definitions --

type CartAndUpgradeButtonsType = {
  product: ProductWithUpsellType;
  cart: CartType | null;
  hasColor: boolean;
  hasSize: boolean;
};
