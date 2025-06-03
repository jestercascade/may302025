"use client";

import { CloseIconThin } from "@/icons";
import { useMobileNavbarStore } from "@/zustand/website/mobileNavbarStore";
import { HiMiniBars3 } from "react-icons/hi2";
import { useRef, useEffect } from "react";
import { useNavigation } from "@/components/shared/NavigationLoadingIndicator";
import clsx from "clsx";

export function MobileNavbarButton() {
  const showMobileNavbarOverlay = useMobileNavbarStore((state) => state.showMobileNavbarOverlay);

  return (
    <button
      onClick={showMobileNavbarOverlay}
      className="h-11 w-11 rounded-full flex items-center justify-center ease-in-out transition duration-300 active:bg-lightgray lg:hover:bg-lightgray"
      aria-label="Open menu"
      title="Open menu"
    >
      <HiMiniBars3 size={26} />
    </button>
  );
}

export function MobileNavbarOverlay() {
  const hideMobileNavbarOverlay = useMobileNavbarStore((state) => state.hideMobileNavbarOverlay);
  const isMobileNavbarOverlayVisible = useMobileNavbarStore((state) => state.isMobileNavbarOverlayVisible);
  const { push } = useNavigation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = isMobileNavbarOverlayVisible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileNavbarOverlayVisible]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleMediaQueryChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches && isMobileNavbarOverlayVisible) {
        hideMobileNavbarOverlay();
      }
    };

    handleMediaQueryChange(mediaQuery);
    mediaQuery.addEventListener("change", handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, [isMobileNavbarOverlayVisible, hideMobileNavbarOverlay]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        overlayRef.current &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        overlayRef.current.contains(event.target as Node)
      ) {
        hideMobileNavbarOverlay();
      }
    };

    if (isMobileNavbarOverlayVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isMobileNavbarOverlayVisible, hideMobileNavbarOverlay]);

  const handleNavigation = (path: string) => {
    push(path);
    hideMobileNavbarOverlay();
  };

  return (
    <>
      <div
        ref={overlayRef}
        className={clsx(
          isMobileNavbarOverlayVisible
            ? "md:hidden fixed w-full h-screen top-0 bottom-0 left-0 right-0 z-40 transition duration-300 ease-in-out bg-glass-black backdrop-blur-sm"
            : "hidden"
        )}
      >
        <div ref={menuRef} className="absolute right-0 bottom-0 top-0 h-full w-3/4 max-w-80 pl-8 pt-10 bg-white">
          <div className="flex flex-col gap-2.5 *:w-max *:text-lg *:font-medium">
            <button onClick={() => handleNavigation("/new-arrivals")}>New Arrivals</button>
            <button onClick={() => handleNavigation("/track")}>Track Order</button>
          </div>
          <button
            onClick={hideMobileNavbarOverlay}
            className="h-9 w-9 rounded-full absolute right-2 top-2 flex items-center justify-center transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
            type="button"
            aria-label="Close menu"
            title="Close menu"
          >
            <CloseIconThin size={24} className="stroke-gray" />
          </button>
        </div>
      </div>
    </>
  );
}
