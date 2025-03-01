"use client";

import { useState, useEffect } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { ArrowLeft, X, Minus, Plus, Pencil } from "lucide-react";
import clsx from "clsx";
import Overlay from "@/ui/Overlay";
import Image from "next/image";
import { RemoveUpsellAction, SetUpsellAction } from "@/actions/products";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { ShowAlertType } from "@/lib/sharedTypes";

export function UpsellButton({ className }: { className: string }) {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.editProduct.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editProduct.overlays.upsell.name
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

export function UpsellOverlay({ data }: { data: DataType }) {
  const [loading, setLoading] = useState(false);
  const [upsellId, setUpsellId] = useState("");

  const { upsell, upsellDetails } = data;

  const showAlert = useAlertStore((state) => state.showAlert);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.editProduct.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editProduct.overlays.upsell.name
  );
  const isOverlayVisible = useOverlayStore(
    (state) => state.pages.editProduct.overlays.upsell.isVisible
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setUpsellId(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addUpsell();
    }
  };

  const addUpsell = async () => {
    if (!upsellId.trim()) {
      return showAlert({
        message: "Upsell ID cannot be empty",
        type: ShowAlertType.ERROR,
      });
    } else if (!/^\d{5}$/.test(upsellId.trim())) {
      return showAlert({
        message: "Upsell ID must be a 5-digit number",
        type: ShowAlertType.ERROR,
      });
    }

    setLoading(true);

    try {
      const result = await SetUpsellAction({
        productId: data.id,
        upsellId,
      });
      showAlert({
        message: result.message,
        type: result.type,
      });
      setUpsellId("");
    } catch (error) {
      console.error("Error setting upsell:", error);
      showAlert({
        message: "Failed to set upsell",
        type: ShowAlertType.ERROR,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUpsell = async () => {
    setLoading(true);

    try {
      const result = await RemoveUpsellAction({
        productId: data.id,
      });
      showAlert({
        message: result.message,
        type: result.type,
      });
    } catch (error) {
      console.error("Error removing upsell:", error);
      showAlert({
        message: "Failed to remove upsell",
        type: ShowAlertType.ERROR,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[20px] overflow-hidden bg-white md:w-[500px] md:rounded-2xl md:shadow md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">Upsell</h2>
                  <button
                    onClick={() => {
                      hideOverlay({ pageName, overlayName });
                    }}
                    type="button"
                    className="w-7 h-7 rounded-full flex items-center justify-center absolute right-4 transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed"
                  >
                    <X color="#6c6c6c" size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
              <div className="hidden md:flex md:items-center md:justify-start py-2 pr-4 pl-2">
                <button
                  onClick={() => {
                    hideOverlay({ pageName, overlayName });
                  }}
                  type="button"
                  className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
                >
                  <ArrowLeft
                    size={20}
                    strokeWidth={2}
                    className="-ml-1 stroke-blue"
                  />
                  <span className="font-semibold text-sm text-blue">
                    Upsell
                  </span>
                </button>
              </div>
              <div className="w-full h-full mt-[52px] md:mt-0 p-5 pb-28 md:pb-10 flex flex-col gap-5 overflow-x-hidden overflow-y-visible invisible-scrollbar md:overflow-hidden">
                {upsell && upsellDetails ? (
                  <div className="mx-auto w-max max-w-full rounded-xl overflow-hidden border border-[#FFD69D] bg-[#FEF0B8]">
                    <div className="rounded-xl p-2 pb-0">
                      <div className="relative">
                        <div className="w-60 select-none">
                          <div className="w-full aspect-square rounded-lg overflow-hidden flex items-center justify-center bg-white">
                            <Image
                              src={upsell.mainImage}
                              alt="Upsell"
                              width={240}
                              height={240}
                              priority
                            />
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveUpsell}
                          className="h-8 w-8 rounded-full flex items-center justify-center absolute top-2 right-2 transition duration-300 ease-in-out backdrop-blur border border-red bg-red/70 active:bg-red"
                        >
                          {loading ? (
                            <Spinner color="white" />
                          ) : (
                            <Minus color="#ffffff" strokeWidth={1.75} />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="p-5 pt-4 pr-12">
                      <p className="mb-1 font-bold text-[#C45500]">
                        ${upsell.pricing.salePrice || upsell.pricing.basePrice}{" "}
                        ({upsellDetails.percentageIncrease}%)
                      </p>
                      <p className="text-xs text-[#C45500]/85">
                        Customer spends ${upsellDetails.additionalSpend} more
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-4 items-center mt-[52px] md:mt-0 px-5 pt-5 pb-28 md:pb-[70px]">
                    <div className="flex flex-col gap-2 items-center">
                      <h2 className="font-semibold text-lg">No upsell</h2>
                      <p className="text-sm text-center">
                        Enter ID below to set one
                      </p>
                    </div>
                    <div className="w-full min-[588px]:w-56 h-9 rounded-full overflow-hidden flex items-center border shadow-sm">
                      <input
                        type="text"
                        value={upsellId}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Paste ID (#12345)"
                        className="h-full w-full pl-4 bg-transparent"
                      />
                      <div className="h-full flex items-center justify-center">
                        <button
                          type="button"
                          onClick={addUpsell}
                          disabled={loading}
                          className={clsx(
                            "w-11 h-9 rounded-full flex items-center justify-center transition duration-300 ease-in-out",
                            {
                              "active:bg-lightgray lg:hover:bg-lightgray":
                                !loading,
                            }
                          )}
                        >
                          {loading ? (
                            <Spinner color="gray" />
                          ) : (
                            <Plus strokeWidth={1.75} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
}

// -- Type Definitions --

type DataType = {
  id: string;
  upsell: {
    id: string;
    mainImage: string;
    pricing: {
      salePrice: number;
      basePrice: number;
      discountPercentage: number;
    };
    visibility: "DRAFT" | "PUBLISHED" | "HIDDEN";
    createdAt: string;
    updatedAt: string;
    products: Array<{
      id: string;
      name: string;
      slug: string;
      basePrice: number;
      images: {
        main: string;
        gallery: string[];
      };
      options: {
        colors: Array<{
          name: string;
          image: string;
        }>;
        sizes: {
          inches: {
            columns: Array<{ label: string; order: number }>;
            rows: Array<{ [key: string]: string }>;
          };
          centimeters: {
            columns: Array<{ label: string; order: number }>;
            rows: Array<{ [key: string]: string }>;
          };
        };
      };
    }>;
  } | null;
  upsellDetails: {
    additionalSpend: string;
    percentageIncrease: string;
  } | null;
};
