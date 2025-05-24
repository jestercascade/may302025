import { getOrders } from "@/actions/get/orders";
import { capitalizeFirstLetter, formatThousands } from "@/lib/utils/common";
import Image from "next/image";
import Link from "next/link";
import { EmailPreviewButton, EmailPreviewOverlay } from "@/components/admin/OrderEmailPreviewOverlay";
import { EmailType } from "@/lib/sharedTypes";
import { getProducts } from "@/actions/get/products";
import clsx from "clsx";

const PAYPAL_BASE_URL = "https://www.sandbox.paypal.com/unifiedtransactions/details/payment/";

export default async function OrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch order directly from Firestore using getOrders
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
      </div>
      <EmailPreviewOverlay emailType={EmailType.ORDER_CONFIRMED} email={order.emails.confirmed} orderId={order.id} />
      <EmailPreviewOverlay emailType={EmailType.ORDER_SHIPPED} email={order.emails.shipped} orderId={order.id} />
      <EmailPreviewOverlay emailType={EmailType.ORDER_DELIVERED} email={order.emails.delivered} orderId={order.id} />
    </>
  );
}

// -- Logic & Utilities --

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

// -- Type Definitions --

// Assuming OrderType is imported or defined elsewhere as per your provided type
// Here's a simplified version for completeness, but use your actual OrderType
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
    estimatedDeliveryDate?: string;
    lastUpdated: string;
  };
};
