"use client";

import clsx from "clsx";
import { useRef, useEffect } from "react";

const SUCCESS = "SUCCESS";
const ERROR = "ERROR";
const NEUTRAL = "NEUTRAL";

export default function AlertMessage({
  message,
  hideAlertMessage,
  type = NEUTRAL,
}: {
  message: string;
  hideAlertMessage: () => void;
  type?: "SUCCESS" | "ERROR" | "NEUTRAL";
}) {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element;
      const overlay = overlayRef.current;

      if (overlay?.contains(target) && overlay === target) {
        hideAlertMessage();
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [hideAlertMessage]);

  return (
    <div
      ref={overlayRef}
      id="alert-message-overlay"
      className={clsx(
        "select-none flex justify-center py-20 w-full h-dvh overflow-x-hidden overflow-y-visible z-50 fixed top-0 bottom-0 left-0 right-0 transition duration-300 ease-in-out",
        { "bg-green-400/30": type.toUpperCase() === SUCCESS },
        { "bg-red-400/30": type.toUpperCase() === ERROR },
        { "bg-black/30": type.toUpperCase() === NEUTRAL }
      )}
    >
      <div
        id="message-container"
        className={clsx(
          "absolute bottom-0 left-0 right-0 pt-3 pb-8 px-8 rounded-tl-3xl rounded-tr-3xl",
          { "bg-[#008500]": type.toUpperCase() === SUCCESS },
          { "bg-[#ed2828]": type.toUpperCase() === ERROR },
          { "bg-black": type.toUpperCase() === NEUTRAL }
        )}
      >
        <div className="mx-auto text-white text-center font-medium max-w-[400px]">
          {message}
        </div>
      </div>
    </div>
  );
}
