"use client";

import Image from "next/image";
import { useEffect, useState, useRef, useCallback } from "react";
import { MobileNavbarButton } from "./MobileNavbarOverlay";
import { ShoppingCart, ChevronDown } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { useQuickviewStore } from "@/zustand/website/quickviewStore";
import { useNavigation } from "@/components/shared/NavigationLoadingIndicator";

export default function Navbar({
  itemsInCart,
  categories,
}: {
  itemsInCart: number;
  categories: CategoryType[] | undefined;
}) {
  // State for navbar visibility and dropdown
  const [shouldHideNavbar, setShouldHideNavbar] = useState(false);
  const [isCategoriesDropdownVisible, setCategoriesDropdownVisible] =
    useState(false);

  // Refs for scroll position and categories dropdown
  const prevScrollRef = useRef(0);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Router and store hooks
  const { push } = useNavigation();
  const isQuickviewOverlayVisible = useQuickviewStore(
    (state) => state.isVisible
  );

  // Memoized event handler functions
  const toggleCategoriesDropdown = useCallback(() => {
    setCategoriesDropdownVisible((prev) => !prev);
  }, []);

  const handleCategoryClick = useCallback(
    (categoryName: string) => {
      push(`/category/${categoryName.toLowerCase()}`);
      setCategoriesDropdownVisible(false);
    },
    [push]
  );

  // Scroll and click-outside handler
  useEffect(() => {
    const handleScroll = () => {
      if (isQuickviewOverlayVisible) return;

      const currentScrollPosition = window.scrollY;
      const scrollDifference = currentScrollPosition - prevScrollRef.current;

      // Update navbar visibility only when conditions change
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
      setCategoriesDropdownVisible(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(event.target as Node)
      ) {
        setCategoriesDropdownVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [shouldHideNavbar, isQuickviewOverlayVisible]);

  return (
    <nav
      className={clsx(
        "w-full z-20 fixed top-0 border-b transition duration-100 bg-white",
        shouldHideNavbar && "-translate-y-full"
      )}
    >
      <MobileNavbar itemsInCart={itemsInCart} />
      <DesktopNavbar
        itemsInCart={itemsInCart}
        categories={categories}
        toggleCategoriesDropdown={toggleCategoriesDropdown}
        isCategoriesDropdownVisible={isCategoriesDropdownVisible}
        categoriesRef={categoriesRef}
        handleCategoryClick={handleCategoryClick}
      />
    </nav>
  );
}

// MobileNavbar component (unchanged)
function MobileNavbar({ itemsInCart }: { itemsInCart: number }) {
  return (
    <div className="md:hidden flex items-center justify-between w-full max-w-[1080px] mx-auto pl-4 pr-[10px] py-2">
      <Link
        href="/"
        className="h-12 min-w-[168px] w-[168px] flex items-center justify-center"
      >
        <Image
          src="/images/logos/cherlygood-wordmark.svg"
          alt="Cherly Good"
          width={160}
          height={40}
          priority
        />
      </Link>
      <div className="flex items-center gap-2">
        <Link
          href="/cart"
          className="relative h-12 w-12 rounded-full flex items-center justify-center ease-in-out transition duration-300 active:bg-lightgray lg:hover:bg-lightgray"
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
  );
}

// DesktopNavbar component (unchanged)
function DesktopNavbar({
  itemsInCart,
  categories,
  toggleCategoriesDropdown,
  isCategoriesDropdownVisible,
  categoriesRef,
  handleCategoryClick,
}: {
  itemsInCart: number;
  categories: CategoryType[] | undefined;
  toggleCategoriesDropdown: () => void;
  isCategoriesDropdownVisible: boolean;
  categoriesRef: React.RefObject<HTMLDivElement | null>;
  handleCategoryClick: (categoryName: string) => void;
}) {
  return (
    <div className="hidden md:flex w-full max-w-[1080px] mx-auto px-6 py-2 flex-col md:flex-row justify-between gap-1 relative">
      <div className="flex items-center gap-5">
        <Link
          href="/"
          className="h-10 min-w-[168px] w-[168px] pl-2 flex items-center"
        >
          <Image
            src="/images/logos/cherlygood-wordmark.svg"
            alt="Cherly Good"
            width={160}
            height={40}
            priority
          />
        </Link>
        <div className="flex gap-3 h-10">
          <Link
            href="/new-arrivals"
            className="hover:bg-lightgray h-10 text-sm font-semibold px-2 rounded-full flex items-center transition duration-300 ease-in-out"
          >
            New Arrivals
          </Link>
          {categories && categories.length > 0 && (
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={toggleCategoriesDropdown}
                className={clsx(
                  "hover:bg-lightgray h-10 text-sm font-semibold px-2 rounded-full flex items-center transition duration-300 ease-in-out",
                  isCategoriesDropdownVisible && "bg-lightgray"
                )}
              >
                <span>Categories</span>
                <ChevronDown
                  size={18}
                  strokeWidth={2}
                  className={`-mr-1 transition-transform duration-300 ${
                    isCategoriesDropdownVisible ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isCategoriesDropdownVisible && (
                <div className="w-36 absolute top-[48px] left-0 z-20 py-2 rounded-md shadow-dropdown bg-white before:content-[''] before:w-[10px] before:h-[10px] before:bg-white before:rounded-tl-[2px] before:rotate-45 before:origin-top-left before:absolute before:-top-2 before:border-l before:border-t before:border-[#d9d9d9] before:left-10 min-[840px]:before:right-24">
                  {categories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => handleCategoryClick(category.name)}
                      className="block w-full text-left px-5 py-2 text-sm font-semibold transition duration-300 ease-in-out hover:bg-lightgray"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <Link
            href="#"
            className="hover:bg-lightgray h-10 text-sm font-semibold px-2 rounded-full flex items-center transition duration-300 ease-in-out"
          >
            Track Order
          </Link>
        </div>
      </div>
      <div className="absolute right-4 top-2 md:relative md:right-auto md:top-auto min-w-[160px] w-max h-10 flex items-center justify-end">
        <Link
          href="/cart"
          className="relative h-11 w-11 rounded-full flex items-center justify-center ease-in-out transition duration-300 active:bg-lightgray lg:hover:bg-lightgray"
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
  );
}

// Type Definitions (unchanged)
type CategoryType = {
  index: number;
  name: string;
  image: string;
  visibility: "VISIBLE" | "HIDDEN";
};
