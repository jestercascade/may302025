import { capitalizeFirstLetter } from "@/lib/utils/common";
import clsx from "clsx";

type DataChipType = {
  value: VisibilityType;
};

const chipStyles: Record<VisibilityType, string> = {
  PUBLISHED: "bg-green/10 border border-green/15 text-green",
  DRAFT: "bg-lightgray border border-[#6c6c6c]/15 text-gray",
  HIDDEN: "bg-lightgray border border-[#6c6c6c]/15 text-gray",
};

export default function DataChip({ value }: DataChipType) {
  const chipColor = clsx(
    "px-3 rounded-full h-6 w-max flex items-center",
    chipStyles[value.toUpperCase() as VisibilityType],
  );

  return <div className={chipColor}>{capitalizeFirstLetter(value.toLowerCase())}</div>;
}
