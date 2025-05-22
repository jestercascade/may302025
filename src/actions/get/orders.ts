"use server";

import { adminDb } from "@/lib/firebase/admin";

const BATCH_SIZE = 10;

/**
 * Get orders from the database with various filtering options
 *
 * @example Get all orders
 * const orders = await getOrders();
 *
 * @example Get a single order by document ID
 * const order = await getOrders({ ids: ["41785892BW449490G"] });
 *
 * @example Get multiple orders by document IDs
 * const orders = await getOrders({ ids: ["id1", "id2"] });
 *
 * @example Get order by invoice ID (short form)
 * const order = await getOrders({ invoiceIds: ["543B2D3F"] });
 *
 * @example Get order by invoice ID (full form - will be normalized)
 * const order = await getOrders({ invoiceIds: ["543B2D3F — enter at cherlygood.com/track"] });
 *
 * @example Get orders with specific fields only
 * const orders = await getOrders({
 *   ids: ["id1", "id2"],
 *   fields: ["invoiceId", "amount", "status", "items"]
 * });
 *
 * @example Get orders by payer email
 * const orders = await getOrders({ payerEmail: "john@example.com" });
 */
export async function getOrders(options: GetOrdersOptionsType = {}): Promise<OrderType[] | null> {
  const { ids = [], invoiceIds = [], fields = [], payerEmail, transactionId } = options;

  let orders: OrderType[] = [];

  try {
    // Fetch orders by document IDs using getAll
    if (ids.length > 0) {
      const orderBatches = [];
      for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        orderBatches.push(ids.slice(i, i + BATCH_SIZE));
      }

      const snapshots = await Promise.all(
        orderBatches.map((batch) => {
          const docRefs = batch.map((id) => adminDb.collection("orders").doc(id));
          return adminDb.getAll(...docRefs);
        })
      );

      const docs = snapshots.flat();
      docs.forEach((doc) => {
        if (!doc.exists) return;
        const order = filterOrderFields(doc.data(), fields, doc.id);
        orders.push(order);
      });
    }
    // Fetch orders by invoice IDs
    else if (invoiceIds.length > 0) {
      // Normalize invoice IDs - convert to full format expected in Firestore
      const normalizedInvoiceIds = invoiceIds.map(normalizeInvoiceId);

      const invoiceBatches = [];
      for (let i = 0; i < normalizedInvoiceIds.length; i += BATCH_SIZE) {
        invoiceBatches.push(normalizedInvoiceIds.slice(i, i + BATCH_SIZE));
      }

      const snapshots = await Promise.all(
        invoiceBatches.map((batch) => {
          return adminDb.collection("orders").where("invoiceId", "in", batch).get();
        })
      );

      snapshots.forEach((snapshot) => {
        snapshot.docs.forEach((doc) => {
          const order = filterOrderFields(doc.data(), fields, doc.id);
          orders.push(order);
        });
      });
    }
    // Query with filters when no specific IDs are provided
    else {
      let queryRef = adminDb.collection("orders") as FirebaseFirestore.Query;

      if (payerEmail) {
        queryRef = queryRef.where("payer.email", "==", payerEmail);
      }
      if (transactionId) {
        queryRef = queryRef.where("transactionId", "==", transactionId);
      }

      const snapshot = await queryRef.get();

      if (snapshot.empty) {
        return null;
      }

      snapshot.docs.forEach((doc) => {
        const order = filterOrderFields(doc.data(), fields, doc.id);
        orders.push(order);
      });
    }

    // Sort by timestamp (most recent first) when not fetching by specific IDs
    if (ids.length === 0 && invoiceIds.length === 0) {
      orders.sort((a, b) => {
        const dateA = new Date(a.timestamp || 0).getTime();
        const dateB = new Date(b.timestamp || 0).getTime();
        return dateB - dateA;
      });
    }

    return orders.length > 0 ? orders : null;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return null;
  }
}

function filterOrderFields(data: any, fields: string[], id: string): OrderType {
  const filtered: Partial<OrderType> = { id };

  // Always include timestamp if it exists for sorting
  if (data.timestamp !== undefined) filtered.timestamp = data.timestamp;

  if (fields.length > 0) {
    // Include specified fields
    fields.forEach((field) => {
      if (data[field] !== undefined) {
        filtered[field as keyof OrderType] = data[field];
      }
    });
  } else {
    // Include all fields
    Object.keys(data).forEach((field) => {
      if (field !== "id") {
        // id is already included
        filtered[field as keyof OrderType] = data[field];
      }
    });
  }

  return filtered as OrderType;
}

/**
 * Normalize invoice ID to the format stored in Firestore
 * Handles both short format (543B2D3F) and full format (543B2D3F — enter at cherlygood.com/track)
 *
 * @param invoiceId - The invoice ID in either format
 * @returns The normalized invoice ID in full format
 */
function normalizeInvoiceId(invoiceId: string): string {
  if (!invoiceId || typeof invoiceId !== "string") {
    throw new Error("Invoice ID must be a non-empty string");
  }

  // Remove any whitespace
  const trimmed = invoiceId.trim();

  // Check if it already contains the suffix
  const suffix = " — enter at cherlygood.com/track";
  if (trimmed.includes(" — enter at cherlygood.com/track")) {
    // Extract just the ID part (before the suffix)
    const idPart = trimmed.split(" — enter at cherlygood.com/track")[0].trim();

    // Validate the extracted ID part
    if (!isValidInvoiceIdFormat(idPart)) {
      throw new Error(`Invalid invoice ID format: ${idPart}. Expected 8 alphanumeric characters.`);
    }

    // Return with properly formatted suffix
    return `${idPart}${suffix}`;
  }

  // Validate the raw ID format
  if (!isValidInvoiceIdFormat(trimmed)) {
    throw new Error(`Invalid invoice ID format: ${trimmed}. Expected 8 alphanumeric characters.`);
  }

  // Add the suffix to create the full format
  return `${trimmed}${suffix}`;
}

/**
 * Validate that the invoice ID matches the expected format
 * Should be exactly 8 alphanumeric characters
 *
 * @param invoiceId - The raw invoice ID to validate
 * @returns True if valid format, false otherwise
 */
function isValidInvoiceIdFormat(invoiceId: string): boolean {
  // Should be exactly 8 characters, alphanumeric only
  const invoiceIdRegex = /^[A-Za-z0-9]{8}$/;
  return invoiceIdRegex.test(invoiceId);
}

type GetOrdersOptionsType = {
  ids?: string[];
  invoiceIds?: string[];
  fields?: string[];
  payerEmail?: string;
  transactionId?: string;
};
