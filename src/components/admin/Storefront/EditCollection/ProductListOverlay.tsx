"use client";

import { useState, useEffect } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import clsx from "clsx";
import Overlay from "@/ui/Overlay";
import { AddProductAction } from "@/actions/collections";
import Image from "next/image";
import {
  Pencil,
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { capitalizeFirstLetter, formatThousands } from "@/lib/utils/common";
import Link from "next/link";
import {
  RemoveProductButton,
  RemoveProductOverlay,
} from "./RemoveProductOverlay";
import {
  ChangeProductIndexButton,
  ChangeProductIndexOverlay,
} from "./ChangeProductIndexOverlay";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { ShowAlertType } from "@/lib/sharedTypes";
import { useBodyOverflowStore } from "@/zustand/shared/bodyOverflowStore";

type ProductWithIndex = ProductType & { index: number };

export function ProductListButton({ className }: { className: string }) {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.editCollection.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editCollection.overlays.productList.name
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

export function ProductListOverlay({
  data,
}: {
  data: { id: string; products: ProductWithIndex[] };
}) {
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
  const overlayName = useOverlayStore(
    (state) => state.pages.editCollection.overlays.productList.name
  );
  const isOverlayVisible = useOverlayStore(
    (state) => state.pages.editCollection.overlays.productList.isVisible
  );
  const setPreventBodyOverflowChange = useBodyOverflowStore(
    (state) => state.setPreventBodyOverflowChange
  );

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
  }, [isOverlayVisible]);

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
      return data.products.filter(
        (product) => product.visibility.toUpperCase() === PUBLISHED
      );
    } else if (filter === INACTIVE) {
      return data.products.filter(
        (product) =>
          product.visibility.toUpperCase() === HIDDEN ||
          product.visibility.toUpperCase() === DRAFT
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
        message: `${capitalizeFirstLetter(
          newFilter.toLowerCase()
        )} filter has no products`,
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

  const pagination = (
    data: ProductWithIndex[],
    currentPage: number,
    rowsPerPage: number
  ) => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedArray = data.slice(startIndex, endIndex);

    return {
      paginatedArray,
      totalPages,
    };
  };

  const { paginatedArray: tableData } = pagination(
    filteredProducts,
    currentPage,
    rowsPerPage
  );

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
          <div className="md:mx-auto md:mt-20 md:mb-[50vh] md:px-5 lg:p-0">
            <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] mx-auto ease-in-out duration-300 transition overflow-hidden md:overflow-visible rounded-t-3xl bg-white md:w-full md:max-w-[800px] md:rounded-2xl md:shadow md:h-max md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
              <div className="w-full">
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
                    <ArrowLeft
                      size={20}
                      strokeWidth={2}
                      className="-ml-1 stroke-blue"
                    />
                    <span className="font-semibold text-sm text-blue">
                      Products
                    </span>
                  </button>
                </div>
                {tableData.length > 0 ? (
                  <div className="w-full h-full mt-[52px] md:mt-0 p-5 flex flex-col gap-2 overflow-x-hidden overflow-y-visible invisible-scrollbar md:overflow-hidden">
                    <div className="w-full flex flex-col min-[588px]:flex-row gap-2 items-center justify-between">
                      <div className="max-w-full flex flex-nowrap rounded-full bg-lightgray overflow-x-visible overflow-y-hidden invisible-scrollbar *:min-w-max *:h-9 *:rounded-full *:flex *:items-center *:justify-center *:font-semibold *:text-sm *:ease-in-out *:duration-300 *:transition">
                        <button
                          onClick={() => handleFilterChange(ALL)}
                          className={`px-3 pl-[14px] h-9 hover:bg-lightgray-dimmed rounded-full ${
                            filter === ALL
                              ? "text-blue"
                              : "text-gray hover:text-black"
                          }`}
                        >
                          View all ({data.products.length})
                        </button>
                        <button
                          onClick={() => handleFilterChange(PUBLISHED)}
                          className={`px-3 h-9 hover:bg-lightgray-dimmed rounded-full ${
                            filter === PUBLISHED
                              ? "text-blue"
                              : "text-gray hover:text-black"
                          }`}
                        >
                          Published (
                          {
                            data.products.filter(
                              (product) =>
                                product.visibility.toUpperCase() === PUBLISHED
                            ).length
                          }
                          )
                        </button>
                        <button
                          onClick={() => handleFilterChange(INACTIVE)}
                          className={`px-3 pr-[14px] h-9 hover:bg-lightgray-dimmed rounded-full ${
                            filter === INACTIVE
                              ? "text-blue"
                              : "text-gray hover:text-black"
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
                    {tableData.length > 0 && (
                      <div className="hidden lg:block rounded-xl bg-white border overflow-hidden">
                        <div className="overflow-auto custom-x-scrollbar">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="p-4 text-left text-xs font-medium text-gray uppercase tracking-wider">
                                  #
                                </th>
                                <th className="p-2 text-left text-xs font-medium text-gray uppercase tracking-wider">
                                  Main image
                                </th>
                                <th className="p-4 text-left text-xs font-medium text-gray uppercase tracking-wider w-40">
                                  Name
                                </th>
                                <th className="p-4 text-left text-xs font-medium text-gray uppercase tracking-wider w-32">
                                  Price
                                </th>
                                <th className="p-4 text-left text-xs font-medium text-gray uppercase tracking-wider w-32">
                                  Visibility
                                </th>
                                <th className="p-4 text-left text-xs font-medium text-gray uppercase tracking-wider"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {tableData.map(
                                ({
                                  id,
                                  index,
                                  slug,
                                  images,
                                  name,
                                  pricing,
                                  visibility,
                                }) => (
                                  <tr
                                    key={id}
                                    className="group border-b last:border-b-0 hover:bg-[#ffcc001a] transition-colors"
                                  >
                                    <td className="p-4 pr-0 font-medium">
                                      {index}
                                    </td>
                                    <td className="p-2">
                                      <div className="h-[120px] w-[120px] overflow-hidden flex items-center justify-center">
                                        <Image
                                          src={images.main}
                                          alt={name}
                                          width={120}
                                          height={120}
                                          priority
                                        />
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <p className="font-medium line-clamp-2">
                                        {name}
                                      </p>
                                    </td>
                                    <td className="p-4">
                                      <div className="w-max flex items-center justify-center">
                                        {Number(pricing.salePrice) ? (
                                          <div className="flex items-center gap-[6px]">
                                            <div className="flex items-baseline">
                                              <span className="text-[0.813rem] leading-3 font-semibold">
                                                $
                                              </span>
                                              <span className="text-lg font-bold">
                                                {Math.floor(
                                                  Number(pricing.salePrice)
                                                )}
                                              </span>
                                              <span className="text-[0.813rem] leading-3 font-semibold">
                                                {(Number(pricing.salePrice) % 1)
                                                  .toFixed(2)
                                                  .substring(1)}
                                              </span>
                                            </div>
                                            <span className="text-[0.813rem] leading-3 text-gray line-through">
                                              $
                                              {formatThousands(
                                                Number(pricing.basePrice)
                                              )}
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="flex items-baseline">
                                            <span className="text-[0.813rem] leading-3 font-semibold">
                                              $
                                            </span>
                                            <span className="text-lg font-bold">
                                              {Math.floor(
                                                Number(pricing.basePrice)
                                              )}
                                            </span>
                                            <span className="text-[0.813rem] leading-3 font-semibold">
                                              {(Number(pricing.basePrice) % 1)
                                                .toFixed(2)
                                                .substring(1)}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <span
                                        className={clsx(
                                          "inline-flex px-3 py-1 rounded-full text-sm font-medium",
                                          visibility === "PUBLISHED"
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-gray-100"
                                        )}
                                      >
                                        {capitalizeFirstLetter(
                                          visibility.toLowerCase()
                                        )}
                                      </span>
                                    </td>
                                    <td className="p-4">
                                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link
                                          href={`/admin/products/${slug}-${id}`}
                                          className="h-9 w-9 rounded-full flex items-center justify-center"
                                        >
                                          <Pencil
                                            size={18}
                                            strokeWidth={1.75}
                                          />
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
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {filteredProducts.length > rowsPerPage && (
                      <div className="mt-2">
                        <div className="w-max mx-auto flex gap-1 h-9">
                          <button
                            onClick={handlePrevious}
                            className="w-9 h-9 flex items-center justify-center rounded-full ease-in-out duration-300 transition active:bg-lightgray lg:hover:bg-lightgray"
                          >
                            <ChevronLeft
                              strokeWidth={1.5}
                              className="mr-[2px]"
                            />
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
                          <div className="flex items-center justify-center px-1 cursor-context-menu">
                            of
                          </div>
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
                            <ChevronRight
                              strokeWidth={1.5}
                              className="ml-[2px]"
                            />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-4 items-center mt-[52px] md:mt-0 px-5 pt-5 pb-28 md:pb-[90px]">
                    <div className="flex flex-col gap-2 items-center">
                      <h2 className="font-semibold text-lg">
                        Collection is empty
                      </h2>
                      <p className="text-sm text-center">
                        Enter ID below for your first product
                      </p>
                    </div>
                    <div className="w-full min-[588px]:w-56 h-9 rounded-full overflow-hidden flex items-center border shadow-sm">
                      <input
                        type="text"
                        value={productId}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Paste ID"
                        className="h-full w-full pl-4 bg-transparent"
                      />
                      <div className="h-full flex items-center justify-center">
                        <button
                          onClick={addProduct}
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
      <RemoveProductOverlay collectionId={data.id} />
      <ChangeProductIndexOverlay />
    </>
  );
}
