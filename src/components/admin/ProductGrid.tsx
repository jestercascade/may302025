"use client";

import { NewProductEmptyGridButton } from "@/components/admin/NewProductOverlay";
import { ChevronLeft, ChevronRight, Copy, Check } from "lucide-react";
import { capitalizeFirstLetter, formatThousands } from "@/lib/utils/common";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAlertStore } from "@/zustand/shared/alertStore";

const PUBLISHED = "PUBLISHED";
const DRAFT = "DRAFT";
const HIDDEN = "HIDDEN";
const INACTIVE = "INACTIVE";
const ALL = "ALL";

export default function ProductGrid({ products }: { products: ProductType[] }) {
  const [filter, setFilter] = useState<string>(ALL);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageJumpValue, setPageJumpValue] = useState("1");
  const [isPageInRange, setIsPageInRange] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showAlert = useAlertStore((state) => state.showAlert);

  const copyProductId = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getFilteredProducts = (filter: string) => {
    if (filter === PUBLISHED) {
      return products.filter((product) => product.visibility.toUpperCase() === PUBLISHED);
    } else if (filter === INACTIVE) {
      return products.filter(
        (product) => product.visibility.toUpperCase() === HIDDEN || product.visibility.toUpperCase() === DRAFT
      );
    }
    return products;
  };

  const filteredProducts = getFilteredProducts(filter);

  const handleFilterChange = (newFilter: string) => {
    const newFilteredProducts = getFilteredProducts(newFilter);

    if (newFilteredProducts.length === 0) {
      showAlert({
        message: `${capitalizeFirstLetter(newFilter.toLowerCase())} filter has no products`,
      });
    } else {
      setFilter(newFilter);
      setPageJumpValue("1");
      setCurrentPage(1);
      setIsPageInRange(true);
    }
  };

  const pagination = (data: ProductType[], currentPage: number, rowsPerPage: number) => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedArray = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / rowsPerPage);

    return {
      paginatedArray,
      totalPages,
    };
  };

  const rowsPerPage = 16;
  const { paginatedArray: gridData, totalPages } = pagination(filteredProducts, currentPage, rowsPerPage);

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
    <div className="mx-auto px-5 md:px-0 md:w-[762px] lg:w-[1016px]">
      {products.length > 0 ? (
        <>
          <div className="w-full flex flex-col gap-3">
            <div className="w-full flex flex-col min-[588px]:flex-row gap-2 items-center justify-between">
              <div className="max-w-full flex flex-nowrap rounded-full bg-[#efefef] overflow-x-visible overflow-y-hidden invisible-scrollbar *:min-w-max *:h-9 *:rounded-full *:flex *:items-center *:justify-center *:font-semibold *:text-sm *:ease-in-out *:duration-300 *:transition">
                <button
                  onClick={() => handleFilterChange(ALL)}
                  className={`px-3 pl-[14px] h-9 hover:bg-[#e4e4e4] rounded-full ${
                    filter === ALL ? "text-blue" : "text-gray hover:text-black"
                  }`}
                >
                  View all ({products.length})
                </button>
                <button
                  onClick={() => handleFilterChange(PUBLISHED)}
                  className={`px-3 h-9 hover:bg-[#e4e4e4] rounded-full ${
                    filter === PUBLISHED ? "text-blue" : "text-gray hover:text-black"
                  }`}
                >
                  Published ({products.filter((product) => product.visibility.toUpperCase() === PUBLISHED).length})
                </button>
                <button
                  onClick={() => handleFilterChange(INACTIVE)}
                  className={`px-3 pr-[14px] h-9 hover:bg-[#e4e4e4] rounded-full ${
                    filter === INACTIVE ? "text-blue" : "text-gray hover:text-black"
                  }`}
                >
                  Inactive (
                  {
                    products.filter(
                      (product) =>
                        product.visibility.toUpperCase() === HIDDEN || product.visibility.toUpperCase() === DRAFT
                    ).length
                  }
                  )
                </button>
              </div>
            </div>
            <div className="w-full flex flex-wrap gap-5 justify-start">
              {gridData.map(({ id, name, pricing, images, slug }, index) => (
                <div
                  key={index}
                  className="group aspect-square w-[calc(50%-10px)] min-[560px]:w-[calc(33.33%-14px)] lg:w-[calc(25%-15px)] select-none"
                >
                  <Link href={`/admin/products/${slug}-${id}`}>
                    <div className="relative">
                      <div className="w-full aspect-square overflow-hidden flex items-center justify-center shadow-[2px_2px_4px_#9E9E9E] bg-white">
                        <Image src={images.main} alt={name} width={250} height={250} priority />
                      </div>
                      <div className="w-full h-full absolute top-0 bottom-0 left-0 right-0 ease-in-out duration-300 transition group-hover:bg-black/20"></div>
                    </div>
                  </Link>
                  <div className="mt-2 w-full flex items-center justify-between px-1">
                    <div>
                      {Number(pricing.salePrice) ? (
                        <div className="flex items-center gap-[6px]">
                          <div className="flex items-baseline">
                            <span className="text-[0.813rem] leading-3 font-semibold">$</span>
                            <span className="text-lg font-bold">{Math.floor(Number(pricing.salePrice))}</span>
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
                          <span className="text-lg font-bold">{Math.floor(Number(pricing.basePrice))}</span>
                          <span className="text-[0.813rem] leading-3 font-semibold">
                            {(Number(pricing.basePrice) % 1).toFixed(2).substring(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => copyProductId(e, id)}
                      className="p-1.5 rounded-md hover:bg-[#efefef] transition-colors"
                      title={`Copy Product ID: ${id}`}
                      aria-label="Copy product ID"
                    >
                      {copiedId === id ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} className="text-gray" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {filteredProducts.length > rowsPerPage && (
              <div className="mt-2">
                <div className="w-max mx-auto flex gap-1 h-9">
                  <button
                    onClick={handlePrevious}
                    className="w-9 h-9 flex items-center justify-center rounded-full ease-in-out duration-300 transition active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed"
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
                  <div className="flex items-center justify-center px-1 cursor-context-menu">of</div>
                  <button
                    onClick={jumpToLastPage}
                    className="w-9 h-9 flex items-center justify-center border rounded-full ease-in-out duration-300 transition bg-white active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed"
                  >
                    {totalPages}
                  </button>
                  <button
                    onClick={handleNext}
                    className="w-9 h-9 flex items-center justify-center rounded-full ease-in-out duration-300 transition active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed "
                  >
                    <ChevronRight strokeWidth={1.5} className="ml-[2px]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="w-full flex justify-center">
          <div className="text-center">
            <h2 className="font-semibold text-lg mb-2">No products yet</h2>
            <p className="text-sm mb-4">Click the button below to create your first one</p>
            <NewProductEmptyGridButton />
          </div>
        </div>
      )}
    </div>
  );
}
