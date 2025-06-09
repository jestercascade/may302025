import { getOrders } from "@/actions/get/orders";
import { capitalizeFirstLetter, formatThousands } from "@/lib/utils/common";
import Image from "next/image";
import Link from "next/link";
import { EmailPreviewButton, EmailPreviewOverlay } from "@/components/admin/OrderEmailPreviewOverlay";
import { EmailType } from "@/lib/sharedTypes";
import clsx from "clsx";
import { OrderTrackingButton, OrderTrackingOverlay } from "@/components/admin/OrderTrackingOverlay";
import { Truck, CheckCircle, Clock, Check, PackageCheck, Trophy } from "lucide-react";
import React from "react";

const PAYPAL_BASE_URL = "https://www.sandbox.paypal.com/unifiedtransactions/details/payment/";

export default async function OrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const orders = await getOrders({ ids: [id] });
  if (!orders || orders.length === 0) {
    return <div>Order not found</div>;
  }
  const order: OrderType = orders[0];

  function formatOrderPlacedDate(timestamp: string, timeZone = "Europe/Athens"): string {
    const date = new Date(timestamp);
    return date
      .toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone,
      })
      .replace("24:", "00:");
  }

  function formatDate(dateString: string): string {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

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

  function getPayPalUrl(transactionId: string) {
    return `${PAYPAL_BASE_URL}${transactionId}`;
  }

  const StatusIcon = ({ status }: { status: string }) => {
    const statusUpper = status.toUpperCase();

    switch (statusUpper) {
      case "PENDING":
        return <Clock className="h-5 w-5 text-gray" />;
      case "CONFIRMED":
        return <CheckCircle className="h-5 w-5 text-gray" />;
      case "SHIPPED":
        return <Truck className="h-5 w-5 text-gray" />;
      case "DELIVERED":
        return <PackageCheck className="h-5 w-5 text-gray" />;
      case "COMPLETED":
        return <Trophy className="h-5 w-5 text-gray" />;
      default:
        return <Clock className="h-5 w-5 text-gray" />;
    }
  };

  const orderPlacedDate = formatOrderPlacedDate(order.timestamp);
  const paypalUrl = getPayPalUrl(order.transactionId);

  const formatOptions = (
    options: Record<string, { value: string; optionDisplayOrder: number; groupDisplayOrder: number }>,
    type: "product" | "upsell" = "product"
  ) => {
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

  const hasTrackingDetails =
    order.tracking &&
    (order.tracking.currentStatus || order.tracking.trackingNumber || order.tracking.estimatedDeliveryDate);

  const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "COMPLETED", label: "Completed" },
  ];

  const getStatusLabel = (status: string) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option ? option.label : status;
  };

  const extractInvoiceId = (input: string): string => {
    const id = input.trim().split(" ")[0];
    const idRegex = /^[A-Za-z0-9]{8}$/;

    return idRegex.test(id) ? id : "";
  };

  return (
    <>
      <div className="max-w-[768px] flex flex-col gap-10 px-5">
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Order summary</h2>
            <p className="text-sm md:max-w-[85%]">
              Clear order information helps you find exactly what you're looking for in seconds. And with shipping
              details organized neatly, everyone on your team can help customers without confusion.
            </p>
          </div>
          <div className="max-w-[618px] p-6 relative shadow rounded-xl bg-white">
            <div className="flex flex-col">
              <div className="mb-7">
                {/* Mobile Layout - Stacked */}
                <div className="flex flex-col gap-3 sm:hidden">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Invoice #{extractInvoiceId(order.invoiceId)}</h3>
                    <div className="text-right">
                      <div className="flex items-baseline justify-end">
                        <span className="text-sm leading-3 font-semibold">$</span>
                        <span className="text-xl font-bold">{Math.floor(Number(order.amount.value))}</span>
                        <span className="text-sm leading-3 font-semibold">
                          {(Number(order.amount.value) % 1).toFixed(2).substring(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray">Total</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div
                      className={clsx(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                        order.status.toUpperCase() === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-gray-100"
                      )}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {capitalizeFirstLetter(order.status)}
                    </div>
                    <p className="text-xs text-gray">Purchased {orderPlacedDate}</p>
                  </div>
                </div>

                {/* Desktop Layout - Original */}
                <div className="hidden sm:flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">Invoice #{extractInvoiceId(order.invoiceId)}</h3>
                      <div
                        className={clsx(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                          order.status.toUpperCase() === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-gray-100"
                        )}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {capitalizeFirstLetter(order.status)}
                      </div>
                    </div>
                    <p className="text-xs text-gray">Purchased {orderPlacedDate}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline justify-end">
                      <span className="text-sm leading-3 font-semibold">$</span>
                      <span className="text-xl font-bold">{Math.floor(Number(order.amount.value))}</span>
                      <span className="text-sm leading-3 font-semibold">
                        {(Number(order.amount.value) % 1).toFixed(2).substring(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray">Total</p>
                  </div>
                </div>
              </div>
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 rounded-lg bg-neutral-50">
                  <div className="text-xs font-semibold text-gray-400 mb-3">Customer</div>
                  <div className="space-y-1.5">
                    <div className="font-semibold">
                      {order.payer.name.firstName} {order.payer.name.lastName}
                    </div>
                    <div className="text-sm text-gray break-all">{order.payer.email}</div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-neutral-50">
                  <div className="text-xs font-semibold text-gray-400 mb-3">Shipping Address</div>
                  <div className="space-y-1.5">
                    <div className="font-semibold">{order.shipping.address.line1}</div>
                    <div className="text-sm text-gray">
                      {order.shipping.address.city}, {order.shipping.address.state} {order.shipping.address.postalCode},{" "}
                      {order.shipping.address.country}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Link href={paypalUrl} target="_blank">
                  <span
                    className="text-blue hover:underline text-xs font-medium transition-colors duration-200 cursor-pointer"
                    title="View Transaction Details"
                  >
                    View on PayPal
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Status updates</h2>
            <p className="text-sm md:max-w-[85%]">
              Send customers the right updates at every stage of their order. This keeps them informed and reduces
              support queries. It builds trust and makes customers feel valued.
            </p>
          </div>
          <div className="max-w-[618px] p-5 relative shadow rounded-xl bg-white">
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-5">
              <EmailPreviewButton emailType={EmailType.ORDER_CONFIRMED} email={order.emails.confirmed} />
              <EmailPreviewButton emailType={EmailType.ORDER_SHIPPED} email={order.emails.shipped} />
              <EmailPreviewButton emailType={EmailType.ORDER_DELIVERED} email={order.emails.delivered} />
            </div>
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Purchased items</h2>
            <p className="text-sm md:max-w-[85%]">
              Clear item breakdowns help your team pack orders perfectly every time. And with all product options listed
              clearly, handling returns and exchanges becomes stress-free.
            </p>
          </div>
          <div className="max-w-[618px] p-5 relative flex items-center justify-between shadow rounded-xl bg-white">
            <div className="flex flex-col gap-5">
              {order.items.map((item) => {
                if (item.type === "product") {
                  return (
                    <div key={item.index} className="flex gap-4 p-5 rounded-lg border border-gray-200/80">
                      <div className="min-[580px]:hidden flex items-center justify-center min-w-[108px] max-w-[108px] min-h-[108px] max-h-[108px] overflow-hidden rounded-lg">
                        <Image src={item.mainImage} alt={item.name} width={108} height={108} priority />
                      </div>
                      <div className="hidden min-[580px]:flex items-center justify-center min-w-[128px] max-w-[128px] min-h-[128px] max-h-[128px] overflow-hidden rounded-lg">
                        <Image src={item.mainImage} alt={item.name} width={128} height={128} priority />
                      </div>
                      <div className="w-full flex flex-col gap-1">
                        <Link
                          href={`/${item.slug}-${item.baseProductId}`}
                          target="_blank"
                          className="text-xs line-clamp-1 hover:underline"
                        >
                          {item.name}
                        </Link>
                        {item.selectedOptions && formatOptions(item.selectedOptions)}
                        <div className="mt-1 w-max flex items-center justify-center">
                          {Number(item.pricing.salePrice) ? (
                            <div className="flex items-center gap-[6px]">
                              <div className="flex items-baseline text-[rgb(168,100,0)]">
                                <span className="text-[0.813rem] leading-3 font-semibold">$</span>
                                <span className="text-lg font-bold">{Math.floor(Number(item.pricing.salePrice))}</span>
                                <span className="text-[0.813rem] leading-3 font-semibold">
                                  {(Number(item.pricing.salePrice) % 1).toFixed(2).substring(1)}
                                </span>
                              </div>
                              <span className="text-[0.813rem] leading-3 text-gray line-through">
                                ${formatThousands(Number(item.pricing.basePrice))}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-baseline">
                              <span className="text-[0.813rem] leading-3 font-semibold">$</span>
                              <span className="text-lg font-bold">{Math.floor(Number(item.pricing.basePrice))}</span>
                              <span className="text-[0.813rem] leading-3 font-semibold">
                                {(Number(item.pricing.basePrice) % 1).toFixed(2).substring(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                } else if (item.type === "upsell") {
                  return (
                    <div key={item.index} className="p-5 rounded-lg bg-blue-50 border border-blue-200/50">
                      <div className="mb-4">
                        <div className="flex items-center justify-center">
                          <div className="w-max flex items-center justify-center">
                            {Number(item.pricing.salePrice) ? (
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
                        {item.products.map((product) => (
                          <div key={product.id} className="bg-white rounded-lg p-3 border border-blue-200/50">
                            <div className="flex gap-4">
                              <div className="min-[580px]:hidden flex items-center justify-center min-w-[80px] max-w-[80px] min-h-[80px] max-h-[80px] overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/50">
                                <Image src={product.mainImage} alt={product.name} width={80} height={80} priority />
                              </div>
                              <div className="hidden min-[580px]:flex items-center justify-center min-w-[120px] max-w-[120px] min-h-[120px] max-h-[120px] overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/50">
                                <Image src={product.mainImage} alt={product.name} width={120} height={120} priority />
                              </div>
                              <div className="space-y-3">
                                <Link
                                  href={`/${product.slug}-${product.id}`}
                                  target="_blank"
                                  className="text-xs line-clamp-1 hover:underline"
                                >
                                  {product.name}
                                </Link>
                                {product.selectedOptions && formatOptions(product.selectedOptions, "upsell")}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Order Tracking</h2>
            <p className="text-sm md:max-w-[85%]">
              Track the order status from warehouse to delivery. And set the estimated delivery so customers know when
              to expect it.
            </p>
          </div>
          {/* <div className="max-w-[618px] p-5 relative shadow rounded-xl bg-white">
            <div className="flex flex-col gap-5">
              {hasTrackingDetails ? (
                <>
                  <div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center rounded-full h-10 w-10 bg-lightgray">
                            <StatusIcon status={order.tracking.currentStatus} />
                          </div>
                          <div>
                            <div className="text-lg font-semibold capitalize">
                              {getStatusLabel(order.tracking.currentStatus)}
                            </div>
                            {order.tracking.estimatedDeliveryDate && (
                              <div className="text-xs text-gray">
                                Expected delivery: {formatDateRange(order.tracking.estimatedDeliveryDate)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="py-6">
                    <div className="relative max-w-2xl mx-auto px-[10px]">
                      <div className="absolute top-[9px] left-[10px] right-[10px] h-0.5 bg-gray-300 rounded-full"></div>
                      <div
                        className="absolute top-[9px] left-0 h-0.5 bg-[#404040] rounded-full transition-all duration-700"
                        style={{
                          width: `${
                            ((statusOptions.findIndex((opt) => opt.value === order.tracking.currentStatus) + 1) /
                              statusOptions.length) *
                            100
                          }%`,
                        }}
                      ></div>
                      <div className="relative flex justify-between">
                        {statusOptions.map((status, index) => {
                          const currentStatusIndex = statusOptions.findIndex(
                            (opt) => opt.value === order.tracking.currentStatus
                          );
                          const isCompleted = currentStatusIndex >= index;
                          const isActive = index === currentStatusIndex;

                          return (
                            <div key={status.value} className="flex flex-col items-center">
                              <div
                                className={`rounded-full h-5 w-5 flex items-center justify-center mb-2 transition-all duration-300 ${
                                  isActive ? "bg-[#404040] shadow-sm" : isCompleted ? "bg-[#404040]" : "bg-gray-300"
                                }`}
                              >
                                {isCompleted && <Check color="#ffffff" size={14} />}
                              </div>
                              <div
                                className={`text-xs font-medium text-center ${
                                  isCompleted ? "text-black" : "text-gray-400"
                                }`}
                              >
                                {status.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-medium mb-4">Status Log</h3>
                    <div className="space-y-4">
                      {(order.tracking?.statusHistory || [])
                        .slice()
                        .reverse()
                        .map((historyItem, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="flex-shrink-0 mt-1.5">
                              <div className="w-2 h-2 bg-neutral-400/70 rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium">
                                  {historyItem?.status
                                    ? historyItem.status.charAt(0).toUpperCase() +
                                      historyItem.status.slice(1).toLowerCase()
                                    : "Status Update"}
                                </p>
                                <time className="text-xs text-gray flex-shrink-0 font-mono">
                                  {formatDate(historyItem.timestamp)}
                                </time>
                              </div>
                              <p className="text-sm text-gray">{historyItem?.message || "Status updated"}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              ) : (
                <span className="text-xs text-gray-500">No tracking details available</span>
              )}
            </div>
            <OrderTrackingButton />
          </div> */}
          <div className="max-w-[618px] p-5 relative shadow rounded-xl bg-white">
            <div className="flex flex-col gap-5">
              {hasTrackingDetails ? (
                <>
                  <div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center rounded-full h-10 w-10 bg-lightgray">
                            <StatusIcon status={order.tracking.currentStatus} />
                          </div>
                          <div>
                            <div className="text-lg font-semibold capitalize">
                              {getStatusLabel(order.tracking.currentStatus)}
                            </div>
                            {order.tracking.estimatedDeliveryDate && (
                              <div className="text-xs text-gray">
                                Expected delivery: {formatDateRange(order.tracking.estimatedDeliveryDate)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop: Horizontal progress bar */}
                  <div className="hidden sm:block py-6">
                    <div className="relative max-w-2xl mx-auto px-[10px]">
                      <div className="absolute top-[9px] left-[10px] right-[10px] h-0.5 bg-gray-300 rounded-full"></div>
                      <div
                        className="absolute top-[9px] left-0 h-0.5 bg-[#404040] rounded-full transition-all duration-700"
                        style={{
                          width: `${
                            ((statusOptions.findIndex((opt) => opt.value === order.tracking.currentStatus) + 1) /
                              statusOptions.length) *
                            100
                          }%`,
                        }}
                      ></div>
                      <div className="relative flex justify-between">
                        {statusOptions.map((status, index) => {
                          const currentStatusIndex = statusOptions.findIndex(
                            (opt) => opt.value === order.tracking.currentStatus
                          );
                          const isCompleted = currentStatusIndex >= index;
                          const isActive = index === currentStatusIndex;

                          return (
                            <div key={status.value} className="flex flex-col items-center">
                              <div
                                className={`rounded-full h-5 w-5 flex items-center justify-center mb-2 transition-all duration-300 ${
                                  isActive ? "bg-[#404040] shadow-sm" : isCompleted ? "bg-[#404040]" : "bg-gray-300"
                                }`}
                              >
                                {isCompleted && <Check color="#ffffff" size={14} />}
                              </div>
                              <div
                                className={`text-xs font-medium text-center ${
                                  isCompleted ? "text-black" : "text-gray-400"
                                }`}
                              >
                                {status.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Mobile: Vertical timeline (iOS-style) */}
                  <div className="sm:hidden py-4">
                    <div className="space-y-0">
                      {statusOptions.map((status, index) => {
                        const currentStatusIndex = statusOptions.findIndex(
                          (opt) => opt.value === order.tracking.currentStatus
                        );
                        const isCompleted = currentStatusIndex >= index;
                        const isActive = index === currentStatusIndex;
                        const isLast = index === statusOptions.length - 1;

                        return (
                          <div key={status.value} className="relative flex items-start gap-3 pb-6 last:pb-0">
                            {/* Connecting line */}
                            {!isLast && <div className="absolute left-2.5 top-6 w-0.5 h-6 bg-gray-200"></div>}

                            {/* Status circle */}
                            <div
                              className={`flex-shrink-0 rounded-full h-5 w-5 flex items-center justify-center mt-0.5 transition-all duration-300 z-10 ${
                                isActive ? "bg-[#404040]" : isCompleted ? "bg-[#404040]" : "bg-gray-300"
                              }`}
                            >
                              {isCompleted && <Check color="#ffffff" size={12} />}
                            </div>

                            {/* Status content */}
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div
                                className={`text-sm font-medium ${
                                  isActive ? "text-black" : isCompleted ? "text-black" : "text-gray-400"
                                }`}
                              >
                                {status.label}
                              </div>
                              {isActive && <div className="text-xs text-blue-600 mt-0.5">Current status</div>}
                              {isCompleted && !isActive && (
                                <div className="text-xs text-green-600 mt-0.5">Completed</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status Log */}
                  <div>
                    <h3 className="text-base font-medium mb-4">Status Log</h3>
                    <div className="space-y-4">
                      {(order.tracking?.statusHistory || [])
                        .slice()
                        .reverse()
                        .map((historyItem, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="flex-shrink-0 mt-1.5">
                              <div className="w-2 h-2 bg-neutral-400/70 rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 gap-1 sm:gap-0">
                                <p className="text-sm font-medium">
                                  {historyItem?.status
                                    ? historyItem.status.charAt(0).toUpperCase() +
                                      historyItem.status.slice(1).toLowerCase()
                                    : "Status Update"}
                                </p>
                                <time className="text-xs text-gray font-mono">{formatDate(historyItem.timestamp)}</time>
                              </div>
                              <p className="text-sm text-gray">{historyItem?.message || "Status updated"}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              ) : (
                <span className="text-xs text-gray-500">No tracking details available</span>
              )}
            </div>
            <OrderTrackingButton />
          </div>
        </div>
      </div>
      <EmailPreviewOverlay emailType={EmailType.ORDER_CONFIRMED} email={order.emails.confirmed} orderId={order.id} />
      <EmailPreviewOverlay emailType={EmailType.ORDER_SHIPPED} email={order.emails.shipped} orderId={order.id} />
      <EmailPreviewOverlay emailType={EmailType.ORDER_DELIVERED} email={order.emails.delivered} orderId={order.id} />
      <OrderTrackingOverlay order={order} />
    </>
  );
}
