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
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatThousands } from "@/lib/utils/common";

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

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

class DataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataError";
  }
}

const validateInvoiceId = (invoiceId: string): string => {
  const trimmed = invoiceId?.trim();
  if (!trimmed) {
    throw new ValidationError("Invoice ID is required");
  }

  const id = trimmed.split(" ")[0];
  const idRegex = /^[A-Za-z0-9]{8}$/;

  if (!idRegex.test(id)) {
    throw new ValidationError("Invoice ID must be 8 alphanumeric characters");
  }

  return id;
};

const validateOrderData = (data: any): OrderType => {
  if (!data) {
    throw new DataError("No order data received");
  }

  const requiredFields = ["invoiceId", "timestamp", "amount", "shipping", "tracking", "items"];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new DataError(`Missing required field: ${field}`);
    }
  }

  if (!data.amount?.value) {
    throw new DataError("Missing order amount");
  }

  if (!data.shipping?.address?.city || !data.shipping?.address?.country) {
    throw new DataError("Missing shipping address information");
  }

  if (!data.tracking?.currentStatus || !Array.isArray(data.tracking?.statusHistory)) {
    throw new DataError("Missing or invalid tracking information");
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new DataError("Order must contain at least one item");
  }

  return data as OrderType;
};

const validateNumericValue = (value: number | string, fallback: number = 0): number => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

const safeFormatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid date";
  }
};

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
      const validatedId = validateInvoiceId(invoiceId);

      const result = await getOrders({ invoiceIds: [validatedId] });

      if (!result || result.length === 0) {
        showAlert({
          message: "No order found with this invoice ID",
          type: ShowAlertType.ERROR,
        });
        return;
      }

      const validatedOrder = validateOrderData(result[0]);
      setOrderData(validatedOrder);
    } catch (error) {
      console.error("Order tracking error:", error);

      let errorMessage = "An unexpected error occurred";

      if (error instanceof ValidationError) {
        errorMessage = error.message;
      } else if (error instanceof DataError) {
        errorMessage = `Data error: ${error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      showAlert({
        message: errorMessage,
        type: ShowAlertType.ERROR,
      });
    } finally {
      setIsLoading(false);
    }
  };

  function formatDateRange(range?: { start: string; end: string }): string {
    if (!range || (!range.start && !range.end)) {
      return "Not set";
    }

    const toDate = (s: string) => (s ? new Date(s) : null);
    const start = range.start ? toDate(range.start) : null;
    const end = range.end ? toDate(range.end) : null;

    const fmtMD = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

    if (start && end) {
      const sameMonth = start.getUTCFullYear() === end.getUTCFullYear() && start.getUTCMonth() === end.getUTCMonth();

      if (sameMonth) {
        const month = start.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
        return `${month} ${start.getUTCDate()}–${end.getUTCDate()}`;
      } else {
        return `${fmtMD(start)} – ${fmtMD(end)}`;
      }
    }

    if (start) {
      return `From ${fmtMD(start)}`;
    }

    if (end) {
      return `By ${fmtMD(end)}`;
    }

    return "Not set";
  }

  const shouldShowExpectedDelivery = (status: string): boolean => {
    const normalizedStatus = status.toLowerCase();
    return normalizedStatus !== "delivered" && normalizedStatus !== "completed";
  };

  const statusOptions = ["pending", "confirmed", "shipped", "delivered", "completed"];

  const formatOptions = (options: Record<string, SelectedOptionType>, type: "product" | "upsell" = "product") => {
    try {
      const entries = Object.entries(options || {});
      if (entries.length === 0) return null;

      const sortedEntries = entries.sort(([, a], [, b]) => (a?.groupDisplayOrder || 0) - (b?.groupDisplayOrder || 0));

      const getClassNames = () => {
        if (type === "upsell") {
          return "inline-flex text-xs px-1.5 py-0.5 rounded border border-blue-200/70 text-gray bg-blue-50";
        }
        return "inline-flex text-xs px-1.5 py-0.5 rounded bg-[#F7F7F7] text-neutral-500";
      };

      return (
        <div className="flex flex-wrap gap-1 mt-1 max-w-72">
          {sortedEntries.map(([key, option]) => {
            if (!option?.value) return null;

            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
            const id = `${key}:${option.value}`;
            return (
              <span key={id} className={getClassNames()}>
                {formattedKey}: {option.value}
              </span>
            );
          })}
        </div>
      );
    } catch (error) {
      console.error("Error formatting options:", error);
      return null;
    }
  };

  const renderProductItem = (item: OrderProductItemType, index: number) => {
    try {
      const basePrice = validateNumericValue(item.pricing?.basePrice);
      const salePrice = item.pricing?.salePrice ? validateNumericValue(item.pricing.salePrice) : null;
      const itemName = item.name || "Product";
      const imageUrl = item.mainImage || "/placeholder-image.jpg";

      return (
        <div key={index} className="flex gap-3">
          <div className="relative flex flex-col min-[580px]:flex-row gap-4 w-full p-5 rounded-lg border border-gray-200/70">
            <div className="aspect-square h-[160px] min-[580px]:h-[128px]">
              <div className="min-[580px]:hidden flex items-center justify-center h-full w-max mx-auto overflow-hidden rounded-lg">
                <Image
                  src={imageUrl}
                  alt={itemName}
                  width={160}
                  height={160}
                  priority
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-image.jpg";
                  }}
                />
              </div>
              <div className="hidden min-[580px]:flex items-center justify-center min-[580px]:min-w-[128px] min-[580px]:max-w-[128px] min-[580px]:min-h-[128px] min-[580px]:max-h-[128px] overflow-hidden rounded-lg">
                <Image
                  src={imageUrl}
                  alt={itemName}
                  width={128}
                  height={128}
                  priority
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-image.jpg";
                  }}
                />
              </div>
            </div>
            <div className="w-full flex flex-col gap-1">
              <div className="min-w-full h-5 flex items-center justify-between gap-3">
                {item.slug && item.baseProductId ? (
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
              {formatOptions(item.selectedOptions)}
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
    } catch (error) {
      console.error("Error rendering product item:", error);
      return (
        <div key={index} className="flex gap-3">
          <div className="w-full p-5 rounded-lg border border-red-200 bg-red-50">
            <p className="text-sm text-red-600">Error displaying product item</p>
          </div>
        </div>
      );
    }
  };

  const renderUpsellItem = (item: OrderUpsellItemType, index: number) => {
    try {
      const basePrice = validateNumericValue(item.pricing?.basePrice);
      const salePrice = item.pricing?.salePrice ? validateNumericValue(item.pricing.salePrice) : null;

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
              {(item.products || []).map((product, prodIndex) => {
                const productName = product?.name || "Product";
                const imageUrl = product?.mainImage || "/placeholder-image.jpg";

                return (
                  <div
                    key={prodIndex}
                    className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-3 border border-blue-200/50 shadow-sm"
                  >
                    <div className="flex flex-col min-[580px]:flex-row gap-4">
                      <div className="aspect-square h-[160px] min-[580px]:h-[128px]">
                        <div className="min-[580px]:hidden flex items-center justify-center h-full w-max mx-auto overflow-hidden rounded-lg">
                          <Image
                            src={imageUrl}
                            alt={productName}
                            width={160}
                            height={160}
                            priority
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-image.jpg";
                            }}
                          />
                        </div>
                        <div className="hidden min-[580px]:flex items-center justify-center min-[580px]:min-w-[128px] min-[580px]:max-w-[128px] min-[580px]:min-h-[128px] min-[580px]:max-h-[128px] overflow-hidden rounded-lg">
                          <Image
                            src={imageUrl}
                            alt={productName}
                            width={128}
                            height={128}
                            priority
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-image.jpg";
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        {product?.slug && product?.id ? (
                          <Link
                            href={`${product.slug}-${product.id}`}
                            target="_blank"
                            className="text-xs line-clamp-1 hover:underline"
                          >
                            {productName}
                          </Link>
                        ) : (
                          <h4 className="text-xs line-clamp-1">{productName}</h4>
                        )}
                        {formatOptions(product?.selectedOptions || {}, "upsell")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error("Error rendering upsell item:", error);
      return (
        <div key={index} className="flex gap-3">
          <div className="w-full p-5 rounded-lg border border-red-200 bg-red-50">
            <p className="text-sm text-red-600">Error displaying upsell item</p>
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
              className="block w-full pl-10 pr-4 py-2 bg-white border rounded-lg focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200"
              disabled={isLoading}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto px-6 py-2 rounded-lg font-medium text-white transition-all duration-200 bg-blue hover:bg-blue-dimmed disabled:opacity-50 disabled:cursor-not-allowed"
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
                    Order #{orderData.invoiceId?.trim()?.split(" ")[0] || "Unknown"}
                  </h2>
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber text-white">
                    {orderData.tracking?.currentStatus
                      ? orderData.tracking.currentStatus.charAt(0).toUpperCase() +
                        orderData.tracking.currentStatus.slice(1).toLowerCase()
                      : "Unknown"}
                  </div>
                </div>
                <p className="text-sm text-gray mb-1">Placed {safeFormatDate(orderData.timestamp)}</p>
                <div className="flex items-center text-sm text-gray">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {orderData.shipping?.address?.city || "Unknown"},{" "}
                    {orderData.shipping?.address?.country || "Unknown"}
                  </span>
                </div>
                {shouldShowExpectedDelivery(orderData.tracking?.currentStatus || "") &&
                  orderData.tracking?.estimatedDeliveryDate && (
                    <div className="flex items-center text-sm text-blue mt-2">
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
                  <span className="text-xl font-bold">{Math.floor(validateNumericValue(orderData.amount?.value))}</span>
                  <span className="text-sm leading-3 font-semibold">
                    {(validateNumericValue(orderData.amount?.value) % 1).toFixed(2).substring(1)}
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
                className="absolute top-[9px] left-0 h-0.5 bg-black rounded-full transition-all duration-700"
                style={{
                  width: `${
                    ((statusOptions.indexOf(orderData.tracking?.currentStatus?.toLowerCase() || "pending") + 1) /
                      statusOptions.length) *
                    100
                  }%`,
                }}
              ></div>
              <div className="relative flex justify-between">
                {statusOptions.map((status, index) => {
                  const currentStatusIndex = statusOptions.indexOf(
                    orderData.tracking?.currentStatus?.toLowerCase() || "pending"
                  );
                  const isCompleted = currentStatusIndex >= index;
                  const isActive = status === orderData.tracking?.currentStatus?.toLowerCase();

                  return (
                    <div key={status} className="flex flex-col items-center">
                      <div
                        className={`rounded-full h-5 w-5 flex items-center justify-center mb-2 transition-all duration-300 ${
                          isActive ? "bg-black shadow-sm" : isCompleted ? "bg-black" : "bg-gray-300"
                        }`}
                      >
                        {isCompleted && <Check color="#ffffff" size={14} />}
                      </div>
                      <div
                        className={`text-xs font-medium text-center ${isCompleted ? "text-gray-900" : "text-gray-400"}`}
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
              {orderData.tracking?.currentStatus?.toLowerCase() === "pending" ? (
                <>
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  Your order is pending. We'll start processing it soon.
                </>
              ) : orderData.tracking?.currentStatus?.toLowerCase() === "confirmed" ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                  Your order is confirmed. We're getting it ready.
                </>
              ) : orderData.tracking?.currentStatus?.toLowerCase() === "shipped" ? (
                <>
                  <Truck className="h-4 w-4 mr-2 text-gray-500" />
                  Your order has shipped and is in transit.
                </>
              ) : orderData.tracking?.currentStatus?.toLowerCase() === "delivered" ? (
                <>
                  <PackageCheck className="h-4 w-4 mr-2 text-gray-500" />
                  Your package has been delivered. Thanks for shopping with us!
                </>
              ) : orderData.tracking?.currentStatus?.toLowerCase() === "completed" ? (
                <>
                  <Trophy className="h-4 w-4 mr-2 text-gray-500" />
                  Your order is complete. Enjoy!
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2 text-gray-500" />
                  We're preparing your order. You’ll get an update soon.
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
