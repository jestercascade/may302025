"use client";

import { useNavigationLoadingIndicatorStore } from "@/zustand/shared/navigationLoadingIndicatorStore";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useRef,
} from "react";

const NavigationContext = createContext<{
  triggerLoading: () => void;
  showOverlay: boolean;
}>({
  triggerLoading: () => {},
  showOverlay: false,
});

function LoadingOverlay({ showOverlay }: { showOverlay: boolean }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showOverlay) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      // Delay hiding the overlay to allow for fade-out animation
      const timer = setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = "";
      }, 200); // Match this with CSS transition duration
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showOverlay]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-200 ease-in-out ${
        showOverlay ? "opacity-100" : "opacity-0"
      }`}
      style={{
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
        backgroundColor: "rgba(244, 244, 244, 0.45)",
      }}
    >
      <div className="w-full h-1 absolute top-0 left-0 overflow-hidden">
        <div
          className="h-full w-full bg-amber absolute animate-navigationLoadingIndicatorAnimation"
          style={{
            maskImage:
              "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 2%, rgba(0,0,0,1) 98%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 2%, rgba(0,0,0,1) 98%, rgba(0,0,0,0) 100%)",
          }}
        ></div>
      </div>
    </div>
  );
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const showOverlay = useNavigationLoadingIndicatorStore(
    (state) => state.showOverlay
  );
  const hideOverlay = useNavigationLoadingIndicatorStore(
    (state) => state.hideOverlay
  );
  const isOverlayVisible = useNavigationLoadingIndicatorStore(
    (state) => state.isVisible
  );

  const pathname = usePathname();
  const navigationStartTime = useRef<number | null>(null);
  const DELAY_MS = 300;
  const MIN_LOADING_TIME = 800;
  const FADE_DURATION = 200;

  const handleNavigation = useCallback(() => {
    if (!navigationStartTime.current) {
      navigationStartTime.current = Date.now();
      const timer = setTimeout(() => {
        showOverlay();
      }, DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [DELAY_MS, showOverlay]);

  useEffect(() => {
    // Reset state when navigation completes
    if (navigationStartTime.current) {
      const navigationTime = Date.now() - navigationStartTime.current;
      const remainingTime = Math.max(
        MIN_LOADING_TIME - navigationTime, // Ensure minimum display time
        FADE_DURATION // Always allow time for fade-out animation
      );

      setTimeout(() => {
        hideOverlay();
        navigationStartTime.current = null;
      }, remainingTime);
    }
  }, [pathname, hideOverlay]);

  const handleLinkClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const closestLink = target.closest("a");
      if (closestLink) {
        const href = closestLink.getAttribute("href");
        const linkTarget = closestLink.getAttribute("target");

        // Skip if the link opens in a new tab
        if (linkTarget === "_blank") {
          return;
        }

        if (href?.startsWith("/") && href !== pathname) {
          handleNavigation();
        }
      }
    },
    [pathname, handleNavigation]
  );

  useEffect(() => {
    document.addEventListener("click", handleLinkClick);
    return () => {
      document.removeEventListener("click", handleLinkClick);
    };
  }, [handleLinkClick]);

  const triggerLoading = useCallback(() => {
    return handleNavigation();
  }, [handleNavigation]);

  return (
    <NavigationContext.Provider
      value={{ triggerLoading, showOverlay: isOverlayVisible }}
    >
      <LoadingOverlay showOverlay={isOverlayVisible} />
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const router = useRouter();
  const context = useContext(NavigationContext);
  const pathname = usePathname();

  return {
    push: useCallback(
      (url: string) => {
        if (url !== pathname) {
          const cleanup = context.triggerLoading();
          router.push(url);
          return cleanup;
        }
        router.push(url);
      },
      [context, router, pathname]
    ),
  };
}
