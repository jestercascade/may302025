"use client";

import { useState, useEffect, useRef } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { ArrowLeft, Pencil } from "lucide-react";
import clsx from "clsx";
import TipTapEditor from "@/components/shared/TipTapEditor";
import { UpdateProductAction } from "@/actions/products";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { ShowAlertType } from "@/lib/sharedTypes";

export function DescriptionButton({ className }: { className?: string }) {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.editProduct.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editProduct.overlays.description.name
  );

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      type="button"
      className={`w-9 h-9 rounded-full flex items-center justify-center transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray ${className}`}
    >
      <Pencil size={18} strokeWidth={1.75} />
    </button>
  );
}

export function DescriptionOverlay({
  data,
}: {
  data: {
    id: string;
    description: string;
  };
}) {
  const [description, setDescription] = useState<string>(data.description);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [clearLoading, setClearLoading] = useState<boolean>(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const showAlert = useAlertStore((state) => state.showAlert);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.editProduct.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editProduct.overlays.description.name
  );
  const isOverlayVisible = useOverlayStore(
    (state) => state.pages.editProduct.overlays.description.isVisible
  );

  const isLoading = saveLoading || clearLoading;

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

  const handleEditorChange = (html: string) => {
    setDescription(html);
  };

  const saveDescription = async (contentToSave: string, isClear = false) => {
    if (isClear) {
      setClearLoading(true);
    } else {
      setSaveLoading(true);
    }

    try {
      const result = await UpdateProductAction({
        id: data.id,
        description: contentToSave,
      });

      showAlert({
        message: result.message,
        type: result.type,
      });
    } catch (error) {
      console.error("Error updating product:", error);
      showAlert({
        message: "Failed to update product",
        type: ShowAlertType.ERROR,
      });
    } finally {
      if (isClear) {
        setClearLoading(false);
      } else {
        setSaveLoading(false);
      }
      hideOverlay({ pageName, overlayName });
    }
  };

  const handleClear = () => {
    setDescription("");
    saveDescription("", true);
  };

  const handleSave = () => {
    saveDescription(description, false);
  };

  return (
    <>
      {isOverlayVisible && (
        <div
          ref={overlayRef}
          className="px-5 md:px-0 fixed top-0 bottom-0 left-0 right-0 z-50 transition duration-300 ease-in-out bg-glass-black backdrop-blur-sm overflow-x-hidden overflow-y-visible custom-scrollbar"
        >
          <div className="bg-white max-w-[640px] rounded-2xl shadow mx-auto mt-20 mb-[50vh] relative">
            <div className="flex items-center justify-between p-2 pr-4 pb-0">
              <button
                onClick={() => {
                  hideOverlay({ pageName, overlayName });
                }}
                type="button"
                disabled={isLoading}
                className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray disabled:hover:bg-transparent"
              >
                <ArrowLeft
                  size={20}
                  strokeWidth={2}
                  className="-ml-1 stroke-blue"
                />
                <span className="md:hidden font-semibold text-sm text-blue">
                  Description
                </span>
                <span className="hidden md:block font-semibold text-sm text-blue">
                  Product description
                </span>
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  type="button"
                  disabled={isLoading}
                  className="h-9 px-4 rounded-full bg-lightgray transition-colors disabled:opacity-50 disabled:hover:bg-lightgray disabled:cursor-not-allowed hover:bg-gray-300 active:bg-gray-400"
                >
                  {clearLoading ? (
                    <div className="flex gap-1 items-center justify-center w-full h-full">
                      <Spinner />
                      <span>Clearing</span>
                    </div>
                  ) : (
                    <span>Clear</span>
                  )}
                </button>
                <button
                  onClick={handleSave}
                  type="button"
                  disabled={isLoading}
                  className={clsx(
                    "relative h-9 w-max px-4 rounded-full overflow-hidden transition-colors text-white bg-neutral-700 disabled:opacity-50 disabled:hover:bg-neutral-700 disabled:cursor-not-allowed",
                    {
                      "hover:bg-neutral-600 active:bg-neutral-800": !isLoading,
                    }
                  )}
                >
                  {saveLoading ? (
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
            <div className="p-5">
              <div className="rounded-md shadow-sm border">
                <TipTapEditor
                  level="FULL"
                  onUpdate={handleEditorChange}
                  initialContent={description}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
