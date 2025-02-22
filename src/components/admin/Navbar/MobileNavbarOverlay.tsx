"use client";

import { useMobileNavbarStore } from "@/zustand/admin/mobileNavbarStore";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { DeleteProductAction } from "@/actions/products";
import { DeleteUpsellAction } from "@/actions/upsells";
import { DeleteCollectionAction } from "@/actions/collections";
import { NewCollectionMenuButton } from "../Storefront/NewCollectionOverlay";
import { NewProductMenuButton } from "../NewProductOverlay";
import { NewUpsellMenuButton } from "../NewUpsellOverlay";
import { clientAuth } from "@/lib/firebase/client";
import { CreateNewsletterMenuButton } from "../Newsletters/CreateNewsletterOverlay";

export function MobileNavbarButton() {
  const showMobileNavbarOverlay = useMobileNavbarStore(
    (state) => state.showMobileNavbarOverlay
  );

  return (
    <button
      onClick={showMobileNavbarOverlay}
      className="h-12 w-12 rounded-full flex items-center justify-center ease-in-out transition duration-300 active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed"
      aria-label="Menu"
    >
      <Menu strokeWidth={2.5} />
    </button>
  );
}

export function MobileNavbarOverlay() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const hideMobileNavbarOverlay = useMobileNavbarStore(
    (state) => state.hideMobileNavbarOverlay
  );
  const isMobileNavbarOverlayVisible = useMobileNavbarStore(
    (state) => state.isMobileNavbarOverlayVisible
  );

  const isProductListPage = pathname === "/admin/products";
  const isProductEditingPage = /^\/admin\/products\/[a-z0-9-]+-\d{5}$/.test(
    pathname
  );
  const isCollectionListPage = pathname === "/admin/storefront";
  const isCollectionEditingPage =
    /^\/admin\/collections\/[a-z0-9-]+-\d{5}$/.test(pathname);
  const isUpsellListPage = pathname === "/admin/upsells";
  const isUpsellEditingPage = /^\/admin\/upsells\/\d{5}$/.test(pathname);
  const isNewsletterListPage = pathname === "/admin/newsletters";

  const showSeparator =
    isProductListPage ||
    isCollectionListPage ||
    isProductEditingPage ||
    isUpsellEditingPage ||
    isCollectionEditingPage ||
    isUpsellListPage ||
    isNewsletterListPage;

  const productSlug = isProductEditingPage
    ? pathname.split("/").pop()
    : undefined;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleMediaQueryChange = (
      e: MediaQueryListEvent | MediaQueryList
    ) => {
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
    router.push(path);
    hideMobileNavbarOverlay();
  };

  const getIdFromPath = () => {
    if (isProductEditingPage) {
      const match = pathname.match(/-(\d{5})$/);
      return match ? match[1] : null;
    }
    if (isUpsellEditingPage) {
      const match = pathname.match(/\/(\d{5})$/);
      return match ? match[1] : null;
    }
    if (isCollectionEditingPage) {
      const match = pathname.match(/-(\d{5})$/);
      return match ? match[1] : null;
    }
    return null;
  };

  const handleDelete = async () => {
    const id = getIdFromPath();
    if (!id) return;

    setIsDeleting(true);
    try {
      let redirectPath = "";

      if (isProductEditingPage) {
        await DeleteProductAction({ id });
        redirectPath = "/admin/products";
      } else if (isUpsellEditingPage) {
        await DeleteUpsellAction({ id });
        redirectPath = "/admin/upsells";
      } else if (isCollectionEditingPage) {
        await DeleteCollectionAction({ id });
        redirectPath = "/admin/storefront";
      }

      router.push(redirectPath);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
      hideMobileNavbarOverlay();
    }
  };

  const signOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    try {
      await clientAuth.signOut();
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div
      ref={overlayRef}
      className={clsx(
        isMobileNavbarOverlayVisible
          ? "md:hidden fixed w-full h-screen top-0 bottom-0 left-0 right-0 z-40 transition bg-glass-black backdrop-blur-sm md:overflow-x-hidden md:overflow-y-visible md:custom-scrollbar"
          : "hidden"
      )}
    >
      <div
        ref={menuRef}
        className="absolute right-0 bottom-0 top-0 h-full w-3/4 max-w-80 px-5 pt-3 bg-white"
      >
        <div className="h-full">
          <button
            onClick={() => handleNavigation("/admin")}
            className="h-12 min-w-[168px] w-[168px] ml-[2px] flex items-center justify-center"
          >
            <Image
              src="/images/logos/cherlygood_wordmark.svg"
              alt="Cherly Good"
              width={160}
              height={40}
              priority
            />
          </button>
          <div className="flex flex-col gap-4 mt-5 ml-2">
            <div className="flex flex-col gap-1">
              {isCollectionListPage && (
                <NewCollectionMenuButton closeMenu={hideMobileNavbarOverlay} />
              )}
              {isProductListPage && (
                <NewProductMenuButton closeMenu={hideMobileNavbarOverlay} />
              )}
              {isUpsellListPage && (
                <NewUpsellMenuButton closeMenu={hideMobileNavbarOverlay} />
              )}
              {isNewsletterListPage && (
                <CreateNewsletterMenuButton
                  closeMenu={hideMobileNavbarOverlay}
                />
              )}
              {isProductEditingPage && (
                <>
                  <button
                    onClick={() => {
                      handleNavigation(`/${productSlug}`);
                      hideMobileNavbarOverlay();
                    }}
                    className="h-10 w-max text-lg font-medium rounded-full flex items-center md:h-9 md:w-[calc(100%-10px)] md:mx-auto md:px-3 md:text-sm md:font-semibold md:rounded-md md:cursor-pointer md:transition md:active:bg-lightgray md:hover:bg-lightgray"
                  >
                    Visit product
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-10 w-max text-lg text-red font-medium rounded-full flex items-center md:h-9 md:w-[calc(100%-10px)] md:mx-auto md:px-3 md:text-sm md:font-semibold md:rounded-md md:cursor-pointer md:transition md:active:bg-lightgray md:hover:bg-lightgray"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </>
              )}
              {(isUpsellEditingPage || isCollectionEditingPage) && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-10 w-max text-lg text-red font-medium rounded-full flex items-center md:h-9 md:w-[calc(100%-10px)] md:mx-auto md:px-3 md:text-sm md:font-semibold md:rounded-md md:cursor-pointer md:transition md:active:bg-lightgray md:hover:bg-lightgray"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
            {showSeparator && <hr />}
            <div className="flex flex-col gap-1 *:h-10 *:w-max *:text-lg *:font-medium *:rounded-full *:flex *:items-center">
              <button onClick={() => handleNavigation("/admin/storefront")}>
                Storefront
              </button>
              <button onClick={() => handleNavigation("/admin/products")}>
                Products
              </button>
              <button onClick={() => handleNavigation("/admin/upsells")}>
                Upsells
              </button>
              <button onClick={() => handleNavigation("/admin/orders")}>
                Orders
              </button>
              <button onClick={() => handleNavigation("/admin/newsletters")}>
                Newsletters
              </button>
            </div>
            <hr />
            <div className="flex flex-col gap-1 *:h-9 *:w-max *:text-sm *:font-medium *:rounded-full *:flex *:items-center">
              <button onClick={() => handleNavigation("/")}>
                Public website
              </button>
              <button
                onClick={() => signOut()}
                disabled={isSigningOut}
                className={clsx({
                  "opacity-50 cursor-not-allowed": isSigningOut,
                  "active:bg-lightgray lg:hover:bg-lightgray": !isSigningOut,
                })}
              >
                {isSigningOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={hideMobileNavbarOverlay}
          className="h-9 w-9 rounded-full absolute right-3 top-2 flex items-center justify-center transition duration-300 ease-in-out hover:bg-lightgray"
          type="button"
        >
          <X color="#6c6c6c" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
