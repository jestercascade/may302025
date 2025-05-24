import { getOrders } from "@/actions/get/orders";
import { capitalizeFirstLetter, formatThousands } from "@/lib/utils/common";
import Image from "next/image";
import Link from "next/link";
import { EmailPreviewButton, EmailPreviewOverlay } from "@/components/admin/OrderEmailPreviewOverlay";
import { EmailType } from "@/lib/sharedTypes";
import { getProducts } from "@/actions/get/products";
import clsx from "clsx";
import { OrderTrackingButton, OrderTrackingOverlay } from "@/components/admin/OrderTrackingOverlay";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";

const PAYPAL_BASE_URL = "https://www.sandbox.paypal.com/unifiedtransactions/details/payment/";

export default async function OrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const orders = await getOrders({ ids: [id] });
  if (!orders || orders.length === 0) {
    console.error(`Order with ID ${id} not found`);
    return <div>Order not found</div>;
  }
  const order: OrderType = orders[0];

  await updateUpsellProductNames(order);

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
    if (!range || (!range.start && !range.end)) return "Not set";
    const formatRangeDate = (dateString: string) => {
      if (!dateString) return null;
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };
    const startFormatted = formatRangeDate(range.start);
    const endFormatted = formatRangeDate(range.end);
    if (startFormatted && endFormatted) {
      return `${startFormatted} - ${endFormatted}`;
    } else if (startFormatted) {
      return `From ${startFormatted}`;
    } else if (endFormatted) {
      return `By ${endFormatted}`;
    }
    return "Not set";
  }

  function getPayPalUrl(transactionId: string) {
    return `${PAYPAL_BASE_URL}${transactionId}`;
  }

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
    (order.tracking.currentStatus || order.tracking.trackingNumber || order.tracking.estimatedDeliveryRange);

  const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "DELIVERED", label: "Delivered" },
  ];

  const getStatusLabel = (status: string) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option ? option.label : status;
  };

  const currentStatusIndex = statusOptions.findIndex((opt) => opt.value === order.tracking.currentStatus);
  const progressWidth =
    currentStatusIndex >= 0 ? `calc(${((currentStatusIndex + 1) / statusOptions.length) * 100}% - 8px)` : "0%";

  return (
    <>
      <div className="max-w-[768px] flex flex-col gap-10 px-5">
        {/* Order Summary Section */}
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Order summary</h2>
            <p className="text-sm md:max-w-[85%]">
              Clear order information helps you find exactly what you're looking for in seconds. And with shipping
              details organized neatly, everyone on your team can help customers without confusion.
            </p>
          </div>
          <div className="relative flex items-center justify-between shadow rounded-xl bg-white">
            <div className="w-full flex flex-col px-5">
              <div className="space-y-4 py-5 border-b">
                <div className="flex gap-5 items-center text-sm">
                  <h3 className="min-w-[78px] max-w-[78px] text-gray">Transaction</h3>
                  <div
                    className={clsx(
                      "inline-flex px-3 py-1 rounded-full text-sm font-medium",
                      order.status.toUpperCase() === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-gray-100"
                    )}
                  >
                    {capitalizeFirstLetter(order.status)}
                  </div>
                </div>
                <div className="flex gap-5 text-sm">
                  <h3 className="min-w-[78px] max-w-[78px] text-gray">Purchased</h3>
                  <span className="w-full font-medium">{orderPlacedDate}</span>
                </div>
                <div className="flex gap-5 text-sm">
                  <h3 className="min-w-[78px] max-w-[78px] text-gray">Total</h3>
                  <span className="w-full font-medium">${order.amount.value}</span>
                </div>
              </div>
              <div className="flex flex-col gap-4 py-5 border-b">
                <div className="flex gap-5 text-sm">
                  <h3 className="min-w-[78px] max-w-[78px] text-gray">Shipping</h3>
                  <div className="flex flex-col gap-1 font-medium">
                    <span>{order.shipping.address.line1}</span>
                    <span>
                      {order.shipping.address.city}, {order.shipping.address.state} {order.shipping.address.postalCode}
                    </span>
                    <span>{order.shipping.address.country}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4 py-5 border-b">
                <div className="flex gap-5 text-sm">
                  <h3 className="min-w-[78px] max-w-[78px] text-gray">Customer</h3>
                  <span className="w-full font-medium">
                    {order.payer.name.firstName} {order.payer.name.lastName}
                  </span>
                </div>
                <div className="flex gap-5 text-sm">
                  <h3 className="min-w-[78px] max-w-[78px] text-gray">Email</h3>
                  <span className="w-full font-medium break-all">{order.payer.email}</span>
                </div>
              </div>
              <div className="flex flex-col gap-4 py-5">
                <div className="flex gap-5 text-sm">
                  <h3 className="min-w-[78px] max-w-[78px] text-gray">ID</h3>
                  <Link href={paypalUrl} target="_blank">
                    <span className="w-full text-gray text-xs underline">{order.transactionId}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Updates Section */}
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Status updates</h2>
            <p className="text-sm md:max-w-[85%]">
              Send customers the right updates at every stage of their order. This keeps them informed and reduces
              support queries. It builds trust and makes customers feel valued.
            </p>
          </div>
          <div className="p-5 pt-4 relative shadow rounded-xl bg-white">
            <div className="flex flex-wrap gap-5">
              <EmailPreviewButton emailType={EmailType.ORDER_CONFIRMED} email={order.emails.confirmed} />
              <EmailPreviewButton emailType={EmailType.ORDER_SHIPPED} email={order.emails.shipped} />
              <EmailPreviewButton emailType={EmailType.ORDER_DELIVERED} email={order.emails.delivered} />
            </div>
          </div>
        </div>

        {/* Purchased Items Section */}
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

        {/* Order Tracking Section */}
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Order Tracking</h2>
            <p className="text-sm md:max-w-[85%]">
              Keep track of your order's journey from our warehouse to your doorstep. Update the status as the order
              progresses.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5">
              {hasTrackingDetails ? (
                <>
                  {/* Current Status Card */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium text-gray-900 capitalize">
                            {getStatusLabel(order.tracking.currentStatus)}
                          </div>
                          <div className="text-sm text-gray-500">Current status</div>
                        </div>
                      </div>
                      {(order.tracking.trackingNumber || order.tracking.estimatedDeliveryRange) && (
                        <div className="text-right">
                          {order.tracking.trackingNumber && (
                            <div className="text-sm font-medium text-gray-900 font-mono">
                              {order.tracking.trackingNumber}
                            </div>
                          )}
                          {order.tracking.estimatedDeliveryRange && (
                            <div className="text-sm text-gray-500">
                              Delivery:{" "}
                              <span className="font-medium">
                                {formatDateRange(order.tracking.estimatedDeliveryRange)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="relative">
                      <div className="absolute top-2 left-2 right-2 h-0.5 bg-gray-200 rounded-full"></div>
                      <div
                        className="absolute top-2 left-0 h-0.5 bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `calc(${
                            ((statusOptions.findIndex((opt) => opt.value === order.tracking.currentStatus) + 1) /
                              statusOptions.length) *
                            100
                          }% - 8px)`,
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
                                className={`rounded-full h-4 w-4 flex items-center justify-center mb-2 transition-all duration-500 ${
                                  isActive
                                    ? "bg-blue-500 ring-3 ring-blue-100"
                                    : isCompleted
                                    ? "bg-blue-500"
                                    : "bg-gray-200"
                                }`}
                              >
                                {isCompleted && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                              </div>
                              <div
                                className={`text-xs font-medium text-center leading-tight ${
                                  isCompleted ? "text-gray-700" : "text-gray-400"
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

                  {/* Timeline Section */}
                  <div className="border-t border-gray-100 pt-5">
                    <div className="space-y-3">
                      {order.tracking.statusHistory
                        .slice()
                        .reverse()
                        .map((historyItem, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="flex-shrink-0 mt-1.5 relative">
                              <div
                                className={`w-2 h-2 rounded-full ${index === 0 ? "bg-blue-500" : "bg-gray-300"}`}
                              ></div>
                              {index !== order.tracking.statusHistory.length - 1 && (
                                <div className="absolute top-3 left-1 w-px h-6 bg-gray-200"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 pb-3">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-gray-900 capitalize">
                                  {getStatusLabel(historyItem.status)}
                                </p>
                                <time className="text-xs text-gray-500 flex-shrink-0 font-mono">
                                  {formatDate(historyItem.timestamp)}
                                </time>
                              </div>
                              {historyItem.message && (
                                <p className="text-sm text-gray-600 leading-relaxed">{historyItem.message}</p>
                              )}
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
          </div>
        </div>
      </div>

      {/* Overlays */}
      <EmailPreviewOverlay emailType={EmailType.ORDER_CONFIRMED} email={order.emails.confirmed} orderId={order.id} />
      <EmailPreviewOverlay emailType={EmailType.ORDER_SHIPPED} email={order.emails.shipped} orderId={order.id} />
      <EmailPreviewOverlay emailType={EmailType.ORDER_DELIVERED} email={order.emails.delivered} orderId={order.id} />
      <OrderTrackingOverlay order={order} />
    </>
  );
}

async function updateUpsellProductNames(order: OrderType) {
  const upsellProductIds: string[] = [];

  order.items.forEach((item) => {
    if (item.type === "upsell") {
      item.products.forEach((product) => {
        upsellProductIds.push(product.id);
      });
    }
  });

  let upsellProducts;
  if (upsellProductIds.length > 0) {
    try {
      upsellProducts = await getProducts({
        ids: upsellProductIds,
        fields: ["name"],
        visibility: "PUBLISHED",
      });
    } catch (error) {
      console.error("Failed to fetch upsell product names", error);
      return;
    }
  }

  const productNameMap =
    upsellProducts?.reduce((map, product) => {
      map[product.id] = product.name;
      return map;
    }, {} as { [key: string]: string }) || {};

  order.items.forEach((item) => {
    if (item.type === "upsell") {
      item.products.forEach((product) => {
        product.name = productNameMap[product.id] || product.name;
      });
    }
  });
}

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

//-----------------------------------------------
// const AdminOrderTracker = () => {
//   const [order, setOrder] = useState({
//     tracking: {
//       currentStatus: "processing",
//       statusHistory: [
//         {
//           status: "pending",
//           timestamp: "2025-05-23T16:06:00Z",
//           message: "Order placed and payment confirmed"
//         },
//         {
//           status: "processing",
//           timestamp: "2025-05-24T10:30:00Z",
//           message: "Order is being prepared for shipment"
//         }
//       ],
//       trackingNumber: "1Z999AA1234567890",
//       estimatedDeliveryRange: {
//         start: "2025-05-30",
//         end: "2025-06-14"
//       },
//       lastUpdated: "2025-05-24T10:30:00Z"
//     }
//   });

//   const [isEditing, setIsEditing] = useState(false);
//   const [showTimeline, setShowTimeline] = useState(true);
//   const [editForm, setEditForm] = useState({
//     status: '',
//     trackingNumber: '',
//     deliveryStartDate: '',
//     deliveryEndDate: '',
//     statusMessage: ''
//   });

//   const statusOptions = [
//     { value: 'pending', label: 'Pending', icon: Clock, color: 'amber' },
//     { value: 'processing', label: 'Processing', icon: Package, color: 'blue' },
//     { value: 'shipped', label: 'Shipped', icon: Truck, color: 'indigo' },
//     { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'green' }
//   ];

//   const handleEditStart = () => {
//     const range = order.tracking.estimatedDeliveryRange;
//     setEditForm({
//       status: order.tracking.currentStatus,
//       trackingNumber: order.tracking.trackingNumber || '',
//       deliveryStartDate: range?.start || '',
//       deliveryEndDate: range?.end || '',
//       statusMessage: ''
//     });
//     setIsEditing(true);
//   };

//   const handleEditCancel = () => {
//     setIsEditing(false);
//     setEditForm({
//       status: '',
//       trackingNumber: '',
//       deliveryStartDate: '',
//       deliveryEndDate: '',
//       statusMessage: ''
//     });
//   };

//   const handleEditSave = () => {
//     const now = new Date().toISOString();
//     const newStatusHistory = [...order.tracking.statusHistory];

//     if (editForm.status !== order.tracking.currentStatus) {
//       newStatusHistory.push({
//         status: editForm.status,
//         timestamp: now,
//         message: editForm.statusMessage || `Status updated to ${editForm.status}`
//       });
//     }

//     let deliveryRange = null;
//     if (editForm.deliveryStartDate || editForm.deliveryEndDate) {
//       deliveryRange = {
//         start: editForm.deliveryStartDate || null,
//         end: editForm.deliveryEndDate || null
//       };
//     }

//     setOrder(prev => ({
//       ...prev,
//       tracking: {
//         ...prev.tracking,
//         currentStatus: editForm.status,
//         statusHistory: newStatusHistory,
//         trackingNumber: editForm.trackingNumber || null,
//         estimatedDeliveryRange: deliveryRange,
//         lastUpdated: now
//       }
//     }));

//     setIsEditing(false);
//     setEditForm({
//       status: '',
//       trackingNumber: '',
//       deliveryStartDate: '',
//       deliveryEndDate: '',
//       statusMessage: ''
//     });
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Not set';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const formatDateRange = (range) => {
//     if (!range || (!range.start && !range.end)) return 'Not set';

//     const formatRangeDate = (dateString) => {
//       if (!dateString) return null;
//       return new Date(dateString).toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric'
//       });
//     };

//     const startFormatted = formatRangeDate(range.start);
//     const endFormatted = formatRangeDate(range.end);

//     if (startFormatted && endFormatted) {
//       return `${startFormatted} - ${endFormatted}`;
//     } else if (startFormatted) {
//       return `From ${startFormatted}`;
//     } else if (endFormatted) {
//       return `By ${endFormatted}`;
//     }
//     return 'Not set';
//   };

//   const getStatusColor = (status) => {
//     const statusOption = statusOptions.find(opt => opt.value === status);
//     return statusOption ? statusOption.color : 'gray';
//   };

//   const getStatusIcon = (status) => {
//     const statusOption = statusOptions.find(opt => opt.value === status);
//     return statusOption ? statusOption.icon : Clock;
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-8 bg-gray-50 min-h-screen">
//       {/* macOS-style unified tracking section */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         {/* Header with clean typography */}
//         <div className="px-6 py-5 border-b border-gray-100">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-lg font-semibold text-gray-900">Order Tracking</h2>
//               <p className="text-sm text-gray-500 mt-0.5">Last updated {formatDate(order.tracking.lastUpdated)}</p>
//             </div>
//             {!isEditing ? (
//               <button
//                 onClick={handleEditStart}
//                 className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//               >
//                 <Edit3 className="h-4 w-4 mr-1.5" />
//                 Edit
//               </button>
//             ) : (
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={handleEditSave}
//                   className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//                 >
//                   <Save className="h-4 w-4 mr-1.5" />
//                   Save
//                 </button>
//                 <button
//                   onClick={handleEditCancel}
//                   className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
//                 >
//                   <X className="h-4 w-4 mr-1.5" />
//                   Cancel
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="px-6 py-5">
//           {!isEditing ? (
//             <>
//               {/* Current Status Card - Clean and minimal */}
//               <div className="bg-gray-50 rounded-lg p-4 mb-6">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center">
//                     {React.createElement(getStatusIcon(order.tracking.currentStatus), {
//                       className: `h-5 w-5 mr-3 text-${getStatusColor(order.tracking.currentStatus)}-500`
//                     })}
//                     <div>
//                       <div className="font-medium text-gray-900 capitalize">
//                         {order.tracking.currentStatus}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         Current status
//                       </div>
//                     </div>
//                   </div>
//                   {(order.tracking.trackingNumber || order.tracking.estimatedDeliveryRange) && (
//                     <div className="text-right">
//                       {order.tracking.trackingNumber && (
//                         <div className="text-sm font-medium text-gray-900 font-mono">
//                           {order.tracking.trackingNumber}
//                         </div>
//                       )}
//                       {order.tracking.estimatedDeliveryRange && (
//                         <div className="text-sm text-gray-500">
//                           Delivery: <span className="font-medium">{formatDateRange(order.tracking.estimatedDeliveryRange)}</span>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Progress Bar - Minimalist design */}
//               <div className="mb-6">
//                 <div className="relative">
//                   <div className="absolute top-2 left-2 right-2 h-0.5 bg-gray-200 rounded-full"></div>
//                   <div
//                     className="absolute top-2 left-0 h-0.5 bg-blue-500 rounded-full transition-all duration-1000 ease-out"
//                     style={{
//                       width: `calc(${
//                         ((statusOptions.findIndex(opt => opt.value === order.tracking.currentStatus) + 1) /
//                           statusOptions.length) *
//                         100
//                       }% - 8px)`,
//                     }}
//                   ></div>
//                   <div className="relative flex justify-between">
//                     {statusOptions.map((status, index) => {
//                       const currentStatusIndex = statusOptions.findIndex(
//                         opt => opt.value === order.tracking.currentStatus
//                       );
//                       const isCompleted = currentStatusIndex >= index;
//                       const isActive = status.value === order.tracking.currentStatus;

//                       return (
//                         <div key={status.value} className="flex flex-col items-center">
//                           <div
//                             className={`rounded-full h-4 w-4 flex items-center justify-center mb-2 transition-all duration-500 ${
//                               isActive
//                                 ? `bg-blue-500 ring-3 ring-blue-100`
//                                 : isCompleted
//                                 ? `bg-blue-500`
//                                 : "bg-gray-200"
//                             }`}
//                           >
//                             {isCompleted && (
//                               <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
//                             )}
//                           </div>
//                           <div
//                             className={`text-xs font-medium text-center leading-tight ${
//                               isCompleted ? "text-gray-700" : "text-gray-400"
//                             }`}
//                           >
//                             {status.label}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//             </>
//           ) : (
//             /* Edit Form - Clean inputs */
//             <div className="space-y-4 mb-6">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Status
//                   </label>
//                   <select
//                     value={editForm.status}
//                     onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                   >
//                     {statusOptions.map(option => (
//                       <option key={option.value} value={option.value}>
//                         {option.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Tracking Number
//                   </label>
//                   <input
//                     type="text"
//                     value={editForm.trackingNumber}
//                     onChange={(e) => setEditForm(prev => ({ ...prev, trackingNumber: e.target.value }))}
//                     placeholder="Enter tracking number"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
//                   />
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Delivery Start Date
//                   </label>
//                   <input
//                     type="date"
//                     value={editForm.deliveryStartDate}
//                     onChange={(e) => setEditForm(prev => ({ ...prev, deliveryStartDate: e.target.value }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Delivery End Date
//                   </label>
//                   <input
//                     type="date"
//                     value={editForm.deliveryEndDate}
//                     onChange={(e) => setEditForm(prev => ({ ...prev, deliveryEndDate: e.target.value }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Status Message
//                 </label>
//                 <input
//                   type="text"
//                   value={editForm.statusMessage}
//                   onChange={(e) => setEditForm(prev => ({ ...prev, statusMessage: e.target.value }))}
//                   placeholder="Optional status message"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                 />
//               </div>
//             </div>
//           )}

//           {/* Timeline Section - Collapsible with smooth animation */}
//           <div className="border-t border-gray-100 pt-5">
//             <button
//               onClick={() => setShowTimeline(!showTimeline)}
//               className="flex items-center justify-between w-full text-left group focus:outline-none"
//             >
//               <h3 className="text-base font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
//                 Timeline
//               </h3>
//               <div className="flex items-center text-gray-400 group-hover:text-gray-600 transition-colors">
//                 <span className="text-xs text-gray-500 mr-2">
//                   {order.tracking.statusHistory.length} events
//                 </span>
//                 {showTimeline ? (
//                   <ChevronDown className="h-4 w-4 transition-transform duration-200" />
//                 ) : (
//                   <ChevronRight className="h-4 w-4 transition-transform duration-200" />
//                 )}
//               </div>
//             </button>

//             <div className={`overflow-hidden transition-all duration-300 ease-out ${
//               showTimeline ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
//             }`}>
//               <div className="space-y-3">
//                 {order.tracking.statusHistory
//                   .slice()
//                   .reverse()
//                   .map((historyItem, index) => (
//                     <div key={index} className="flex gap-3 group">
//                       <div className="flex-shrink-0 mt-1.5 relative">
//                         <div className={`w-2 h-2 rounded-full transition-colors ${
//                           index === 0 ? 'bg-blue-500' : 'bg-gray-300'
//                         }`}></div>
//                         {index !== order.tracking.statusHistory.length - 1 && (
//                           <div className="absolute top-3 left-1 w-px h-6 bg-gray-200"></div>
//                         )}
//                       </div>
//                       <div className="flex-1 min-w-0 pb-3">
//                         <div className="flex items-center justify-between mb-1">
//                           <p className="text-sm font-medium text-gray-900 capitalize">
//                             {historyItem.status}
//                           </p>
//                           <time className="text-xs text-gray-500 flex-shrink-0 font-mono">
//                             {formatDate(historyItem.timestamp)}
//                           </time>
//                         </div>
//                         <p className="text-sm text-gray-600 leading-relaxed">{historyItem.message}</p>
//                       </div>
//                     </div>
//                   ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
