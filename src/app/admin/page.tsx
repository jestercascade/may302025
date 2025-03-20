import { getCarts } from "@/actions/get/carts";
import { getCategories } from "@/actions/get/categories";
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
    return `${localDate.getFullYear()}-${(localDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${localDate.getDate().toString().padStart(2, "0")}`;
  }

  private filterOrdersByDate(date: string): OrderType[] {
    return this.orders.filter((order) =>
      this.getLocalDateForComparison(order.timestamp).startsWith(date)
    );
  }

  private filterOrdersByMonth(date: string): OrderType[] {
    return this.orders.filter((order) =>
      this.getLocalDateForComparison(order.timestamp).startsWith(
        date.substring(0, 7)
      )
    );
  }

  private calculateRevenue(orders: OrderType[]): number {
    return orders.reduce(
      (acc, order) => acc + parseFloat(order.amount.value),
      0
    );
  }

  private calculateAOV(orders: OrderType[]): number {
    return orders.length > 0
      ? this.calculateRevenue(orders) / orders.length
      : 0;
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
    const thisMonth = `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

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
    getOrders() as Promise<PaymentTransaction[]>,
    getProducts({ fields: ["visibility", "pricing"] }) as Promise<
      ProductType[] | null
    >,
    getUpsells({ fields: ["visibility", "pricing", "products"] }) as Promise<
      UpsellType[] | null
    >,
    getCarts(),
  ]);

  return (
    <div className="max-w-[820px] mx-auto min-[1080px]:mx-0 flex flex-col gap-10 px-5">
      <div>
        <h2 className="font-semibold text-xl mb-6">Store Growth</h2>
        <div className="w-full p-5 relative shadow rounded-xl bg-white">
          <StoreGrowth orders={orders} />
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-xl mb-6">Best-Selling Products</h2>
        <div className="w-full p-5 relative shadow rounded-xl bg-white">
          <BestsellingProducts orders={orders} />
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-xl mb-6">Revenue by Category</h2>
        <div className="w-full p-5 relative shadow rounded-xl bg-white">
          <RevenueByCategory orders={orders} />
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-xl mb-6">Product Status</h2>
        <div className="w-full p-5 relative shadow rounded-xl bg-white">
          <ProductStatus products={products} />
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-xl mb-6">Cart Status Breakdown</h2>
        <div className="w-full p-5 relative shadow rounded-xl bg-white">
          <CartStatusBreakdown
            carts={carts}
            products={products}
            upsells={upsells}
          />
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-xl mb-6">Upsell Performance</h2>
        <div className="w-full p-5 relative shadow rounded-xl bg-white">
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
    <div className="rounded-lg bg-white border overflow-hidden">
      <div className="overflow-auto custom-x-scrollbar">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left text-xs font-medium text-gray uppercase tracking-wider min-w-36 md:w-1/4">
                Metric
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray uppercase tracking-wider min-w-36 md:w-1/4">
                Today
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray uppercase tracking-wider min-w-36 md:w-1/4">
                This Month
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray uppercase tracking-wider min-w-36 md:w-1/4">
                All-Time
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="group border-b last:border-b-0 hover:bg-[#ffcc001a] transition-colors">
              <td className="p-4 font-semibold">Revenue</td>
              <td
                className={clsx(
                  "p-4",
                  metrics.revenue.today !== 0 && "text-green-700 font-semibold"
                )}
              >
                {metrics.revenue.today
                  ? storeGrowthMetrics.formatRevenue(metrics.revenue.today)
                  : "—"}
              </td>
              <td
                className={clsx(
                  "p-4 font-semibold",
                  metrics.revenue.today !== 0 && "text-green-700"
                )}
              >
                {metrics.revenue.thisMonth
                  ? storeGrowthMetrics.formatRevenue(metrics.revenue.thisMonth)
                  : "—"}
              </td>
              <td className="p-4 font-semibold">
                {storeGrowthMetrics.formatRevenue(metrics.revenue.allTime)}
              </td>
            </tr>
            <tr className="group border-b last:border-b-0 hover:bg-[#ffcc001a] transition-colors">
              <td className="p-4 font-semibold">Orders</td>
              <td className="p-4">{metrics.orders.today || "—"}</td>
              <td className="p-4">{metrics.orders.thisMonth || "—"}</td>
              <td className="p-4">{metrics.orders.allTime || "—"}</td>
            </tr>
            <tr className="group border-b last:border-b-0 hover:bg-[#ffcc001a] transition-colors">
              <td className="p-4 font-semibold">AOV</td>
              <td className="p-4">
                {metrics.aov.today
                  ? storeGrowthMetrics.formatRevenue(metrics.aov.today)
                  : "—"}
              </td>
              <td className="p-4">
                {metrics.aov.thisMonth
                  ? storeGrowthMetrics.formatRevenue(metrics.aov.thisMonth)
                  : "—"}
              </td>
              <td className="p-4">
                {metrics.aov.allTime
                  ? storeGrowthMetrics.formatRevenue(metrics.aov.allTime)
                  : "—"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BestsellingProducts = ({
  orders,
}: {
  orders: PaymentTransaction[] | null;
}) => {
  const TOP_PRODUCTS_COUNT = 5;

  const calculateBestSellingProducts = (
    orders: PaymentTransaction[],
    dateFilter: string | null
  ) => {
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
        // Handle upsell products
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
            products[baseProductId].revenue += parseFloat(
              String(product.basePrice)
            );
            products[baseProductId].quantity += 1;
          });
        } else {
          // Handle regular products
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
          products[baseProductId].revenue += parseFloat(
            String(item.pricing.basePrice)
          );
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
  const thisMonth = `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;

  const bestSellingToday = calculateBestSellingProducts(orders || [], today);
  const bestSellingThisMonth = calculateBestSellingProducts(
    orders || [],
    thisMonth
  );

  const allProducts = Object.entries(bestSellingThisMonth)
    .map(([baseProductId, monthData]) => ({
      id: baseProductId,
      name: monthData.name,
      slug: monthData.slug,
      todayRevenue: bestSellingToday[baseProductId]?.revenue || 0,
      monthRevenue: monthData.revenue,
      monthQuantity: monthData.quantity,
    }))
    .sort((a, b) => b.monthQuantity - a.monthQuantity) // Sort by units sold
    .slice(0, TOP_PRODUCTS_COUNT);

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No sales data available yet
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white border overflow-hidden">
      <div className="overflow-auto custom-x-scrollbar">
        <table className="w-full min-w-[738px] text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left text-xs font-medium text-gray tracking-wider min-w-36 md:w-1/4">
                PRODUCT
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray tracking-wider min-w-36 md:w-1/4">
                <div className="relative">
                  <span>REVENUE</span>
                  <span className="absolute left-0 top-full font-normal bg-neutral-100">
                    today
                  </span>
                </div>
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray tracking-wider min-w-36 md:w-1/4">
                <div className="relative">
                  <span>REVENUE</span>
                  <span className="absolute left-0 top-full font-normal bg-neutral-100">
                    this month
                  </span>
                </div>
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray tracking-wider min-w-36 md:w-1/4">
                <div className="relative">
                  <span>UNITS SOLD</span>
                  <span className="absolute left-0 top-full font-normal bg-neutral-100">
                    this month
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {allProducts.map(
              ({
                id,
                name,
                slug,
                todayRevenue,
                monthRevenue,
                monthQuantity,
              }) => (
                <tr
                  key={id}
                  className="group border-b last:border-b-0 hover:bg-[#ffcc001a] transition-colors"
                >
                  <td className="p-4">
                    <div className="w-full max-w-[112px]">
                      <Link
                        href={`/admin/products/${slug}-${id}`}
                        target="_blank"
                        className="underline line-clamp-1 min-w-[152px]"
                      >
                        {name}
                      </Link>
                    </div>
                  </td>
                  <td className="p-4">
                    {todayRevenue > 0 ? formatRevenue(todayRevenue) : "—"}
                  </td>
                  <td className="p-4 font-semibold text-green-700">
                    {formatRevenue(monthRevenue)}
                  </td>
                  <td className="p-4">{monthQuantity}</td>
                </tr>
              )
            )}
            {allProducts.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  No sales yet for this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RevenueByCategory = async ({
  orders,
}: {
  orders: PaymentTransaction[] | null;
}) => {
  const categoriesData = (await getCategories()) || { categories: [] };
  const products =
    (await getProducts({ fields: ["id", "slug", "category"] })) || [];

  const productCategories = products.reduce((acc, product) => {
    if ("slug" in product && "category" in product) {
      acc[product.slug] = product.category.toLowerCase();
    }
    return acc;
  }, {} as Record<string, string>);

  const calculateRevenueByCategory = (
    orders: PaymentTransaction[],
    dateFilter: string | null
  ): Record<string, { revenue: number; category: string }> => {
    const categoryRevenue: Record<
      string,
      { revenue: number; category: string }
    > = {};

    categoriesData.categories.forEach((category) => {
      const normalizedName = category.name.toLowerCase();
      categoryRevenue[normalizedName] = {
        revenue: 0,
        category: category.name,
      };
    });

    const isDateMatch = (timestamp: string, filter: string | null) => {
      if (!filter) return true;
      const orderDate = new Date(timestamp).toISOString().split("T")[0];
      return orderDate.startsWith(filter);
    };

    orders?.forEach((order) => {
      if (dateFilter && !isDateMatch(order.timestamp, dateFilter)) return;

      const orderTotal = parseFloat(order.amount.value);
      const itemCount = order.items.reduce((count, orderItem) => {
        if (orderItem.type === "upsell") {
          return count + orderItem.products.length;
        }
        return count + 1;
      }, 0);
      const revenuePerItem = orderTotal / itemCount;

      order.items.forEach((item) => {
        if (item.type === "upsell") {
          item.products.forEach((product) => {
            const category = (
              productCategories[product.slug] || "uncategorized"
            ).toLowerCase();
            if (!categoryRevenue[category]) {
              categoryRevenue[category] = {
                revenue: 0,
                category: category.charAt(0).toUpperCase() + category.slice(1),
              };
            }
            categoryRevenue[category].revenue += revenuePerItem;
          });
        } else {
          const category = (
            productCategories[item.slug] || "uncategorized"
          ).toLowerCase();
          if (!categoryRevenue[category]) {
            categoryRevenue[category] = {
              revenue: 0,
              category: category.charAt(0).toUpperCase() + category.slice(1),
            };
          }
          categoryRevenue[category].revenue += revenuePerItem;
        }
      });
    });

    return categoryRevenue;
  };

  const formatRevenue = (amount: number): string => {
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPercentage = (amount: number, total: number): string => {
    return total === 0
      ? "—"
      : amount === 0
      ? "0"
      : `${((amount / total) * 100).toFixed(1)}%`;
  };

  const thisMonth = `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;

  const monthlyRevenue = calculateRevenueByCategory(orders || [], thisMonth);
  const allTimeRevenue = calculateRevenueByCategory(orders || [], null);

  const totalMonthlyRevenue = Object.values(monthlyRevenue).reduce(
    (acc, { revenue }) => acc + revenue,
    0
  );

  const sortedCategories = Object.entries(allTimeRevenue)
    .sort(([nameA], [nameB]) => {
      const monthlyRevenueA = monthlyRevenue[nameA]?.revenue || 0;
      const monthlyRevenueB = monthlyRevenue[nameB]?.revenue || 0;
      return monthlyRevenueB - monthlyRevenueA;
    })
    .map(([name, data]) => ({
      name,
      category: data.category,
      monthRevenue: monthlyRevenue[name]?.revenue || 0,
      allTimeRevenue: data.revenue,
    }));

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No orders available</div>
    );
  }

  return (
    <div className="rounded-lg bg-white border overflow-hidden">
      <div className="overflow-auto custom-x-scrollbar">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left text-xs font-medium text-gray tracking-wider min-w-36 md:w-1/4">
                CATEGORY
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray tracking-wider min-w-40 md:w-1/4">
                <div className="relative">
                  <span>REVENUE</span>
                  <span className="absolute left-0 top-full font-normal bg-neutral-100">
                    this month
                  </span>
                </div>
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray tracking-wider min-w-40 md:w-1/4">
                ALL-TIME REVENUE
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray tracking-wider min-w-40 md:w-1/4">
                <div className="relative">
                  <span>CONTRIBUTION</span>
                  <span className="absolute left-0 top-full font-normal bg-neutral-100">
                    this month
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCategories.map(
              ({ name, category, monthRevenue, allTimeRevenue }) => (
                <tr
                  key={name}
                  className="group border-b last:border-b-0 hover:bg-[#ffcc001a] transition-colors"
                >
                  <td className="p-4 font-semibold">{category}</td>
                  <td
                    className={`p-4 ${
                      monthRevenue > 0 ? "text-green-700 font-semibold" : ""
                    }`}
                  >
                    {monthRevenue > 0 ? formatRevenue(monthRevenue) : "—"}
                  </td>
                  <td className="p-4">
                    {allTimeRevenue > 0 ? formatRevenue(allTimeRevenue) : "—"}
                  </td>
                  <td
                    className={`p-4 ${
                      monthlyRevenue[name]?.revenue > 0 &&
                      formatPercentage(monthRevenue, totalMonthlyRevenue) !==
                        "0"
                        ? "text-green-700 font-semibold"
                        : ""
                    }`}
                  >
                    {formatPercentage(monthRevenue, totalMonthlyRevenue)}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
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
    <div className="rounded-lg bg-white border overflow-hidden">
      <div className="overflow-auto custom-x-scrollbar">
        <table className="w-full min-w-[738px] text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left text-xs font-medium text-gray uppercase tracking-wider min-w-[100px]">
                Status
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray uppercase tracking-wider min-w-[100px]">
                Product Count
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray uppercase tracking-wider">
                Summary
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="group border-b last:border-b-0 hover:bg-[#ffcc001a] transition-colors">
              <td className="p-4">
                <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                  Active
                </span>
              </td>
              <td className="p-4 font-semibold">{activeProducts.length}</td>
              <td className="p-4">Currently available for sale.</td>
            </tr>
            <tr className="group border-b last:border-b-0 hover:bg-[#ffcc001a] transition-colors">
              <td className="p-4">
                <span className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
                  Hidden
                </span>
              </td>
              <td className="p-4 font-semibold">{hiddenProducts.length}</td>
              <td className="p-4">Awaiting restock or clearance.</td>
            </tr>
          </tbody>
        </table>
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
          const price = parseFloat(String(product.pricing.basePrice));
          totalValue += price;
        }
      } else if (item.type === "upsell") {
        const upsell = upsells?.find((u) => u.id === item.baseUpsellId);
        if (upsell) {
          const price = parseFloat(String(upsell.pricing.basePrice));
          totalValue += price;
        }
      }
    });

    return totalValue;
  };

  const statusCounts = carts.reduce(
    (acc, cart) => {
      const status = determineCartStatus(cart.updatedAt);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { Active: 0, Idle: 0, Abandoned: 0, Dead: 0 }
  );

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

  return (
    <div className="rounded-lg bg-white border overflow-hidden">
      <div className="overflow-auto custom-x-scrollbar">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left text-xs font-medium text-gray uppercase tracking-wider min-w-36">
                Status
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray uppercase tracking-wider min-w-36">
                Cart Count
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray uppercase tracking-wider min-w-36">
                Total Value
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray uppercase tracking-wider min-w-64">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="group border-b last:border-b-0 hover:bg-[#ffcc001a] transition-colors">
              <td className="p-4">
                <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                  Active
                </span>
              </td>
              <td
                className={clsx("p-4", {
                  "font-semibold": statusCounts.Active !== 0,
                })}
              >
                {statusBreakdown.Active.count}
              </td>
              <td
                className={clsx(
                  "p-4",
                  statusBreakdown.Active.value && "font-semibold"
                )}
              >
                {statusBreakdown.Active.value
                  ? `$${statusBreakdown.Active.value.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}`
                  : 0}
              </td>
              <td className="p-4">Carts within &lt; 24 hours.</td>
            </tr>
            <tr className="group border-b last:border-b-0 hover:bg-[#ffcc001a] transition-colors">
              <td className="p-4">
                <span className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
                  Idle
                </span>
              </td>
              <td
                className={clsx("p-4", {
                  "font-semibold": statusCounts.Idle !== 0,
                })}
              >
                {statusBreakdown.Idle.count}
              </td>
              <td
                className={clsx(
                  "p-4",
                  statusBreakdown.Idle.value && "font-semibold"
                )}
              >
                {statusBreakdown.Idle.value
                  ? `$${statusBreakdown.Idle.value.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}`
                  : 0}
              </td>
              <td className="p-4">Carts inactive for 1-7 days.</td>
            </tr>
            <tr className="group border-b last:border-b-0 hover:bg-[#ffcc001a] transition-colors">
              <td className="p-4">
                <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                  Abandoned
                </span>
              </td>
              <td
                className={clsx("p-4", {
                  "font-semibold": statusCounts.Abandoned !== 0,
                })}
              >
                {statusBreakdown.Abandoned.count}
              </td>
              <td
                className={clsx(
                  "p-4",
                  statusBreakdown.Abandoned.value && "font-semibold"
                )}
              >
                {statusBreakdown.Abandoned.value
                  ? `$${statusBreakdown.Abandoned.value.toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: 2,
                      }
                    )}`
                  : 0}
              </td>
              <td className="p-4">Carts abandoned for 7-30 days.</td>
            </tr>
            <tr className="group border-b last:border-b-0 hover:bg-[#ffcc001a] transition-colors">
              <td className="p-4">
                <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                  Dead
                </span>
              </td>
              <td
                className={clsx("p-4", {
                  "font-semibold": statusCounts.Dead !== 0,
                })}
              >
                {statusBreakdown.Dead.count}
              </td>
              <td
                className={clsx(
                  "p-4",
                  statusBreakdown.Dead.value && "text-red-700"
                )}
              >
                {statusBreakdown.Dead.value
                  ? `$${statusBreakdown.Dead.value.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}`
                  : 0}
              </td>
              <td className="p-4">Carts older than 30 days.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UpsellPerformance = ({ upsells }: { upsells: UpsellType[] | null }) => {
  // Calculate active upsells (PUBLISHED only)
  const activeUpsells =
    upsells?.filter((u) => u.visibility === "PUBLISHED").length || 0;

  // Calculate total potential revenue and actual revenue with discounts
  const metrics = upsells?.reduce(
    (acc, upsell) => {
      if (upsell.visibility !== "PUBLISHED") return acc;

      const baseRevenue = upsell.pricing.basePrice;
      const actualRevenue =
        upsell.pricing.salePrice || upsell.pricing.basePrice;

      return {
        totalRevenue: acc.totalRevenue + baseRevenue,
        discountLoss: acc.discountLoss + (baseRevenue - actualRevenue),
      };
    },
    { totalRevenue: 0, discountLoss: 0 }
  ) || { totalRevenue: 0, discountLoss: 0 };

  // Calculate average customer savings
  const avgSavings = activeUpsells ? metrics.discountLoss / activeUpsells : 0;

  return (
    <div className="rounded-lg bg-white border overflow-hidden">
      <div className="overflow-auto custom-x-scrollbar">
        <table className="w-full min-w-[738px] text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left text-xs font-medium text-gray uppercase tracking-wider w-36">
                Metric
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray uppercase tracking-wider w-36">
                Value
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="group border-b last:border-b-0 hover:bg-[#ffcc001a] transition-colors">
              <td className="p-4 font-semibold">Active Upsells</td>
              <td className="p-4 font-semibold">{activeUpsells}</td>
              <td className="p-4">
                Test combinations to find the most profitable upsells with the
                least discount impact.
              </td>
            </tr>
            <tr className="group border-b last:border-b-0 hover:bg-[#ffcc001a] transition-colors">
              <td className="p-4 font-semibold">Revenue from Upsells</td>
              <td className="p-4 font-semibold">
                {metrics.totalRevenue !== 0
                  ? `$${metrics.totalRevenue.toLocaleString()}`
                  : "0"}
              </td>
              <td className="p-4">
                Compare upsell revenue to single-item sales to evaluate the
                value of upsells.
              </td>
            </tr>
            <tr className="group border-b last:border-b-0 hover:bg-[#ffcc001a] transition-colors">
              <td className="p-4 font-semibold">Revenue Lost via Discounts</td>
              <td className="p-4 font-semibold">
                {metrics.discountLoss !== 0
                  ? `$${metrics.discountLoss.toLocaleString()}`
                  : "0"}
              </td>
              <td className="p-4">
                Refine discount strategies to minimize revenue loss while
                maintaining customer value.
              </td>
            </tr>
            <tr className="group border-b last:border-b-0 hover:bg-[#ffcc001a] transition-colors">
              <td className="p-4 font-semibold">Avg. Customer Savings</td>
              <td className="p-4 font-semibold">
                {avgSavings !== 0
                  ? `$${Math.round(avgSavings).toLocaleString()}`
                  : "0"}
              </td>
              <td className="p-4">
                Make sure upsells are sustainably boosting profits, not just
                moving stock.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// -- Type Definitions --

type ProductInUpsell = {
  mainImage: string;
  index: number;
  basePrice: number;
  color: string;
  id: string;
  size: string;
  slug: string;
  name: string;
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
  items: Array<
    | {
        slug: string;
        type: "product";
        mainImage: string;
        pricing: {
          basePrice: number;
          salePrice: number;
          discountPercentage: number;
        };
        color: string;
        size: string;
        index: number;
        baseProductId: string;
        variantId: string;
        name: string;
      }
    | {
        mainImage: string;
        index: number;
        pricing: {
          basePrice: number;
          salePrice: number;
          discountPercentage: number;
        };
        products: ProductInUpsell[];
        type: "upsell";
        baseUpsellId: string;
        variantId: string;
      }
  >;
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
