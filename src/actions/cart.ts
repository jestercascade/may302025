"use server";

import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { generateId } from "@/lib/utils/common";
import { ShowAlertType } from "@/lib/sharedTypes";
import { FieldValue } from "firebase-admin/firestore";

export async function AddToCartAction(data: {
  type: "product" | "upsell";
  baseProductId?: string;
  size?: string;
  color?: string;
  baseUpsellId?: string;
  products?: Array<{ id: string; size: string; color: string }>;
}) {
  const setNewDeviceIdentifier = async () => {
    const newDeviceIdentifier = nanoid();
    const cookieStore = await cookies();
    cookieStore.set({
      name: "device_identifier",
      value: newDeviceIdentifier,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    return newDeviceIdentifier;
  };

  const createCartItem = (index: number) => ({
    ...(data.type === "product"
      ? {
          type: "product",
          baseProductId: data.baseProductId,
          size: data.size,
          color: data.color,
        }
      : {
          type: "upsell",
          baseUpsellId: data.baseUpsellId,
          products: data.products,
        }),
    variantId: generateId(),
    index,
  });

  const generateNewCart = async () => {
    try {
      const newDeviceIdentifier = await setNewDeviceIdentifier();
      const newCartRef = adminDb.collection("carts").doc(generateId());

      await newCartRef.set({
        device_identifier: newDeviceIdentifier,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        items: [createCartItem(1)],
      });

      revalidatePath("/cart");
      return { type: ShowAlertType.SUCCESS, message: "Item added to cart" };
    } catch (error) {
      console.error("New cart error:", error);
      return {
        type: ShowAlertType.ERROR,
        message: "Please reload and try again",
      };
    }
  };

  const updateExistingCart = async (
    cartDoc: FirebaseFirestore.DocumentReference,
    items: any[]
  ) => {
    const nextIndex = items.length + 1;
    const newItem = createCartItem(nextIndex);

    if (data.type === "product") {
      const exists = items.some(
        (item) =>
          item.type === "product" &&
          item.baseProductId === data.baseProductId &&
          item.size === data.size &&
          item.color === data.color
      );
      if (exists)
        return { type: ShowAlertType.ERROR, message: "Item already in cart" };
    } else {
      const exists = items.some(
        (item) =>
          item.type === "upsell" &&
          item.baseUpsellId === data.baseUpsellId &&
          item.products?.every(
            (p: any, i: number) =>
              p.color === data.products?.[i]?.color &&
              p.size === data.products?.[i]?.size
          )
      );
      if (exists)
        return { type: ShowAlertType.ERROR, message: "Item already in cart" };
    }

    await cartDoc.update({
      items: [...items, newItem],
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath("/cart");
    return { type: ShowAlertType.SUCCESS, message: "Item added to cart" };
  };

  try {
    const cookieStore = await cookies();
    const deviceIdentifier = cookieStore.get("device_identifier")?.value;
    if (!deviceIdentifier) return await generateNewCart();

    const snapshot = await adminDb
      .collection("carts")
      .where("device_identifier", "==", deviceIdentifier)
      .limit(1)
      .get();

    if (snapshot.empty) return await generateNewCart();

    const cartDoc = snapshot.docs[0];
    return await updateExistingCart(cartDoc.ref, cartDoc.data().items || []);
  } catch (error) {
    console.error("Cart error:", error);
    return {
      type: ShowAlertType.ERROR,
      message: "Please reload and try again",
    };
  }
}

export async function RemoveFromCartAction({
  variantId,
}: {
  variantId: string;
}) {
  try {
    const cookieStore = await cookies();
    const deviceIdentifier = cookieStore.get("device_identifier")?.value;
    if (!deviceIdentifier)
      return { type: ShowAlertType.ERROR, message: "Cart not found" };

    const snapshot = await adminDb
      .collection("carts")
      .where("device_identifier", "==", deviceIdentifier)
      .limit(1)
      .get();

    if (snapshot.empty)
      return { type: ShowAlertType.ERROR, message: "Cart not found" };

    const cartDoc = snapshot.docs[0];
    const existingItems = snapshot.docs[0].data().items;
    const filteredItems = existingItems
      .filter((item: { variantId: string }) => item.variantId !== variantId)
      .map((item: any, index: number) => ({ ...item, index: index + 1 }));

    if (filteredItems.length === 0) {
      await cartDoc.ref.delete();
      const cookieStore = await cookies();
      cookieStore.delete("device_identifier");
    } else {
      await cartDoc.ref.update({
        items: filteredItems,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    revalidatePath("/cart");
    return { type: ShowAlertType.SUCCESS, message: "Item removed from cart" };
  } catch (error) {
    console.error("Remove item error:", error);
    return {
      type: ShowAlertType.ERROR,
      message: "Please reload and try again",
    };
  }
}

export async function ClearPurchasedItemsAction({
  variantIds,
}: {
  variantIds: string[];
}) {
  try {
    const cookieStore = await cookies();
    const deviceIdentifier = cookieStore.get("device_identifier")?.value;
    if (!deviceIdentifier)
      return { type: ShowAlertType.ERROR, message: "Cart not found" };

    const snapshot = await adminDb
      .collection("carts")
      .where("device_identifier", "==", deviceIdentifier)
      .limit(1)
      .get();

    if (snapshot.empty)
      return { type: ShowAlertType.ERROR, message: "Cart not found" };

    const cartDoc = snapshot.docs[0];
    const existingItems = cartDoc.data().items || [];
    const remainingItems = existingItems
      .filter(
        (item: { variantId: string }) => !variantIds.includes(item.variantId)
      )
      .map((item: any, index: number) => ({ ...item, index: index + 1 }));

    if (remainingItems.length === 0) {
      await cartDoc.ref.delete();
      const cookieStore = await cookies();
      cookieStore.delete("device_identifier");
    } else {
      await cartDoc.ref.update({
        items: remainingItems,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    revalidatePath("/cart");
    return {
      type: ShowAlertType.SUCCESS,
      message: "Cart updated successfully",
    };
  } catch (error) {
    console.error("Clear purchased error:", error);
    return { type: ShowAlertType.ERROR, message: "Failed to update cart" };
  }
}
