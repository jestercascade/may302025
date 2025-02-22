import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";
import clsx from "clsx";
import Link from "next/link";

export function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  return (
    <>
      {totalPages > 1 && (
        <div className="mt-8 mb-12">
          <div className="w-max mx-auto flex gap-1 h-9">
            <Link
              href={`?page=${currentPage - 1}`}
              className={clsx(
                "w-9 h-9 flex items-center justify-center rounded-full ease-in-out duration-300 transition",
                {
                  "pointer-events-none opacity-50": currentPage === 1,
                  "active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed":
                    currentPage !== 1,
                }
              )}
            >
              <ChevronLeftIcon className="-ml-[2px]" size={24} />
            </Link>
            <div className="min-w-[36px] max-w-[36px] h-9 px-1 flex items-center justify-center border rounded-full bg-white">
              {currentPage}
            </div>
            <div className="flex items-center justify-center px-1">of</div>
            <div className="min-w-[36px] max-w-[36px] h-9 px-1 flex items-center justify-center border rounded-full bg-white">
              {totalPages}
            </div>
            <Link
              href={`?page=${currentPage + 1}`}
              className={clsx(
                "w-9 h-9 flex items-center justify-center rounded-full ease-in-out duration-300 transition",
                {
                  "pointer-events-none opacity-50": currentPage === totalPages,
                  "active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed":
                    currentPage !== totalPages,
                }
              )}
            >
              <ChevronRightIcon className="-mr-[2px]" size={24} />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
