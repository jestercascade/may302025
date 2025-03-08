"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";
import { Spinner } from "@/ui/Spinners/Default";
import clsx from "clsx";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, KeyboardEvent, ChangeEvent, useRef } from "react";

export function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigatingDirection, setNavigatingDirection] = useState<
    "prev" | "next" | "input" | "last" | null
  >(null);
  const [inputValue, setInputValue] = useState(currentPage.toString());
  const [inputError, setInputError] = useState(false);
  const lastPageRequested = useRef<number | null>(null);

  // Reset navigation state when the component mounts (after page transition)
  useEffect(() => {
    // Check if we've arrived at the requested page
    if (
      lastPageRequested.current === currentPage ||
      lastPageRequested.current === null
    ) {
      setIsNavigating(false);
      setNavigatingDirection(null);
    }

    setInputValue(currentPage.toString());
    setInputError(false);
    lastPageRequested.current = null;
  }, [currentPage]);

  const handleNavigation = (
    direction: "prev" | "next" | "input" | "last",
    page?: number
  ) => {
    let targetPage: number;

    if (direction === "prev") {
      targetPage = currentPage - 1;
    } else if (direction === "next") {
      targetPage = currentPage + 1;
    } else if (direction === "last") {
      targetPage = totalPages;
    } else {
      // Input navigation
      targetPage = page || parseInt(inputValue);

      // Validate page number
      if (isNaN(targetPage) || targetPage < 1 || targetPage > totalPages) {
        setInputError(true);
        return;
      }
    }

    // Store the requested page to compare after navigation
    lastPageRequested.current = targetPage;

    // Don't navigate if already on the target page
    if (targetPage === currentPage) {
      return;
    }

    setIsNavigating(true);
    setNavigatingDirection(direction);

    const params = new URLSearchParams(searchParams);
    params.set("page", targetPage.toString());
    router.push(`${pathname}?${params.toString()}`);

    // Safety timeout to reset spinner if navigation takes too long
    setTimeout(() => {
      setIsNavigating(false);
      setNavigatingDirection(null);
    }, 5000);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setInputError(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const page = parseInt(inputValue);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        handleNavigation("input", page);
      } else {
        setInputError(true);
      }
    }
  };

  return (
    <>
      {totalPages > 1 && (
        <div className="mt-8 mb-12">
          <div className="w-max mx-auto flex gap-1 h-9">
            <button
              onClick={() => handleNavigation("prev")}
              disabled={currentPage === 1 || isNavigating}
              className={clsx(
                "w-9 h-9 flex items-center justify-center rounded-full ease-in-out duration-300 transition",
                {
                  "pointer-events-none":
                    currentPage === 1 || isNavigating,
                  "active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed":
                    currentPage !== 1 && !isNavigating,
                }
              )}
            >
              {isNavigating && navigatingDirection === "prev" ? (
                <Spinner />
              ) : (
                <ChevronLeftIcon className="-ml-[2px]" size={24} />
              )}
            </button>

            <div
              className={clsx(
                "min-w-[36px] max-w-[36px] h-9 flex items-center justify-center rounded-full overflow-hidden",
                inputError ? "border border-red" : "border bg-white"
              )}
            >
              {isNavigating && navigatingDirection === "input" ? (
                <Spinner />
              ) : (
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onBlur={() => setInputError(false)}
                  className="w-full h-full text-center bg-transparent focus:outline-none"
                  disabled={isNavigating}
                  aria-label="Go to page"
                />
              )}
            </div>

            <div className="flex items-center justify-center px-1">of</div>

            <button
              onClick={() => handleNavigation("last")}
              disabled={currentPage === totalPages || isNavigating}
              className={clsx(
                "min-w-[36px] max-w-[36px] h-9 px-1 flex items-center justify-center border rounded-full bg-white",
                {
                  "cursor-context-menu": currentPage === totalPages || isNavigating,
                  "hover:bg-lightgray cursor-pointer":
                    currentPage !== totalPages && !isNavigating,
                }
              )}
            >
              {isNavigating && navigatingDirection === "last" ? (
                <Spinner />
              ) : (
                totalPages
              )}
            </button>

            <button
              onClick={() => handleNavigation("next")}
              disabled={currentPage === totalPages || isNavigating}
              className={clsx(
                "w-9 h-9 flex items-center justify-center rounded-full ease-in-out duration-300 transition",
                {
                  "pointer-events-none opacity-50":
                    currentPage === totalPages || isNavigating,
                  "active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed":
                    currentPage !== totalPages && !isNavigating,
                }
              )}
            >
              {isNavigating && navigatingDirection === "next" ? (
                <Spinner />
              ) : (
                <ChevronRightIcon className="-mr-[2px]" size={24} />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
