"use server";

import { adminDb } from "@/lib/firebase/admin";

/**
 * Retrieve all orders from the database.
 *
 * @example Get all orders
 * const orders = await getOrders();
 *
 * @returns {Promise<OrderType[] | null>} A list of orders or `null` if no orders are found.
 */
export async function getOrders(): Promise<OrderType[] | null> {
  try {
    const snapshot = await adminDb.collection("orders").get();

    if (snapshot.empty) {
      return null;
    }

    const orders = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as OrderType;
    });

    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return null; 
  }
}
