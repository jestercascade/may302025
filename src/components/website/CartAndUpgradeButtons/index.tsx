"use client";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { useOptionsStore } from "@/zustand/website/optionsStore";
import { useTransition } from "react";
import { ShowAlertType } from "@/lib/sharedTypes";
import { AddToCartAction } from "@/actions/cart";
import { Spinner } from "@/ui/Spinners/Default";
import styles from "./styles.module.css";
import clsx from "clsx";
import { capitalizeFirstLetter } from "@/lib/utils/common";

export function CartAndUpgradeButtons({ product, cart }: { product: ProductWithUpsellType; cart: CartType | null }) {
  const [isPending, startTransition] = useTransition();
  const { showAlert } = useAlertStore();
  const { selectedOptions } = useOptionsStore();

  const handleAddToCart = async () => {
    // Safety check for product options
    if (!product.options?.groups) {
      return showAlert({
        message: "Product configuration is incomplete",
        type: ShowAlertType.ERROR,
      });
    }

    // Identify active option groups (those with at least one active option)
    const activeOptionGroups = product.options.groups.filter((group) => group.values.some((opt) => opt.isActive));

    // Find any unselected active option groups
    const unselectedOptions = activeOptionGroups.filter(
      (group) => selectedOptions[group.id] === undefined || selectedOptions[group.id] === null
    );

    // If there are unselected options, show a specific alert
    if (unselectedOptions.length > 0) {
      // Get the name of the first missing option
      const firstMissingOption = unselectedOptions[0].name;

      // Construct a clear, specific message
      let message = `${capitalizeFirstLetter(firstMissingOption)} not selected.`;

      // If there are multiple missing options, add additional context
      if (unselectedOptions.length > 1) {
        message += " Select all options to continue.";
      } else {
        // Add a message for the single missing option
        message += " Please select all options.";
      }

      return showAlert({
        message,
        type: ShowAlertType.NEUTRAL,
      });
    }

    // If all options are selected, proceed to add to cart
    startTransition(async () => {
      try {
        // Transform selectedOptions to human-readable format
        const readableSelectedOptions: Record<string, string> = {};

        for (const [groupIdStr, optionId] of Object.entries(selectedOptions)) {
          if (optionId === null || optionId === undefined) continue;

          const groupId = Number(groupIdStr);
          const group = product.options.groups.find((g) => g.id === groupId);

          if (group) {
            const option = group.values.find((v) => v.id === optionId);
            if (option) {
              // Use group name as key (lowercase for case-insensitive lookup later)
              readableSelectedOptions[group.name.toLowerCase()] = option.value;
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
          type: result.type === ShowAlertType.ERROR ? ShowAlertType.ERROR : ShowAlertType.NEUTRAL,
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
