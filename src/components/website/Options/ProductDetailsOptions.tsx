// "use client";

// import { memo, useState, useEffect, useRef } from "react";
// import { ChevronDown } from "lucide-react";
// import clsx from "clsx";
// import { useOptionsStore } from "@/zustand/website/optionsStore";

// type OptionType = {
//   id: number;
//   value: string;
//   isActive: boolean;
// };

// type OptionGroupType = {
//   id: number;
//   name: string;
//   displayOrder: number;
//   values: OptionType[];
// };

// type ProductOptionsType = {
//   groups: OptionGroupType[];
// };

// type ProductDetailsOptionsProps = {
//   options: ProductOptionsType;
//   isStickyBarInCartIndicator?: boolean;
// };

// export const ProductDetailsOptions = memo(function ProductDetailsOptions({
//   options,
//   isStickyBarInCartIndicator = false,
// }: ProductDetailsOptionsProps) {
//   const [isDropdownVisible, setDropdownVisible] = useState(false);
//   const { selectedOptions, setSelectedOption } = useOptionsStore();
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   // Sort groups by display order
//   const sortedGroups = [...options.groups].sort((a, b) => a.displayOrder - b.displayOrder);

//   // Return null if no option groups exist
//   if (sortedGroups.length === 0) return null;

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setDropdownVisible(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Render button content with styled keys and values
//   const renderButtonText = () => {
//     const selectedCount = Object.keys(selectedOptions).length;
//     const totalGroups = sortedGroups.length;

//     if (selectedCount === 0) {
//       return <span>Select Options</span>;
//     }

//     // Helper to build list of groups
//     const list = sortedGroups
//       .filter((group) => selectedOptions[group.id] !== undefined)
//       .map((group) => {
//         const selected = group.values.find((opt) => opt.id === selectedOptions[group.id]);
//         return { id: group.id, name: group.name, value: selected?.value || "" };
//       });

//     // If all selected
//     if (selectedCount === totalGroups) {
//       return (
//         <>
//           {list.map((item, idx) => (
//             <span key={item.id} className="truncate inline-block">
//               <span className="text-gray">{item.name}: </span>
//               <span className="text-black font-medium">{item.value}</span>
//               {idx < list.length - 1 && <span className="text-gray">,&nbsp;</span>}
//             </span>
//           ))}
//         </>
//       );
//     }

//     // Partial selection
//     return (
//       <>
//         {list.map((item, idx) => (
//           <span key={item.id} className="inline-block">
//             <span className="text-gray">{item.name}: </span>
//             <span className="text-black font-medium">{item.value}</span>
//             {idx < list.length - 1 && <span className="text-gray">,&nbsp;</span>}
//           </span>
//         ))}
//         <span className="text-gray">&nbsp;+{totalGroups - selectedCount} more</span>
//       </>
//     );
//   };

//   // Handle option selection
//   const handleSelectOption = (groupId: number, optionId: number) => {
//     setSelectedOption(groupId, optionId);

//     const updated = { ...selectedOptions, [groupId]: optionId };
//     const allSelected = sortedGroups.every((g) => updated[g.id] !== undefined);

//     if (allSelected) setDropdownVisible(false);
//   };

//   return (
//     <div
//       ref={dropdownRef}
//       className={clsx(
//         "dropdown-container relative",
//         !isStickyBarInCartIndicator && "flex flex-col gap-3 items-start lg:flex-row lg:items-center",
//         isStickyBarInCartIndicator && "flex gap-3 items-center"
//       )}
//     >
//       <button
//         onClick={() => setDropdownVisible((prev) => !prev)}
//         className={clsx(
//           "h-10 px-4 rounded-full flex items-center justify-between gap-2",
//           "transition-all duration-200 ease-in-out",
//           "border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100",
//           "text-sm font-medium min-w-[180px]",
//           isDropdownVisible && "ring-2 ring-gray-300"
//         )}
//       >
//         <span className="truncate flex">{renderButtonText()}</span>
//         <ChevronDown
//           size={16}
//           strokeWidth={2}
//           className={clsx("transition-transform duration-200", isDropdownVisible && "rotate-180")}
//         />
//       </button>

//       {isDropdownVisible && (
//         <div className="absolute top-12 left-0 z-20 w-full min-w-[240px]">
//           <div className="p-4 rounded-lg shadow-lg bg-white border border-gray-200">
//             {sortedGroups.map((group) => (
//               <div key={group.id} className="mb-4 last:mb-0">
//                 <h3 className="text-sm font-medium mb-2 text-black">{group.name}</h3>
//                 <div className="flex flex-wrap gap-2">
//                   {group.values
//                     .filter((option) => option.isActive)
//                     .map((option) => (
//                       <button
//                         key={option.id}
//                         onClick={() => handleSelectOption(group.id, option.id)}
//                         className={clsx(
//                           "px-3 py-1.5 rounded-full text-sm",
//                           "transition-all duration-150 ease-in-out",
//                           selectedOptions[group.id] === option.id
//                             ? "bg-black text-white"
//                             : "bg-lightgray text-black hover:bg-lightgray-dimmed"
//                         )}
//                       >
//                         {option.value}
//                       </button>
//                     ))}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// });

"use client";

import { memo, useState, useEffect, useRef } from "react";
import { ChevronDown, Ruler } from "lucide-react";
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
  sizeChart?: SizeChartType;
};

