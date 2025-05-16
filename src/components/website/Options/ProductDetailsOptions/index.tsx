"use client";

import { useOptionsStore } from "@/zustand/website/optionsStore";
import { memo, useState, useEffect, useRef } from "react";
import { ChevronDown, Ruler } from "lucide-react";
import clsx from "clsx";
import styles from "./styles.module.css";
import { useOverlayStore } from "@/zustand/website/overlayStore";
import { useScrollStore } from "@/zustand/website/scrollStore";

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
  config?: {
    chaining?: {
      enabled: boolean;
      relationships?: Array<{
        parentGroupId: number;
        childGroupId: number;
        constraints: { [parentOptionId: string]: number[] };
      }>;
    };
  };
};

type ProductDetailsOptionsProps = {
  options: ProductOptionsType;
  isStickyBarInCartIndicator?: boolean;
  onSizeChartClick?: () => void;
  hideDetailedSelections?: boolean;
};

const sizeLabels = new Set(["XXXS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "2XL", "3XL", "4XL", "5XL"]);
const countryCodes = new Set(["US", "UK", "EU", "FR", "IT", "JP", "AU", "CN"]);

export const ProductDetailsOptions = memo(function ProductDetailsOptions({
  options,
  isStickyBarInCartIndicator = false,
  hideDetailedSelections = false,
}: ProductDetailsOptionsProps) {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const { selectedOptions, setSelectedOption } = useOptionsStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [highlightedOptions, setHighlightedOptions] = useState<Record<number, boolean>>({});
  const previousSelections = useRef<Record<number, number | null>>({});
  const shouldShowStickyBar = useScrollStore((state) => state.shouldShowStickyBar);

  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const productDetailsPage = useOverlayStore((state) => state.pages.productDetails);

  const MAX_DISPLAY_CHARS = 24;

  const sortedGroups = [...options.groups].sort((a, b) => a.displayOrder - b.displayOrder);

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

  // Extract chaining configuration safely
  const chaining = options.config?.chaining;
  const isChainingEnabled = chaining?.enabled ?? false;
  const relationships = chaining?.relationships || [];

  // Pre-compute which parent options have at least one valid child option
  const validParentOptions = new Map<number, Set<number>>();
  const validChildOptions = new Map<number, Set<number>>();

  relationships.forEach((relationship) => {
    const { parentGroupId, childGroupId, constraints } = relationship;

    if (!validParentOptions.has(parentGroupId)) {
      validParentOptions.set(parentGroupId, new Set<number>());
    }
    if (!validChildOptions.has(childGroupId)) {
      validChildOptions.set(childGroupId, new Set<number>());
    }

    const childGroup = sortedGroups.find((group) => group.id === childGroupId);
    const parentGroup = sortedGroups.find((group) => group.id === parentGroupId);
    if (!childGroup || !parentGroup) return;

    Object.entries(constraints).forEach(([parentOptionIdStr, allowedChildIds]) => {
      const parentOptionId = Number(parentOptionIdStr);
      const parentOption = parentGroup.values.find((opt) => opt.id === parentOptionId);
      if (!parentOption?.isActive) return;

      const hasValidChild = allowedChildIds.some((childId) => {
        const childOption = childGroup.values.find((opt) => opt.id === childId);
        return childOption && childOption.isActive;
      });

      if (hasValidChild) {
        validParentOptions.get(parentGroupId)?.add(parentOptionId);
        allowedChildIds.forEach((childId) => {
          const childOption = childGroup.values.find((opt) => opt.id === childId);
          if (childOption?.isActive) {
            validChildOptions.get(childGroupId)?.add(childId);
          }
        });
      }
    });
  });

  useEffect(() => {
    if (!shouldShowStickyBar) {
      setDropdownVisible(false);
    }
  }, [shouldShowStickyBar]);

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
    const separator = ", ";
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
    const updated = { ...selectedOptions, [groupId]: optionId };

    if (isChainingEnabled) {
      relationships.forEach((rel) => {
        if (rel.parentGroupId === groupId) {
          const childGroupId = rel.childGroupId;
          const selectedChildId = selectedOptions[childGroupId];

          if (selectedChildId != null) {
            // Check for null or undefined
            const allowedChildIds = rel.constraints[optionId] || [];
            if (!allowedChildIds.includes(selectedChildId)) {
              delete updated[childGroupId];
            }
          }
        }
      });
    }

    Object.entries(updated).forEach(([gId, oId]) => {
      setSelectedOption(Number(gId), oId);
    });

    if (sortedGroups.every((g) => updated[g.id] !== undefined)) {
      setDropdownVisible(false);
    }
  };

  const handleSizeChartClick = () => {
    showOverlay({
      pageName: productDetailsPage.name,
      overlayName: productDetailsPage.overlays.sizeChart.name,
    });
  };

  const isOptionDisabled = (groupId: number, optionId: number) => {
    const group = sortedGroups.find((g) => g.id === groupId);
    const option = group?.values.find((o) => o.id === optionId);
    if (!option?.isActive) return true;

    if (isChainingEnabled) {
      const isParent = relationships.some((rel) => rel.parentGroupId === groupId);
      if (isParent) {
        if (!validParentOptions.get(groupId)?.has(optionId)) {
          return true;
        }

        const childSelectionsInvalid = relationships.some((rel) => {
          if (rel.parentGroupId !== groupId) return false;

          const childGroupId = rel.childGroupId;
          const selectedChildId = selectedOptions[childGroupId];

          if (selectedChildId != null) {
            // Check for null or undefined
            const allowedChildIds = rel.constraints[optionId] || [];
            return !allowedChildIds.includes(selectedChildId);
          }

          return false;
        });

        if (childSelectionsInvalid) {
          return true;
        }
      }

      const relationshipAsChild = relationships.find((rel) => rel.childGroupId === groupId);
      if (relationshipAsChild) {
        const { parentGroupId, constraints } = relationshipAsChild;
        const selectedParentId = selectedOptions[parentGroupId];

        if (selectedParentId != null) {
          // Check for null or undefined
          const allowedChildIds = constraints[selectedParentId] || [];
          return !allowedChildIds.includes(optionId);
        } else {
          const hasAnyValidParent = Object.entries(constraints).some(([parentIdStr, allowedChildIds]) => {
            const parentId = Number(parentIdStr);
            return validParentOptions.get(parentGroupId)?.has(parentId) && allowedChildIds.includes(optionId);
          });
          return !hasAnyValidParent;
        }
      }
    }

    return false;
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
          "border bg-white hover:bg-neutral-50 active:bg-neutral-100",
          isDropdownVisible ? "ring-2 ring-neutral-300" : ""
        )}
      >
        <div className="flex flex-col items-start w-full">
          {hasSelections ? (
            <div className="flex flex-col w-full">
              <div className="flex items-center">
                <span className="text-base font-medium">{display}</span>
                {remaining > 0 && <span className="text-sm text-gray-500 ml-2">+{remaining}</span>}
              </div>
              {!hideDetailedSelections && (
                <div className="flex flex-wrap gap-1 mt-1 w-full">
                  {selections.map((s) => (
                    <span
                      key={s.name}
                      className={clsx(
                        "inline-flex text-xs px-1.5 py-0.5 rounded",
                        highlightedOptions[s.id] ? "bg-amber-100 text-amber-800" : "bg-neutral-100 text-gray-600"
                      )}
                      style={highlightedOptions[s.id] ? { animation: "highlightPulse 800ms ease-out" } : {}}
                    >
                      {s.name}: {s.value}
                    </span>
                  ))}
                </div>
              )}
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
        <div className="absolute bottom-full md:top-full md:bottom-auto left-0 z-20 w-80 mb-2 md:mb-0 md:mt-2">
          <div
            className={`${styles.customScrollbar} flex flex-col gap-4 p-4 rounded-md shadow-lg bg-white border border-gray-200 max-h-60 overflow-y-auto`}
          >
            {sortedGroups.map((group) => (
              <div key={group.id}>
                <h3 className="text-sm font-medium mb-2">{group.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.values.map((option) => {
                    const isDisabled = isOptionDisabled(group.id, option.id);

                    return (
                      <button
                        key={option.id}
                        onClick={() => !isDisabled && handleSelectOption(group.id, option.id)}
                        className={clsx(
                          "px-3 py-1.5 min-w-12 rounded-full text-sm transition-all duration-150 ease-in-out",
                          selectedOptions[group.id] === option.id
                            ? "bg-black text-white"
                            : isDisabled
                            ? "border-2 border-dashed border-gray-300 text-gray-400 opacity-50 cursor-not-allowed"
                            : "bg-neutral-100 text-black hover:bg-neutral-200"
                        )}
                        disabled={isDisabled}
                      >
                        {option.value}
                      </button>
                    );
                  })}
                </div>
                {group.name.toLowerCase() === "size" && selectedOptions[group.id] !== undefined && selectedSizeRow && (
                  <div className="mt-3">
                    <div className="bg-neutral-50 rounded-lg px-3 py-2.5 border border-neutral-100">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                        {measurementColumns.map((column) => {
                          const measurement = selectedSizeRow[column.label];
                          if (!measurement) return null;
                          return (
                            <div key={column.label} className="flex items-center text-xs text-black">
                              <span className="mr-1">{column.label}:</span>
                              <span className="font-semibold">{formatMeasurement(column.label, measurement)}</span>
                            </div>
                          );
                        })}
                      </div>
                      {sizeChartData && (
                        <button
                          onClick={handleSizeChartClick}
                          className="mt-2 text-xs text-blue hover:text-blue-dimmed transition-colors flex items-center"
                        >
                          <Ruler size={12} className="mr-1.5" />
                          View Measurements
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
