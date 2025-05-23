"use client";

import { getOrders } from "@/actions/get/orders";
import { ShowAlertType } from "@/lib/sharedTypes";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { Search, CheckCircle, Truck, Package, MapPin, Check } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatThousands } from "@/lib/utils/common";

// Type Definitions
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

type OrderItemType = OrderProductItemType | OrderUpsellItemType;

type OrderType = {
  invoiceId: string;
  timestamp: string;
  amount: { value: string };
  shipping: { address: { city: string; country: string } };
  tracking: {
    currentStatus: string;
    statusHistory: Array<{ status: string; timestamp: string; message?: string }>;
  };
  items: OrderItemType[];
};

export default function OrderTracker() {
  const [invoiceId, setInvoiceId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderData, setOrderData] = useState<OrderType | null>(null);
  const { showAlert } = useAlertStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoiceId.trim()) {
      showAlert({
        message: "Please enter an invoice ID",
        type: ShowAlertType.ERROR,
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await getOrders({ invoiceIds: [invoiceId.trim()] });
      console.log("Order data:", result);

      if (!result || result.length === 0) {
        setOrderData(null);
        showAlert({
          message: "We couldn't find any matching order",
          type: ShowAlertType.ERROR,
        });
      } else {
        setOrderData(result[0]);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setOrderData(null);
      showAlert({
        message: "An error occurred while fetching the order",
        type: ShowAlertType.ERROR,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusOptions = ["pending", "processing", "shipped", "delivered"];

  const formatOptions = (options: Record<string, SelectedOptionType>, type: "product" | "upsell" = "product") => {
    const entries = Object.entries(options || {});
    if (entries.length === 0) return null;

    const sortedEntries = entries.sort(([, a], [, b]) => a.groupDisplayOrder - b.groupDisplayOrder);

    const getClassNames = () => {
      if (type === "upsell") {
        return "inline-flex text-xs px-1.5 py-0.5 rounded border border-blue-200/70 text-gray bg-blue-50";
      }
      return "inline-flex text-xs px-1.5 py-0.5 rounded bg-[#F7F7F7] text-neutral-500";
    };

    return (
      <div className="flex flex-wrap gap-1 mt-1 max-w-72">
        {sortedEntries.map(([key, option]) => {
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
              className="w-full md:w-auto px-6 py-2 rounded-lg font-medium text-white transition-all duration-200 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <h2 className="text-xl font-semibold text-gray-900">Order #{invoiceId}</h2>
                  <div
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      orderData.tracking.currentStatus.toLowerCase() === "delivered"
                        ? "bg-green-100 text-green-800"
                        : orderData.tracking.currentStatus.toLowerCase() === "shipped"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {orderData.tracking.currentStatus.charAt(0).toUpperCase() +
                      orderData.tracking.currentStatus.slice(1).toLowerCase()}
                  </div>
                </div>
                <p className="text-sm text-gray mb-1">Placed {formatDate(orderData.timestamp)}</p>
                <div className="flex items-center text-sm text-gray">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {orderData.shipping.address.city}, {orderData.shipping.address.country}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-baseline justify-end">
                  <span className="text-sm leading-3 font-semibold">$</span>
                  <span className="text-xl font-bold">{Math.floor(Number(orderData.amount.value))}</span>
                  <span className="text-sm leading-3 font-semibold">
                    {(Number(orderData.amount.value) % 1).toFixed(2).substring(1)}
                  </span>
                </div>
                <p className="text-xs text-gray">Total</p>
              </div>
            </div>
          </div>
          <div className="py-6">
            <div className="relative max-w-2xl mx-auto px-[10px]">
              <div className="absolute top-[9px] left-[10px] right-[10px] h-0.5 bg-gray-300 rounded-full"></div>
              <div
                className="absolute top-[9px] left-0 h-0.5 bg-blue-500 rounded-full transition-all duration-700"
                style={{
                  width: `${
                    ((statusOptions.indexOf(orderData.tracking.currentStatus.toLowerCase()) + 1) /
                      statusOptions.length) *
                    100
                  }%`,
                }}
              ></div>
              <div className="relative flex justify-between">
                {statusOptions.map((status, index) => {
                  const isCompleted = statusOptions.indexOf(orderData.tracking.currentStatus.toLowerCase()) >= index;
                  const isActive = status === orderData.tracking.currentStatus.toLowerCase();

                  return (
                    <div key={status} className="flex flex-col items-center">
                      <div
                        className={`rounded-full h-5 w-5 flex items-center justify-center mb-2 transition-all duration-300 ${
                          isActive
                            ? "bg-blue-500 ring-4 ring-blue-100 shadow-sm"
                            : isCompleted
                            ? "bg-blue-500"
                            : "bg-gray-300"
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
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center px-4 py-3 rounded-xl text-sm ${
                orderData.tracking.currentStatus.toLowerCase() === "delivered"
                  ? "bg-green-50 text-green-800 border border-green-200/50"
                  : orderData.tracking.currentStatus.toLowerCase() === "shipped"
                  ? "bg-blue-50 text-blue-800 border border-blue-200/50"
                  : "bg-gray-50 text-gray-800 border border-gray-200/50"
              }`}
            >
              {orderData.tracking.currentStatus.toLowerCase() === "shipped" ? (
                <>
                  <Truck className="h-4 w-4 mr-2" />
                  Your package is on the way! Expected delivery in 2-3 business days.
                </>
              ) : orderData.tracking.currentStatus.toLowerCase() === "delivered" ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Your package has been delivered. Thank you for your order!
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  We're preparing your order. You'll receive a shipping confirmation soon.
                </>
              )}
            </div>
          </div>
          <div className="mb-8">
            <h3 className="text-base font-medium text-gray-900 mb-4">Order Timeline</h3>
            <div className="space-y-4">
              {orderData.tracking.statusHistory
                .slice()
                .reverse()
                .map((historyItem, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 mt-1.5">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">
                          {historyItem.status.charAt(0).toUpperCase() + historyItem.status.slice(1).toLowerCase()}
                        </p>
                        <time className="text-xs text-gray flex-shrink-0">{formatDate(historyItem.timestamp)}</time>
                      </div>
                      <p className="text-sm text-gray">{historyItem.message || "Status updated"}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-medium mb-4">Items Ordered</h3>
            {orderData.items.map((item, index) => {
              if (item.type === "product") {
                const basePrice = Number(item.pricing.basePrice);
                const salePrice = item.pricing.salePrice ? Number(item.pricing.salePrice) : null;
                const itemName = item.name || "Product";
                return (
                  <div key={index} className="flex gap-3">
                    <div className="relative flex flex-col min-[580px]:flex-row gap-4 w-full p-5 rounded-lg border border-gray-200/70">
                      <div className="aspect-square h-[160px] min-[580px]:h-[128px]">
                        <div className="min-[580px]:hidden flex items-center justify-center h-full w-max mx-auto overflow-hidden rounded-lg">
                          <Image src={item.mainImage} alt={itemName} width={160} height={160} priority />
                        </div>
                        <div className="hidden min-[580px]:flex items-center justify-center min-[580px]:min-w-[128px] min-[580px]:max-w-[128px] min-[580px]:min-h-[128px] min-[580px]:max-h-[128px] overflow-hidden rounded-lg">
                          <Image src={item.mainImage} alt={itemName} width={128} height={128} priority />
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
              } else if (item.type === "upsell") {
                return (
                  <div key={index} className="flex gap-3">
                    <div className="relative w-full p-5 rounded-lg bg-blue-50 border border-blue-200/50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="min-w-full h-5 flex gap-5 items-center justify-center">
                          <div className="w-max flex items-center justify-center">
                            {item.pricing.salePrice ? (
                              <div className="flex items-center gap-[6px]">
                                <div className="flex items-baseline text-[rgb(168,100,0)]">
                                  <span className="text-[0.813rem] leading-3 font-semibold">$</span>
                                  <span className="text-lg font-bold">
                                    {Math.floor(Number(item.pricing.salePrice))}
                                  </span>
                                  <span className="text-[0.813rem] leading-3 font-semibold">
                                    {(Number(item.pricing.salePrice) % 1).toFixed(2).substring(1)}
                                  </span>
                                </div>
                                <span className="text-[0.813rem] leading-3 text-gray line-through">
                                  ${formatThousands(Number(item.pricing.basePrice))}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-baseline text-[rgb(168,100,0)]">
                                <span className="text-[0.813rem] leading-3 font-semibold">$</span>
                                <span className="text-lg font-bold">{Math.floor(Number(item.pricing.basePrice))}</span>
                                <span className="text-[0.813rem] leading-3 font-semibold">
                                  {(Number(item.pricing.basePrice) % 1).toFixed(2).substring(1)}
                                </span>
                                <span className="ml-1 text-[0.813rem] leading-3 font-semibold">today</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {item.products.map((product, prodIndex) => {
                          const productName = product.name || "Product";
                          return (
                            <div
                              key={prodIndex}
                              className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-3 border border-blue-200/50 shadow-sm transition-all duration-200 hover:shadow-md hover:bg-opacity-100"
                            >
                              <div className="flex flex-col min-[580px]:flex-row gap-4">
                                <div className="aspect-square h-[160px] min-[580px]:h-[128px]">
                                  <div className="min-[580px]:hidden flex items-center justify-center h-full w-max mx-auto overflow-hidden rounded-lg">
                                    <Image
                                      src={product.mainImage}
                                      alt={productName}
                                      width={160}
                                      height={160}
                                      priority
                                    />
                                  </div>
                                  <div className="hidden min-[580px]:flex items-center justify-center min-[580px]:min-w-[128px] min-[580px]:max-w-[128px] min-[580px]:min-h-[128px] min-[580px]:max-h-[128px] overflow-hidden rounded-lg">
                                    <Image
                                      src={product.mainImage}
                                      alt={productName}
                                      width={128}
                                      height={128}
                                      priority
                                    />
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  {product.slug && product.id ? (
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
                                  {formatOptions(product.selectedOptions, "upsell")}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
