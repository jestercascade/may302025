import { getCarts } from "@/actions/get/carts";
import { getOrders } from "@/actions/get/orders";
import { getProducts } from "@/actions/get/products";
import { getUpsells } from "@/actions/get/upsells";
import { formatThousands } from "@/lib/utils/common";
import clsx from "clsx";
import Link from "next/link";

class StoreGrowthMetrics {
  private orders: OrderType[];

  constructor(orders: OrderType[]) {
    this.orders = orders;
  }

  private getLocalDateForComparison(utcDate: string): string {
    const date = new Date(utcDate);
    const localDate = new Date(date.toLocaleString());
    return `${localDate.getFullYear()}-${(localDate.getMonth() + 1).toString().padStart(2, "0")}-${localDate
      .getDate()
      .toString()
      .padStart(2, "0")}`;
  }

  private filterOrdersByDate(date: string): OrderType[] {
    return this.orders.filter((order) => this.getLocalDateForComparison(order.timestamp).startsWith(date));
  }

  private filterOrdersByMonth(date: string): OrderType[] {
    return this.orders.filter((order) =>
      this.getLocalDateForComparison(order.timestamp).startsWith(date.substring(0, 7))
    );
  }

  private calculateRevenue(orders: OrderType[]): number {
    return orders.reduce((acc, order) => acc + parseFloat(order.amount.value), 0);
  }

  private calculateAOV(orders: OrderType[]): number {
    return orders.length > 0 ? this.calculateRevenue(orders) / orders.length : 0;
  }

  getMetrics() {
    if (!this.orders || this.orders.length === 0) {
      return {
        revenue: { today: 0, thisMonth: 0, allTime: 0 },
        orders: { today: 0, thisMonth: 0, allTime: 0 },
        aov: { today: 0, thisMonth: 0, allTime: 0 },
      };
    }

    const today = this.getLocalDateForComparison(new Date().toISOString());
    const thisMonth = `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, "0")}`;

    const todayOrders = this.filterOrdersByDate(today);
    const thisMonthOrders = this.filterOrdersByMonth(thisMonth);

    const allTimeRevenue = this.calculateRevenue(this.orders);
    const todayRevenue = this.calculateRevenue(todayOrders);
    const thisMonthRevenue = this.calculateRevenue(thisMonthOrders);

    const allTimeAOV = this.calculateAOV(this.orders);
    const todayAOV = this.calculateAOV(todayOrders);
    const thisMonthAOV = this.calculateAOV(thisMonthOrders);

    return {
      revenue: {
        today: todayRevenue,
        thisMonth: thisMonthRevenue,
        allTime: allTimeRevenue,
      },
      orders: {
        today: todayOrders.length,
        thisMonth: thisMonthOrders.length,
        allTime: this.orders.length,
      },
      aov: {
        today: todayAOV,
        thisMonth: thisMonthAOV,
        allTime: allTimeAOV,
      },
    };
  }

  formatRevenue(amount: number): string {
    return `$${formatThousands(amount.toFixed(2))}`;
  }
}

export default async function Overview() {
  const [orders, products, upsells, carts] = await Promise.all([
    getOrders() as Promise<OrderType[] | null>,
    getProducts({ fields: ["visibility", "pricing"] }) as Promise<ProductType[] | null>,
    getUpsells({ fields: ["visibility", "pricing", "products"] }) as Promise<UpsellType[] | null>,
    getCarts(),
  ]);

  return (
    <div className="max-w-[820px] mx-auto min-[1080px]:mx-0 flex flex-col gap-10 px-5">
      <div>
        <h2 className="font-semibold text-xl mb-6">Store Growth</h2>
        <div className="w-full p-5 relative border rounded-xl bg-white">
          <StoreGrowth orders={orders} />
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-xl mb-6">Best-Selling Products</h2>
        <div className="w-full p-5 relative border rounded-xl bg-white">
          <BestsellingProducts orders={orders} />
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-xl mb-6">Product Status</h2>
        <div className="w-full p-5 relative border rounded-xl bg-white">
          <ProductStatus products={products} />
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-xl mb-6">Cart Status Breakdown</h2>
        <div className="w-full p-5 relative border rounded-xl bg-white">
          <CartStatusBreakdown carts={carts} products={products} upsells={upsells} />
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-xl mb-6">Upsell Performance</h2>
        <div className="w-full p-5 relative border rounded-xl bg-white">
          <UpsellPerformance upsells={upsells} />
        </div>
      </div>
    </div>
  );
}

// -- UI Components --

