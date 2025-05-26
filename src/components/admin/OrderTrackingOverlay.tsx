"use client";

import { FormEvent, useState, useEffect, useRef } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { ArrowLeft, X, ChevronDown, Pencil } from "lucide-react";
import Overlay from "@/ui/Overlay";
import { ShowAlertType } from "@/lib/sharedTypes";
import { useAlertStore } from "@/zustand/shared/alertStore";
import clsx from "clsx";
import DatePicker from "react-datepicker";

export function OrderTrackingButton() {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.orderDetails.name);
  const overlayName = useOverlayStore((state) => state.pages.orderDetails.overlays.orderTracking.name);

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      type="button"
      className="w-9 h-9 absolute top-2 right-2 rounded-full flex items-center justify-center transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
    >
      <Pencil size={18} strokeWidth={1.75} />
    </button>
  );
}

export function OrderTrackingOverlay({ order }: { order: OrderType }) {
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState(order.tracking.currentStatus);
  const [estimatedDeliveryStart, setEstimatedDeliveryStart] = useState<Date | null>(
    order.tracking.estimatedDeliveryRange?.start ? new Date(order.tracking.estimatedDeliveryRange.start) : null
  );
  const [estimatedDeliveryEnd, setEstimatedDeliveryEnd] = useState<Date | null>(
    order.tracking.estimatedDeliveryRange?.end ? new Date(order.tracking.estimatedDeliveryRange.end) : null
  );
  const [trackingNumber, setTrackingNumber] = useState(order.tracking.trackingNumber || "");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const showAlert = useAlertStore((state) => state.showAlert);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.orderDetails.name);
  const overlayName = useOverlayStore((state) => state.pages.orderDetails.overlays.orderTracking.name);
  const isOverlayVisible = useOverlayStore((state) => state.pages.orderDetails.overlays.orderTracking.isVisible);

  const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "COMPLETED", label: "Completed" },
  ];

  useEffect(() => {
    if (isOverlayVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      if (!isOverlayVisible) {
        document.body.style.overflow = "visible";
      }
    };
  }, [isOverlayVisible, showAlert]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!statusDropdownRef.current || !(event.target instanceof Node)) {
        return;
      }

      const targetNode = statusDropdownRef.current as Node;

      if (!targetNode.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isValidDateRange =
    estimatedDeliveryStart &&
    estimatedDeliveryEnd &&
    estimatedDeliveryStart.toISOString().split("T")[0] < estimatedDeliveryEnd.toISOString().split("T")[0];

  const onHideOverlay = () => {
    setLoading(false);
    hideOverlay({ pageName, overlayName });
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();

    setLoading(true);

    const updatedData = {
      id: order.id,
      tracking: {
        currentStatus: orderStatus,
        trackingNumber: trackingNumber || undefined,
        estimatedDeliveryRange:
          estimatedDeliveryStart && estimatedDeliveryEnd
            ? {
                start: estimatedDeliveryStart.toISOString(),
                end: estimatedDeliveryEnd.toISOString(),
              }
            : undefined,
      },
    };

    try {
      // const result = await UpdateOrderTrackingAction(updatedData);
      // showAlert({
      //   message: result.message,
      //   type: result.type,
      // });
    } catch (error) {
      console.error("Error updating order tracking:", error);
      showAlert({
        message: "Failed to update order tracking",
        type: ShowAlertType.ERROR,
      });
    } finally {
      setLoading(false);
      onHideOverlay();
    }
  };

  const selectedStatusLabel = statusOptions.find((option) => option.value === orderStatus)?.label || "Select status";

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[20px] bg-white md:w-[500px] md:rounded-2xl md:shadow md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">Basic details</h2>
                  <button
                    onClick={() => {
                      hideOverlay({ pageName, overlayName });
                    }}
                    type="button"
                    className="w-7 h-7 rounded-full flex items-center justify-center absolute right-4 transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed"
                  >
                    <X color="#6c6c6c" size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
              <div className="hidden md:flex md:items-center md:justify-between py-2 pr-4 pl-2">
                <button
                  onClick={() => {
                    hideOverlay({ pageName, overlayName });
                  }}
                  type="button"
                  className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
                >
                  <ArrowLeft size={20} strokeWidth={2} className="-ml-1 stroke-blue" />
                  <span className="font-semibold text-sm text-blue">Basic details</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={clsx(
                    "relative h-9 w-max px-4 rounded-full overflow-hidden transition-colors text-white bg-neutral-700",
                    {
                      "bg-opacity-50": loading,
                      "hover:bg-neutral-600 active:bg-neutral-800": !loading,
                    }
                  )}
                >
                  {loading ? (
                    <div className="flex gap-1 items-center justify-center w-full h-full">
                      <Spinner color="white" />
                      <span className="text-white">Saving</span>
                    </div>
                  ) : (
                    <span className="text-white">Save</span>
                  )}
                </button>
              </div>
              <div className="w-full h-full mt-[52px] md:mt-0 p-5 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="orderStatus" className="text-xs text-gray">
                    Order Status
                  </label>
                  <div className="w-full h-9 relative" ref={statusDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                      className="h-9 w-full px-3 rounded-md flex items-center justify-between transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed"
                    >
                      <span className="text-left">{selectedStatusLabel}</span>
                      <ChevronDown
                        size={16}
                        className={clsx("-mr-[4px] stroke-gray transition-transform duration-200", {
                          "rotate-180": isStatusDropdownOpen,
                        })}
                      />
                    </button>
                    <div
                      className={clsx("w-full absolute top-10 z-10", {
                        hidden: !isStatusDropdownOpen,
                        block: isStatusDropdownOpen,
                      })}
                    >
                      <div className="overflow-hidden h-full w-full py-[6px] flex flex-col gap-0 rounded-md shadow-dropdown bg-white">
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setOrderStatus(option.value as OrderType["tracking"]["currentStatus"]);
                              setIsStatusDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left transition-colors duration-150 hover:bg-lightgray"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xs text-gray">Estimated Delivery</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <div
                      className={clsx("w-[140px] flex gap-2 items-center border rounded-md overflow-hidden pl-3", {
                        "border-red": !isValidDateRange && estimatedDeliveryStart && estimatedDeliveryEnd,
                      })}
                    >
                      <DatePicker
                        selected={estimatedDeliveryStart}
                        onChange={(date) => setEstimatedDeliveryStart(date)}
                        className="w-full h-9 outline-none text-sm"
                        placeholderText="Start date"
                      />
                    </div>
                    <span className="text-sm text-gray">to</span>
                    <div
                      className={clsx("w-[140px] flex gap-2 items-center border rounded-md overflow-hidden pl-3", {
                        "border-red": !isValidDateRange && estimatedDeliveryStart && estimatedDeliveryEnd,
                      })}
                    >
                      <DatePicker
                        selected={estimatedDeliveryEnd}
                        onChange={(date) => setEstimatedDeliveryEnd(date)}
                        className="w-full h-9 outline-none text-sm"
                        placeholderText="End date"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="trackingNumber" className="text-xs text-gray">
                    Tracking Number
                  </label>
                  <div className="w-full h-9 relative">
                    <input
                      type="text"
                      id="trackingNumber"
                      placeholder="Enter tracking number"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-neutral-400"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="md:hidden w-full pb-5 pt-2 px-5 absolute bottom-0 bg-white">
              <div className="flex gap-3">
                <button
                  onClick={() => hideOverlay({ pageName, overlayName })}
                  type="button"
                  className="h-12 px-6 rounded-full border border-neutral-300 font-medium text-neutral-700 transition duration-300 ease-in-out active:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={clsx(
                    "relative h-12 flex-1 rounded-full overflow-hidden transition-colors text-white bg-blue",
                    {
                      "bg-opacity-50": loading,
                      "hover:bg-blue-600 active:bg-blue-700": !loading,
                    }
                  )}
                >
                  {loading ? (
                    <div className="flex gap-1 items-center justify-center w-full h-full">
                      <Spinner color="white" />
                      <span className="text-white">Updating</span>
                    </div>
                  ) : (
                    <span className="text-white">Update</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
}

// -- Type Definitions --

type OrderType = {
  id: string;
  timestamp: string;
  status: string;
  payer: {
    email: string;
    payerId: string;
    name: {
      firstName: string;
      lastName: string;
    };
  };
  amount: {
    value: string;
    currency: string;
  };
  shipping: {
    name: string;
    address: {
      line1: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  transactionId: string;
  items: Array<
    | {
        type: "product";
        baseProductId: string;
        name: string;
        slug: string;
        pricing: {
          basePrice: number;
          salePrice: number;
          discountPercentage: number;
        };
        mainImage: string;
        variantId: string;
        selectedOptions: Record<string, { value: string; optionDisplayOrder: number; groupDisplayOrder: number }>;
        index: number;
      }
    | {
        type: "upsell";
        baseUpsellId: string;
        variantId: string;
        index: number;
        mainImage: string;
        pricing: {
          basePrice: number;
          salePrice: number;
          discountPercentage: number;
        };
        products: Array<{
          id: string;
          slug: string;
          name: string;
          mainImage: string;
          basePrice: number;
          selectedOptions: Record<string, { value: string; optionDisplayOrder: number; groupDisplayOrder: number }>;
        }>;
      }
  >;
  invoiceId: string;
  emails: {
    confirmed: {
      sentCount: number;
      maxAllowed: number;
      lastSent: string | null;
    };
    shipped: {
      sentCount: number;
      maxAllowed: number;
      lastSent: string | null;
    };
    delivered: {
      sentCount: number;
      maxAllowed: number;
      lastSent: string | null;
    };
  };
  tracking: {
    currentStatus: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "COMPLETED";
    statusHistory: Array<{
      status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "COMPLETED";
      timestamp: string;
      message?: string;
    }>;
    trackingNumber?: string;
    estimatedDeliveryRange?: {
      start: string;
      end: string;
    };
    lastUpdated: string;
  };
};
