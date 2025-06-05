"use client";

import { useState, useEffect } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import clsx from "clsx";
import Overlay from "@/ui/Overlay";
import { AddProductAction } from "@/actions/collections";
import Image from "next/image";
import { Pencil, ArrowLeft, X, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { capitalizeFirstLetter, formatThousands } from "@/lib/utils/common";
import Link from "next/link";
import { RemoveProductButton, RemoveProductOverlay } from "./RemoveProductOverlay";
import { ChangeProductIndexButton, ChangeProductIndexOverlay } from "./ChangeProductIndexOverlay";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { ShowAlertType } from "@/lib/sharedTypes";
import { useBodyOverflowStore } from "@/zustand/shared/bodyOverflowStore";

type ProductWithIndex = ProductType & { index: number };

export function ProductListButton({ className }: { className: string }) {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.editCollection.name);
  const overlayName = useOverlayStore((state) => state.pages.editCollection.overlays.productList.name);

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

export function ProductListOverlay({ data }: { data: { id: string; products: ProductWithIndex[] } }) {
  const PUBLISHED = "PUBLISHED";
  const DRAFT = "DRAFT";
  const HIDDEN = "HIDDEN";
  const INACTIVE = "INACTIVE";
  const ALL = "ALL";
  const rowsPerPage = 12;

  const [loading, setLoading] = useState<boolean>(false);
  const [productId, setProductId] = useState("");
  const [filter, setFilter] = useState<string>(ALL);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageJumpValue, setPageJumpValue] = useState("1");
  const [isPageInRange, setIsPageInRange] = useState(true);

  const showAlert = useAlertStore((state) => state.showAlert);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.editCollection.name);
  const overlayName = useOverlayStore((state) => state.pages.editCollection.overlays.productList.name);
  const isOverlayVisible = useOverlayStore((state) => state.pages.editCollection.overlays.productList.isVisible);
  const setPreventBodyOverflowChange = useBodyOverflowStore((state) => state.setPreventBodyOverflowChange);

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

  const onHideOverlay = () => {
    setLoading(false);
    hideOverlay({ pageName, overlayName });
    setFilter(ALL);
    setPageJumpValue("1");
    setCurrentPage(1);
    setIsPageInRange(true);
    setProductId("");
  };

  const addProduct = async () => {
    if (!productId.trim()) {
      showAlert({
        message: "Product ID cannot be empty",
        type: ShowAlertType.ERROR,
      });
      setPreventBodyOverflowChange(true);
      return;
    } else if (!/^\d{5}$/.test(productId.trim())) {
      showAlert({
        message: "Product ID must be a 5-digit number",
        type: ShowAlertType.ERROR,
      });
      setPreventBodyOverflowChange(true);
      return;
    }

    setLoading(true);

    try {
      const result = await AddProductAction({
        collectionId: data.id,
        productId,
      });
      showAlert({
        message: result.message,
        type: result.type,
      });
      setProductId("");
    } catch (error) {
      console.error("Error adding product:", error);
      showAlert({
        message: "Failed to add product",
        type: ShowAlertType.ERROR,
      });
    } finally {
      setLoading(false);
      setPageJumpValue("1");
      setCurrentPage(1);
      setIsPageInRange(true);
      setPreventBodyOverflowChange(true);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setProductId(value);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      addProduct();
    }
  };

  const getFilteredProducts = (filter: string) => {
    if (filter === PUBLISHED) {
      return data.products.filter((product) => product.visibility.toUpperCase() === PUBLISHED);
    } else if (filter === INACTIVE) {
      return data.products.filter(
        (product) => product.visibility.toUpperCase() === HIDDEN || product.visibility.toUpperCase() === DRAFT
      );
    }
    return data.products;
  };

  const filteredProducts = getFilteredProducts(filter);
  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
      setPageJumpValue(totalPages.toString());
    }
  }, [filteredProducts.length, currentPage, totalPages]);

  const handleFilterChange = (newFilter: string) => {
    const newFilteredProducts = getFilteredProducts(newFilter);

    if (newFilteredProducts.length === 0) {
      showAlert({
        message: `${capitalizeFirstLetter(newFilter.toLowerCase())} filter has no products`,
        type: ShowAlertType.NEUTRAL,
      });
      setPreventBodyOverflowChange(true);
    } else {
      setFilter(newFilter);
      setPageJumpValue("1");
      setCurrentPage(1);
      setIsPageInRange(true);
    }
  };

  const pagination = (data: ProductWithIndex[], currentPage: number, rowsPerPage: number) => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedArray = data.slice(startIndex, endIndex);

    return {
      paginatedArray,
      totalPages,
    };
  };

  const { paginatedArray: tableData } = pagination(filteredProducts, currentPage, rowsPerPage);

  const handlePrevious = () => {
    setCurrentPage((prevPage) => {
      const value = Math.max(prevPage - 1, 1);
      setPageJumpValue(String(value));
      return value;
    });
    setIsPageInRange(true);
  };

  const handleNext = () => {
    setCurrentPage((prevPage) => {
      const value = Math.min(prevPage + 1, totalPages);
      setPageJumpValue(String(value));
      return value;
    });
    setIsPageInRange(true);
  };

  const jumpToLastPage = () => {
    setPageJumpValue(String(totalPages));
    setCurrentPage(totalPages);
    setIsPageInRange(true);
  };

  const jumpToPage = () => {
    const page = parseInt(pageJumpValue, 10);

    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setIsPageInRange(true);
    } else {
      setIsPageInRange(false);
    }
  };

  const pageJumpEnterKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      jumpToPage();
    }
  };

  const pageJumpInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setPageJumpValue(value);
    }
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="md:mx-auto md:mt-16 md:mb-[50vh] md:px-6 lg:p-0">
            <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] mx-auto ease-in-out duration-500 transition-all overflow-hidden rounded-t-[20px] bg-white/95 backdrop-blur-xl border-t border-gray-200/50 md:overflow-visible md:w-full md:max-w-[900px] md:rounded-[16px] md:shadow-2xl md:shadow-black/10 md:h-max md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0 md:border md:border-gray-300/60">
              <div className="w-full h-full flex flex-col">
                <div className="md:hidden flex items-end justify-center pt-5 pb-3 flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-gray-200">
                  <div className="relative flex justify-center items-center w-full h-8">
                    <h2 className="font-semibold text-[17px] text-gray-900 tracking-[-0.022em]">Products</h2>
                    <button
                      onClick={onHideOverlay}
                      type="button"
                      className="w-8 h-8 rounded-full flex items-center justify-center absolute right-4 transition-all duration-200 ease-out bg-gray-200 hover:bg-gray-300 active:scale-95"
                    >
                      <X color="#4b5563" size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
                <div className="hidden md:flex md:items-center md:justify-between py-4 pr-5 pl-4 flex-shrink-0 border-b border-gray-200">
                  <button
                    onClick={onHideOverlay}
                    type="button"
                    className="h-10 px-4 rounded-[10px] flex items-center gap-2 transition-all duration-200 ease-out hover:bg-gray-100 active:scale-98"
                  >
                    <ArrowLeft size={18} strokeWidth={2.5} className="stroke-blue-600" />
                    <span className="font-medium text-[15px] text-blue-600 tracking-[-0.011em]">Products</span>
                  </button>
                </div>
                {tableData.length > 0 ? (
                  <div className="flex-1 min-h-0 p-6 flex flex-col gap-5 overflow-y-auto md:overflow-hidden">
                    <div className="w-full flex flex-col min-[588px]:flex-row gap-4 items-center justify-between flex-shrink-0">
                      <div className="max-w-full flex flex-nowrap rounded-[12px] bg-gray-200 p-1 overflow-x-visible overflow-y-hidden invisible-scrollbar">
                        <button
                          onClick={() => handleFilterChange(ALL)}
                          className={`px-4 h-8 rounded-[8px] flex items-center justify-center font-medium text-[14px] ease-out duration-200 transition-all tracking-[-0.006em] whitespace-nowrap ${
                            filter === ALL
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-700 hover:text-gray-900 hover:bg-white/70"
                          }`}
                        >
                          View all ({data.products.length})
                        </button>
                        <button
                          onClick={() => handleFilterChange(PUBLISHED)}
                          className={`px-4 h-8 rounded-[8px] flex items-center justify-center font-medium text-[14px] ease-out duration-200 transition-all tracking-[-0.006em] whitespace-nowrap ${
                            filter === PUBLISHED
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-700 hover:text-gray-900 hover:bg-white/70"
                          }`}
                        >
                          Published (
                          {data.products.filter((product) => product.visibility.toUpperCase() === PUBLISHED).length})
                        </button>
                        <button
                          onClick={() => handleFilterChange(INACTIVE)}
                          className={`px-4 h-8 rounded-[8px] flex items-center justify-center font-medium text-[14px] ease-out duration-200 transition-all tracking-[-0.006em] whitespace-nowrap ${
                            filter === INACTIVE
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-700 hover:text-gray-900 hover:bg-white/70"
                          }`}
                        >
                          Inactive (
                          {
                            data.products.filter(
                              (product) =>
                                product.visibility.toUpperCase() === HIDDEN ||
                                product.visibility.toUpperCase() === DRAFT
                            ).length
                          }
                          )
                        </button>
                      </div>
                      <div className="w-full min-[588px]:w-64 h-10 rounded-[10px] overflow-hidden flex items-center border border-gray-300 bg-white hover:border-gray-400 focus-within:border-blue-500 transition-all duration-200">
                        <input
                          type="text"
                          value={productId}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyDown}
                          placeholder="Paste ID (#12345)"
                          className="h-full w-full pl-4 bg-transparent text-[15px] placeholder-gray-500 outline-none tracking-[-0.011em]"
                        />
                        <div className="h-full flex items-center justify-center pr-1">
                          <button
                            onClick={addProduct}
                            disabled={loading}
                            className={clsx(
                              "w-8 h-8 rounded-[8px] flex items-center justify-center transition-all duration-200 ease-out",
                              {
                                "hover:bg-gray-100 active:scale-95": !loading,
                              }
                            )}
                          >
                            {loading ? (
                              <Spinner color="gray" />
                            ) : (
                              <Plus strokeWidth={2} size={18} className="text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    {tableData.length > 0 && (
                      <div className="rounded-[14px] bg-white/90 backdrop-blur-sm border border-gray-200/40 overflow-hidden flex-shrink-0 shadow-sm">
                        <div className="overflow-x-auto custom-x-scrollbar">
                          <table className="w-full text-sm min-w-[600px] relative">
                            <thead>
                              <tr className="border-b border-gray-100/80 bg-gray-50/60">
                                <th className="p-4 text-left text-[13px] font-semibold text-gray-700 uppercase tracking-[0.5px]">
                                  #
                                </th>
                                <th className="p-3 text-left text-[13px] font-semibold text-gray-700 uppercase tracking-[0.5px] sticky left-0 bg-gray-50/90 backdrop-blur-sm z-10 border-r border-gray-100/80">
                                  Main image
                                </th>
                                <th className="p-4 text-left text-[13px] font-semibold text-gray-700 uppercase tracking-[0.5px] w-40">
                                  Name
                                </th>
                                <th className="p-4 text-left text-[13px] font-semibold text-gray-700 uppercase tracking-[0.5px] w-32">
                                  Price
                                </th>
                                <th className="p-4 text-left text-[13px] font-semibold text-gray-700 uppercase tracking-[0.5px] w-32">
                                  Visibility
                                </th>
                                <th className="p-4 text-left text-[13px] font-semibold text-gray-700 uppercase tracking-[0.5px]"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {tableData.map(({ id, index, slug, images, name, pricing, visibility }) => (
                                <tr
                                  key={id}
                                  className="group border-b border-gray-50/80 last:border-b-0 hover:bg-blue-50/30 transition-all duration-200 ease-out"
                                >
                                  <td className="p-4 pr-0 font-semibold text-gray-800 text-[15px] tracking-[-0.011em]">
                                    {index}
                                  </td>
                                  <td className="p-3 sticky left-0 bg-white/95 backdrop-blur-sm z-10 border-r border-gray-50/80 group-hover:bg-blue-50/40">
                                    <div className="h-[100px] w-[100px] overflow-hidden flex items-center justify-center rounded-[12px] bg-gray-50/80 border border-gray-100/60">
                                      <Image
                                        src={images.main}
                                        alt={name}
                                        width={100}
                                        height={100}
                                        priority
                                        className="object-cover"
                                      />
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <p className="font-medium line-clamp-2 text-gray-900 text-[15px] tracking-[-0.011em] leading-5">
                                      {name}
                                    </p>
                                  </td>
                                  <td className="p-4">
                                    <div className="w-max flex items-center justify-center">
                                      {Number(pricing.salePrice) ? (
                                        <div className="flex items-center gap-2">
                                          <div className="flex items-baseline">
                                            <span className="text-[13px] leading-3 font-semibold text-gray-900">$</span>
                                            <span className="text-[17px] font-bold text-gray-900 tracking-[-0.022em]">
                                              {Math.floor(Number(pricing.salePrice))}
                                            </span>
                                            <span className="text-[13px] leading-3 font-semibold text-gray-900">
                                              {(Number(pricing.salePrice) % 1).toFixed(2).substring(1)}
                                            </span>
                                          </div>
                                          <span className="text-[13px] leading-3 text-gray-500 line-through">
                                            ${formatThousands(Number(pricing.basePrice))}
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="flex items-baseline">
                                          <span className="text-[13px] leading-3 font-semibold text-gray-900">$</span>
                                          <span className="text-[17px] font-bold text-gray-900 tracking-[-0.022em]">
                                            {Math.floor(Number(pricing.basePrice))}
                                          </span>
                                          <span className="text-[13px] leading-3 font-semibold text-gray-900">
                                            {(Number(pricing.basePrice) % 1).toFixed(2).substring(1)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <span
                                      className={clsx(
                                        "inline-flex px-3 py-1.5 rounded-[8px] text-[13px] font-semibold tracking-[-0.006em]",
                                        visibility === "PUBLISHED"
                                          ? "bg-green-100/80 text-green-800 border border-green-200/60"
                                          : "bg-gray-100/80 text-gray-700 border border-gray-200/60"
                                      )}
                                    >
                                      {capitalizeFirstLetter(visibility.toLowerCase())}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out">
                                      <Link
                                        href={`/admin/products/${slug}-${id}`}
                                        target="_blank"
                                        className="h-8 w-8 rounded-[8px] flex items-center justify-center hover:bg-gray-100/70 transition-all duration-200 ease-out active:scale-95"
                                      >
                                        <Pencil size={16} strokeWidth={2} className="text-gray-600" />
                                      </Link>
                                      <ChangeProductIndexButton
                                        collectionId={data.id}
                                        product={{
                                          id,
                                          name,
                                          index,
                                        }}
                                      />
                                      <RemoveProductButton id={id} />
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {filteredProducts.length > rowsPerPage && (
                      <div className="mt-3 flex-shrink-0">
                        <div className="w-max mx-auto flex gap-2 h-10">
                          <button
                            onClick={handlePrevious}
                            className="w-10 h-10 flex items-center justify-center rounded-[10px] ease-out duration-200 transition-all hover:bg-gray-100/70 active:scale-95 border border-gray-200/60"
                          >
                            <ChevronLeft strokeWidth={2} size={18} className="mr-[1px] text-gray-600" />
                          </button>
                          <input
                            value={pageJumpValue}
                            onChange={pageJumpInputChange}
                            onKeyDown={pageJumpEnterKey}
                            type="text"
                            className={clsx(
                              "min-w-[40px] max-w-[40px] h-10 px-2 text-center border cursor-text outline-none rounded-[10px] bg-white/80 backdrop-blur-sm text-[15px] font-medium tracking-[-0.011em] transition-all duration-200",
                              {
                                "border-red-400 focus:border-red-500": !isPageInRange,
                                "border-gray-200/60 focus:border-blue-500": isPageInRange,
                              }
                            )}
                          />
                          <div className="flex items-center justify-center px-2 cursor-context-menu text-[14px] text-gray-600 font-medium">
                            of
                          </div>
                          <button
                            onClick={jumpToLastPage}
                            className="w-10 h-10 flex items-center justify-center border border-gray-200/60 rounded-[10px] ease-out duration-200 transition-all hover:bg-gray-100/70 active:scale-95 text-[15px] font-medium text-gray-700 tracking-[-0.011em]"
                          >
                            {totalPages}
                          </button>
                          <button
                            onClick={handleNext}
                            className="w-10 h-10 flex items-center justify-center rounded-[10px] ease-out duration-200 transition-all bg-white/80 backdrop-blur-sm hover:bg-gray-100/70 active:scale-95 border border-gray-200/60"
                          >
                            <ChevronRight strokeWidth={2} size={18} className="ml-[1px] text-gray-600" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 min-h-0 w-full flex flex-col gap-6 items-center px-6 pt-8 pb-32 md:pb-[120px] overflow-y-auto invisible-scrollbar">
                    <div className="flex flex-col gap-3 items-center max-w-sm text-center">
                      <h2 className="font-semibold text-[20px] text-gray-900 tracking-[-0.022em]">
                        Collection is empty
                      </h2>
                      <p className="text-[15px] text-gray-600 tracking-[-0.011em] leading-5">
                        Enter a product ID below to add your first item to this collection
                      </p>
                    </div>
                    <div className="w-full min-[588px]:w-72 h-12 rounded-[12px] overflow-hidden flex items-center border border-gray-200/60 shadow-sm bg-white/80 backdrop-blur-sm hover:border-gray-300/80 focus-within:border-blue-500 transition-all duration-200">
                      <input
                        type="text"
                        value={productId}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Paste ID"
                        className="h-full w-full pl-5 bg-transparent text-[16px] placeholder-gray-500 outline-none tracking-[-0.011em]"
                      />
                      <div className="h-full flex items-center justify-center pr-2">
                        <button
                          onClick={addProduct}
                          disabled={loading}
                          className={clsx(
                            "w-10 h-10 rounded-[10px] flex items-center justify-center transition-all duration-200 ease-out",
                            {
                              "hover:bg-gray-100/70 active:scale-95": !loading,
                            }
                          )}
                        >
                          {loading ? (
                            <Spinner color="gray" />
                          ) : (
                            <Plus strokeWidth={2} size={20} className="text-gray-600" />
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
      <RemoveProductOverlay collectionId={data.id} />
      <ChangeProductIndexOverlay />
    </>
  );
}
