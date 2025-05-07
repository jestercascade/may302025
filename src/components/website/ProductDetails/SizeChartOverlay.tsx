"use client";

import { X } from "lucide-react";
import { useOverlayStore } from "@/zustand/website/overlayStore";
import { memo } from "react";
import { clsx } from "clsx";

// Types
type OptionGroupType = {
  id: number;
  name: string;
  displayOrder: number;
  values: Array<{
    id: number;
    value: string;
    isActive: boolean;
  }>;
  sizeChart?: SizeChartType;
};

type ProductOptionsType = {
  groups: Array<OptionGroupType>;
  config?: {
    chaining: {
      enabled: boolean;
      relationships: Array<{
        parentGroupId: number;
        childGroupId: number;
        constraints: {
          [parentOptionId: string]: number[];
        };
      }>;
    };
  };
};

type SizeChartType = {
  centimeters?: {
    columns: Array<{
      label: string;
      order: number;
    }>;
    rows: Array<{
      [key: string]: string;
    }>;
  };
  inches?: {
    columns: Array<{
      label: string;
      order: number;
    }>;
    rows: Array<{
      [key: string]: string;
    }>;
  };
};

type SizeChartOverlayProps = {
  productInfo: {
    id: string;
    options: ProductOptionsType;
  };
};

// Chart Component
const Chart = memo(function Chart({ sizeChart, unit }: { sizeChart: SizeChartType; unit: "inches" | "centimeters" }) {
  const chartData = sizeChart[unit];

  if (!chartData) {
    return <div className="text-gray-500">No {unit} data available</div>;
  }

  // Sort columns by order property
  const sortedColumns = [...chartData.columns].sort((a, b) => a.order - b.order);

  return (
    <div className="border w-full max-w-[max-content] rounded overflow-y-hidden overflow-x-visible custom-x-scrollbar">
      <table className="w-max bg-white">
        <thead className="h-10 border-b">
          <tr>
            {sortedColumns.map((column, index) => (
              <th
                key={index}
                className={clsx(
                  "px-5 text-nowrap text-sm font-normal",
                  index === sortedColumns.length - 1 ? "" : "border-r",
                  index === 0 ? "sticky left-0 bg-neutral-100" : ""
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chartData.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className={clsx("h-10", rowIndex === chartData.rows.length - 1 ? "" : "border-b")}>
              {sortedColumns.map((column, columnIndex) => (
                <td
                  key={columnIndex}
                  className={clsx(
                    "text-center px-5 w-[118px] text-sm",
                    columnIndex === 0
                      ? "sticky left-0 bg-neutral-100 border-r font-semibold"
                      : columnIndex === sortedColumns.length - 1
                      ? ""
                      : "border-r"
                  )}
                >
                  {row[column.label]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

// Main Overlay Component
export function SizeChartOverlay({ productInfo }: SizeChartOverlayProps) {
  const pageName = useOverlayStore((state) => state.pages.productDetails.name);
  const overlayName = useOverlayStore((state) => state.pages.productDetails.overlays.sizeChart.name);
  const isOverlayVisible = useOverlayStore((state) => state.pages.productDetails.overlays.sizeChart.isVisible);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);

  // Find the size group and its size chart
  const sizeGroup = productInfo.options.groups.find((group) => group.name.toLowerCase() === "size");
  const sizeChart = sizeGroup?.sizeChart;

  // Guard clause - don't render if no size data or overlay not visible
  if (!isOverlayVisible || !sizeChart) {
    return null;
  }

  return (
    <div className="fixed w-full h-dvh top-0 bottom-0 left-0 right-0 z-50 transition bg-glass-black backdrop-blur-sm md:overflow-x-hidden md:overflow-y-visible md:custom-scrollbar">
      <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[20px] overflow-hidden bg-white md:w-max md:min-w-[516px] md:max-w-[740px] md:rounded-2xl md:shadow md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
        <h2 className="font-semibold text-lg text-center pt-5 pb-2">Product Measurements</h2>
        <button
          onClick={() => {
            hideOverlay({
              pageName,
              overlayName,
            });
          }}
          className="w-9 h-9 rounded-full absolute top-[6px] right-[6px] flex items-center justify-center transition-colors active:bg-lightgray lg:hover:bg-lightgray"
          type="button"
          aria-label="Close size chart"
        >
          <X color="#6c6c6c" strokeWidth={1.5} />
        </button>
        <div className="w-full h-[calc(100%-52px)] px-5 pb-10 invisible-scrollbar overflow-x-hidden overflow-y-visible">
          <div className="w-full max-w-[602px] mx-auto flex flex-col gap-6 mt-6">
            {/* Inches Section */}
            {sizeChart.inches && (
              <div>
                <h3 className="font-semibold mb-4">Inches</h3>
                <Chart sizeChart={sizeChart} unit="inches" />
              </div>
            )}

            {/* Centimeters Section */}
            {sizeChart.centimeters && (
              <div>
                <h3 className="font-semibold mb-4">Centimeters</h3>
                <Chart sizeChart={sizeChart} unit="centimeters" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
