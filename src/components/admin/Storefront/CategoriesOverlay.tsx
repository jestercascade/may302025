"use client";

import { useState, useEffect } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { ArrowLeft, X } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import Overlay from "@/ui/Overlay";
import { UpdateCategoriesAction } from "@/actions/categories";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { ShowAlertType } from "@/lib/sharedTypes";

const HIDDEN = "HIDDEN";
const VISIBLE = "VISIBLE";

export function CategoriesButton({
  showOnPublicSite,
}: {
  showOnPublicSite: boolean | undefined;
}) {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.storefront.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.storefront.overlays.categories.name
  );

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      className="flex flex-col items-start w-full min-[560px]:w-[calc(100%/2-4px)] min-[824px]:w-64 rounded-xl p-5 relative cursor-pointer border transition bg-white active:border-[#b9bfc9] lg:hover:border-[#b9bfc9]"
    >
      <div className="w-full mb-4 flex items-center justify-between relative">
        <h2 className="text-left font-semibold text-sm">Categories</h2>
        <div
          className={clsx(
            "w-10 h-5 rounded-full relative cursor-pointer ease-in-out duration-200",
            showOnPublicSite ? "bg-blue border border-blue" : "bg-white border"
          )}
        >
          <div
            className={clsx(
              "w-[10px] h-[10px] rounded-full ease-in-out duration-300 absolute [top:50%] [transform:translateY(-50%)]",
              showOnPublicSite ? "left-[23px] bg-white" : "left-[5px] bg-black"
            )}
          ></div>
        </div>
      </div>
      <p className="w-52 text-left text-gray text-xs leading-[18px]">
        Group similar products so they're easy to find: Dresses, Tops, Bottoms,
        and more.
      </p>
    </button>
  );
}

