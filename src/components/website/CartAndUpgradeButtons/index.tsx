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

export function CartAndUpgradeButtons({ product, cart }: CartAndUpgradeButtonsType) {
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async () => {
    // ...
  };

  return (
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
  );
}

// -- Type Definitions --

type CartAndUpgradeButtonsType = {
  product: ProductWithUpsellType;
  cart: CartType | null;
};
