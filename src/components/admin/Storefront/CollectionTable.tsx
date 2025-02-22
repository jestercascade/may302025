"use client";

import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Hourglass,
  Clock,
  Ban,
} from "lucide-react";
import { capitalizeFirstLetter } from "@/lib/utils/common";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import {
  ChangeCollectionIndexButton,
  ChangeCollectionIndexOverlay,
} from "./ChangeCollectionIndexOverlay";
import { NewCollectionEmptyTableButton } from "./NewCollectionOverlay";

export default function CollectionTable({
  collections,
}: {
  collections: CollectionType[];
}) {
  const CAMPAIGN_STATUS_ENDED = "Ended";
  const CAMPAIGN_STATUS_UPCOMING = "Upcoming";
  const CAMPAIGN_STATUS_ACTIVE = "Active";

  const [currentPage, setCurrentPage] = useState(1);
  const [pageJumpValue, setPageJumpValue] = useState("1");
  const [isPageInRange, setIsPageInRange] = useState(true);

  const pagination = (
    data: CollectionType[] | null,
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
    collections,
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const getCampaignStatus = (startDate: string, endDate: string): string => {
    const currentDate = new Date();
    const campaignStartDate = new Date(startDate);
    const campaignEndDate = new Date(endDate);

    campaignStartDate.setUTCHours(0, 0, 0, 0);
    campaignEndDate.setUTCHours(0, 0, 0, 0);

    if (currentDate.getTime() > campaignEndDate.getTime()) {
      return CAMPAIGN_STATUS_ENDED;
    } else if (currentDate.getTime() < campaignStartDate.getTime()) {
      return CAMPAIGN_STATUS_UPCOMING;
    } else {
      return CAMPAIGN_STATUS_ACTIVE;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case CAMPAIGN_STATUS_UPCOMING:
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            <Hourglass size={12} />
            <span className="text-xs font-medium">Upcoming</span>
          </div>
        );
      case CAMPAIGN_STATUS_ACTIVE:
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 text-green-700">
            <Clock size={12} />
            <span className="text-xs font-medium">Active</span>
          </div>
        );
      case CAMPAIGN_STATUS_ENDED:
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100 text-red-700">
            <Ban size={12} />
            <span className="text-xs font-medium">Ended</span>
          </div>
        );
    }
  };

  return (
    <>
      {tableData.length > 0 ? (
        <div className="space-y-5">
          <h2 className="font-semibold text-lg">Collections</h2>

          {/* Mobile View */}
          <div className="lg:hidden space-y-3">
            {tableData.map(
              ({
                id,
                index,
                title,
                slug,
                campaignDuration,
                collectionType,
                products,
                visibility,
              }) => {
                const status = getCampaignStatus(
                  campaignDuration.startDate,
                  campaignDuration.endDate
                );

                return (
                  <div key={index} className="bg-white rounded-xl border">
                    <div className="p-5 space-y-4">
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium mb-2">{title}</h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center justify-center h-6 px-2 rounded text-xs font-medium text-neutral-700 bg-gray-100 border">
                            {products ? products.length : 0} products
                          </span>
                          <span className="inline-flex items-center justify-center h-6 px-2 rounded text-xs font-medium text-neutral-700 bg-gray-100 border">
                            {capitalizeFirstLetter(
                              collectionType.toLowerCase()
                            )}
                          </span>
                          <span
                            className={clsx(
                              "inline-flex items-center justify-center h-6 px-2 rounded text-xs font-medium border",
                              visibility === "PUBLISHED"
                                ? "bg-green-100 text-green-700"
                                : "bg-neutral-100 text-neutral-700"
                            )}
                          >
                            {capitalizeFirstLetter(visibility.toLowerCase())}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        {getStatusBadge(status)}
                        <div className="text-xs text-gray truncate">
                          <span>{formatDate(campaignDuration.startDate)}</span>
                          <span className="mx-1">→</span>
                          <span>{formatDate(campaignDuration.endDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-2 border-t">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/collections/${slug}-${id}`}
                          className="h-9 w-9 rounded-full flex items-center justify-center ease-in-out duration-300 transition active:bg-lightgray lg:hover:bg-lightgray"
                        >
                          <Pencil size={18} strokeWidth={1.75} />
                        </Link>
                        <ChangeCollectionIndexButton
                          data={{ id, title, index: String(index) }}
                        />
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden lg:block rounded-xl bg-white border overflow-hidden">
            <div className="overflow-auto custom-x-scrollbar">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider w-14">
                      #
                    </th>
                    <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider w-64">
                      Title
                    </th>
                    <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider">
                      Products
                    </th>
                    <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider">
                      Type
                    </th>
                    <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider">
                      Visibility
                    </th>
                    <th className="h-11 px-4 text-left text-xs font-medium text-gray uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map(
                    ({
                      id,
                      index,
                      title,
                      slug,
                      campaignDuration,
                      collectionType,
                      products,
                      visibility,
                    }) => {
                      const status = getCampaignStatus(
                        campaignDuration.startDate,
                        campaignDuration.endDate
                      );

                      return (
                        <tr
                          key={index}
                          className="group border-b last:border-b-0 hover:bg-gray-50/80 transition-colors"
                        >
                          <td className="px-4 py-4 font-medium">{index}</td>
                          <td className="px-4 py-4 w-64">
                            <p className="font-medium line-clamp-2">{title}</p>
                          </td>
                          <td className="px-4 py-4">
                            <div className="space-y-2">
                              {getStatusBadge(status)}
                              <div className="flex items-center gap-1.5 text-xs text-gray">
                                <span>
                                  {formatDate(campaignDuration.startDate)}
                                </span>
                                <span className="text-gray-400">→</span>
                                <span>
                                  {formatDate(campaignDuration.endDate)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center justify-center h-6 px-2 rounded text-sm font-medium bg-gray-100 border">
                              {products ? products.length : 0}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center justify-center h-6 px-2 rounded text-sm font-medium bg-gray-100 border">
                              {capitalizeFirstLetter(
                                collectionType.toLowerCase()
                              )}
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
                              <Link
                                href={`/admin/collections/${slug}-${id}`}
                                className="h-9 w-9 rounded-full flex items-center justify-center ease-in-out duration-300 transition active:bg-lightgray lg:hover:bg-lightgray"
                              >
                                <Pencil size={18} strokeWidth={1.75} />
                              </Link>
                              <ChangeCollectionIndexButton
                                data={{ id, title, index: String(index) }}
                              />
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

          {collections.length > rowsPerPage && (
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
              <h2 className="text-xl font-medium mb-2">No collections yet</h2>
              <p className="text-sm text-gray mb-6">
                Create your first collection to start organizing your products
              </p>
              <NewCollectionEmptyTableButton />
            </div>
          </div>
        </div>
      )}
      <ChangeCollectionIndexOverlay />
    </>
  );
}
