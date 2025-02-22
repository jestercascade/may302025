"use client";

import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { capitalizeFirstLetter } from "@/lib/utils/common";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";

export default function OrdersTable({
  orders,
}: {
  orders: OrderType[] | null;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageJumpValue, setPageJumpValue] = useState("1");
  const [isPageInRange, setIsPageInRange] = useState(true);

  const pagination = (
    data: OrderType[] | null,
    currentPage: number,
    rowsPerPage: number
  ) => {
    if (!data || data.length === 0) {
      return {
        paginatedArray: [],
        totalPages: 0,
      };
    }

    // Sort orders by timestamp in descending order (latest first)
    const sortedData = [...data].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedArray = sortedData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / rowsPerPage);

    return {
      paginatedArray,
      totalPages,
    };
  };

  const rowsPerPage = 5;
  const { paginatedArray: tableData, totalPages } = pagination(
    orders || [],
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

  const jumpToPage = () => {
    const page = parseInt(pageJumpValue, 10);

    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setIsPageInRange(true);
    } else {
      setIsPageInRange(false);
    }
  };

  const pageJumpEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      jumpToPage();
    }
  };

  const pageJumpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setPageJumpValue(value);
    }
  };

  const jumpToLastPage = () => {
    setPageJumpValue(String(totalPages));
    setCurrentPage(totalPages);
    setIsPageInRange(true);
  };

  const formatDate = (
    dateString: string,
    timeZone = "Europe/Athens"
  ): string => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone,
    });
  };

  const formatTime = (
    dateString: string,
    timeZone = "Europe/Athens"
  ): string => {
    if (typeof window === "undefined") {
      return "";
    }

    const date = new Date(dateString);
    return date
      .toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone,
      })
      .replace("24:", "00:");
  };

  return (
    <>
      {tableData.length > 0 ? (
        <div className="space-y-5">
          {/* Desktop View */}
          <div className="hidden lg:block rounded-xl bg-white border overflow-hidden">
            <div className="overflow-auto custom-x-scrollbar">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider">
                      Date
                    </th>
                    <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider">
                      Time
                    </th>
                    <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider">
                      Status
                    </th>
                    <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider">
                      Total
                    </th>
                    <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider">
                      Country
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map(
                    ({ id, timestamp, payer, amount, shipping, status }) => {
                      return (
                        <tr
                          key={id}
                          className="group border-b last:border-b-0 hover:bg-gray-50/80 transition-colors"
                        >
                          <td className="px-4 py-4">
                            <Link
                              href={`/admin/orders/${id}`}
                              className="w-max font-medium line-clamp-2 text-blue hover:underline"
                            >
                              {payer.name.firstName} {payer.name.lastName}
                            </Link>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-medium line-clamp-2">
                              {formatDate(timestamp)}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-medium line-clamp-2">
                              {formatTime(timestamp)}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={clsx(
                                "inline-flex px-3 py-1 rounded-full text-sm font-medium",
                                status.toUpperCase() === "COMPLETED"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100"
                              )}
                            >
                              {capitalizeFirstLetter(status.toLowerCase())}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-medium line-clamp-2">
                              ${amount.value}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-medium line-clamp-2">
                              {shipping.address.country}
                            </p>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {orders && orders.length > rowsPerPage && (
            <div className="w-max mx-auto flex gap-1 h-9">
              <button
                onClick={handlePrevious}
                className="w-9 h-9 flex items-center justify-center rounded-full ease-in-out duration-300 transition active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed"
              >
                <ChevronLeft
                  size={24}
                  strokeWidth={1.5}
                  className="-ml-[2px]"
                />
              </button>
              <input
                value={pageJumpValue}
                onChange={pageJumpInputChange}
                onKeyDown={pageJumpEnterKey}
                className={clsx(
                  "min-w-[36px] max-w-[36px] h-9 px-1 text-center border cursor-text outline-none rounded-full bg-white",
                  !isPageInRange && "border-red"
                )}
                type="text"
              />
              <div className="flex items-center justify-center px-1 cursor-context-menu">
                of
              </div>
              <button
                onClick={jumpToLastPage}
                className="w-9 h-9 flex items-center justify-center border rounded-full ease-in-out duration-300 transition bg-white active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed"
              >
                {totalPages}
              </button>
              <button
                onClick={handleNext}
                className="w-9 h-9 flex items-center justify-center rounded-full ease-in-out duration-300 transition active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed"
              >
                <ChevronRight
                  size={24}
                  strokeWidth={1.5}
                  className="-mr-[2px]"
                />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-white shadow-sm border/50 p-12 text-center">
          <div className="max-w-sm mx-auto space-y-4">
            <div className="p-4 rounded-full bg-gray-100 w-max mx-auto">
              <Clock className="w-6 h-6 text-gray" />
            </div>
            <div>
              <h2 className="text-xl font-medium mb-2">No newsletters yet</h2>
              <p className="text-sm text-gray mb-6">
                Click the button below to create your first one
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