export function CategoriesOverlay({
  categoriesData,
}: {
  categoriesData: StoreCategoriesType | null;
}) {
  const [loading, setLoading] = useState(false);
  const [categorySectionVisibility, setCategorySectionVisibility] = useState(
    categoriesData?.showOnPublicSite
  );
  const [visibilityStates, setVisibilityStates] = useState<
    ("VISIBLE" | "HIDDEN")[]
  >(categoriesData?.categories.map((category) => category.visibility) || []);

  const showAlert = useAlertStore((state) => state.showAlert);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.storefront.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.storefront.overlays.categories.name
  );
  const isOverlayVisible = useOverlayStore(
    (state) => state.pages.storefront.overlays.categories.isVisible
  );

  useEffect(() => {
    document.body.style.overflow = isOverlayVisible ? HIDDEN : VISIBLE;
    return () => {
      if (!isOverlayVisible) {
        document.body.style.overflow = VISIBLE;
      }
    };
  }, [isOverlayVisible]);

  const handleSave = async () => {
    setLoading(true);

    try {
      const updatedCategories = categoriesData?.categories.map(
        (category, index) => ({
          index: category.index,
          name: category.name,
          image: category.image,
          visibility: visibilityStates[index],
        })
      );

      const allCategoriesHidden = updatedCategories?.every(
        (category) => category.visibility === HIDDEN
      );

      if (categorySectionVisibility && allCategoriesHidden) {
        showAlert({
          message:
            "Cannot display category section on storefront; all categories are hidden.",
          type: ShowAlertType.ERROR,
        });
        setLoading(false);
        return;
      }

      const result = await UpdateCategoriesAction({
        showOnPublicSite: categorySectionVisibility ?? false,
        categories: updatedCategories || [],
      });

      showAlert({
        message: result.message,
        type: result.type,
      });
    } catch (error) {
      console.error("Error updating categories:", error);
      showAlert({
        message: "Failed to update categories",
        type: ShowAlertType.ERROR,
      });
    } finally {
      setLoading(false);
    }
  };

  const onHideOverlay = () => {
    setLoading(false);
    hideOverlay({ pageName, overlayName });
    setCategorySectionVisibility(categoriesData?.showOnPublicSite);
    setVisibilityStates(
      categoriesData?.categories.map((category) => category.visibility) || []
    );
  };

  const toggleVisibility = (index: number) => {
    setVisibilityStates((prev) => {
      const newVisibilityStates = [...prev];
      newVisibilityStates[index] =
        newVisibilityStates[index] === VISIBLE ? HIDDEN : VISIBLE;
      return newVisibilityStates;
    });
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[20px] overflow-hidden bg-white md:w-[536px] md:rounded-2xl md:shadow-lg md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">Setup categories</h2>
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
                    Setup categories
                  </span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={clsx(
                    "relative h-9 w-max px-4 rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-neutral-700",
                    {
                      "bg-opacity-50": loading,
                      "active:bg-neutral-700": !loading,
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
                  <h2 className="text-xs text-gray">Visibility</h2>
                  <div className="px-[10px] py-2 w-full min-[425px]:w-max rounded-md flex gap-4 min-[425px]:gap-4 items-start justify-between bg-lightgray">
                    <div className="text-sm">Show categories on storefront</div>
                    <div
                      onClick={() =>
                        setCategorySectionVisibility((prevState) => !prevState)
                      }
                      className={clsx(
                        "min-w-10 w-10 h-5 rounded-full relative cursor-pointer ease-in-out duration-200",
                        categorySectionVisibility
                          ? "bg-blue border border-blue"
                          : "bg-white border"
                      )}
                    >
                      <div
                        className={clsx(
                          "w-[10px] h-[10px] rounded-full ease-in-out duration-300 absolute [top:50%] [transform:translateY(-50%)]",
                          categorySectionVisibility
                            ? "left-[23px] bg-white"
                            : "left-[5px] bg-black"
                        )}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-xs text-gray">Categories</h2>
                  <div className="flex flex-wrap gap-2">
                    {categoriesData?.categories.map(
                      ({ index, image, name }, mapIndex) => (
                        <div
                          key={mapIndex}
                          className="w-[calc(50%-4px)] min-[466px]:w-[calc(33.333333%-6px)] min-[608px]:w-[calc(25%-6px)] min-[768px]:w-40 border rounded-xl relative overflow-hidden"
                        >
                          <div className="w-full aspect-square mb-2 flex flex-col gap-2 items-center pt-5">
                            <div className="w-[calc(100%-56px)] max-w-[140px] aspect-square rounded-full overflow-hidden flex items-center justify-center shadow-[rgba(0,0,0,0.2)_0px_1px_3px_0px,_rgba(27,31,35,0.15)_0px_0px_0px_1px]">
                              <Image
                                src={`/images/categories/${image}`}
                                alt={name}
                                width={140}
                                height={140}
                                priority={true}
                              />
                            </div>
                            <span className="text-gray text-xs">{name}</span>
                          </div>
                          <div className="w-full py-2 px-5 flex items-center justify-between border-t">
                            <span className="text-sm font-semibold">
                              {index + 1}
                            </span>
                            <div
                              onClick={() => toggleVisibility(mapIndex)}
                              className={clsx(
                                "w-10 h-5 rounded-full relative cursor-pointer ease-in-out duration-200",
                                {
                                  "bg-white border":
                                    visibilityStates[mapIndex] === HIDDEN,
                                  "bg-blue border border-blue":
                                    visibilityStates[mapIndex] === VISIBLE,
                                }
                              )}
                            >
                              <div
                                className={clsx(
                                  "w-[10px] h-[10px] rounded-full ease-in-out duration-300 absolute [top:50%] [transform:translateY(-50%)]",
                                  {
                                    "left-[5px] bg-black":
                                      visibilityStates[mapIndex] === HIDDEN,
                                    "left-[23px] bg-white":
                                      visibilityStates[mapIndex] === VISIBLE,
                                  }
                                )}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="md:hidden w-full pb-5 pt-2 px-5 absolute bottom-0 bg-white">
              <button
                onClick={handleSave}
                disabled={loading}
                className={clsx(
                  "relative h-12 w-full rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-neutral-700",
                  {
                    "bg-opacity-50": loading,
                    "bg-neutral-700": !loading,
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

type CategoryType = {
  index: number;
  name: string;
  image: string;
  visibility: "VISIBLE" | "HIDDEN";
};

type StoreCategoriesType = {
  showOnPublicSite: boolean;
  categories: CategoryType[];
};
