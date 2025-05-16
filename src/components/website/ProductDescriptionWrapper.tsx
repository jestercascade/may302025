"use client";

import React, { useEffect, useRef } from "react";
import { useScrollStore } from "@/zustand/website/scrollStore";

export default function ProductDescriptionWrapper({ children }: { readonly children: React.ReactNode }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const scrollPosition = useScrollStore((state) => state.scrollPosition);
  const setShouldShowStickyBar = useScrollStore((state) => state.setShouldShowStickyBar);

  useEffect(() => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setShouldShowStickyBar(rect.top <= 0);
    }
  }, [scrollPosition, setShouldShowStickyBar]);

  return (
    <div className="w-full pr-[70px] mx-auto" ref={elementRef}>
      {children}
    </div>
  );
}
