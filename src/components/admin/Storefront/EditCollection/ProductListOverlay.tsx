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
  // const rowsPerPage = 12;
  const rowsPerPage = 2;

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
            {/* <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] mx-auto ease-in-out duration-500 transition-all overflow-hidden rounded-t-[20px] bg-white backdrop-blur-xl border-t border-gray-200/50 md:overflow-visible md:w-full md:max-w-[900px] md:rounded-[16px] md:shadow-2xl md:shadow-black/10 md:h-max md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0 md:border md:border-gray-300/60"> */}
            <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] mx-auto ease-in-out duration-300 transition overflow-hidden md:overflow-visible rounded-t-3xl bg-white md:w-full md:max-w-[800px] md:rounded-2xl md:shadow md:h-max md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
              <div className="w-full h-full flex flex-col">
                <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                  <div className="relative flex justify-center items-center w-full h-7">
                    <h2 className="font-semibold text-lg">Products</h2>
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
                    <ArrowLeft size={20} strokeWidth={2} className="-ml-1 stroke-blue" />
                    <span className="font-semibold text-sm text-blue">Products</span>
                  </button>
                </div>
                {tableData.length > 0 ? (
                  <div className="flex-1 min-h-0 p-6 flex flex-col gap-5 overflow-y-auto md:overflow-hidden">
                    <div className="w-full flex flex-col min-[588px]:flex-row gap-4 items-center justify-between flex-shrink-0">
                      <div className="max-w-full flex flex-nowrap rounded-full bg-lightgray overflow-x-visible overflow-y-hidden invisible-scrollbar *:min-w-max *:h-9 *:rounded-full *:flex *:items-center *:justify-center *:font-semibold *:text-sm *:ease-in-out *:duration-300 *:transition">
                        <button
                          onClick={() => handleFilterChange(ALL)}
                          className={`px-3 pl-[14px] h-9 hover:bg-lightgray-dimmed rounded-full ${
                            filter === ALL ? "text-blue" : "text-gray hover:text-black"
                          }`}
                        >
                          View all ({data.products.length})
                        </button>
                        <button
                          onClick={() => handleFilterChange(PUBLISHED)}
                          className={`px-3 h-9 hover:bg-lightgray-dimmed rounded-full ${
                            filter === PUBLISHED ? "text-blue" : "text-gray hover:text-black"
                          }`}
                        >
                          Published (
                          {data.products.filter((product) => product.visibility.toUpperCase() === PUBLISHED).length})
                        </button>
                        <button
                          onClick={() => handleFilterChange(INACTIVE)}
                          className={`px-3 pr-[14px] h-9 hover:bg-lightgray-dimmed rounded-full ${
                            filter === INACTIVE ? "text-blue" : "text-gray hover:text-black"
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
                      <div className="w-full min-[588px]:w-56 h-9 rounded-full overflow-hidden flex items-center border">
                        <input
                          type="text"
                          value={productId}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyDown}
                          placeholder="Paste ID (#12345)"
                          className="h-full w-full pl-4 bg-transparent"
                        />
                        <div className="h-full flex items-center justify-center">
                          <button
                            onClick={addProduct}
                            disabled={loading}
                            className={clsx(
                              "w-11 h-9 rounded-full flex items-center justify-center transition duration-300 ease-in-out",
                              {
                                "active:bg-lightgray lg:hover:bg-lightgray": !loading,
                              }
                            )}
                          >
                            {loading ? (
                              <Spinner color="gray" />
                            ) : (
                              <Plus strokeWidth={1.75} size={22} className="text-gray" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    {tableData.length > 0 && (
                      <div className="rounded-xl bg-white/90 backdrop-blur-sm border overflow-hidden flex-shrink-0 shadow-sm">
                        <div className="overflow-x-auto custom-x-scrollbar">
                          <table className="w-full text-sm min-w-[600px] relative">
                            <thead>
                              <tr className="border-b">
                                <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider">
                                  #
                                </th>
                                <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider sticky left-0 z-10 border-b">
                                  Main image
                                </th>
                                <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider w-40">
                                  Name
                                </th>
                                <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider w-32">
                                  Price
                                </th>
                                <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider w-32">
                                  Visibility
                                </th>
                                <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {tableData.map(({ id, index, slug, images, name, pricing, visibility }) => (
                                <tr
                                  key={id}
                                  className="group border-b last:border-b-0 hover:bg-[#ffcc001a] transition-colors"
                                >
                                  <td className="p-4 pr-0 font-semibold text-sm">{index}</td>
                                  <td className="p-3 sticky left-0 bg-white z-10 group-hover:bg-transparent transition-colors">
                                    <div className="h-[100px] w-[100px] overflow-hidden flex items-center justify-center rounded-[12px] bg-gray-50/80 border border-gray-100/60">
                                      <Image src={images.main} alt={name} width={100} height={100} priority />
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <p className="font-medium line-clamp-2 text-sm">{name}</p>
                                  </td>
                                  <td className="p-4">
                                    <div className="w-max flex items-center justify-center">
                                      {Number(pricing.salePrice) ? (
                                        <div className="flex items-center gap-[6px]">
                                          <div className="flex items-baseline">
                                            <span className="text-[0.813rem] leading-3 font-semibold">$</span>
                                            <span className="text-lg font-bold">
                                              {Math.floor(Number(pricing.salePrice))}
                                            </span>
                                            <span className="text-[0.813rem] leading-3 font-semibold">
                                              {(Number(pricing.salePrice) % 1).toFixed(2).substring(1)}
                                            </span>
                                          </div>
                                          <span className="text-[0.813rem] leading-3 text-gray line-through">
                                            ${formatThousands(Number(pricing.basePrice))}
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="flex items-baseline">
                                          <span className="text-[0.813rem] leading-3 font-semibold">$</span>
                                          <span className="text-lg font-bold">
                                            {Math.floor(Number(pricing.basePrice))}
                                          </span>
                                          <span className="text-[0.813rem] leading-3 font-semibold">
                                            {(Number(pricing.basePrice) % 1).toFixed(2).substring(1)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <span
                                      className={clsx(
                                        "inline-flex px-2.5 py-0.5 rounded-full text-sm font-medium",
                                        visibility === "PUBLISHED"
                                          ? "bg-green-100/80 text-green-700 border border-green-200/60"
                                          : "bg-gray-100/80 text-gray border border-gray-200/60"
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
                                        className="h-9 w-9 rounded-full flex items-center justify-center"
                                      >
                                        <Pencil size={18} strokeWidth={1.75} />
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
                            className="w-9 h-9 flex items-center justify-center rounded-full ease-in-out duration-300 transition active:bg-lightgray lg:hover:bg-lightgray"
                          >
                            <ChevronLeft strokeWidth={1.5} className="mr-[2px]" />
                          </button>
                          <input
                            value={pageJumpValue}
                            onChange={pageJumpInputChange}
                            onKeyDown={pageJumpEnterKey}
                            type="text"
                            className={clsx(
                              "min-w-[36px] max-w-[36px] h-9 px-1 text-center border cursor-text outline-none rounded-full bg-white",
                              {
                                "border-red": !isPageInRange,
                              }
                            )}
                          />
                          <div className="flex items-center justify-center px-1 cursor-context-menu -mt-0.5">of</div>
                          <button
                            onClick={jumpToLastPage}
                            className="w-9 h-9 flex items-center justify-center border rounded-full ease-in-out duration-300 transition active:bg-lightgray lg:hover:bg-lightgray"
                          >
                            {totalPages}
                          </button>
                          <button
                            onClick={handleNext}
                            className="w-9 h-9 flex items-center justify-center rounded-full ease-in-out duration-300 transition bg-white active:bg-lightgray lg:hover:bg-lightgray "
                          >
                            <ChevronRight strokeWidth={1.5} className="ml-[2px]" />
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
                      <p className="text-sm text-gray-600 tracking-[-0.011em] leading-5">
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
                            "w-10 h-10 rounded-md flex items-center justify-center transition-all duration-200 ease-out",
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
