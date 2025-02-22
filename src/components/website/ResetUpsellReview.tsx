"use client";

import { useUpsellReviewStore } from "@/zustand/website/upsellReviewStore";
import { useEffect } from "react";

export function ResetUpsellReview() {
  const isVisible = useUpsellReviewStore((state) => state.isVisible);
  const hideOverlay = useUpsellReviewStore((state) => state.hideOverlay);

  useEffect(() => {
    if (isVisible) {
      hideOverlay();
    }
  }, [isVisible, hideOverlay]);

  return null;
}