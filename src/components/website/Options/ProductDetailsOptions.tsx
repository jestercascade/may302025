"use client";

import { useOptionsStore } from "@/zustand/website/optionsStore";
import { memo, useState, useEffect, useRef } from "react";
import { ChevronDown, Ruler } from "lucide-react";
import clsx from "clsx";

type OptionType = {
  id: number;
  value: string;
  isActive: boolean;
};

type OptionGroupType = {
  id: number;
  name: string;
  displayOrder: number;
  values: OptionType[];
  sizeChart?: SizeChartType;
};

type SizeChartType = {
  centimeters?: { columns: { label: string; order: number }[]; rows: { [key: string]: string }[] };
  inches?: { columns: { label: string; order: number }[]; rows: { [key: string]: string }[] };
};

type ProductOptionsType = {
  groups: OptionGroupType[];
};

type ProductDetailsOptionsProps = {
  options: ProductOptionsType;
  isStickyBarInCartIndicator?: boolean;
  onSizeChartClick?: () => void;
};

const sizeLabels = new Set(["XXXS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "2XL", "3XL", "4XL", "5XL"]);
const countryCodes = new Set(["US", "UK", "EU", "FR", "IT", "JP", "AU", "CN"]);

export const ProductDetailsOptions = memo(function ProductDetailsOptions({
  options,
  isStickyBarInCartIndicator = false,
  onSizeChartClick,
}: ProductDetailsOptionsProps) {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const { selectedOptions, setSelectedOption } = useOptionsStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [highlightedOptions, setHighlightedOptions] = useState<Record<number, boolean>>({});
  const previousSelections = useRef<Record<number, number | null>>({});

  const MAX_DISPLAY_CHARS = 28;

  const sortedGroups = [...options.groups]
    .filter((group) => group.values.some((opt) => opt.isActive))
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const sizeGroup = sortedGroups.find((group) => group.name.toLowerCase() === "size");
  const isSizeSelected = sizeGroup && selectedOptions[sizeGroup.id] !== undefined;

  const selectedSize =
    isSizeSelected && sizeGroup
      ? sizeGroup.values.find((opt) => opt.id === selectedOptions[sizeGroup.id])?.value
      : null;

  const sizeChartData = sizeGroup?.sizeChart;
  const selectedSizeRow =
    selectedSize &&
    sizeChartData?.inches?.rows.find((row) => Object.values(row).some((value) => value === selectedSize));

  const measurementColumns =
    sizeChartData?.inches?.columns.filter((col) => !["size", "name", "label size"].includes(col.label.toLowerCase())) ||
    [];

  const formatMeasurement = (label: string, value: string) => {
    if (sizeLabels.has(value) || countryCodes.has(value)) return value;
    if (value.includes("'") || value.includes('"') || value.includes("cm") || value.includes("in")) return value;
    if (/^\d+(\/\d+)?$/.test(value)) return value;
    if (label.toLowerCase() === "height" && value.includes("-")) return value + "cm";
    return value + " in";
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const changedGroups: number[] = [];

    Object.entries(selectedOptions).forEach(([groupId, optionId]) => {
      const groupIdNum = Number(groupId);
      if (previousSelections.current[groupIdNum] !== undefined && previousSelections.current[groupIdNum] !== optionId) {
        changedGroups.push(groupIdNum);
      }
      previousSelections.current[groupIdNum] = optionId;
    });

    changedGroups.forEach((groupId) => {
      setHighlightedOptions((prev) => ({ ...prev, [groupId]: true }));
      setTimeout(() => {
        setHighlightedOptions((prev) => ({ ...prev, [groupId]: false }));
      }, 800);
    });
  }, [selectedOptions]);

  const getFormattedSelections = () => {
    return sortedGroups
      .filter((group) => selectedOptions[group.id] !== undefined)
      .map((group) => {
        const selected = group.values.find((opt) => opt.id === selectedOptions[group.id]);
        return { id: group.id, name: group.name, value: selected?.value || "" };
      });
  };

  const getSmartDisplayText = () => {
    const selections = getFormattedSelections();
    if (selections.length === 0) return { display: "Select Options", remaining: 0 };

    let displayText = "";
    let separator = ", ";
    let index = 0;
    let remaining = selections.length;

    displayText = selections[0].value;
    index++;
    remaining--;

    while (index < selections.length) {
      const nextOption = selections[index].value;
      const nextDisplayText = displayText + separator + nextOption;
      if (nextDisplayText.length <= MAX_DISPLAY_CHARS) {
        displayText = nextDisplayText;
        index++;
        remaining--;
      } else break;
    }

    return { display: displayText, remaining };
  };

  const handleSelectOption = (groupId: number, optionId: number) => {
    setSelectedOption(groupId, optionId);
    const updated = { ...selectedOptions, [groupId]: optionId };
    if (sortedGroups.every((g) => updated[g.id] !== undefined)) setDropdownVisible(false);
  };

  const handleSizeChartClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onSizeChartClick?.();
  };

  if (sortedGroups.length === 0) return null;

  const selections = getFormattedSelections();
  const hasSelections = selections.length > 0;
  const { display, remaining } = getSmartDisplayText();

  const highlightKeyframes = `
    @keyframes highlightPulse {
      0% { background-color: rgb(254, 243, 199); color: rgb(146, 64, 14); }
      70% { background-color: rgb(254, 243, 199); color: rgb(146, 64, 14); }
      100% { background-color: rgb(243, 244, 246); color: rgb(75, 85, 99); }
    }
  `;

  return (
    <div
      ref={dropdownRef}
      className={clsx(
        "relative",
        !isStickyBarInCartIndicator && "w-full max-w-xs",
        isStickyBarInCartIndicator && "flex gap-2 items-center"
      )}
    >
      <style jsx>{highlightKeyframes}</style>

      <button
        onClick={() => setDropdownVisible((prev) => !prev)}
        className={clsx(
          "w-full px-4 py-2.5 rounded-lg flex items-center justify-between",
          "transition-all duration-200 ease-in-out",
          "border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100",
          isDropdownVisible ? "ring-2 ring-gray-300" : ""
        )}
      >
        <div className="flex flex-col items-start w-full">
          {hasSelections ? (
            <div className="flex flex-col w-full">
              <div className="flex items-center">
                <span className="text-base font-medium">{display}</span>
                {remaining > 0 && <span className="text-sm text-gray-500 ml-2">+{remaining}</span>}
              </div>
              <div className="flex flex-wrap gap-1 mt-1 w-full">
                {selections.map((s) => (
                  <span
                    key={s.name}
                    className={clsx(
                      "inline-flex text-xs px-1.5 py-0.5 rounded",
                      highlightedOptions[s.id] ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
                    )}
                    style={highlightedOptions[s.id] ? { animation: "highlightPulse 800ms ease-out" } : {}}
                  >
                    {s.name}: {s.value}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <span className="text-base">Select Options</span>
          )}
        </div>
        <ChevronDown
          size={18}
          strokeWidth={2}
          className={clsx(
            "transition-transform duration-200 ml-2 flex-shrink-0",
            isDropdownVisible ? "rotate-180" : ""
          )}
        />
      </button>

      {isDropdownVisible && (
        <div className="absolute top-full left-0 z-20 w-full mt-2">
          <div className="p-4 rounded-lg shadow-lg bg-white border border-gray-200">
            {sortedGroups.map((group) => (
              <div key={group.id} className="mb-4 last:mb-0">
                <h3 className="text-sm font-medium mb-2">{group.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.values
                    .filter((option) => option.isActive)
                    .map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleSelectOption(group.id, option.id)}
                        className={clsx(
                          "px-3 py-1.5 rounded-full text-sm",
                          "transition-all duration-150 ease-in-out",
                          selectedOptions[group.id] === option.id
                            ? "bg-black text-white"
                            : "bg-gray-100 text-black hover:bg-gray-200"
                        )}
                      >
                        {option.value}
                      </button>
                    ))}
                </div>

                {group.name.toLowerCase() === "size" && selectedOptions[group.id] !== undefined && selectedSizeRow && (
                  <div className="mt-3">
                    <div className="bg-neutral-50 rounded-lg px-3 py-2.5 border border-neutral-100">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                        {measurementColumns.map((column) => {
                          const measurement = selectedSizeRow[column.label];
                          if (!measurement) return null;
                          return (
                            <div key={column.label} className="flex items-center text-xs text-gray-700">
                              <span className="mr-1">{column.label}:</span>
                              <span className="font-semibold">{formatMeasurement(column.label, measurement)}</span>
                            </div>
                          );
                        })}
                      </div>

                      {sizeChartData && (
                        <button
                          onClick={handleSizeChartClick}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                        >
                          <Ruler size={12} className="mr-1.5" />
                          View Size Chart
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
