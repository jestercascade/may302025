"use client";

import { useProductColorImageStore } from "@/zustand/website/productColorImageStore";
import { useOptionsStore } from "@/zustand/website/optionsStore";
import { memo, useCallback, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

export const ProductColors = memo(function ProductColors({
  colors,
}: {
  colors: Array<{
    name: string;
    image: string;
  }>;
}) {
  const selectedColor = useOptionsStore((state) => state.selectedColor);
  const setSelectedColor = useOptionsStore((state) => state.setSelectedColor);
  const setSelectedColorImage = useProductColorImageStore(
    (state) => state.setSelectedColorImage
  );

  const handleColorSelect = useCallback(
    (name: string, image: string) => {
      setSelectedColor(name);
      setSelectedColorImage(image);
    },
    [setSelectedColor, setSelectedColorImage]
  );

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3">
        {colors.map(({ name, image }, index) => (
          <div
            onClick={() => handleColorSelect(name, image)}
            key={index}
            className={`relative w-[40px] h-[40px] flex items-center justify-center cursor-pointer hover:before:content-[''] hover:before:h-12 hover:before:w-12 hover:before:absolute hover:before:rounded-[6px] ${
              selectedColor === name &&
              "before:content-[''] before:h-12 before:w-12 before:absolute before:rounded-[6px] before:border before:border-black/60 hover:before:!border-black/60"
            }`}
          >
            <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-lightgray border rounded">
              <Image
                src={image}
                alt={name}
                width={40}
                height={40}
                priority={selectedColor === name} // Prioritize only the selected color
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export const ProductSizes = memo(function ProductSizes({
  sizeChart,
  onSizeChartClick,
}: {
  sizeChart: {
    inches: {
      columns: Array<{ label: string; order: number }>;
      rows: Array<{ [key: string]: string }>;
    };
    centimeters: {
      columns: Array<{ label: string; order: number }>;
      rows: Array<{ [key: string]: string }>;
    };
  };
  onSizeChartClick: () => void;
}) {
  const selectedSize = useOptionsStore((state) => state.selectedSize);
  const setSelectedSize = useOptionsStore((state) => state.setSelectedSize);

  const { columns, rows } = sizeChart.inches;

  // Memoize sizes array
  const sizes = useMemo(
    () => rows.map((row) => row[columns[0].label]),
    [rows, columns]
  );

  // Memoize filtered and sorted columns
  const filteredColumns = useMemo(
    () =>
      columns
        .filter(
          (column) =>
            column.label !== "Size" &&
            !["US", "EU", "UK", "NZ", "AU", "DE"].includes(column.label)
        )
        .sort((a, b) => a.order - b.order),
    [columns]
  );

  // Memoize selected row
  const selectedRow = useMemo(
    () =>
      selectedSize
        ? rows.find((row) => row[columns[0].label] === selectedSize)
        : null,
    [selectedSize, rows, columns]
  );

  const isFeetInchFormat = (value: string) =>
    /\d+'(?:\d{1,2}")?-?\d*'?(?:\d{1,2}")?/.test(value);

  return (
    <div className="w-full">
      <div className="w-full max-w-[298px] flex flex-wrap gap-[10px]">
        {sizes.map((size, index) => (
          <div key={index} className="relative cursor-pointer">
            <div
              onClick={() => setSelectedSize(size)}
              className={`font-medium text-sm border rounded-full relative px-4 h-7 flex items-center justify-center ${
                selectedSize === size &&
                "border-white hover:border-white before:border before:border-black/60 before:content-[''] before:h-8 before:w-[calc(100%_+_8px)] before:absolute before:rounded-full"
              }`}
            >
              {size}
            </div>
          </div>
        ))}
      </div>
      {selectedSize && selectedRow && (
        <div
          onClick={onSizeChartClick}
          className="w-full py-3 pl-[14px] pr-8 mt-2 rounded-lg relative cursor-pointer bg-neutral-100"
        >
          <div>
            <ul className="leading-3 max-w-[calc(100%-20px)] flex flex-row flex-wrap gap-2">
              {filteredColumns.map((column) => {
                const measurement = selectedRow[column.label] || "";
                return (
                  <li key={column.label} className="text-nowrap">
                    <span className="text-xs font-medium text-gray">{`${column.label}: `}</span>
                    <span className="text-xs font-semibold">
                      {measurement}
                      {!isFeetInchFormat(measurement) && measurement !== ""
                        ? " in"
                        : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <ChevronRight
            color="#828282"
            size={18}
            strokeWidth={2}
            className="absolute top-[50%] -translate-y-1/2 right-[6px]"
          />
        </div>
      )}
    </div>
  );
});
