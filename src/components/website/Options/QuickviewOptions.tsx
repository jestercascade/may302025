"use client";

import { useOptionsStore } from "@/zustand/website/optionsStore";
import { ProductDetailsOptions } from "@/components/website/Options/ProductDetailsOptions";
import { memo, useEffect } from "react";

export const QuickviewOptions = memo(function QuickviewOptions({
  productId,
  options,
  isStickyBarInCartIndicator = false,
}: {
  productId: string;
  options: ProductOptionsType;
  isStickyBarInCartIndicator?: boolean;
}) {
  const resetOptions = useOptionsStore((state) => state.resetOptions);

  useEffect(() => {
    resetOptions();
    return () => {
      resetOptions();
    };
  }, [productId, resetOptions]);

  return <ProductDetailsOptions options={options} isStickyBarInCartIndicator={isStickyBarInCartIndicator} />;
});
