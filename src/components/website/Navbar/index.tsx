"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { MobileNavbarButton } from "./MobileNavbarOverlay";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { useQuickviewStore } from "@/zustand/website/quickviewStore";
import { useMobileNavbarStore } from "@/zustand/website/mobileNavbarStore";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { useNavigationLoadingIndicatorStore } from "@/zustand/shared/navigationLoadingIndicatorStore";
import { usePathname } from "next/navigation";

export default function Navbar({ itemsInCart }: { itemsInCart: number }) {
  const [shouldHideNavbar, setShouldHideNavbar] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const prevScrollRef = useRef(0);
  const pathname = usePathname();
  const isQuickviewOverlayVisible = useQuickviewStore((state) => state.isVisible);
  const isMobileNavbarVisible = useMobileNavbarStore((state) => state.isMobileNavbarOverlayVisible);
  const isAlertOverlayVisible = useAlertStore((state) => state.isVisible);
  const isNavigationLoadingIndicatorVisible = useNavigationLoadingIndicatorStore((state) => state.isVisible);

  useEffect(() => {
    setIsNavigating(true);
    setShouldHideNavbar(false);
    prevScrollRef.current = window.scrollY;

    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      // Skip scroll handling during navigation
      if (isNavigating) return;

      if (
        isQuickviewOverlayVisible ||
        isMobileNavbarVisible ||
        isAlertOverlayVisible ||
        isNavigationLoadingIndicatorVisible
      ) {
        return;
      }

      const currentScrollPosition = window.scrollY;
      const scrollDifference = currentScrollPosition - prevScrollRef.current;

      if (scrollDifference > 0) {
        // Scrolling down
        if (currentScrollPosition >= 154 && !shouldHideNavbar) {
          setShouldHideNavbar(true);
        }
      } else if (scrollDifference < 0) {
        // Scrolling up
        if (shouldHideNavbar) {
          setShouldHideNavbar(false);
        }
      }

      prevScrollRef.current = currentScrollPosition;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [
    shouldHideNavbar,
    isQuickviewOverlayVisible,
    isMobileNavbarVisible,
    isAlertOverlayVisible,
    isNavigationLoadingIndicatorVisible,
    isNavigating,
  ]);

  return (
    <nav
      className={clsx(
        "w-full z-20 fixed top-0 border-b bg-white",
        // Apply transition only when not navigating
        !isNavigating && "transition duration-100",
        shouldHideNavbar && "-translate-y-full"
      )}
    >
      <div className="md:hidden flex items-center justify-between w-full max-w-[1080px] mx-auto pl-4 pr-[10px] py-2">
        <Link href="/" className="ml-1">
          <Image src="/cherlygood/logo.svg" alt="Cherlygood" width={220} height={27} priority className="mt-1" />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative h-11 w-11 rounded-full flex gap-1 items-center justify-center transition-colors active:bg-lightgray lg:hover:bg-lightgray"
            aria-label="View cart"
            title="View cart"
          >
            <ShoppingCart size={24} strokeWidth={2.5} />
            {itemsInCart > 0 && (
              <span className="absolute top-[4px] left-[30px] min-w-5 w-max h-5 px-1 rounded-full text-sm font-medium flex items-center justify-center text-white bg-red">
                {itemsInCart}
              </span>
            )}
          </Link>
          <MobileNavbarButton />
        </div>
      </div>
      <div className="hidden md:flex w-full max-w-[1080px] mx-auto px-6 py-2 flex-col md:flex-row justify-between gap-1 relative">
        <div className="flex items-center gap-7">
          <Link href="/">
            <Image src="/cherlygood/logo.svg" alt="Cherlygood" width={220} height={27} priority className="mt-1" />
          </Link>
          <div className="flex gap-3 h-10">
            <Link
              href="/new-arrivals"
              className="active:bg-lightgray lg:hover:bg-lightgray h-10 text-sm font-semibold px-2 rounded-full flex items-center transition duration-300 ease-in-out"
            >
              New Arrivals
            </Link>
            <Link
              href="/track"
              className="active:bg-lightgray lg:hover:bg-lightgray h-10 text-sm font-semibold px-2 rounded-full flex items-center transition duration-300 ease-in-out"
            >
              Track Order
            </Link>
          </div>
        </div>
        <div className="absolute right-4 top-2 md:relative md:right-auto md:top-auto w-max h-10 flex items-center justify-end">
          <Link
            href="/cart"
            className="relative h-11 w-11 rounded-full flex items-center justify-center ease-in-out transition duration-300 active:bg-lightgray lg:hover:bg-lightgray"
            aria-label="View cart"
            title="View cart"
          >
            <ShoppingCart strokeWidth={2.5} />
            {itemsInCart > 0 && (
              <span className="absolute top-[4px] left-[30px] min-w-5 w-max h-5 px-1 rounded-full text-sm font-medium flex items-center justify-center text-white bg-red">
                {itemsInCart}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