const StoreGrowth = ({ orders }: { orders: OrderType[] | null }) => {
  const storeGrowthMetrics = new StoreGrowthMetrics(orders || []);
  const metrics = storeGrowthMetrics.getMetrics();

  return (
    <div className="overflow-x-auto custom-x-scrollbar">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left pb-3 pr-6 text-xs font-medium text-gray uppercase tracking-wider">Metric</th>
            <th className="text-left pb-3 px-6 text-xs font-medium text-gray uppercase tracking-wider">Today</th>
            <th className="text-left pb-3 px-6 text-xs font-medium text-gray uppercase tracking-wider">
              This Month
            </th>
            <th className="text-left pb-3 pl-6 text-xs font-medium text-gray uppercase tracking-wider">All-Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <tr className="hover:bg-[#ffcc001a] transition-colors duration-150">
            <td className="py-3 pr-6 text-sm font-medium">Revenue</td>
            <td className="py-3 px-6 text-sm">
              {metrics.revenue.today > 0 ? storeGrowthMetrics.formatRevenue(metrics.revenue.today) : "—"}
            </td>
            <td className="py-3 px-6 text-sm">
              {metrics.revenue.thisMonth > 0 ? storeGrowthMetrics.formatRevenue(metrics.revenue.thisMonth) : "—"}
            </td>
            <td className="py-3 pl-6 text-sm font-semibold">
              {storeGrowthMetrics.formatRevenue(metrics.revenue.allTime)}
            </td>
          </tr>
          <tr className="hover:bg-[#ffcc001a] transition-colors duration-150">
            <td className="py-3 pr-6 text-sm font-medium">Orders</td>
            <td className="py-3 px-6 text-sm">{metrics.orders.today || "—"}</td>
            <td className="py-3 px-6 text-sm">{metrics.orders.thisMonth || "—"}</td>
            <td className="py-3 pl-6 text-sm font-medium">{metrics.orders.allTime || "—"}</td>
          </tr>
          <tr className="hover:bg-[#ffcc001a] transition-colors duration-150">
            <td className="py-3 pr-6 text-sm font-medium">AOV</td>
            <td className="py-3 px-6 text-sm">
              {metrics.aov.today > 0 ? storeGrowthMetrics.formatRevenue(metrics.aov.today) : "—"}
            </td>
            <td className="py-3 px-6 text-sm">
              {metrics.aov.thisMonth > 0 ? storeGrowthMetrics.formatRevenue(metrics.aov.thisMonth) : "—"}
            </td>
            <td className="py-3 pl-6 text-sm font-medium">
              {metrics.aov.allTime > 0 ? storeGrowthMetrics.formatRevenue(metrics.aov.allTime) : "—"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const BestsellingProducts = ({ orders }: { orders: OrderType[] | null }) => {
  const TOP_PRODUCTS_COUNT = 5;

  const calculateBestSellingProducts = (orders: OrderType[], dateFilter: string | null) => {
    const products: Record<
      string,
      {
        revenue: number;
        quantity: number;
        name: string;
        slug: string;
        id: string;
      }
    > = {};

    const isDateMatch = (timestamp: string, filter: string | null) => {
      if (!filter) return true;
      const orderDate = new Date(timestamp).toISOString().split("T")[0];
      return orderDate.startsWith(filter);
    };

    orders.forEach((order) => {
      if (dateFilter && !isDateMatch(order.timestamp, dateFilter)) return;

      order.items.forEach((item) => {
        if (item.type === "upsell") {
          item.products.forEach((product) => {
            const baseProductId = product.id;
            if (!products[baseProductId]) {
              products[baseProductId] = {
                revenue: 0,
                quantity: 0,
                name: product.name,
                slug: product.slug,
                id: baseProductId,
              };
            }
            products[baseProductId].revenue += parseFloat(String(product.basePrice));
            products[baseProductId].quantity += 1;
          });
        } else {
          const baseProductId = item.baseProductId;
          if (!products[baseProductId]) {
            products[baseProductId] = {
              revenue: 0,
              quantity: 0,
              name: item.name,
              slug: item.slug,
              id: baseProductId,
            };
          }
          products[baseProductId].revenue += parseFloat(String(item.pricing.basePrice));
          products[baseProductId].quantity += 1;
        }
      });
    });

    return products;
  };

  const formatRevenue = (amount: number): string => {
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const today = new Date().toISOString().split("T")[0];
  const thisMonth = `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, "0")}`;

  const bestSellingToday = calculateBestSellingProducts(orders || [], today);
  const bestSellingThisMonth = calculateBestSellingProducts(orders || [], thisMonth);

  const allProducts = Object.entries(bestSellingThisMonth)
    .map(([baseProductId, monthData]) => ({
      id: baseProductId,
      name: monthData.name,
      slug: monthData.slug,
      todayRevenue: bestSellingToday[baseProductId]?.revenue || 0,
      monthRevenue: monthData.revenue,
      monthQuantity: monthData.quantity,
    }))
    .sort((a, b) => b.monthQuantity - a.monthQuantity)
    .slice(0, TOP_PRODUCTS_COUNT);

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 mx-auto mb-3 bg-gray-100/60 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p className="text-gray text-sm">No sales data available yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-x-scrollbar">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left pb-3 pr-6 text-xs font-medium text-gray uppercase tracking-wider">Product</th>
            <th className="text-left pb-3 px-6 text-xs font-medium text-gray uppercase tracking-wider">
              Today's Revenue
            </th>
            <th className="text-left pb-3 px-6 text-xs font-medium text-gray uppercase tracking-wider">
              Monthly Revenue
            </th>
            <th className="text-left pb-3 pl-6 text-xs font-medium text-gray uppercase tracking-wider">
              Units Sold
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {allProducts.map(({ id, name, slug, todayRevenue, monthRevenue, monthQuantity }) => (
            <tr key={id} className="hover:bg-[#ffcc001a] transition-colors duration-150">
              <td className="py-3 pr-6">
                <Link
                  href={`/admin/products/${slug}-${id}`}
                  target="_blank"
                  className="truncate max-w-60 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-150 block"
                >
                  {name}
                </Link>
              </td>
              <td className="py-3 px-6 text-sm">{todayRevenue > 0 ? formatRevenue(todayRevenue) : "—"}</td>
              <td className="py-3 px-6 text-sm">{formatRevenue(monthRevenue)}</td>
              <td className="py-3 pl-6 text-sm font-semibold">{monthQuantity}</td>
            </tr>
          ))}
          {allProducts.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-8 text-gray text-sm">
                No sales yet for this period
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const ProductStatus = ({ products }: { products: ProductType[] | null }) => {
  if (!products) {
    return null;
  }

  const activeProducts = products.filter((p) => p.visibility === "PUBLISHED");
  const hiddenProducts = products.filter((p) => p.visibility !== "PUBLISHED");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-neutral-50/60 rounded-lg p-5 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <h3 className="text-sm font-medium">Active Products</h3>
            </div>
            <p className="text-xs text-gray">Currently available for sale</p>
          </div>
          <div className="text-xl font-semibold">{activeProducts.length}</div>
        </div>
      </div>

      <div className="bg-neutral-50/60 rounded-lg p-5 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <h3 className="text-sm font-medium">Hidden Products</h3>
            </div>
            <p className="text-xs text-gray">Awaiting restock or clearance</p>
          </div>
          <div className="text-xl font-semibold">{hiddenProducts.length}</div>
        </div>
      </div>
    </div>
  );
};

const CartStatusBreakdown = ({
  carts,
  products,
  upsells,
}: {
  carts: CartType[];
  products: ProductType[] | null;
  upsells: UpsellType[] | null;
}) => {
  const determineCartStatus = (updatedAt: string) => {
    const now = new Date();
    const updatedDate = new Date(updatedAt);
    const differenceInMs = now.getTime() - updatedDate.getTime();
    const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);

    if (differenceInDays < 1) {
      return "Active";
    } else if (differenceInDays >= 1 && differenceInDays <= 7) {
      return "Idle";
    } else if (differenceInDays > 7 && differenceInDays <= 30) {
      return "Abandoned";
    } else {
      return "Dead";
    }
  };

  const calculateCartValue = (cart: CartType) => {
    let totalValue = 0;
    cart.items.forEach((item) => {
      if (item.type === "product") {
        const product = products?.find((p) => p.id === item.baseProductId);
        if (product) {
          const price = product.pricing.salePrice
            ? parseFloat(String(product.pricing.salePrice))
            : parseFloat(String(product.pricing.basePrice));
          totalValue += price;
        }
      } else if (item.type === "upsell") {
        const upsell = upsells?.find((u) => u.id === item.baseUpsellId);
        if (upsell) {
          const price = upsell.pricing.salePrice
            ? parseFloat(String(upsell.pricing.salePrice))
            : parseFloat(String(upsell.pricing.basePrice));
          totalValue += price;
        }
      }
    });
    return totalValue;
  };

  const statusBreakdown = carts.reduce(
    (acc, cart) => {
      const status = determineCartStatus(cart.updatedAt);
      const value = calculateCartValue(cart);

      acc[status] = {
        count: (acc[status]?.count || 0) + 1,
        value: (acc[status]?.value || 0) + value,
      };
      return acc;
    },
    {
      Active: { count: 0, value: 0 },
      Idle: { count: 0, value: 0 },
      Abandoned: { count: 0, value: 0 },
      Dead: { count: 0, value: 0 },
    }
  );

  const statusConfig = {
    Active: {
      description: "< 24 hours",
      bgColor: "bg-green-100",
      textColor: "text-green-700",
    },
    Idle: {
      description: "1-7 days",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-700",
    },
    Abandoned: {
      description: "7-30 days",
      bgColor: "bg-gray-100",
      textColor: "text-gray-700",
    },
    Dead: {
      description: "> 30 days",
      bgColor: "bg-red-100",
      textColor: "text-red-700",
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(statusBreakdown).map(([status, data]) => {
        const config = statusConfig[status as keyof typeof statusConfig];

        return (
          <div key={status} className="bg-neutral-50/60 rounded-lg p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3
                className={clsx(
                  "text-sm font-medium px-2 py-1 rounded-full",
                  config?.bgColor,
                  config?.textColor
                )}
              >
                {status}
              </h3>
              <div className="text-lg font-semibold">{data.count}</div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray">{config.description}</p>
              <p className="text-sm font-medium text-gray-700">
                {data.value > 0 ? `$${data.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "$0.00"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const UpsellPerformance = ({ upsells }: { upsells: UpsellType[] | null }) => {
  const activeUpsells = upsells?.filter((u) => u.visibility === "PUBLISHED").length || 0;

  const metrics = upsells?.reduce(
    (acc, upsell) => {
      if (upsell.visibility !== "PUBLISHED") return acc;

      const baseRevenue = upsell.pricing.basePrice;
      const actualRevenue = upsell.pricing.salePrice || upsell.pricing.basePrice;

      return {
        totalRevenue: acc.totalRevenue + baseRevenue,
        discountLoss: acc.discountLoss + (baseRevenue - actualRevenue),
      };
    },
    { totalRevenue: 0, discountLoss: 0 }
  ) || { totalRevenue: 0, discountLoss: 0 };

  const avgSavings = activeUpsells ? metrics.discountLoss / activeUpsells : 0;

  const performanceCards = [
    {
      title: "Active Upsells",
      value: activeUpsells,
      description: "Test combinations to find the most profitable upsells",
    },
    {
      title: "Revenue from Upsells",
      value: metrics.totalRevenue !== 0 ? `$${metrics.totalRevenue.toLocaleString()}` : "$0",
      description: "Compare upsell revenue to single-item sales",
    },
    {
      title: "Revenue Lost via Discounts",
      value: metrics.discountLoss !== 0 ? `$${metrics.discountLoss.toLocaleString()}` : "$0",
      description: "Refine discount strategies to minimize revenue loss",
    },
    {
      title: "Avg. Customer Savings",
      value: avgSavings !== 0 ? `$${Math.round(avgSavings).toLocaleString()}` : "$0",
      description: "Ensure upsells are sustainably boosting profits",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {performanceCards.map((card, index) => {
        return (
          <div key={index} className="bg-neutral-50/60 rounded-lg p-5 border border-gray-100">
            <h3 className="text-sm font-medium mb-2">{card.title}</h3>
            <div className="text-xl font-semibold mb-2">{card.value}</div>
            <p className="text-xs text-gray leading-relaxed">{card.description}</p>
          </div>
        );
      })}
    </div>
  );
};

// -- Type Definitions --

type SelectedOptionType = {
  value: string;
  optionDisplayOrder: number;
  groupDisplayOrder: number;
};

type CartProductItemType = {
  type: "product";
  baseProductId: string;
  selectedOptions: Record<string, SelectedOptionType>;
  variantId: string;
  index: number;
};

type CartUpsellItemType = {
  type: "upsell";
  baseUpsellId: string;
  variantId: string;
  index: number;
  products: Array<{
    index: number;
    id: string;
    slug: string;
    name: string;
    basePrice: number;
    images: {
      main: string;
      gallery: string[];
    };
    options: ProductOptionsType;
  }>;
};

type CartItemType = CartProductItemType | CartUpsellItemType;

type CartType = {
  id: string;
  device_identifier: string;
  items: CartItemType[];
  createdAt: string;
  updatedAt: string;
};
