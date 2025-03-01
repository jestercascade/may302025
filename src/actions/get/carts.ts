"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";
import { FieldPath, FieldValue, Timestamp } from "firebase-admin/firestore";

const BATCH_SIZE = 10; // Firestore "in" query limit is 10

/**
 * Fetch all carts from the database.
 *
 * @example Get all carts
 * const carts = await getCarts();
 *
 * @returns {Promise<CartType[]>} A list of cart objects or an empty array.
 */
export async function getCarts(): Promise<CartType[]> {
  try {
    const snapshot = await adminDb.collection("carts").get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((cartDoc) => formatCartDocument(cartDoc));
  } catch (error) {
    console.error("Error fetching carts:", error);
    return [];
  }
}

/**
 * Fetch a single cart by device identifier with optimized item validation.
 *
 * @example Get a specific cart
 * const cart = await getCart("device-identifier");
 *
 * @param {string | undefined} deviceIdentifier - The unique device identifier of the cart.
 * @returns {Promise<CartType | null>} The cart object or null if not found
 */
export async function getCart(
  deviceIdentifier: string | undefined
): Promise<CartType | null> {
  try {
    if (!deviceIdentifier) {
      return null;
    }

    // Fetch cart with limit for efficiency
    const snapshot = await adminDb
      .collection("carts")
      .where("device_identifier", "==", deviceIdentifier)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const cartDoc = snapshot.docs[0];
    const cartData = cartDoc.data();
    const items = cartData.items || [];

    // Collect IDs for batch validation
    const productIds = new Set<string>();
    const upsellIds = new Set<string>();

    items.forEach((item: CartProductItemType | CartUpsellItemType) => {
      if (item.type === "product" && item.baseProductId) {
        productIds.add(item.baseProductId.trim());
      } else if (item.type === "upsell" && item.baseUpsellId) {
        upsellIds.add(item.baseUpsellId.trim());
      }
    });

    // Batch check existence of products and upsells
    const [validProductIds, validUpsellIds] = await Promise.all([
      checkDocumentsExist("products", Array.from(productIds)),
      checkDocumentsExist("upsells", Array.from(upsellIds)),
    ]);

    // Filter items based on valid IDs
    const validatedItems = items.filter(
      (item: CartProductItemType | CartUpsellItemType) => {
        if (!item || !item.type) return false;

        if (item.type === "product") {
          return validProductIds.has(item.baseProductId.trim());
        }

        if (item.type === "upsell") {
          return validUpsellIds.has(item.baseUpsellId.trim());
        }

        return false;
      }
    );

    if (validatedItems.length !== items.length) {
      const reindexedItems = validatedItems.map((item: any, index: any) => ({
        ...item,
        index: index + 1,
      }));

      await adminDb.collection("carts").doc(cartDoc.id).update({
        items: reindexedItems,
        updatedAt: FieldValue.serverTimestamp(),
      });

      revalidatePath("/cart");
    }

    return {
      id: cartDoc.id,
      device_identifier: cartData.device_identifier,
      items: validatedItems,
      createdAt: formatTimestamp(cartData.createdAt),
      updatedAt: formatTimestamp(cartData.updatedAt),
    };
  } catch (error) {
    console.error("Error fetching cart:", error);
    return null;
  }
}

// --- Helper Functions ---

/**
 * Format a Firestore document into a CartType.
 */
function formatCartDocument(
  cartDoc: FirebaseFirestore.QueryDocumentSnapshot
): CartType {
  const cartData = cartDoc.data();
  return {
    id: cartDoc.id,
    device_identifier: cartData.device_identifier,
    items: cartData.items || [],
    createdAt: formatTimestamp(cartData.createdAt),
    updatedAt: formatTimestamp(cartData.updatedAt),
  };
}

/**
 * Safely format a Firestore timestamp to ISO string.
 */
function formatTimestamp(timestamp: FirebaseFirestore.Timestamp): string {
  return timestamp?.toDate().toISOString() || new Date().toISOString();
}

/**
 * Check existence of multiple documents in a collection using batched "in" queries.
 */
async function checkDocumentsExist(
  collectionName: "products" | "upsells",
  ids: string[]
): Promise<Set<string>> {
  if (!ids.length) return new Set();

  const validIds = new Set<string>();
  const batches: string[][] = [];

  // Split IDs into batches of 10
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    batches.push(ids.slice(i, i + BATCH_SIZE));
  }

  // Execute batch queries in parallel
  const results = await Promise.all(
    batches.map(async (batchIds) => {
      const querySnapshot = await adminDb
        .collection(collectionName)
        .where(FieldPath.documentId(), "in", batchIds)
        .select() // Fetch only IDs, not full documents
        .get();

      return querySnapshot.docs.map((doc) => doc.id);
    })
  );

  // Collect valid IDs
  results.flat().forEach((id) => validIds.add(id));

  return validIds;
}

// --- Type Definitions ---

type CartProductItemType = {
  index: number;
  baseProductId: string;
  variantId: string;
  color: string;
  size: string;
  type: "product";
};

type CartUpsellItemType = {
  index: number;
  baseUpsellId: string;
  variantId: string;
  type: "upsell";
  products: Array<{
    id: string;
    color: string;
    size: string;
  }>;
};

type CartType = {
  id: string;
  device_identifier: any;
  items: (CartProductItemType | CartUpsellItemType)[];
  createdAt: string;
  updatedAt: string;
};
