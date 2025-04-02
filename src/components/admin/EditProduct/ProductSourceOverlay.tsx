"use client";

import { FormEvent, useState, useEffect } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { ArrowLeft, X, Pencil } from "lucide-react";
import clsx from "clsx";
import Overlay from "@/ui/Overlay";
import { UpdateProductAction } from "@/actions/products";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { ShowAlertType } from "@/lib/sharedTypes";

export function ProductSourceButton({ className }: { className: string }) {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.editProduct.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editProduct.overlays.productSource.name
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

export function ProductSourceOverlay({ data }: { data: DataType }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({
    id: data.id,
    platform: data.sourceInfo.platform || "",
    platformUrl: data.sourceInfo.platformUrl || "",
    store: data.sourceInfo.store || "",
    storeId: data.sourceInfo.storeId || "",
    storeUrl: data.sourceInfo.storeUrl || "",
    productUrl: data.sourceInfo.productUrl || "",
  });

  const showAlert = useAlertStore((state) => state.showAlert);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.editProduct.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editProduct.overlays.productSource.name
  );
  const isOverlayVisible = useOverlayStore(
    (state) => state.pages.editProduct.overlays.productSource.isVisible
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
  }, [isOverlayVisible, showAlert]);

  const onHideOverlay = () => {
    setLoading(false);
    hideOverlay({ pageName, overlayName });
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();

    setLoading(true);

    const updatedData = {
      id: data.id,
      sourceInfo: {
        platform: formData.platform,
        platformUrl: formData.platformUrl,
        store: formData.store,
        storeId: formData.storeId,
        storeUrl: formData.storeUrl,
        productUrl: formData.productUrl,
      },
    };

    try {
      const result = await UpdateProductAction(updatedData);
      showAlert({
        message: result.message,
        type: result.type,
      });
    } catch (error) {
      console.error("Error updating product source:", error);
      showAlert({
        message: "Failed to update product source",
        type: ShowAlertType.NEUTRAL,
      });
    } finally {
      setLoading(false);
      onHideOverlay();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[20px] overflow-hidden bg-white md:w-[520px] md:rounded-2xl md:shadow md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <form onSubmit={handleSave}>
              <div className="w-full h-[calc(100vh-188px)] md:h-auto">
                <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                  <div className="relative flex justify-center items-center w-full h-7">
                    <h2 className="font-semibold text-lg">Product source</h2>
                    <button
                      onClick={() => {
                        hideOverlay({ pageName, overlayName });
                        setFormData({
                          id: data.id,
                          platform: data.sourceInfo.platform || "",
                          platformUrl: data.sourceInfo.platformUrl || "",
                          store: data.sourceInfo.store || "",
                          storeId: data.sourceInfo.storeId || "",
                          storeUrl: data.sourceInfo.storeUrl || "",
                          productUrl: data.sourceInfo.productUrl || "",
                        });
                      }}
                      type="button"
                      className="w-7 h-7 rounded-full flex items-center justify-center absolute right-4 transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed"
                    >
                      <X color="#6c6c6c" size={18} strokeWidth={2} />
                    </button>
                  </div>
                </div>
                <div className="hidden md:flex md:items-center md:justify-between py-2 pr-4 pl-2">
                  <button
                    onClick={() => {
                      hideOverlay({ pageName, overlayName });
                      setFormData({
                        id: data.id,
                        platform: data.sourceInfo.platform || "",
                        platformUrl: data.sourceInfo.platformUrl || "",
                        store: data.sourceInfo.store || "",
                        storeId: data.sourceInfo.storeId || "",
                        storeUrl: data.sourceInfo.storeUrl || "",
                        productUrl: data.sourceInfo.productUrl || "",
                      });
                    }}
                    type="button"
                    className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
                  >
                    <ArrowLeft size={20} strokeWidth={2} className="-ml-1 stroke-blue" />
                    <span className="font-semibold text-sm text-blue">Product source</span>
                  </button>
                  <button
                    type="submit"
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
                    <label htmlFor="platform" className="text-xs text-gray">
                      Platform
                    </label>
                    <div className="w-full h-9 relative">
                      <input
                        type="text"
                        name="platform"
                        value={formData.platform}
                        onChange={handleInputChange}
                        placeholder="AliExpress"
                        className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-neutral-400"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="platformUrl" className="text-xs text-gray">
                      Platform URL
                    </label>
                    <div className="w-full h-9 relative">
                      <input
                        type="text"
                        name="platformUrl"
                        value={formData.platformUrl}
                        onChange={handleInputChange}
                        placeholder="https://www.aliexpress.com/"
                        className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-neutral-400"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="store" className="text-xs text-gray">
                      Store
                    </label>
                    <div className="w-full h-9 relative">
                      <input
                        type="text"
                        name="store"
                        value={formData.store}
                        onChange={handleInputChange}
                        placeholder="Women's Sleepwear Store"
                        className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-neutral-400"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="storeId" className="text-xs text-gray">
                      Store ID
                    </label>
                    <div className="w-full h-9 relative">
                      <input
                        type="text"
                        name="storeId"
                        value={formData.storeId}
                        onChange={handleInputChange}
                        placeholder="3286105"
                        className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-neutral-400"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="storeUrl" className="text-xs text-gray">
                      Store URL
                    </label>
                    <div className="w-full h-9 relative">
                      <input
                        type="text"
                        name="storeUrl"
                        value={formData.storeUrl}
                        onChange={handleInputChange}
                        placeholder="https://www.aliexpress.com/store/4839201765"
                        className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-neutral-400"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="productUrl" className="text-xs text-gray">
                      Product URL
                    </label>
                    <div className="w-full h-9 relative">
                      <input
                        type="text"
                        name="productUrl"
                        value={formData.productUrl}
                        onChange={handleInputChange}
                        placeholder="https://www.aliexpress.com/item/7584936210472938.html"
                        className="w-full h-9 px-3 rounded-md transition-colors border focus:border-neutral-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:hidden w-full pb-5 pt-2 px-5 absolute bottom-0 bg-white">
                <button
                  type="submit"
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
            </form>
          </div>
        </Overlay>
      )}
    </>
  );
}

// -- Type Definitions --

type DataType = {
  id: string;
  sourceInfo: {
    platform: string;
    platformUrl: string;
    store: string;
    storeId: string;
    storeUrl: string;
    productUrl: string;
  };
};

type FormDataType = {
  id: string;
  platform: string;
  platformUrl: string;
  store: string;
  storeId: string;
  storeUrl: string;
  productUrl: string;
};
