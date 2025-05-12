import { adminDb } from "@/lib/firebase/admin";
import { capitalizeFirstLetter, formatThousands } from "@/lib/utils/common";
import Image from "next/image";
import Link from "next/link";
import { EmailPreviewButton, EmailPreviewOverlay } from "@/components/admin/OrderEmailPreviewOverlay";
import { EmailType } from "@/lib/sharedTypes";
import { getProducts } from "@/actions/get/products";
import clsx from "clsx";
import { appConfig } from "@/config";

const PAYPAL_BASE_URL = "https://www.sandbox.paypal.com/unifiedtransactions/details/payment/";

export default async function OrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await fetch(`${appConfig.BASE_URL}/api/paypal/orders/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Failed to fetch order details", response);
    return <div>Error fetching order details</div>;
  }

  const paypalOrder: OrderDetailsType = await response.json();
  const order = (await getOrderById(paypalOrder.id)) as PaymentTransaction;

  await updateUpsellProductNames(order);

  function formatOrderPlacedDate(order: OrderDetailsType, timeZone = "Europe/Athens"): string {
    const createTime = order.purchase_units[0].payments.captures[0].create_time;
    const date = new Date(createTime);

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

  function getPayPalUrl(captureId: string) {
    return `${PAYPAL_BASE_URL}${captureId}`;
  }

  const orderPlacedDate = formatOrderPlacedDate(paypalOrder);
  const captureId = paypalOrder.purchase_units[0].payments.captures[0].id;
  const paypalUrl = getPayPalUrl(captureId);

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
                      paypalOrder.status.toUpperCase() === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-gray-100"
                    )}
                  >
                    {capitalizeFirstLetter(paypalOrder.status)}
                  </div>
                </div>
                <div className="flex gap-5 text-sm">
                  <h3 className="min-w-[78px] max-w-[78px] text-gray">Purchased</h3>
                  <span className="w-full font-medium">{orderPlacedDate}</span>
                </div>
                <div className="flex gap-5 text-sm">
                  <h3 className="min-w-[78px] max-w-[78px] text-gray">Total</h3>
                  <span className="w-full font-medium">${paypalOrder.purchase_units[0].amount.value}</span>
                </div>
              </div>
              <div className="flex flex-col gap-4 py-5 border-b">
                <div className="flex gap-5 text-sm">
                  <h3 className="min-w-[78px] max-w-[78px] text-gray">Shipping</h3>
                  <div className="flex flex-col gap-1 font-medium">
                    <span>
                      {paypalOrder.purchase_units[0].shipping.address.address_line_1},{" "}
                      {paypalOrder.purchase_units[0].shipping.address.address_line_2}
                    </span>
                    <span>
                      {paypalOrder.purchase_units[0].shipping.address.admin_area_2},{" "}
                      {paypalOrder.purchase_units[0].shipping.address.admin_area_1}{" "}
                      {paypalOrder.purchase_units[0].shipping.address.postal_code}
                    </span>
                    <span>{paypalOrder.purchase_units[0].shipping.address.country_code}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4 py-5 border-b">
                <div className="flex gap-5 text-sm">
                  <h3 className="min-w-[78px] max-w-[78px] text-gray">Customer</h3>
                  <span className="w-full font-medium">
                    {paypalOrder.payer.name.given_name} {paypalOrder.payer.name.surname}
                  </span>
                </div>
                <div className="flex gap-5 text-sm">
                  <h3 className="min-w-[78px] max-w-[78px] text-gray">Email</h3>
                  <span className="w-full font-medium break-all">{paypalOrder.payer.email_address}</span>
                </div>
              </div>
              <div className="flex flex-col gap-4 py-5">
                <div className="flex gap-5 text-sm">
                  <h3 className="min-w-[78px] max-w-[78px] text-gray">ID</h3>
                  <Link href={paypalUrl} target="_blank">
                    <span className="w-full text-gray text-xs underline">{captureId}</span>
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
                                  href={`${product.slug}-${product.id}`}
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

async function getOrderById(id: string): Promise<OrderType | null> {
  if (!id) {
    return null;
  }

  const docRef = adminDb.collection("orders").doc(id);
  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data();
  if (!data) {
    return null;
  }

  const order = {
    id: snapshot.id,
    ...data,
  } as OrderType;

  return order;
}

async function updateUpsellProductNames(order: PaymentTransaction) {
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

type OrderDetailsType = {
  id: string;
  intent: string;
  status: string;
  payment_source: {
    paypal: {
      email_address: string;
      account_id: string;
      account_status: string;
      name: {
        given_name: string;
        surname: string;
      };
      phone_number: {
        national_number: string;
      };
      address: {
        country_code: string;
      };
      attributes: {
        cobranded_cards: Array<{
          labels: any[];
          payee: {
            email_address: string;
            merchant_id: string;
          };
          amount: {
            currency_code: string;
            value: string;
          };
        }>;
      };
    };
  };
  purchase_units: Array<{
    reference_id: string;
    amount: {
      currency_code: string;
      value: string;
      breakdown: {
        item_total: {
          currency_code: string;
          value: string;
        };
        shipping: {
          currency_code: string;
          value: string;
        };
        handling: {
          currency_code: string;
          value: string;
        };
        insurance: {
          currency_code: string;
          value: string;
        };
        shipping_discount: {
          currency_code: string;
          value: string;
        };
        discount: {
          currency_code: string;
          value: string;
        };
      };
    };
    payee: {
      email_address: string;
      merchant_id: string;
    };
    description: string;
    soft_descriptor: string;
    items: Array<{
      name: string;
      unit_amount: {
        currency_code: string;
        value: string;
      };
      tax: {
        currency_code: string;
        value: string;
      };
      quantity: string;
      sku: string;
    }>;
    shipping: {
      name: {
        full_name: string;
      };
      address: {
        address_line_1: string;
        address_line_2: string;
        admin_area_2: string;
        admin_area_1: string;
        postal_code: string;
        country_code: string;
      };
    };
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
        final_capture: boolean;
        seller_protection: {
          status: string;
          dispute_categories: string[];
        };
        seller_receivable_breakdown: {
          gross_amount: {
            currency_code: string;
            value: string;
          };
          paypal_fee: {
            currency_code: string;
            value: string;
          };
          net_amount: {
            currency_code: string;
            value: string;
          };
        };
        links: Array<{
          href: string;
          rel: string;
          method: string;
        }>;
        create_time: string;
        update_time: string;
      }>;
    };
  }>;
  payer: {
    name: {
      given_name: string;
      surname: string;
    };
    email_address: string;
    payer_id: string;
    phone: {
      phone_number: {
        national_number: string;
      };
    };
    address: {
      country_code: string;
    };
  };
  update_time: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
};

type ProductType = {
  slug: string;
  type: "product";
  mainImage: string;
  pricing: {
    basePrice: number;
    salePrice: number;
    discountPercentage: number;
  };
  selectedOptions: Record<string, { value: string; optionDisplayOrder: number; groupDisplayOrder: number }>;
  index: number;
  baseProductId: string;
  variantId: string;
  name: string;
};

type UpsellType = {
  mainImage: string;
  index: number;
  pricing: {
    basePrice: number;
    salePrice: number;
    discountPercentage: number;
  };
  products: Array<{
    mainImage: string;
    index: number;
    basePrice: number;
    id: string;
    slug: string;
    name: string;
    selectedOptions: Record<string, { value: string; optionDisplayOrder: number; groupDisplayOrder: number }>;
  }>;
  type: "upsell";
  baseUpsellId: string;
  variantId: string;
};

type PaymentTransaction = {
  id: string;
  status: string;
  transactionId: string;
  timestamp: string;
  amount: {
    currency: string;
    value: string;
  };
  payer: {
    email: string;
    payerId: string;
    name: {
      firstName: string;
      lastName: string;
    };
  };
  shipping: {
    name: string;
    address: {
      line1: string;
      state: string;
      country: string;
      city: string;
      postalCode: string;
    };
  };
  items: Array<ProductType | UpsellType>;
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
};
