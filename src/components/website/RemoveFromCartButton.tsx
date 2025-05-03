"use client";

import { useTransition } from "react";
import { Trash, Trash2 } from "lucide-react";
// import { RemoveFromCartAction } from "@/actions/cart";
import { ShowAlertType } from "@/lib/sharedTypes";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { DashSpinner } from "@/ui/Spinners/DashSpinner";
import clsx from "clsx";

export function RemoveFromCartButton({ type, variantId }: { type: "product" | "upsell"; variantId: string }) {
  const [isPending, startTransition] = useTransition();

  const showAlert = useAlertStore((state) => state.showAlert);

  const handleRemove = () => {
    // startTransition(async () => {
    //   const result = await RemoveFromCartAction({ variantId });
    //   showAlert({
    //     message: result.message,
    //     type:
    //       result.type === ShowAlertType.ERROR
    //         ? ShowAlertType.ERROR
    //         : ShowAlertType.NEUTRAL,
    //   });
    // });
  };

  return (
    <button
      onClick={handleRemove}
      disabled={isPending}
      className={clsx(
        "min-w-8 max-w-8 min-h-8 max-h-8 rounded-full flex items-center justify-center ease-in-out duration-300 transition",
        type === "upsell" && "absolute right-3 top-3",
        type === "upsell" && !isPending && "hover:bg-[#e0edfe]",
        type === "product" && !isPending && "hover:bg-[#F7F7F7]",
        isPending ? "cursor-not-allowed" : "cursor-pointer"
      )}
    >
      {isPending ? <DashSpinner size={18} color="#6c6c6c" /> : <Trash2 color="#a3a3a3" size={18} strokeWidth={1.5} />}
    </button>
  );
}
