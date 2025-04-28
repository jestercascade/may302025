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

  // Generate button text based on selections
  const getButtonText = () => {
    const selectedCount = Object.keys(selectedOptions).length;
    const totalGroups = sortedGroups.length;

    // If nothing is selected
    if (selectedCount === 0) {
      return "Select Options";
    }

    // If everything is selected
    if (selectedCount === totalGroups) {
      return sortedGroups
        .map((group) => {
          const selectedOption = group.values.find((opt) => opt.id === selectedOptions[group.id]);
          return `${group.name}: ${selectedOption?.value || ""}`;
        })
        .join(", ");
    }

    // If some options are selected
    const selectedText = sortedGroups
      .filter((group) => selectedOptions[group.id])
      .map((group) => {
        const selectedOption = group.values.find((opt) => opt.id === selectedOptions[group.id]);
        return `${group.name}: ${selectedOption?.value || ""}`;
      })
      .join(", ");

    return `${selectedText} + ${totalGroups - selectedCount} more`;
  };

  // Handle option selection
  const handleSelectOption = (groupId: number, optionId: number) => {
    setSelectedOption(groupId, optionId);

    // Check if all options are selected after this change
    const updatedSelections = { ...selectedOptions, [groupId]: optionId };
    const allSelected = sortedGroups.every((group) => updatedSelections[group.id] !== undefined);

    // Close dropdown if all options are selected
    if (allSelected) {
      setDropdownVisible(false);
    }
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
        <span className="truncate">{getButtonText()}</span>
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
