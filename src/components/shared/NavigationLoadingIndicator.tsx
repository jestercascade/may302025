"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

const NavigationContext = createContext<{
  triggerLoading: () => void;
  showOverlay: boolean;
}>({
  triggerLoading: () => {},
  showOverlay: false,
});

function LoadingOverlay({ showOverlay }: { showOverlay: boolean }) {
  useEffect(() => {
    if (showOverlay) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showOverlay]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-200 ease-in-out ${
        showOverlay ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
        backgroundColor: "rgba(244, 244, 244, 0.45)",
      }}
    >
      <div className="w-full h-[3px] absolute top-0 left-0 overflow-hidden">
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
  const [showOverlay, setShowOverlay] = useState(false);
  const pathname = usePathname();
  const DELAY_MS = 300; // Show overlay after 300ms delay

  const handleLinkClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const closestLink = target.closest("a");
      if (closestLink) {
        const href = closestLink.getAttribute("href");
        // Check if the href starts with "/" (internal link) and doesn’t match the current pathname
        if (href?.startsWith("/") && href !== pathname) {
          const timer = setTimeout(() => {
            setShowOverlay(true);
          }, DELAY_MS);
          return () => clearTimeout(timer);
        }
      }
    },
    [pathname, DELAY_MS]
  );

  const triggerLoading = useCallback(() => {
    const timer = setTimeout(() => {
      setShowOverlay(true);
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, [DELAY_MS]);

  useEffect(() => {
    setShowOverlay(false);
  }, [pathname]);

  useEffect(() => {
    document.addEventListener("click", handleLinkClick);
    return () => {
      document.removeEventListener("click", handleLinkClick);
    };
  }, [handleLinkClick]);

  return (
    <NavigationContext.Provider value={{ triggerLoading, showOverlay }}>
      <LoadingOverlay showOverlay={showOverlay} />
      {children}
    </NavigationContext.Provider>
  );
}

// Custom hook for programmatic navigation
export function useNavigation() {
  const router = useRouter();
  const context = useContext(NavigationContext);
  const pathname = usePathname();

  return {
    push: useCallback(
      (url: string) => {
        // Only show overlay if navigating to a different page
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
