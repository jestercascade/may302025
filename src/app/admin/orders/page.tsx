import { getOrders } from "@/actions/get/orders";
import OrdersTable from "@/components/admin/OrdersTable";

export default async function Orders() {
  const orders = await getOrders();

  return (
    <div className="flex flex-col gap-10 w-full max-w-[1016px] mx-auto px-5 min-[1068px]:p-0">
      <OrdersTable orders={orders} />
    </div>
  );
}
