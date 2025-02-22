"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { useScrollStore } from "@/zustand/website/scrollStore";

export function ProductInfoWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const setProductInfoWrapperHeight = useScrollStore(
    (state) => state.setProductInfoWrapperHeight
  );

  const updateHeight = useCallback(() => {
    if (wrapperRef.current) {
      const height = wrapperRef.current.offsetHeight;
      setProductInfoWrapperHeight(height);
    }
  }, [setProductInfoWrapperHeight]);

  useEffect(() => {
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
  }, [updateHeight]);

  return (
    <div
      ref={wrapperRef}
      className="sticky top-5 pt-5 w-[328px] min-w-[328px] min-[896px]:w-[420px]"
    >
      {children}
    </div>
  );
}
