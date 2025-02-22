"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";

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

    return snapshot.docs.map((cartDoc: any) => {
      const cartData = cartDoc.data();
      return {
        id: cartDoc.id,
        device_identifier: cartData.device_identifier,
        items: cartData.items || [],
        createdAt: (cartData.createdAt as FirebaseFirestore.Timestamp)
          ?.toDate()
          .toISOString(),
        updatedAt: (cartData.updatedAt as FirebaseFirestore.Timestamp)
          ?.toDate()
          .toISOString(),
      };
    });
  } catch (error) {
    console.error("Error fetching carts:", error);
    return [];
  }
}

/**
 * Fetch a single cart by device identifier.
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

    const snapshot = await adminDb
      .collection("carts")
      .where("device_identifier", "==", deviceIdentifier)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const cartDoc = snapshot.docs[0];
    const cartData = cartDoc.data();

    const validatedItems = await validateCartItems(cartData.items || []);

    if (validatedItems.length !== cartData.items?.length) {
      const reindexedItems = validatedItems.map((item, index) => ({
        ...item,
        index: index + 1,
      }));

      await adminDb.runTransaction(async (transaction: any) => {
        transaction.update(cartDoc.ref, {
          items: reindexedItems,
          updatedAt: FirebaseFirestore.Timestamp.now(),
        });
      });

      revalidatePath("/cart");
    }

    return {
      id: cartDoc.id,
      device_identifier: cartData.device_identifier,
      items: validatedItems,
      createdAt: (cartData.createdAt as FirebaseFirestore.Timestamp)
        ?.toDate()
        .toISOString(),
      updatedAt: (cartData.updatedAt as FirebaseFirestore.Timestamp)
        ?.toDate()
        .toISOString(),
    };
  } catch (error) {
    console.error("Error fetching cart:", error);
    return null;
  }
}

// -- Logic & Utilities --

async function validateCartItems(
  items: (CartProductItemType | CartUpsellItemType)[]
): Promise<(CartProductItemType | CartUpsellItemType)[]> {
  if (!items?.length) return [];

  const validatedItems = await Promise.all(
    items.map(async (item) => {
      try {
        if (!item || !item.type) return null;

        if (item.type === "product") {
          const exists = await checkDocumentExists(
            "products",
            item.baseProductId
          );
          return exists ? item : null;
        }

        if (item.type === "upsell") {
          const exists = await checkDocumentExists(
            "upsells",
            item.baseUpsellId
          );
          return exists ? item : null;
        }

        return null;
      } catch {
        return null;
      }
    })
  );

  return validatedItems.filter(
    (item): item is CartProductItemType | CartUpsellItemType => item !== null
  );
}

async function checkDocumentExists(
  collectionName: "products" | "upsells",
  id: string
): Promise<boolean> {
  if (!id?.trim()) return false;

  const docRef = adminDb.collection(collectionName).doc(id.trim());
  const snapshot = await docRef.get();
  return snapshot.exists;
}

// -- Type Definitions --

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
