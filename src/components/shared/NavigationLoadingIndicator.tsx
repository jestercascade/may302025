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
      className={`fixed inset-0 z-[99999999999] flex items-center justify-center transition-opacity duration-200 ease-in-out ${
        showOverlay ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        backgroundColor: "rgba(250, 250, 250, 0.5)",
      }}
    >
      <div className="w-full h-[3px] absolute top-0 left-0 overflow-hidden">
        <div className="h-full w-[25%] bg-amber absolute animate-navigationLoadingIndicatorAnimation"></div>
      </div>
    </div>
  );
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [showOverlay, setShowOverlay] = useState(false);
  const pathname = usePathname();
  const DELAY_MS = 0; // Show overlay after 500ms delay

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
