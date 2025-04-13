"use client";

import { useState, useEffect, useRef } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { ArrowLeft, X, Pencil, GripVertical, Plus } from "lucide-react";
import clsx from "clsx";
import { ReactSortable } from "react-sortablejs";
import { UpdateProductAction } from "@/actions/products";
import { generateId } from "@/lib/utils/common";
import TipTapEditor from "@/components/shared/TipTapEditor";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { ShowAlertType } from "@/lib/sharedTypes";

export function HighlightsButton({ className }: { className?: string }) {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.editProduct.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editProduct.overlays.highlights.name
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

export function HighlightsOverlay({ data }: { data: DataType }) {
  const [saveLoading, setSaveLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [clearFlag, setClearFlag] = useState(false);
  const [headline, setHeadline] = useState(data.highlights.headline);
  const [keyPoints, setKeyPoints] = useState<ItemType[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    data.highlights.keyPoints.sort((a, b) => a.index - b.index);
    const initialKeyPoints = data.highlights.keyPoints.map((item) => ({
      id: Number(generateId()),
      name: item.text,
      order: item.index,
    }));
    setKeyPoints(initialKeyPoints);
  }, [data.highlights.keyPoints]);

  const showAlert = useAlertStore((state) => state.showAlert);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.editProduct.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editProduct.overlays.highlights.name
  );
  const isOverlayVisible = useOverlayStore(
    (state) => state.pages.editProduct.overlays.highlights.isVisible
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
    setSaveLoading(false);
    setClearLoading(false);
    hideOverlay({ pageName, overlayName });
  };

  const handleClear = async () => {
    setClearLoading(true);
    setHeadline("");
    setKeyPoints([]);
    setClearFlag((f) => !f);

    try {
      const result = await UpdateProductAction({
        id: data.id,
        highlights: {
          headline: "",
          keyPoints: [],
        },
      });

      showAlert({
        message: result.message,
        type: result.type,
      });
    } catch (error) {
      console.error("Error clearing highlights:", error);
      showAlert({
        message: "Failed to clear highlights",
        type: ShowAlertType.ERROR,
      });
    } finally {
      setClearLoading(false);
      onHideOverlay();
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);

    const sortedKeyPoints = [...keyPoints].sort((a, b) => a.order - b.order);
    const updatedKeyPoints = sortedKeyPoints.map((item, index) => ({
      text: item.name,
      index: index + 1,
    }));

    const updatedData = {
      id: data.id,
      highlights: {
        headline,
        keyPoints: updatedKeyPoints,
      },
    };

    try {
      const result = await UpdateProductAction(updatedData);
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
      setSaveLoading(false);
      onHideOverlay();
    }
  };

  const handleAdd = () => {
    const newKeyPoint = {
      id: Number(generateId()),
      name: "New Key Point",
      order: keyPoints.length + 1,
    };
    setKeyPoints((prevKeyPoints) => [...prevKeyPoints, newKeyPoint]);
  };

  const handleRemove = (id: number) => {
    setKeyPoints((prevKeyPoints) => {
      const filteredPoints = prevKeyPoints.filter((item) => item.id !== id);
      return filteredPoints.map((item, index) => ({
        ...item,
        order: index + 1,
      }));
    });
  };

  const handleInputChange = (id: number, newValue: string) => {
    setKeyPoints((prevKeyPoints) =>
      prevKeyPoints.map((item) =>
        item.id === id ? { ...item, name: newValue } : item
      )
    );
  };

  const handleHeadlineChange = (html: string) => {
    setHeadline(html);
  };

  const isLoading = saveLoading || clearLoading;

  return (
    <>
      {isOverlayVisible && (
        <div
          ref={overlayRef}
          className="px-5 md:px-0 fixed top-0 bottom-0 left-0 right-0 z-50 transition duration-300 ease-in-out bg-glass-black backdrop-blur-sm overflow-x-hidden overflow-y-visible custom-scrollbar"
        >
          <div className="bg-white max-w-[520px] rounded-2xl shadow mx-auto mt-20 mb-[50vh] relative">
            <div className="flex items-center justify-between p-2 pr-4 pb-0">
              <button
                onClick={() => {
                  hideOverlay({ pageName, overlayName });
                }}
                type="button"
                disabled={isLoading}
                className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray disabled:hover:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft
                  size={20}
                  strokeWidth={2}
                  className="-ml-1 stroke-blue"
                />
                <span className="font-semibold text-sm text-blue">
                  Highlights
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
                    "relative h-9 w-max px-4 rounded-full overflow-hidden transition-colors text-white bg-neutral-700",
                    {
                      "bg-opacity-50": isLoading,
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
            <div className="p-5 space-y-8">
              <div className="space-y-3">
                <label className="text-xs text-gray">Headline</label>
                <div className="rounded-lg border shadow-sm">
                  <TipTapEditor
                    level="BASIC"
                    onUpdate={handleHeadlineChange}
                    initialContent={headline}
                    clearFlag={clearFlag}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray">Key points</label>
                  <button
                    onClick={handleAdd}
                    disabled={isLoading}
                    className="flex items-center gap-1 pl-2 pr-2.5 py-1.5 text-sm font-medium rounded-lg transition-colors hover:bg-lightgray disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                    Add point
                  </button>
                </div>
                <ReactSortable
                  list={keyPoints}
                  setList={(newState) => {
                    const updatedState = newState.map((item, index) => ({
                      ...item,
                      order: index + 1,
                    }));
                    setKeyPoints(updatedState);
                  }}
                  handle=".handle"
                  className="space-y-2"
                  disabled={isLoading}
                >
                  {keyPoints.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center p-1 bg-lightgray rounded-md"
                    >
                      <div className="handle cursor-grab p-2 text-neutral-400 hover:text-neutral-600">
                        <GripVertical size={20} />
                      </div>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          handleInputChange(item.id, e.target.value)
                        }
                        className="flex-1 px-3 py-2 bg-transparent text-gray-800 focus:outline-none disabled:opacity-50"
                        placeholder="Enter key point..."
                        disabled={isLoading}
                      />
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={isLoading}
                        className="p-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-all hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </ReactSortable>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// -- Type Definitions --

type DataType = {
  id: string;
  highlights: {
    headline: string;
    keyPoints: KeyPointsType[];
  };
};

type ItemType = {
  id: number;
  name: string;
  order: number;
};

type KeyPointsType = {
  text: string;
  index: number;
};
