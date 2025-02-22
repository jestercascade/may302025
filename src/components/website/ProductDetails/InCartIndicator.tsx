import { useUpsellReviewStore } from "@/zustand/website/upsellReviewStore";
import { usePathname, useRouter } from "next/navigation";
import { useQuickviewStore } from "@/zustand/website/quickviewStore";
import { useNavigation } from "@/components/shared/NavigationLoadingIndicator";

export function InCartIndicator() {
  const hideOverlay = useUpsellReviewStore((state) => state.hideOverlay);
  const hideQuickviewOverlay = useQuickviewStore((state) => state.hideOverlay);
  const pathname = usePathname();
  const { push } = useNavigation();

  const handleInCartButtonClick = () => {
    if (pathname === "/cart") {
      hideOverlay();
      hideQuickviewOverlay();

      const scrollableParent = document.getElementById("scrollable-parent");
      if (scrollableParent) {
        scrollableParent.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    } else {
      push("/cart");
    }
  };

  return (
    <div className="w-max relative px-4 py-[14px] rounded shadow-dropdown bg-white before:content-[''] before:w-[14px] before:h-[14px] before:bg-white before:rounded-tr-[2px] before:rotate-45 before:absolute before:-top-2 lg:before:top-1/2 lg:before:-translate-y-1/2 before:left-14 lg:before:-left-[7px] before:border-l before:border-t lg:before:border-t-0 lg:before:border-b before:border-[#d9d9d9]">
      <div className="w-full h-full flex items-center justify-between gap-4">
        <span className="font-bold">In cart</span>
        <button
          onClick={handleInCartButtonClick}
          className="text-xs text-blue px-2 w-max h-6 rounded-full cursor-pointer flex items-center justify-center border border-[#d9d8d6] shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear-gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.1)]"
        >
          See now
        </button>
      </div>
    </div>
  );
}
