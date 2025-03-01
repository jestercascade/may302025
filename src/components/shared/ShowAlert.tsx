"use client";

import clsx from "clsx";
import { useRef, useEffect } from "react";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { usePathname } from "next/navigation";

const SUCCESS = "SUCCESS";
const ERROR = "ERROR";
const NEUTRAL = "NEUTRAL";

export default function ShowAlert() {
  const message = useAlertStore((state) => state.message);
  const type = useAlertStore((state) => state.type);
  const isVisible = useAlertStore((state) => state.isVisible);
  const hideAlert = useAlertStore((state) => state.hideAlert);

  const overlayRef = useRef(null);
  const pathname = usePathname();

  const typeUpper = type?.toUpperCase();

  useEffect(() => {
    console.log("hello");

    if (isVisible) hideAlert();
  }, [pathname, hideAlert]); // Fixed: Removed isVisible

  useEffect(() => {
    const body = document.body;
    const productDetailsWrapper = document.getElementById(
      "product-details-wrapper"
    );

    if (isVisible) {
      body.style.overflow = "hidden";
      if (productDetailsWrapper)
        productDetailsWrapper.style.overflow = "hidden";
    } else {
      body.style.overflow = "";
      if (productDetailsWrapper) productDetailsWrapper.style.overflow = "";
    }

    return () => {
      body.style.overflow = "";
      if (productDetailsWrapper) productDetailsWrapper.style.overflow = "";
    };
  }, [isVisible]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const overlay = overlayRef.current;
      if (overlay && overlay === event.target) {
        hideAlert();
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [hideAlert]);

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      id="alert-message-overlay"
      className={clsx(
        "select-none flex justify-center py-20 w-full h-dvh overflow-x-hidden overflow-y-visible z-50 fixed top-0 bottom-0 left-0 right-0 transition duration-300 ease-in-out",
        {
          "bg-green-400/30": typeUpper === SUCCESS,
          "bg-red-400/30": typeUpper === ERROR,
          "bg-black/30": typeUpper === NEUTRAL,
        }
      )}
    >
      <div
        id="message-container"
        className={clsx(
          "absolute bottom-0 left-0 right-0 pt-3 pb-8 px-8 rounded-tl-3xl rounded-tr-3xl",
          {
            "bg-[#008500]": typeUpper === SUCCESS,
            "bg-[#ed2828]": typeUpper === ERROR,
            "bg-black": typeUpper === NEUTRAL,
          }
        )}
      >
        <div className="mx-auto text-white text-center font-medium max-w-[400px]">
          {message}
        </div>
      </div>
    </div>
  );
}
