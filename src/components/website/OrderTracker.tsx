"use client";

import { getOrders } from "@/actions/get/orders";
import { ShowAlertType } from "@/lib/sharedTypes";
import { useAlertStore } from "@/zustand/shared/alertStore";
import {
  Search,
  CheckCircle,
  Truck,
  Package,
  MapPin,
  Check,
  Clock,
  PackageCheck,
  Trophy,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatThousands } from "@/lib/utils/common";

export default function OrderTracker() {
  const [invoiceId, setInvoiceId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderData, setOrderData] = useState<OrderType | null>(null);
  const { showAlert } = useAlertStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setOrderData(null);

    try {
      const validation = validateInvoiceId(invoiceId);
      if (!validation.isValid) {
        showAlert({
          message: validation.error || "Please check your invoice ID",
          type: ShowAlertType.ERROR,
        });
        return;
      }

      const result = await getOrders({ invoiceIds: [validation.id!] });

      if (!result || result.length === 0) {
        showAlert({
          message: "No order found with this invoice ID",
          type: ShowAlertType.ERROR,
        });
        return;
      }

      const orderValidation = validateOrderData(result[0]);
      if (!orderValidation.isValid) {
        showAlert({
          message: orderValidation.error || "Unable to load order details",
          type: ShowAlertType.ERROR,
        });
        return;
      }

      setOrderData(orderValidation.order!);
    } catch (error) {
      console.error("Order tracking error:", error);

      showAlert({
        message: "We're having trouble finding your order. Please try again in a moment.",
        type: ShowAlertType.ERROR,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateRange = (range?: { start: string; end: string }): string => {
    try {
      if (!range || (!range.start && !range.end)) {
        return "Date to be confirmed";
      }

      const parseDate = (dateStr: string) => {
        try {
          return dateStr ? new Date(dateStr) : null;
        } catch {
          return null;
        }
      };

      const start = parseDate(range.start);
      const end = parseDate(range.end);

      const formatMD = (date: Date) => {
        try {
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          });
        } catch {
          return "Invalid date";
        }
      };

      if (start && end) {
        const sameMonth = start.getUTCFullYear() === end.getUTCFullYear() && start.getUTCMonth() === end.getUTCMonth();

        if (sameMonth) {
          const month = start.toLocaleDateString("en-US", {
            month: "short",
            timeZone: "UTC",
          });
          return `${month} ${start.getUTCDate()}–${end.getUTCDate()}`;
        } else {
          return `${formatMD(start)} – ${formatMD(end)}`;
        }
      }

      if (start) return `From ${formatMD(start)}`;
      if (end) return `By ${formatMD(end)}`;

      return "Date to be confirmed";
    } catch {
      return "Date to be confirmed";
    }
  };

  const shouldShowExpectedDelivery = (status: string): boolean => {
    try {
      const normalizedStatus = (status || "").toString().toLowerCase();
      return normalizedStatus !== "delivered" && normalizedStatus !== "completed";
    } catch {
      return true;
    }
  };

  const statusOptions = ["pending", "confirmed", "shipped", "delivered", "completed"];

  const formatOptions = (options: Record<string, SelectedOptionType>, type: "product" | "upsell" = "product") => {
    try {
      if (!options || typeof options !== "object") return null;

      const entries = Object.entries(options).filter(
        ([, option]) => option && typeof option === "object" && option.value
      );

      if (entries.length === 0) return null;

      const sortedEntries = entries.sort(
        ([, a], [, b]) => safeNumber(a?.groupDisplayOrder) - safeNumber(b?.groupDisplayOrder)
      );

      const getClassNames = () => {
        if (type === "upsell") {
          return "inline-flex text-xs px-1.5 py-0.5 rounded border border-blue-200/70 text-gray bg-blue-50";
        }
        return "inline-flex text-xs px-1.5 py-0.5 rounded bg-[#F7F7F7] text-neutral-500";
      };

      return (
        <div className="flex flex-wrap gap-1 mt-1 max-w-72">
          {sortedEntries.map(([key, option]) => {
            const formattedKey = safeString(key).charAt(0).toUpperCase() + safeString(key).slice(1);
            const value = safeString(option?.value);
            const id = `${key}:${value}`;

            return (
              <span key={id} className={getClassNames()}>
                {formattedKey}: {value}
              </span>
            );
          })}
        </div>
      );
    } catch {
      return null;
    }
  };

  const renderProductItem = (item: OrderProductItemType, index: number) => {
    try {
      const basePrice = safeNumber(item?.pricing?.basePrice);
      const salePrice = item?.pricing?.salePrice ? safeNumber(item.pricing.salePrice) : null;
      const itemName = safeString(item?.name, "Product");

      return (
        <div key={index} className="flex gap-3">
          <div className="relative flex flex-col min-[580px]:flex-row gap-4 w-full p-5 rounded-lg border border-gray-200/70">
            <div className="aspect-square h-[160px] min-[580px]:h-[128px]">
              <div className="min-[580px]:hidden flex items-center justify-center h-full w-max mx-auto overflow-hidden rounded-lg">
                <Image src={item.mainImage} alt={item.name} width={160} height={160} priority />
              </div>
              <div className="hidden min-[580px]:flex items-center justify-center min-[580px]:min-w-[128px] min-[580px]:max-w-[128px] min-[580px]:min-h-[128px] min-[580px]:max-h-[128px] overflow-hidden rounded-lg">
                <Image src={item.mainImage} alt={item.name} width={128} height={128} priority />
              </div>
            </div>
            <div className="w-full flex flex-col gap-1">
              <div className="min-w-full h-5 flex items-center justify-between gap-3">
                {item?.slug && item?.baseProductId ? (
                  <Link
                    href={`${item.slug}-${item.baseProductId}`}
                    target="_blank"
                    className="text-xs line-clamp-1 min-[580px]:w-[calc(100%-28px)] hover:underline"
                  >
                    {itemName}
                  </Link>
                ) : (
                  <h4 className="text-xs line-clamp-1">{itemName}</h4>
                )}
              </div>
              {formatOptions(item?.selectedOptions || {})}
              <div className="mt-1 w-max flex items-center justify-center">
                {salePrice ? (
                  <div className="flex items-center gap-[6px]">
                    <div className="flex items-baseline text-[rgb(168,100,0)]">
                      <span className="text-[0.813rem] leading-3 font-semibold">$</span>
                      <span className="text-lg font-bold">{Math.floor(salePrice)}</span>
                      <span className="text-[0.813rem] leading-3 font-semibold">
                        {(salePrice % 1).toFixed(2).substring(1)}
                      </span>
                    </div>
                    <span className="text-[0.813rem] leading-3 text-gray line-through">
                      ${formatThousands(basePrice)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-baseline">
                    <span className="text-[0.813rem] leading-3 font-semibold">$</span>
                    <span className="text-lg font-bold">{Math.floor(basePrice)}</span>
                    <span className="text-[0.813rem] leading-3 font-semibold">
                      {(basePrice % 1).toFixed(2).substring(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    } catch {
      return (
        <div key={index} className="flex gap-3">
          <div className="w-full p-5 rounded-lg border border-gray-200/70 bg-gray-50">
            <div className="flex items-center gap-2 text-gray-600">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">Product information temporarily unavailable</p>
            </div>
          </div>
        </div>
      );
    }
  };

  const renderUpsellItem = (item: OrderUpsellItemType, index: number) => {
    try {
      const basePrice = safeNumber(item?.pricing?.basePrice);
      const salePrice = item?.pricing?.salePrice ? safeNumber(item.pricing.salePrice) : null;
      const products = Array.isArray(item?.products) ? item.products : [];

      return (
        <div key={index} className="flex gap-3">
          <div className="relative w-full p-5 rounded-lg bg-blue-50 border border-blue-200/50">
            <div className="flex items-center justify-between mb-4">
              <div className="min-w-full h-5 flex gap-5 items-center justify-center">
                <div className="w-max flex items-center justify-center">
                  {salePrice ? (
                    <div className="flex items-center gap-[6px]">
                      <div className="flex items-baseline text-[rgb(168,100,0)]">
                        <span className="text-[0.813rem] leading-3 font-semibold">$</span>
                        <span className="text-lg font-bold">{Math.floor(salePrice)}</span>
                        <span className="text-[0.813rem] leading-3 font-semibold">
                          {(salePrice % 1).toFixed(2).substring(1)}
                        </span>
                      </div>
                      <span className="text-[0.813rem] leading-3 text-gray line-through">
                        ${formatThousands(basePrice)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-baseline text-[rgb(168,100,0)]">
                      <span className="text-[0.813rem] leading-3 font-semibold">$</span>
                      <span className="text-lg font-bold">{Math.floor(basePrice)}</span>
                      <span className="text-[0.813rem] leading-3 font-semibold">
                        {(basePrice % 1).toFixed(2).substring(1)}
                      </span>
                      <span className="ml-1 text-[0.813rem] leading-3 font-semibold">today</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {products.map((product, prodIndex) => (
                <div
                  key={prodIndex}
                  className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-3 border border-blue-200/50 shadow-sm"
                >
                  <div className="flex flex-col min-[580px]:flex-row gap-4">
                    <div className="aspect-square h-[160px] min-[580px]:h-[128px]">
                      <div className="min-[580px]:hidden flex items-center justify-center h-full w-max mx-auto overflow-hidden rounded-lg">
                        <Image src={product.mainImage} alt={product.name} width={160} height={160} priority />
                      </div>
                      <div className="hidden min-[580px]:flex items-center justify-center min-[580px]:min-w-[128px] min-[580px]:max-w-[128px] min-[580px]:min-h-[128px] min-[580px]:max-h-[128px] overflow-hidden rounded-lg">
                        <Image src={product.mainImage} alt={product.name} width={128} height={128} priority />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {product?.slug && product?.id ? (
                        <Link
                          href={`${product.slug}-${product.id}`}
                          target="_blank"
                          className="text-xs line-clamp-1 hover:underline"
                        >
                          {product?.name}
                        </Link>
                      ) : (
                        <h4 className="text-xs line-clamp-1">{product?.name}</h4>
                      )}
                      {formatOptions(product?.selectedOptions || {}, "upsell")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } catch {
      return (
        <div key={index} className="flex gap-3">
          <div className="w-full p-5 rounded-lg border border-gray-200/70 bg-gray-50">
            <div className="flex items-center gap-2 text-gray-600">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">Bundle information temporarily unavailable</p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200/70 overflow-hidden">
      <div className="p-6">
        <form className="flex flex-col md:flex-row gap-3" onSubmit={handleSubmit}>
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray" />
            </div>
            <input
              type="text"
              placeholder="Enter invoice ID"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 bg-white border rounded-lg focus:border-[#caced4] transition-all duration-200"
              disabled={isLoading}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto px-6 py-2 rounded-lg font-medium text-white transition-all duration-200 bg-[#404040] hover:bg-[#525252] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Tracking..." : "Track"}
            </button>
          </div>
        </form>
      </div>
      {orderData && (
        <div className="p-6 border-t border-gray-200/70">
          <div className="bg-blue-50/50 px-6 py-5 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Invoice #{safeString(orderData.invoiceId).trim().split(" ")[0] || "Unknown"}
                  </h2>
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber text-white">
                    {safeString(orderData.tracking?.currentStatus)
                      ? safeString(orderData.tracking.currentStatus).charAt(0).toUpperCase() +
                        safeString(orderData.tracking.currentStatus).slice(1).toLowerCase()
                      : "Processing"}
                  </div>
                </div>
                <p className="text-sm text-gray mb-1">Placed {safeFormatDate(orderData.timestamp)}</p>
                <div className="flex items-center text-sm text-gray">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {safeString(orderData.shipping?.address?.city, "Unknown City")},{" "}
                    {safeString(orderData.shipping?.address?.country, "Unknown Country")}
                  </span>
                </div>
                {shouldShowExpectedDelivery(orderData.tracking?.currentStatus || "") &&
                  orderData.tracking?.estimatedDeliveryDate && (
                    <div className="flex items-center text-sm text-amber mt-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="font-medium">
                        Expected delivery: {formatDateRange(orderData.tracking.estimatedDeliveryDate)}
                      </span>
                    </div>
                  )}
              </div>
              <div className="text-right">
                <div className="flex items-baseline justify-end">
                  <span className="text-sm leading-3 font-semibold">$</span>
                  <span className="text-xl font-bold">{Math.floor(safeNumber(orderData.amount?.value))}</span>
                  <span className="text-sm leading-3 font-semibold">
                    {(safeNumber(orderData.amount?.value) % 1).toFixed(2).substring(1)}
                  </span>
                </div>
                <p className="text-xs text-gray">Total</p>
              </div>
            </div>
          </div>

          {/* Status Progress */}
          <div className="py-6">
            <div className="relative max-w-2xl mx-auto px-[10px]">
              <div className="absolute top-[9px] left-[10px] right-[10px] h-0.5 bg-gray-300 rounded-full"></div>
              <div
                className="absolute top-[9px] left-0 h-0.5 bg-[#404040] rounded-full transition-all duration-700"
                style={{
                  width: `${
                    ((statusOptions.indexOf(safeString(orderData.tracking?.currentStatus).toLowerCase() || "pending") +
                      1) /
                      statusOptions.length) *
                    100
                  }%`,
                }}
              ></div>
              <div className="relative flex justify-between">
                {statusOptions.map((status, index) => {
                  const currentStatusIndex = statusOptions.indexOf(
                    safeString(orderData.tracking?.currentStatus).toLowerCase() || "pending"
                  );
                  const isCompleted = currentStatusIndex >= index;
                  const isActive = status === safeString(orderData.tracking?.currentStatus).toLowerCase();

                  return (
                    <div key={status} className="flex flex-col items-center">
                      <div
                        className={`rounded-full h-5 w-5 flex items-center justify-center mb-2 transition-all duration-300 ${
                          isActive ? "bg-[#404040] shadow-sm" : isCompleted ? "bg-[#404040]" : "bg-gray-300"
                        }`}
                      >
                        {isCompleted && <Check color="#ffffff" size={14} />}
                      </div>
                      <div
                        className={`text-xs font-medium text-center ${isCompleted ? "text-black" : "text-gray-400"}`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-3 rounded-xl text-sm bg-neutral-50 text-gray border border-gray-200/50">
              {safeString(orderData.tracking?.currentStatus).toLowerCase() === "pending" ? (
                <>
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  Your order is pending. We'll start processing it soon.
                </>
              ) : safeString(orderData.tracking?.currentStatus).toLowerCase() === "confirmed" ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                  Your order is confirmed. We're getting it ready.
                </>
              ) : safeString(orderData.tracking?.currentStatus).toLowerCase() === "shipped" ? (
                <>
                  <Truck className="h-4 w-4 mr-2 text-gray-500" />
                  Your order has shipped and is in transit.
                </>
              ) : safeString(orderData.tracking?.currentStatus).toLowerCase() === "delivered" ? (
                <>
                  <PackageCheck className="h-4 w-4 mr-2 text-gray-500" />
                  Your package has been delivered. Thanks for shopping with us!
                </>
              ) : safeString(orderData.tracking?.currentStatus).toLowerCase() === "completed" ? (
                <>
                  <Trophy className="h-4 w-4 mr-2 text-gray-500" />
                  Your order is complete. Enjoy!
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2 text-gray-500" />
                  We're preparing your order. You'll get an update soon.
                </>
              )}
            </div>
          </div>

          {/* Status Log */}
          <div className="mb-8">
            <h3 className="text-base font-medium text-gray-900 mb-4">Status Log</h3>
            <div className="space-y-4">
              {(orderData.tracking?.statusHistory || [])
                .slice()
                .reverse()
                .map((historyItem, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 mt-1.5">
                      <div className="w-2 h-2 bg-neutral-400/70 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">
                          {historyItem?.status
                            ? historyItem.status.charAt(0).toUpperCase() + historyItem.status.slice(1).toLowerCase()
                            : "Status Update"}
                        </p>
                        <time className="text-xs text-gray flex-shrink-0 font-mono">
                          {safeFormatDate(historyItem?.timestamp || "")}
                        </time>
                      </div>
                      <p className="text-sm text-gray">{historyItem?.message || "Status updated"}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <h3 className="text-base font-medium mb-4">Items Ordered</h3>
            {(orderData.items || []).map((item, index) => {
              if (item?.type === "product") {
                return renderProductItem(item, index);
              } else if (item?.type === "upsell") {
                return renderUpsellItem(item, index);
              }
              return (
                <div key={index} className="flex gap-3">
                  <div className="w-full p-5 rounded-lg border border-red-200 bg-red-50">
                    <p className="text-sm text-red-600">Unknown item type</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// -- Helper Functions --

const validateInvoiceId = (invoiceId: string): { isValid: boolean; id?: string; error?: string } => {
  try {
    const trimmed = invoiceId?.trim();
    if (!trimmed) {
      return { isValid: false, error: "Please enter an invoice ID" };
    }

    let id = trimmed.split(" ")[0];
    if (id.startsWith("#")) {
      id = id.slice(1);
    }

    const idRegex = /^[A-Za-z0-9]{8}$/;
    if (!idRegex.test(id)) {
      return {
        isValid: false,
        error: "Invoice ID must be 8 alphanumeric characters",
      };
    }

    return { isValid: true, id };
  } catch {
    return { isValid: false, error: "Invalid invoice ID format" };
  }
};

const validateOrderData = (data: any): { isValid: boolean; order?: OrderType; error?: string } => {
  try {
    if (!data || typeof data !== "object") {
      return { isValid: false, error: "Order not found" };
    }

    const requiredChecks = [
      { field: "invoiceId", value: data.invoiceId },
      { field: "timestamp", value: data.timestamp },
      { field: "amount", value: data.amount?.value },
      { field: "shipping", value: data.shipping?.address?.city && data.shipping?.address?.country },
      { field: "tracking", value: data.tracking?.currentStatus },
      { field: "items", value: Array.isArray(data.items) && data.items.length > 0 },
    ];

    for (const check of requiredChecks) {
      if (!check.value) {
        return { isValid: false, error: "Order data is incomplete" };
      }
    }

    return { isValid: true, order: data as OrderType };
  } catch {
    return { isValid: false, error: "Order data is corrupted" };
  }
};

const safeNumber = (value: any, fallback: number = 0): number => {
  try {
    const num = Number(value);
    return !isNaN(num) && isFinite(num) ? num : fallback;
  } catch {
    return fallback;
  }
};

const safeString = (value: any, fallback: string = ""): string => {
  try {
    return value && typeof value === "string" ? value : fallback;
  } catch {
    return fallback;
  }
};

const safeFormatDate = (dateString: string): string => {
  try {
    if (!dateString) return "Date not available";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Date not available";
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Date not available";
  }
};

// -- Type Definitions --

type SelectedOptionType = {
  value: string;
  optionDisplayOrder: number;
  groupDisplayOrder: number;
};

type UpsellProductType = {
  id: string;
  name: string;
  slug: string;
  mainImage: string;
  selectedOptions: Record<string, SelectedOptionType>;
};

type OrderProductItemType = {
  type: "product";
  mainImage: string;
  name: string;
  slug?: string;
  baseProductId?: string;
  selectedOptions: Record<string, SelectedOptionType>;
  pricing: {
    basePrice: number | string;
    salePrice?: number | string;
  };
};

type OrderUpsellItemType = {
  type: "upsell";
  pricing: {
    basePrice: number | string;
    salePrice?: number | string;
  };
  products: UpsellProductType[];
};

type OrderType = {
  invoiceId: string;
  timestamp: string;
  amount: { value: number | string };
  shipping: {
    address: {
      city: string;
      country: string;
    };
  };
  tracking: {
    currentStatus: string;
    estimatedDeliveryDate?: { start: string; end: string };
    statusHistory: Array<{
      status: string;
      timestamp: string;
      message: string;
    }>;
  };
  items: Array<OrderProductItemType | OrderUpsellItemType>;
};