type SizeChartType = {
  centimeters?: {
    columns: Array<{ label: string; order: number }>;
    rows: Array<{ [key: string]: string }>;
  };
  inches?: {
    columns: Array<{ label: string; order: number }>;
    rows: Array<{ [key: string]: string }>;
  };
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
    sizeChartData?.inches?.rows.find((row) => {
      return Object.values(row).some((value) => value === selectedSize);
    });

  const measurementColumns =
    sizeChartData?.inches?.columns.filter(
      (col) =>
        col.label.toLowerCase() !== "size" &&
        col.label.toLowerCase() !== "name" &&
        col.label.toLowerCase() !== "label size"
    ) || [];

  const formatMeasurement = (label: string, value: string) => {
    if (sizeLabels.has(value) || countryCodes.has(value)) {
      return value;
    }

    if (value.includes("'") || value.includes('"') || value.includes("cm") || value.includes("in")) {
      return value;
    }

    if (/^\d+(\/\d+)?$/.test(value)) {
      return value;
    }

    if (label.toLowerCase() === "height" && value.includes("-")) {
      return value + "cm";
    }

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

  // const renderButtonText = () => {
  //   const selectedCount = Object.keys(selectedOptions).length;
  //   const totalGroups = sortedGroups.length;

  //   if (selectedCount === 0) {
  //     return <span>Select Options</span>;
  //   }

  //   const list = sortedGroups
  //     .filter((group) => selectedOptions[group.id] !== undefined)
  //     .map((group) => {
  //       const selected = group.values.find((opt) => opt.id === selectedOptions[group.id]);
  //       return { id: group.id, name: group.name, value: selected?.value || "" };
  //     });

  //   if (selectedCount === totalGroups) {
  //     return (
  //       <>
  //         {list.map((item, idx) => (
  //           <span key={item.id} className="truncate inline-block">
  //             <span className="text-gray-500">{item.name}: </span>
  //             <span className="font-medium">{item.value}</span>
  //             {idx < list.length - 1 && <span className="text-gray-500">,&nbsp;</span>}
  //           </span>
  //         ))}
  //       </>
  //     );
  //   }

  //   return (
  //     <>
  //       {list.map((item, idx) => (
  //         <span key={item.id} className="inline-block">
  //           <span className="text-gray-500">{item.name}: </span>
  //           <span className="font-medium">{item.value}</span>
  //           {idx < list.length - 1 && <span className="text-gray-500">,&nbsp;</span>}
  //         </span>
  //       ))}
  //       <span className="text-gray-500">&nbsp;+{totalGroups - selectedCount} more</span>
  //     </>
  //   );
  // };

  const renderButtonText = () => {
    const selectedCount = Object.keys(selectedOptions).length;
    const totalGroups = sortedGroups.length;

    if (selectedCount === 0) {
      return <span>Select Options</span>;
    }

    // Get list of selected options
    const list = sortedGroups
      .filter((group) => selectedOptions[group.id] !== undefined)
      .map((group) => {
        const selected = group.values.find((opt) => opt.id === selectedOptions[group.id]);
        return { id: group.id, name: group.name, value: selected?.value || "" };
      });

    // Determine how many options to show based on available space
    // Start with just showing the first option
    const displayCount = 1;
    const remaining = list.length - displayCount;

    return (
      <>
        {list.slice(0, displayCount).map((item, idx) => (
          <span key={item.id} className="inline-block">
            <span className="text-gray-500">{item.name}: </span>
            <span className="font-medium">{item.value}</span>
          </span>
        ))}
        {remaining > 0 && <span className="text-gray-500">&nbsp;+{remaining} more</span>}
      </>
    );
  };

  const handleSelectOption = (groupId: number, optionId: number) => {
    setSelectedOption(groupId, optionId);

    const updated = { ...selectedOptions, [groupId]: optionId };
    const allSelected = sortedGroups.every((g) => updated[g.id] !== undefined);

    if (allSelected) setDropdownVisible(false);
  };

  const handleSizeChartClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onSizeChartClick) {
      onSizeChartClick();
    }
  };

  if (sortedGroups.length === 0) return null;

  return (
    <div
      ref={dropdownRef}
      className={clsx(
        "relative",
        !isStickyBarInCartIndicator && "flex flex-col gap-2 items-start lg:flex-row lg:items-center",
        isStickyBarInCartIndicator && "flex gap-2 items-center"
      )}
    >
      <button
        onClick={() => setDropdownVisible((prev) => !prev)}
        className={clsx(
          "h-10 px-3 rounded-full flex items-center justify-between gap-2",
          "transition-all duration-200 ease-in-out",
          "border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100",
          "text-sm font-medium min-w-[160px] max-w-[280px]",
          isDropdownVisible && "ring-1 ring-gray-300"
        )}
      >
        <span className="truncate flex flex-1">{renderButtonText()}</span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={clsx("transition-transform duration-200 flex-shrink-0", isDropdownVisible && "rotate-180")}
        />
      </button>

      {isDropdownVisible && (
        <div className="absolute top-12 left-0 z-20 w-full min-w-[240px] max-w-[340px]">
          <div className="p-3 rounded-lg shadow-lg bg-white border border-gray-200">
            {sortedGroups.map((group) => (
              <div key={group.id} className="mb-3 last:mb-0">
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
                  <div className="mt-2">
                    <div className="bg-neutral-50 rounded-lg px-2.5 py-2 border border-neutral-100">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
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
                          className="mt-2 text-xs text-blue hover:text-blue-dimmed transition-colors flex items-center"
                        >
                          <Ruler size={12} className="mr-1" />
                          Size Chart
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
