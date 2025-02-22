import Link from "next/link";

export function StickyBarInCartIndicator() {
  return (
    <div className="w-max relative px-[10px] pt-1 pb-[10px] min-[860px]:px-4 min-[860px]:py-[14px] rounded shadow-dropdown bg-white before:content-[''] before:w-[14px] before:h-[14px] before:bg-white before:rounded-tr-[2px] before:rotate-45 before:absolute before:top-1/2 before:-translate-y-1/2 before:-left-[7px] before:border-l before:border-b before:border-[#d9d9d9]">
      <div className="w-full h-full flex flex-col min-[860px]:flex-row justify-between gap-1 min-[860px]:gap-4">
        <span className="font-bold">In cart</span>
        <Link
          href="/cart"
          className="text-xs text-blue px-2 w-max h-6 rounded-full cursor-pointer flex items-center justify-center border border-[#d9d8d6] shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear-gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.1)]"
        >
          See now
        </Link>
      </div>
    </div>
  );
}
