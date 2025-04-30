"use server";

import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { generateId } from "@/lib/utils/common";
import { ShowAlertType } from "@/lib/sharedTypes";
import { FieldValue } from "firebase-admin/firestore";

type AddToCartParams = {
  type: "product" | "upsell";
  baseProductId?: string;
  baseUpsellId?: string;
  selectedOptions: Record<string, string>;
};

type CartResponse = {
  success: boolean;
  type: ShowAlertType;
  message: string;
  error?: string;
};

export async function AddToCartAction(data: AddToCartParams): Promise<CartResponse> {
  // Input validation
  if (data.type === "product" && !data.baseProductId) {
    return {
      success: false,
      type: ShowAlertType.ERROR,
      message: "Base Product ID is required",
      error: "Missing baseProductId",
    };
  }
  if (data.type === "upsell" && !data.baseUpsellId) {
    return {
      success: false,
      type: ShowAlertType.ERROR,
      message: "Base Upsell ID is required",
      error: "Missing baseUpsellId",
    };
  }

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
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
    return newDeviceIdentifier;
  };

  const createCartItem = (index: number) => {
    const variantId = generateId();
    if (data.type === "product") {
      return {
        type: "product",
        baseProductId: data.baseProductId,
        selectedOptions: data.selectedOptions,
        variantId,
        index,
      };
    } else {
      return {
        type: "upsell",
        baseUpsellId: data.baseUpsellId,
        selectedOptions: data.selectedOptions,
        variantId,
        index,
      };
    }
  };

  const generateNewCart = async () => {
    try {
      const newDeviceIdentifier = await setNewDeviceIdentifier();
      const newCartId = generateId();
      const newCartRef = adminDb.collection("carts").doc(newCartId);

      await newCartRef.set({
        id: newCartId,
        device_identifier: newDeviceIdentifier,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        items: [createCartItem(1)],
      });

      revalidatePath("/cart");
      return {
        success: true,
        type: ShowAlertType.SUCCESS,
        message: "Item added to cart",
      };
    } catch (error) {
      console.error("New cart error:", error);
      return {
        success: false,
        type: ShowAlertType.ERROR,
        message: "Please reload and try again",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const updateExistingCart = async (cartDoc: FirebaseFirestore.DocumentReference, items: any[]) => {
    try {
      const nextIndex = items.length + 1;
      const newItem = createCartItem(nextIndex);

      // Check for duplicates
      const exists = items.some((item) => {
        if (data.type === "product" && item.type === "product") {
          return (
            item.baseProductId === data.baseProductId &&
            JSON.stringify(item.selectedOptions) === JSON.stringify(data.selectedOptions)
          );
        } else if (data.type === "upsell" && item.type === "upsell") {
          return (
            item.baseUpsellId === data.baseUpsellId &&
            JSON.stringify(item.selectedOptions) === JSON.stringify(data.selectedOptions)
          );
        }
        return false;
      });

      if (exists) {
        return {
          success: false,
          type: ShowAlertType.NEUTRAL,
          message: "This item is already in your cart",
        };
      }

      // Update cart with new item
      await cartDoc.update({
        items: [...items, newItem],
        updatedAt: FieldValue.serverTimestamp(),
      });

      revalidatePath("/cart");
      return {
        success: true,
        type: ShowAlertType.SUCCESS,
        message: "Item added to cart",
      };
    } catch (error) {
      console.error("Update cart error:", error);
      return {
        success: false,
        type: ShowAlertType.ERROR,
        message: "Failed to update cart",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  try {
    const cookieStore = await cookies();
    const deviceIdentifier = cookieStore.get("device_identifier")?.value;

    if (!deviceIdentifier) {
      return await generateNewCart();
    }

    const snapshot = await adminDb
      .collection("carts")
      .where("device_identifier", "==", deviceIdentifier)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return await generateNewCart();
    }

    const cartDoc = snapshot.docs[0];
    return await updateExistingCart(cartDoc.ref, cartDoc.data().items || []);
  } catch (error) {
    console.error("Cart error:", error);
    return {
      success: false,
      type: ShowAlertType.ERROR,
      message: "Please reload and try again",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// export async function RemoveFromCartAction({
//   variantId,
// }: {
//   variantId: string;
// }) {
//   try {
//     const cookieStore = await cookies();
//     const deviceIdentifier = cookieStore.get("device_identifier")?.value;
//     if (!deviceIdentifier)
//       return { type: ShowAlertType.ERROR, message: "Cart not found" };

//     const snapshot = await adminDb
//       .collection("carts")
//       .where("device_identifier", "==", deviceIdentifier)
//       .limit(1)
//       .get();

//     if (snapshot.empty)
//       return { type: ShowAlertType.ERROR, message: "Cart not found" };

//     const cartDoc = snapshot.docs[0];
//     const existingItems = snapshot.docs[0].data().items;
//     const filteredItems = existingItems
//       .filter((item: { variantId: string }) => item.variantId !== variantId)
//       .map((item: any, index: number) => ({ ...item, index: index + 1 }));

//     if (filteredItems.length === 0) {
//       await cartDoc.ref.delete();
//       const cookieStore = await cookies();
//       cookieStore.delete("device_identifier");
//     } else {
//       await cartDoc.ref.update({
//         items: filteredItems,
//         updatedAt: FieldValue.serverTimestamp(),
//       });
//     }

//     revalidatePath("/cart");
//     return { type: ShowAlertType.SUCCESS, message: "Item removed from cart" };
//   } catch (error) {
//     console.error("Remove item error:", error);
//     return {
//       type: ShowAlertType.ERROR,
//       message: "Please reload and try again",
//     };
//   }
// }

// export async function ClearPurchasedItemsAction({
//   variantIds,
// }: {
//   variantIds: string[];
// }) {
//   try {
//     const cookieStore = await cookies();
//     const deviceIdentifier = cookieStore.get("device_identifier")?.value;
//     if (!deviceIdentifier)
//       return { type: ShowAlertType.ERROR, message: "Cart not found" };

//     const snapshot = await adminDb
//       .collection("carts")
//       .where("device_identifier", "==", deviceIdentifier)
//       .limit(1)
//       .get();

//     if (snapshot.empty)
//       return { type: ShowAlertType.ERROR, message: "Cart not found" };

//     const cartDoc = snapshot.docs[0];
//     const existingItems = cartDoc.data().items || [];
//     const remainingItems = existingItems
//       .filter(
//         (item: { variantId: string }) => !variantIds.includes(item.variantId)
//       )
//       .map((item: any, index: number) => ({ ...item, index: index + 1 }));

//     if (remainingItems.length === 0) {
//       await cartDoc.ref.delete();
//       const cookieStore = await cookies();
//       cookieStore.delete("device_identifier");
//     } else {
//       await cartDoc.ref.update({
//         items: remainingItems,
//         updatedAt: FieldValue.serverTimestamp(),
//       });
//     }

//     revalidatePath("/cart");
//     return {
//       type: ShowAlertType.SUCCESS,
//       message: "Cart updated successfully",
//     };
//   } catch (error) {
//     console.error("Clear purchased error:", error);
//     return { type: ShowAlertType.ERROR, message: "Failed to update cart" };
//   }
// }
