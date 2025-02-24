"use client";

import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { SendNewsletterButton } from "./SendNewsletterOverlay";
import { EditNewsletterButton } from "./EditNewsletterOverlay";
import { capitalizeFirstLetter } from "@/lib/utils/common";
import { useState } from "react";
import clsx from "clsx";

export default function NewslettersTable({
  newsletters,
}: {
  newsletters: NewsletterType[] | null;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageJumpValue, setPageJumpValue] = useState("1");
  const [isPageInRange, setIsPageInRange] = useState(true);

  const pagination = (
    data: NewsletterType[] | null,
    currentPage: number,
    rowsPerPage: number
  ) => {
    if (!data || data.length === 0) {
      return {
        paginatedArray: [],
        totalPages: 0,
      };
    }

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedArray = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / rowsPerPage);

    return {
      paginatedArray,
      totalPages,
    };
  };

  const rowsPerPage = 5;
  const { paginatedArray: tableData, totalPages } = pagination(
    newsletters,
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

  return (
    <>
      {tableData.length > 0 ? (
        <div className="space-y-5">
          {/* Mobile View */}
          <div className="md:hidden py-2 space-y-2">
            {tableData.map(({ id, emailSubject, lastSentAt, visibility }) => (
              <div
                key={id}
                className="bg-white rounded-xl border h-[100px] relative"
              >
                <div className="p-4">
                  <div className="flex items-center gap-2.5 mb-2">
                    <h3 className="font-medium line-clamp-1">{emailSubject}</h3>
                    {visibility === "DRAFT" && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray rounded-full">
                        Draft
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {lastSentAt || "Not sent yet"}
                  </div>
                  <div className="flex gap-0.5 absolute bottom-2 right-2">
                    <EditNewsletterButton id={id} />
                    <SendNewsletterButton id={id} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block rounded-xl bg-white border overflow-hidden">
            <div className="overflow-auto custom-x-scrollbar">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider w-96">
                      Title
                    </th>
                    <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider">
                      Last sent
                    </th>
                    <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider">
                      Visibility
                    </th>
                    <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map(
                    ({ id, emailSubject, lastSentAt, visibility }) => {
                      return (
                        <tr
                          key={id}
                          className="group border-b last:border-b-0 hover:bg-gray-50/80 transition-colors"
                        >
                          <td className="px-4 py-4 w-96">
                            <p className="font-medium line-clamp-2">
                              {emailSubject}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center justify-center h-6 px-2 rounded text-sm font-medium bg-gray-100 border">
                              {lastSentAt || "Not Sent Yet"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={clsx(
                                "inline-flex px-3 py-1 rounded-full text-sm font-medium",
                                visibility === "PUBLISHED"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100"
                              )}
                            >
                              {capitalizeFirstLetter(visibility.toLowerCase())}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <EditNewsletterButton id={id} />
                              <SendNewsletterButton id={id} />
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {newsletters && newsletters.length > rowsPerPage && (
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
