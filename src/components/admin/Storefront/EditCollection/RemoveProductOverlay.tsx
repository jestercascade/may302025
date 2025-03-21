"use client";

import { useState } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import clsx from "clsx";
import Overlay from "@/ui/Overlay";
import { RemoveProductAction } from "@/actions/collections";
import { CircleX } from "lucide-react";
import { useItemSelectorStore } from "@/zustand/admin/itemSelectorStore";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { ShowAlertType } from "@/lib/sharedTypes";
import { useBodyOverflowStore } from "@/zustand/shared/bodyOverflowStore";

export function RemoveProductButton({ id }: { id: string }) {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const setSelectedItem = useItemSelectorStore(
    (state) => state.setSelectedItem
  );
  const pageName = useOverlayStore((state) => state.pages.editCollection.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editCollection.overlays.removeProduct.name
  );

  const handleClick = () => {
    setSelectedItem({ id });
    showOverlay({ pageName, overlayName });
  };

  return (
    <button
      onClick={handleClick}
      className="h-9 w-9 rounded-full flex items-center justify-center"
    >
      <CircleX size={20} strokeWidth={1.75} />
    </button>
  );
}

export function RemoveProductOverlay({
  collectionId,
}: {
  collectionId: string;
}) {
  const [loading, setLoading] = useState<boolean>(false);

  const showAlert = useAlertStore((state) => state.showAlert);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const selectedItem = useItemSelectorStore((state) => state.selectedItem);
  const pageName = useOverlayStore((state) => state.pages.editCollection.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editCollection.overlays.removeProduct.name
  );
  const isOverlayVisible = useOverlayStore(
    (state) => state.pages.editCollection.overlays.removeProduct.isVisible
  );
  const setPreventBodyOverflowChange = useBodyOverflowStore(
    (state) => state.setPreventBodyOverflowChange
  );

  const handleSave = async () => {
    setLoading(true);

    try {
      const result = await RemoveProductAction({
        collectionId,
        productId: selectedItem.id,
      });
      showAlert({
        message: result.message,
        type: result.type,
      });
    } catch (error) {
      console.error("Error removing product from collection:", error);
      showAlert({
        message: "Failed to remove product from collection",
        type: ShowAlertType.ERROR,
      });
    } finally {
      setLoading(false);
      hideOverlay({ pageName, overlayName });
      setPreventBodyOverflowChange(true);
    }
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] overflow-hidden md:overflow-visible rounded-t-[20px] bg-white md:w-[360px] md:rounded-2xl md:shadow md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="p-5 w-full h-full">
              <h2 className="font-semibold mb-6">
                Confirm removal of the product?
              </h2>
              <div className="w-full flex gap-2 justify-end">
                <button
                  onClick={() => hideOverlay({ pageName, overlayName })}
                  className="h-9 px-4 rounded-full ease-in-out duration-300 transition border active:bg-lightgray lg:hover:bg-lightgray"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  type="button"
                  disabled={loading}
                  className={clsx(
                    "relative h-9 w-max px-4 rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-red",
                    {
                      "bg-opacity-50": loading,
                      "active:bg-red-dimmed lg:hover:bg-red-dimmed": !loading,
                    }
                  )}
                >
                  {loading ? (
                    <div className="flex gap-1 items-center justify-center w-full h-full">
                      <Spinner color="white" />
                      <span className="text-white">Removing</span>
                    </div>
                  ) : (
                    <span className="text-white">Yes, remove</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
}
