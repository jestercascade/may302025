"use client";

import { isValidRemoteImage } from "@/lib/utils/common";
import { useState, useEffect } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { ArrowLeft, X, Pencil, Minus, Plus } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import Overlay from "@/ui/Overlay";
import { UpdateProductAction } from "@/actions/products";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { ShowAlertType } from "@/lib/sharedTypes";

export function ImageGalleryButton() {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.editProduct.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editProduct.overlays.imageGallery.name
  );

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      type="button"
      className="w-9 h-9 rounded-full flex items-center justify-center transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
    >
      <Pencil size={18} strokeWidth={1.75} />
    </button>
  );
}

export function ImageGalleryOverlay({ data }: { data: DataType }) {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState(data?.images.gallery ?? []);

  const showAlert = useAlertStore((state) => state.showAlert);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.editProduct.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editProduct.overlays.imageGallery.name
  );
  const isOverlayVisible = useOverlayStore(
    (state) => state.pages.editProduct.overlays.imageGallery.isVisible
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
    setLoading(false);
    hideOverlay({ pageName, overlayName });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const filteredImages = images.filter((image) => image !== "");
      if (filteredImages.length === 0) {
        showAlert({
          message: "No images added",
          type: ShowAlertType.ERROR,
        });
        setImages(data?.images.gallery ?? []);
      } else {
        const result = await UpdateProductAction({
          id: data.id,
          images: {
            main: data.images.main,
            gallery: filteredImages,
          },
        });

        showAlert({
          message: result.message,
          type: result.type,
        });
        setImages(filteredImages);
      }
    } catch (error) {
      console.error("Error updating product", error);
      showAlert({
        message: "Failed to update product",
        type: ShowAlertType.ERROR,
      });
    } finally {
      setLoading(false);
      onHideOverlay();
    }
  };

  const addImage = () => {
    const newEmptyImageBox = "";
    const updatedImages = [...images, newEmptyImageBox];
    setImages(updatedImages);
  };

  const removeImage = (indexToRemove: number) => {
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    setImages(updatedImages);
  };

  const handleImageInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value } = event.target;

    const updatedImageList = [...images];
    updatedImageList[index] = value;

    setImages(updatedImageList);
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[20px] overflow-hidden bg-white md:w-[500px] md:rounded-2xl md:shadow md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">Images</h2>
                  <button
                    onClick={() => {
                      hideOverlay({ pageName, overlayName });
                      setImages(data?.images.gallery ?? []);
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
                    setImages(data?.images.gallery ?? []);
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
                    Images
                  </span>
                </button>
                <button
                  onClick={handleSave}
                  type="button"
                  disabled={loading}
                  className={clsx(
                    "relative h-9 w-max px-4 rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-neutral-700",
                    {
                      "bg-opacity-50": loading,
                      "active:bg-neutral-700/85": !loading,
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
              <div className="w-full h-full mt-[52px] md:mt-0 p-5 flex flex-wrap gap-2 overflow-x-hidden overflow-y-visible invisible-scrollbar md:overflow-hidden">
                <button
                  onClick={addImage}
                  type="button"
                  className="transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed h-max w-[calc(50%-4px)] min-[425px]:w-[calc(33.333333%-6px)] rounded-md overflow-hidden"
                >
                  <div className="w-full aspect-square pt-9 flex flex-col items-center justify-center">
                    <Plus size={40} strokeWidth={1.25} />
                  </div>
                  <div className="w-full h-9"></div>
                </button>
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="h-max w-[calc(50%-4px)] min-[425px]:w-[calc(33.333333%-6px)] border rounded-md overflow-hidden"
                  >
                    <div className="w-full aspect-square relative overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center">
                        {image && isValidRemoteImage(image) && (
                          <Image
                            src={image}
                            alt=""
                            width={400}
                            height={400}
                            priority
                          />
                        )}
                      </div>
                      <button
                        onClick={() => removeImage(index)}
                        className="h-8 w-8 rounded-full flex items-center justify-center absolute top-2 right-2 transition duration-300 ease-in-out backdrop-blur border border-red bg-red/70 active:bg-red"
                      >
                        <Minus color="#ffffff" strokeWidth={1.75} />
                      </button>
                    </div>
                    <div className="w-full h-9 border-t">
                      <input
                        type="text"
                        className="w-full h-full px-3 text-sm text-gray"
                        placeholder="Image URL"
                        value={images[index] || ""}
                        onChange={(event) =>
                          handleImageInputChange(event, index)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:hidden w-full pb-5 pt-2 px-5 absolute bottom-0 bg-white">
              <button
                onClick={handleSave}
                type="button"
                disabled={loading}
                className={clsx(
                  "relative h-12 w-full rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-neutral-700",
                  {
                    "bg-opacity-50": loading,
                    "active:bg-neutral-700/85": !loading,
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

type DataType = {
  id: string;
  images: {
    main: string;
    gallery: string[];
  };
};
