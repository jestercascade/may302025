"use client";

import { useEffect } from "react";
import { useAlertStore } from "@/zustand/website/alertStore";
import AlertMessage from "../shared/AlertMessage";

export default function ShowAlert() {
  const message = useAlertStore((state) => state.message);
  const type = useAlertStore((state) => state.type);
  const isVisible = useAlertStore((state) => state.isVisible);
  const hideAlert = useAlertStore((state) => state.hideAlert);

  useEffect(() => {
    const body = document.body;
    const productDetailsWrapper = document.getElementById("product-details-wrapper");

    if (isVisible) {
      // Prevent scrolling
      body.style.overflow = "hidden";
      if (productDetailsWrapper) {
        productDetailsWrapper.style.overflow = "hidden";
      }
    } else {
      // Restore scrolling
      body.style.overflow = "";
      if (productDetailsWrapper) {
        productDetailsWrapper.style.overflow = "";
      }
    }

    // Cleanup on unmount
    return () => {
      body.style.overflow = "";
      if (productDetailsWrapper) {
        productDetailsWrapper.style.overflow = "";
      }
    };
  }, [isVisible]);

  return (
    <>
      {isVisible && (
        <AlertMessage
          hideAlertMessage={hideAlert}
          message={message}
          type={type}
        />
      )}
    </>
  );
}
