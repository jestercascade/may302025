"use client";

import React, { useRef, useEffect, useState } from "react";
import { useScrollStore } from "@/zustand/website/scrollStore";

export function ImageGalleryWrapper({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const setShouldShowStickyBar = useScrollStore((state) => state.setShouldShowStickyBar);
  const scrollPosition = useScrollStore((state) => state.scrollPosition);
  const productInfoWrapperHeight = useScrollStore((state) => state.productInfoWrapperHeight);
  const [wrapperHeight, setWrapperHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      if (wrapperRef.current) {
        setWrapperHeight(wrapperRef.current.offsetHeight);
      }
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const calculateThreshold = () => {
      const offset = 82;
      if (productInfoWrapperHeight > wrapperHeight) {
        return productInfoWrapperHeight + offset;
      }

      return wrapperHeight + offset;
    };

    const threshold = calculateThreshold();
    setShouldShowStickyBar(scrollPosition >= threshold);
  }, [scrollPosition, wrapperHeight, productInfoWrapperHeight, setShouldShowStickyBar]);

  return (
    <div ref={wrapperRef} className="w-full">
      {children}
    </div>
  );
}
