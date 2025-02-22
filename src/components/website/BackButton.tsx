"use client";

import { ChevronLeftIcon } from "@/icons";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoBack}
      className="h-9 w-9 bg-black/80 rounded-full flex items-center justify-center absolute top-4 left-5 z-10 transition duration-300 ease-in-out active:bg-black"
    >
      <ChevronLeftIcon className="stroke-white mr-[2px]" size={22} />
    </button>
  );
}
