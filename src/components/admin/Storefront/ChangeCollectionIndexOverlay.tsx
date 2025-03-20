"use client";

import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { ChangeCollectionIndexAction } from "@/actions/collections";
import { useItemSelectorStore } from "@/zustand/admin/itemSelectorStore";
import { Repeat, X, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import Overlay from "@/ui/Overlay";
import clsx from "clsx";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { ShowAlertType } from "@/lib/sharedTypes";

export function ChangeCollectionIndexButton({
  data,
}: {
  data: ButtonDataType;
}) {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const setSelectedItem = useItemSelectorStore(
    (state) => state.setSelectedItem
  );
  const pageName = useOverlayStore((state) => state.pages.storefront.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.storefront.overlays.changeCollectionIndex.name
  );

  const handleClick = () => {
    setSelectedItem({ ...data });
    showOverlay({ pageName, overlayName });
  };

  return (
    <button
      onClick={handleClick}
      className="h-9 w-9 rounded-full flex items-center justify-center"
    >
      <Repeat size={18} strokeWidth={1.75} />
    </button>
  );
}

export function ChangeCollectionIndexOverlay() {
  const [loading, setLoading] = useState<boolean>(false);

  const showAlert = useAlertStore((state) => state.showAlert);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const selectedItem = useItemSelectorStore((state) => state.selectedItem);
  const setSelectedItem = useItemSelectorStore(
    (state) => state.setSelectedItem
  );
  const pageName = useOverlayStore((state) => state.pages.storefront.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.storefront.overlays.changeCollectionIndex.name
  );
  const isOverlayVisible = useOverlayStore(
    (state) => state.pages.storefront.overlays.changeCollectionIndex.isVisible
  );

  useEffect(() => {
    if (isOverlayVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      if (!isOverlayVisible) {
        document.body.style.overflow = "visible";
      }
    };
  }, [isOverlayVisible]);

  const onHideOverlay = () => {
    hideOverlay({ pageName, overlayName });
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await ChangeCollectionIndexAction({
        id: selectedItem.id,
        index: Number(selectedItem.index),
      });
      showAlert({
        message: result.message,
        type: result.type,
      });
    } catch (error) {
      console.error("Error updating product index:", error);
      showAlert({
        message: "Failed to change product index",
        type: ShowAlertType.ERROR,
      });
    } finally {
      onHideOverlay();
    }
  };

  const handleIndexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = event.target.value;
    if (/^\d*$/.test(newIndex)) {
      setSelectedItem({ ...selectedItem, index: newIndex });
    }
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[20px] overflow-hidden bg-white md:w-[500px] md:rounded-2xl md:shadow md:h-max md:mx-auto md:mt-20 md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">Reposition up/down</h2>
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
                  <ArrowLeft
                    size={20}
                    strokeWidth={2}
                    className="-ml-1 stroke-blue"
                  />
                  <span className="font-semibold text-sm text-blue">
                    Reposition up/down
                  </span>
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
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold mb-2">Title</h3>
                  <div className="w-full max-w-full h-9 px-3 rounded-md bg-neutral-100 border flex items-center text-nowrap overflow-x-visible overflow-y-hidden invisible-scrollbar">
                    {selectedItem.title}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="index" className="font-semibold text-sm">
                    Index
                  </label>
                  <div className="w-full h-9 relative">
                    <input
                      type="text"
                      name="index"
                      value={selectedItem.index}
                      onChange={handleIndexChange}
                      className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-neutral-400"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="md:hidden w-full pb-5 pt-2 px-5 absolute bottom-0">
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

type ButtonDataType = {
  id: string;
  index: string;
  title: string;
};
