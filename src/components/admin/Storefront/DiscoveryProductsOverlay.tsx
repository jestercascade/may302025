"use client";

import { useState, useEffect } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { ArrowLeft, X } from "lucide-react";
import clsx from "clsx";
import Overlay from "@/ui/Overlay";
import { UpdateDiscoveryProductsAction } from "@/actions/discoveryProducts";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { ShowAlertType } from "@/lib/sharedTypes";
import { useBodyOverflowStore } from "@/zustand/shared/bodyOverflowStore";

export function DiscoveryProductsButton() {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.storefront.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.storefront.overlays.discoveryProducts.name
  );

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      className="flex flex-col items-start w-full min-[560px]:w-[calc(100%/2-4px)] min-[824px]:w-64 rounded-xl p-5 relative cursor-pointer border transition bg-white active:border-[#b9bfc9] lg:hover:border-[#b9bfc9]"
    >
      <div className="w-full mb-4 flex items-center justify-between relative">
        <h2 className="text-left font-semibold text-sm">Discovery Products</h2>
      </div>
      <p className="w-52 text-left text-gray text-xs leading-[18px]">
        Customers love to treasure hunt—products appear in a random order, refreshed with every page
        visit.
      </p>
    </button>
  );
}

export function DiscoveryProductsOverlay({
  discoveryProductsSettings,
}: {
  discoveryProductsSettings: DiscoveryProductsSettingsType | null;
}) {
  const [loading, setLoading] = useState(false);
  const [visibleOnPages, setVisibleOnPages] = useState<{
    [key: string]: boolean;
  }>(discoveryProductsSettings?.visibleOnPages || { home: false, cart: false });

  const showAlert = useAlertStore((state) => state.showAlert);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.storefront.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.storefront.overlays.discoveryProducts.name
  );
  const isOverlayVisible = useOverlayStore(
    (state) => state.pages.storefront.overlays.discoveryProducts.isVisible
  );
  const { setPreventBodyOverflowChange } = useBodyOverflowStore();

  useEffect(() => {
    if (isOverlayVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
      setPreventBodyOverflowChange(false);
    }

    return () => {
      if (!isOverlayVisible) {
        document.body.style.overflow = "visible";
        setPreventBodyOverflowChange(false);
      }
    };
  }, [isOverlayVisible, setPreventBodyOverflowChange]);

  const handleSave = async () => {
    setLoading(true);

    try {
      const result = await UpdateDiscoveryProductsAction({
        visibleOnPages,
      });

      showAlert({
        message: result.message,
        type: result.type,
      });
    } catch {
      showAlert({
        message: "Failed to update discovery products settings",
        type: ShowAlertType.ERROR,
      });
    } finally {
      setLoading(false);
      setPreventBodyOverflowChange(true);
      hideOverlay({ pageName, overlayName });
    }
  };

  const onHideOverlay = () => {
    setLoading(false);
    hideOverlay({ pageName, overlayName });
    setVisibleOnPages(discoveryProductsSettings?.visibleOnPages || { home: false, cart: false });
  };

  const togglePageVisibility = (page: string) => {
    setVisibleOnPages((prev) => ({
      ...prev,
      [page]: !prev[page],
    }));
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[20px] overflow-hidden bg-white md:w-[400px] md:rounded-2xl md:shadow-lg md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">Discovery products</h2>
                  <button
                    onClick={onHideOverlay}
                    type="button"
                    className="w-7 h-7 rounded-full flex items-center justify-center absolute right-4 transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed"
                  >
                    <X color="#6c6c6c" size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
              <div className="hidden md:flex md:items-center md:justify-between py-2 pr-4 pl-2">
                <button
                  onClick={onHideOverlay}
                  type="button"
                  className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
                >
                  <ArrowLeft size={20} strokeWidth={2} className="-ml-1 stroke-blue" />
                  <span className="font-semibold text-sm text-blue">Discovery products</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={clsx(
                    "relative h-9 w-max px-4 rounded-full overflow-hidden transition-colors text-white bg-neutral-700",
                    {
                      "bg-opacity-50": loading,
                      "hover:bg-neutral-600 active:bg-neutral-800": !loading,
                    }
                  )}
                >
                  {loading ? (
                    <div className="flex gap-1 items-center justify-center w-full h-full">
                      <Spinner color="white" />
                      <span className="text-white">Saving</span>
                    </div>
                  ) : (
                    <span className="text-white">Save</span>
                  )}
                </button>
              </div>
              <div className="w-full h-full mt-[52px] md:mt-0 p-5 flex flex-col gap-5 overflow-x-hidden overflow-y-visible invisible-scrollbar md:overflow-hidden">
                <div className="space-y-2">
                  <div className="px-[10px] py-2 w-full rounded-md flex gap-4 min-[425px]:gap-4 items-start justify-between bg-lightgray">
                    <div className="text-sm">
                      Show on <strong>Home</strong> page
                    </div>
                    <div
                      onClick={() => togglePageVisibility("home")}
                      className={clsx(
                        "min-w-10 w-10 h-5 rounded-full relative cursor-pointer ease-in-out duration-200",
                        visibleOnPages.home ? "bg-blue border border-blue" : "bg-white border"
                      )}
                    >
                      <div
                        className={clsx(
                          "w-[10px] h-[10px] rounded-full ease-in-out duration-300 absolute [top:50%] [transform:translateY(-50%)]",
                          visibleOnPages.home ? "left-[23px] bg-white" : "left-[5px] bg-black"
                        )}
                      ></div>
                    </div>
                  </div>
                  <div className="px-[10px] py-2 w-full rounded-md flex gap-4 min-[425px]:gap-4 items-start justify-between bg-lightgray">
                    <div className="text-sm">
                      Show on <strong>Cart</strong> page
                    </div>
                    <div
                      onClick={() => togglePageVisibility("cart")}
                      className={clsx(
                        "min-w-10 w-10 h-5 rounded-full relative cursor-pointer ease-in-out duration-200",
                        visibleOnPages.cart ? "bg-blue border border-blue" : "bg-white border"
                      )}
                    >
                      <div
                        className={clsx(
                          "w-[10px] h-[10px] rounded-full ease-in-out duration-300 absolute [top:50%] [transform:translateY(-50%)]",
                          visibleOnPages.cart ? "left-[23px] bg-white" : "left-[5px] bg-black"
                        )}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:hidden w-full pb-5 pt-2 px-5 absolute bottom-0 bg-white">
              <button
                onClick={handleSave}
                disabled={loading}
                className={clsx(
                  "relative h-12 w-full rounded-full overflow-hidden transition-colors text-white bg-neutral-700",
                  {
                    "bg-opacity-50": loading,
                    "hover:bg-neutral-600 active:bg-neutral-800": !loading,
                  }
                )}
              >
                {loading ? (
                  <div className="flex gap-1 items-center justify-center w-full h-full">
                    <Spinner color="white" />
                    <span className="text-white">Saving</span>
                  </div>
                ) : (
                  <span className="text-white">Save</span>
                )}
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
}

// -- Type Definitions --

type DiscoveryProductsSettingsType = {
  id: string;
  visibleOnPages: {
    cart: boolean;
    home: boolean;
    [key: string]: boolean;
  };
};
