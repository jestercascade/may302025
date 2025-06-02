"use server";

import { adminDb } from "@/lib/firebase/admin";
import { currentTimestamp } from "@/lib/utils/common";
import { revalidatePath } from "next/cache";
import { ShowAlertType } from "@/lib/sharedTypes";

export async function UpdateOrderTrackingAction(data: {
  id: string;
  tracking: {
    currentStatus: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "COMPLETED";
    trackingNumber?: string;
    estimatedDeliveryDate?: {
      start: string;
      end: string;
    };
  };
}) {
  try {
    const orderRef = adminDb.collection("orders").doc(data.id);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return { type: ShowAlertType.ERROR, message: "Order not found" };
    }

    const currentOrder = orderSnap.data() as OrderType;
    const currentTime = currentTimestamp();

    const statusHistory = [...currentOrder.tracking.statusHistory];
    if (data.tracking.currentStatus !== currentOrder.tracking.currentStatus) {
      const statusMessages = {
        PENDING: "Order is pending processing",
        CONFIRMED: "Order confirmed and is being prepared",
        SHIPPED: "Order has been shipped",
        DELIVERED: "Order has been delivered",
        COMPLETED: "Order is completed",
      };

      statusHistory.push({
        status: data.tracking.currentStatus,
        timestamp: currentTime,
        message: statusMessages[data.tracking.currentStatus],
      });
    }

    const updatedTracking = {
      ...currentOrder.tracking,
      currentStatus: data.tracking.currentStatus,
      statusHistory,
      lastUpdated: currentTime,
    };

    if (data.tracking.trackingNumber !== undefined) {
      updatedTracking.trackingNumber = data.tracking.trackingNumber || undefined;
    }

    if (data.tracking.estimatedDeliveryDate) {
      updatedTracking.estimatedDeliveryDate = {
        start: data.tracking.estimatedDeliveryDate.start,
        end: data.tracking.estimatedDeliveryDate.end,
      };
    }

    const updatedOrder = {
      ...currentOrder,
      tracking: updatedTracking,
    };

    await orderRef.set(updatedOrder);

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${data.id}`);

    return {
      type: ShowAlertType.SUCCESS,
      message: "Order tracking updated successfully",
    };
  } catch (error) {
    console.error("Error updating order tracking:", error);
    return {
      type: ShowAlertType.ERROR,
      message: "Failed to update order tracking",
    };
  }
}
