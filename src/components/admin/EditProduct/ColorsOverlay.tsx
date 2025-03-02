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

export function ColorsButton() {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.editProduct.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editProduct.overlays.colors.name
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

export function ColorsOverlay({ data }: { data: DataType }) {
  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState<ColorProps[]>([...(data.colors || [])]);
  const [newColor, setNewColor] = useState<ColorProps>({ name: "", image: "" });

  const showAlert = useAlertStore((state) => state.showAlert);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.editProduct.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editProduct.overlays.colors.name
  );
  const isOverlayVisible = useOverlayStore(
    (state) => state.pages.editProduct.overlays.colors.isVisible
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

    let hasMissingInfo = false;
    let hasInvalidImage = false;

    colors.forEach(({ name, image }) => {
      if (!name || !image) {
        showAlert({
          message: "Make sure existing colors are provided names & image URLs",
          type: ShowAlertType.ERROR,
        });
        hasMissingInfo = true;
      } else if (!isValidRemoteImage(image)) {
        showAlert({
          message:
            "Invalid image URL found. Try an image from Pinterest or your Firebase Storage.",
          type: ShowAlertType.ERROR,
        });
        hasInvalidImage = true;
      }
    });

    if (hasMissingInfo || hasInvalidImage) {
      setLoading(false);
      return;
    }

    try {
      const result = await UpdateProductAction({
        id: data.id,
        options: { colors: colors.filter(({ name, image }) => name && image) },
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
      setLoading(false);
      onHideOverlay();
    }
  };

  const addColor = () => {
    const hasInvalidExistingColor = colors.some(
      ({ name, image }) => !name || !image || !isValidRemoteImage(image)
    );

    if (hasInvalidExistingColor) {
      const message = colors.some(
        ({ name, image }) => name === "" || image === ""
      )
        ? "Make sure existing colors are provided names & image URLs"
        : "Invalid image URL found. Try an image from Pinterest or your Firebase Storage.";

      return showAlert({
        message: message,
        type: ShowAlertType.ERROR,
      });
    }

    setColors((prevColors) => [...prevColors, { ...newColor }]);
    setNewColor({ name: "", image: "" });
  };

  const removeColor = (index: number) => {
    setColors((prevColors) => prevColors.filter((_, i) => i !== index));
  };

  const handleColorChange = (index: number, field: string, value: string) => {
    setColors((prevColors) =>
      prevColors.map((color, i) =>
        i === index ? { ...color, [field]: value } : color
      )
    );
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[20px] overflow-hidden bg-white md:w-[500px] md:rounded-2xl md:shadow md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">Colors</h2>
                  <button
                    onClick={() => {
                      hideOverlay({ pageName, overlayName });
                      setColors([...(data.colors || [])]);
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
                    setColors([...(data.colors || [])]);
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
                    Colors
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
                  onClick={addColor}
                  type="button"
                  className="transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed h-max w-[calc(50%-4px)] min-[425px]:w-[calc(33.333333%-6px)] rounded-md overflow-hidden"
                >
                  <div className="w-full aspect-square pt-[72px] flex flex-col items-center justify-center">
                    <Plus size={40} strokeWidth={1.25} />
                  </div>
                  <div className="w-full h-[72px]"></div>
                </button>
                {colors.map(({ name, image }, index) => (
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
                        onClick={() => removeColor(index)}
                        className="h-8 w-8 rounded-full flex items-center justify-center absolute top-2 right-2 transition duration-300 ease-in-out backdrop-blur border border-red bg-red/70 active:bg-red"
                      >
                        <Minus color="#ffffff" strokeWidth={1.75} />
                      </button>
                    </div>
                    <div className="w-full h-9 border-t">
                      <input
                        type="text"
                        className="w-full h-full px-3 text-sm font-medium"
                        placeholder="Color name"
                        value={name}
                        onChange={(e) =>
                          handleColorChange(index, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="w-full h-9 border-t">
                      <input
                        type="text"
                        className="w-full h-full px-3 text-sm text-gray"
                        placeholder="Image URL"
                        value={image}
                        onChange={(e) =>
                          handleColorChange(index, "image", e.target.value)
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

type ColorProps = {
  name: string;
  image: string;
};

type DataType = {
  id: string;
  colors: ColorProps[] | null;
};
