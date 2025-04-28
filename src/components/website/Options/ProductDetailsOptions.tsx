"use client";

import { memo, useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useOptionsStore } from "@/zustand/website/optionsStore";

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
};

type ProductOptionsType = {
  groups: OptionGroupType[];
};

type ProductDetailsOptionsProps = {
  options: ProductOptionsType;
  isStickyBarInCartIndicator?: boolean;
};

export const ProductDetailsOptions = memo(function ProductDetailsOptions({
  options,
  isStickyBarInCartIndicator = false,
}: ProductDetailsOptionsProps) {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const { selectedOptions, setSelectedOption } = useOptionsStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sort groups by display order
  const sortedGroups = [...options.groups].sort((a, b) => a.displayOrder - b.displayOrder);

  // Return null if no option groups exist
  if (sortedGroups.length === 0) return null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Render button content with styled keys and values
  const renderButtonText = () => {
    const selectedCount = Object.keys(selectedOptions).length;
    const totalGroups = sortedGroups.length;

    if (selectedCount === 0) {
      return <span>Select Options</span>;
    }

    // Helper to build list of groups
    const list = sortedGroups
      .filter((group) => selectedOptions[group.id] !== undefined)
      .map((group) => {
        const selected = group.values.find((opt) => opt.id === selectedOptions[group.id]);
        return { id: group.id, name: group.name, value: selected?.value || "" };
      });

    // If all selected
    if (selectedCount === totalGroups) {
      return (
        <>
          {list.map((item, idx) => (
            <span key={item.id} className="truncate inline-block">
              <span className="text-gray-500">{item.name}: </span>
              <span className="text-gray-900 font-medium">{item.value}</span>
              {idx < list.length - 1 && <span className="text-gray-500">,&nbsp;</span>}
            </span>
          ))}
        </>
      );
    }

    // Partial selection
    return (
      <>
        {list.map((item, idx) => (
          <span key={item.id} className="inline-block">
            <span className="text-gray-500">{item.name}: </span>
            <span className="text-gray-900 font-medium">{item.value}</span>
            {idx < list.length - 1 && <span className="text-gray-500">,&nbsp;</span>}
          </span>
        ))}
        <span className="text-gray-500">&nbsp;+{totalGroups - selectedCount} more</span>
      </>
    );
  };

  // Handle option selection
  const handleSelectOption = (groupId: number, optionId: number) => {
    setSelectedOption(groupId, optionId);

    const updated = { ...selectedOptions, [groupId]: optionId };
    const allSelected = sortedGroups.every((g) => updated[g.id] !== undefined);

    if (allSelected) setDropdownVisible(false);
  };

  return (
    <div
      ref={dropdownRef}
      className={clsx(
        "dropdown-container relative",
        !isStickyBarInCartIndicator && "flex flex-col gap-3 items-start lg:flex-row lg:items-center",
        isStickyBarInCartIndicator && "flex gap-3 items-center"
      )}
    >
      <button
        onClick={() => setDropdownVisible((prev) => !prev)}
        className={clsx(
          "h-10 px-4 rounded-full flex items-center justify-between gap-2",
          "transition-all duration-200 ease-in-out",
          "border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100",
          "text-sm font-medium min-w-[180px]",
          isDropdownVisible && "ring-2 ring-gray-300"
        )}
      >
        <span className="truncate flex">{renderButtonText()}</span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={clsx("transition-transform duration-200", isDropdownVisible && "rotate-180")}
        />
      </button>

      {isDropdownVisible && (
        <div className="absolute top-12 left-0 z-20 w-full min-w-[240px]">
          <div className="p-4 rounded-lg shadow-lg bg-white border border-gray-200">
            {sortedGroups.map((group) => (
              <div key={group.id} className="mb-4 last:mb-0">
                <h3 className="text-sm font-medium mb-2 text-gray-700">{group.name}</h3>
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
                            ? "bg-amber-500 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        )}
                      >
                        {option.value}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
