"use client";

import { StickyBarInCartIndicator } from "../ProductDetails/StickyBarInCartIndicator";
import { InCartIndicator } from "../ProductDetails/InCartIndicator";
import { useOverlayStore } from "@/zustand/website/overlayStore";
import { useOptionsStore } from "@/zustand/website/optionsStore";
import { useScrollStore } from "@/zustand/website/scrollStore";
import { ProductColors, ProductSizes } from "./ProductOptions";
import { memo, useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";

export const ProductDetailsOptions = memo(function Options({
  productInfo,
  isStickyBarInCartIndicator,
}: {
  productInfo: {
    id: string;
    name: string;
    pricing: {
      basePrice: number;
      salePrice?: number;
      discountPercentage?: number;
    };
    images: {
      main: string;
      gallery: string[];
    };
    options: {
      colors: Array<{
        name: string;
        image: string;
      }>;
      sizes: {
        inches: {
          columns: Array<{ label: string; order: number }>;
          rows: Array<{ [key: string]: string }>;
        };
        centimeters: {
          columns: Array<{ label: string; order: number }>;
          rows: Array<{ [key: string]: string }>;
        };
      };
    };
  };
  isStickyBarInCartIndicator: boolean;
}) {
  // Calculate static values first
  const hasColor = productInfo.options.colors.length > 0;
  const hasSize = Object.keys(productInfo.options.sizes).length > 0;

  // Initialize all state hooks
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [localSelections, setLocalSelections] = useState<string[]>([]);
  const [currentSelectionKey, setCurrentSelectionKey] = useState<string | null>(
    null
  );

  // Initialize all store hooks
  const resetOptions = useOptionsStore((state) => state.resetOptions);
  const setProductId = useOptionsStore((state) => state.setProductId);
  const selectedColor = useOptionsStore((state) => state.selectedColor);
  const selectedSize = useOptionsStore((state) => state.selectedSize);
  const isInCart = useOptionsStore((state) => state.isInCart);
  const setIsInCart = useOptionsStore((state) => state.setIsInCart);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const productDetailsPage = useOverlayStore(
    (state) => state.pages.productDetails
  );
  const shouldShowStickyBar = useScrollStore(
    (state) => state.shouldShowStickyBar
  );

  useEffect(() => {
    setProductId(productInfo.id);
    return () => {
      resetOptions();
      setIsInCart(false);
      setLocalSelections([]);
      setDropdownVisible(false);
    };
  }, [productInfo.id, resetOptions, setIsInCart, setProductId]);

  // Handle sticky bar visibility
  useEffect(() => {
    if (!shouldShowStickyBar) {
      setDropdownVisible(false);
    }
  }, [shouldShowStickyBar]);

  // Handle selection key updates
  useEffect(() => {
    const selectionKeyParts = [
      productInfo.id.toLowerCase(),
      selectedColor?.toLowerCase(),
      selectedSize?.toLowerCase(),
    ];

    const selectionKey = selectionKeyParts.filter(Boolean).join("-");
    setCurrentSelectionKey(selectionKey);
  }, [selectedColor, selectedSize, productInfo.id]);

  // Handle cart status updates
  useEffect(() => {
    const isInLocalCart = currentSelectionKey
      ? localSelections.includes(currentSelectionKey)
      : false;
    setIsInCart(isInLocalCart);

    if (
      isInCart &&
      currentSelectionKey &&
      !localSelections.includes(currentSelectionKey)
    ) {
      setLocalSelections((prev) => [...prev, currentSelectionKey]);
    }
  }, [isInCart, currentSelectionKey, localSelections, productInfo.id, setIsInCart]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        isDropdownVisible &&
        !target.closest(".dropdown-container") &&
        !target.closest(".overlay")
      ) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownVisible]);

  // If no options are available, return null
  if (!hasColor && !hasSize) {
    return null;
  }

  const getButtonText = () => {
    if (hasColor && hasSize) {
      if (!selectedColor && !selectedSize) return "Select Color & Size";
      if (selectedColor && !selectedSize)
        return (
          <>
            <span className="text-gray">Color: </span>
            <span className="text-gray">{selectedColor} - </span>
            <span className="text-xs font-semibold">Select Size</span>
          </>
        );
      if (!selectedColor && selectedSize)
        return (
          <>
            <span className="text-gray">Size: </span>
            <span className="text-gray">{selectedSize} - </span>
            <span className="text-xs font-semibold">Select Color</span>
          </>
        );
      return (
        <>
          <span className="text-gray">Color: </span>
          <span>{selectedColor}</span>
          <span>, </span>
          <span className="text-gray">Size: </span>
          <span>{selectedSize}</span>
        </>
      );
    }
    if (hasColor) {
      return selectedColor ? (
        <>
          <span className="text-gray">Color: </span>
          <span>{selectedColor}</span>
        </>
      ) : (
        "Select Color"
      );
    }
    if (hasSize) {
      return selectedSize ? (
        <>
          <span className="text-gray">Size: </span>
          <span>{selectedSize}</span>
        </>
      ) : (
        "Select Size"
      );
    }
    return "";
  };

  const handleSizeChartClick = () => {
    showOverlay({
      pageName: productDetailsPage.name,
      overlayName: productDetailsPage.overlays.sizeChart.name,
    });
  };

  return (
    <div
      className={clsx(
        "dropdown-container w-max rounded-full relative",
        !isStickyBarInCartIndicator &&
          "h-max flex flex-col gap-3 items-start lg:h-8 lg:flex-row lg:items-center",
        isStickyBarInCartIndicator && "h-8 flex gap-3 items-center"
      )}
    >
      <div className="relative">
        <button
          onClick={() => setDropdownVisible((prev) => !prev)}
          className="h-8 w-max px-4 rounded-full flex items-center justify-center gap-[2px] ease-in-out duration-300 transition bg-lightgray active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed"
        >
          <div className="text-sm font-medium">{getButtonText()}</div>
          <ChevronRight
            color="#828282"
            size={18}
            strokeWidth={2}
            className="-mr-[8px]"
          />
        </button>
        {isDropdownVisible && (
          <div className="absolute top-[42px] left-0 z-20 pb-2">
            <div className="space-y-4 w-max min-w-[238px] max-w-[288px] p-5 rounded-xl shadow-dropdown bg-white before:content-[''] before:w-[14px] before:h-[14px] before:bg-white before:rounded-tl-[2px] before:rotate-45 before:origin-top-left before:absolute before:-top-[10px] before:border-l before:border-t before:border-[#d9d9d9] before:left-16 min-[840px]:before:right-24">
              {hasColor && hasSize && (
                <div className="flex flex-col gap-4 select-none">
                  <ProductColors colors={productInfo.options.colors} />
                  <ProductSizes
                    sizeChart={productInfo.options.sizes}
                    onSizeChartClick={handleSizeChartClick}
                  />
                </div>
              )}
              {hasColor && !hasSize && (
                <ProductColors colors={productInfo.options.colors} />
              )}
              {!hasColor && hasSize && (
                <ProductSizes
                  sizeChart={productInfo.options.sizes}
                  onSizeChartClick={handleSizeChartClick}
                />
              )}
            </div>
          </div>
        )}
      </div>
      {isInCart &&
        !isDropdownVisible &&
        (isStickyBarInCartIndicator ? (
          <StickyBarInCartIndicator />
        ) : (
          <InCartIndicator />
        ))}
    </div>
  );
});
