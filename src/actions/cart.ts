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

  const createCartItem = (index: number) => {
    if (data.type === "product") {
      return {
        type: "product",
        baseProductId: data.baseProductId,
        size: data.size,
        color: data.color,
        variantId: generateId(),
        index,
      };
    } else {
      return {
        type: "upsell",
        baseUpsellId: data.baseUpsellId,
        variantId: generateId(),
        index,
        products: data.products,
      };
    }
  };

  const generateNewCart = async () => {
    try {
      const newDeviceIdentifier = await setNewDeviceIdentifier();

      const newCartData = {
        device_identifier: newDeviceIdentifier,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        items: [createCartItem(1)],
      };

      const cartsRef = adminDb.collection("carts");
      const newCartRef = cartsRef.doc(generateId());

      await adminDb.runTransaction(async (transaction) => {
        await transaction.set(newCartRef, newCartData);
      });

      revalidatePath("/");
      revalidatePath("/cart");
      revalidatePath("/[slug]", "page");
      revalidatePath("/admin");

      return {
        type: ShowAlertType.SUCCESS,
        message: "Item added to cart",
      };
    } catch (error) {
      console.error("Error generating new cart:", error);
      return {
        type: ShowAlertType.ERROR,
        message: "Please reload the page and try again",
      };
    }
  };

  const updateExistingCart = async (cartDoc: any, existingCartItems: any[]) => {
    const nextIndex = existingCartItems.length + 1;

    if (data.type === "product") {
      const productExists = existingCartItems.some(
        (product: { baseProductId: string; size: string; color: string }) =>
          product.baseProductId === data.baseProductId &&
          product.size === data.size &&
          product.color === data.color
      );

      if (productExists) {
        return {
          type: ShowAlertType.ERROR,
          message: "Item already in cart",
        };
      } else {
        existingCartItems.push({
          type: data.type,
          baseProductId: data.baseProductId,
          size: data.size,
          color: data.color,
          variantId: generateId(),
          index: nextIndex,
        });
      }
    } else if (data.type === "upsell" && data.products) {
      const upsellExists = existingCartItems.some((item) => {
        if (item.type === "upsell" && item.baseUpsellId === data.baseUpsellId) {
          return item.products.every(
            (
              existingProduct: { color: string; size: string },
              index: number
            ) => {
              const newProduct = data.products?.[index];
              if (!newProduct) return false;
              return (
                existingProduct.color === newProduct.color &&
                existingProduct.size === newProduct.size
              );
            }
          );
        }
        return false;
      });

      if (upsellExists) {
        return {
          type: ShowAlertType.ERROR,
          message: "Item already in cart",
        };
      } else {
        existingCartItems.push({
          type: "upsell",
          baseUpsellId: data.baseUpsellId,
          variantId: generateId(),
          index: nextIndex,
          products: data.products,
        });
      }
    }

    await adminDb.runTransaction(async (transaction) => {
      await transaction.update(cartDoc, {
        items: existingCartItems,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    revalidatePath("/");
    revalidatePath("/cart");
    revalidatePath("/[slug]", "page");
    revalidatePath("/admin");

    return {
      type: ShowAlertType.SUCCESS,
      message: "Item added to cart",
    };
  };

  try {
    const cookieStore = await cookies();
    const deviceIdentifier = cookieStore.get("device_identifier")?.value;
    if (!deviceIdentifier) return await generateNewCart();

    const cartsRef = adminDb.collection("carts");
    const snapshot = await cartsRef
      .where("device_identifier", "==", deviceIdentifier)
      .get();

    if (snapshot.empty) {
      return await generateNewCart();
    } else {
      const cartDoc = snapshot.docs[0].ref;
      const existingCartItems = snapshot.docs[0].data().items || [];
      return await updateExistingCart(cartDoc, existingCartItems);
    }
  } catch (error) {
    console.error("Error adding product to cart:", error);
    return {
      type: ShowAlertType.ERROR,
      message: "Please reload the page and try again",
    };
  }
}

export async function RemoveFromCartAction({
  variantId,
}: {
  variantId: string;
}) {
  const cookieStore = await cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value;

  if (!deviceIdentifier) {
    return {
      type: ShowAlertType.ERROR,
      message: "Cart not found",
    };
  }

  try {
    const cartsRef = adminDb.collection("carts");
    const snapshot = await cartsRef
      .where("device_identifier", "==", deviceIdentifier)
      .get();

    if (snapshot.empty) {
      return {
        type: ShowAlertType.ERROR,
        message: "Cart not found",
      };
    }

    const cartDoc = snapshot.docs[0].ref;
    const existingCartItems = snapshot.docs[0].data().items;

    const filteredItems = existingCartItems.filter(
      (item: CartProductItemType | CartUpsellItemType) =>
        item.variantId !== variantId
    );

    // If this was the last item, delete the cart and remove the cookie
    if (filteredItems.length === 0) {
      await adminDb.runTransaction(async (transaction) => {
        await transaction.delete(cartDoc);
      });

      // Remove the device_identifier cookie
      cookieStore.delete({
        name: "device_identifier",
        path: "/",
      });

      revalidatePath("/cart");
      revalidatePath("/admin");

      return {
        type: ShowAlertType.SUCCESS,
        message: "Cart cleared",
      };
    }

    // Otherwise, update the cart as before
    const sortedItems = filteredItems.sort(
      (a: any, b: any) => a.index - b.index
    );

    const reindexedItems = sortedItems.map(
      (item: CartProductItemType | CartUpsellItemType, index: number) => ({
        ...item,
        index: index + 1,
      })
    );

    await adminDb.runTransaction(async (transaction) => {
      await transaction.update(cartDoc, {
        items: reindexedItems,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    revalidatePath("/cart");
    revalidatePath("/admin");

    return {
      type: ShowAlertType.SUCCESS,
      message: "Item removed from cart",
    };
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return {
      type: ShowAlertType.ERROR,
      message: "Please reload the page and try again",
    };
  }
}

export async function ClearPurchasedItemsAction({
  variantIds,
}: {
  variantIds: string[];
}) {
  const cookieStore = await cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value;

  if (!deviceIdentifier) {
    return {
      type: ShowAlertType.ERROR,
      message: "Cart not found",
    };
  }

  try {
    const cartsRef = adminDb.collection("carts");
    const snapshot = await cartsRef
      .where("device_identifier", "==", deviceIdentifier)
      .get();

    if (snapshot.empty) {
      return {
        type: ShowAlertType.ERROR,
        message: "Cart not found",
      };
    }

    const cartDoc = snapshot.docs[0].ref;
    const existingCartItems = snapshot.docs[0].data().items;

    // Filter out the purchased items
    const remainingItems = existingCartItems.filter(
      (item: { variantId: string }) => !variantIds.includes(item.variantId)
    );

    // Reindex remaining items
    const reindexedItems = remainingItems.map((item: any, index: number) => ({
      ...item,
      index: index + 1,
    }));

    if (reindexedItems.length === 0) {
      await adminDb.runTransaction(async (transaction) => {
        await transaction.delete(cartDoc);
      });

      // Clear the device_identifier cookie since cart is gone
      const cookieStore = await cookies();
      cookieStore.delete("device_identifier");
    } else {
      await adminDb.runTransaction(async (transaction) => {
        await transaction.update(cartDoc, {
          items: reindexedItems,
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
    }

    revalidatePath("/cart");
    revalidatePath("/admin");

    return {
      type: ShowAlertType.SUCCESS,
      message: "Cart updated successfully",
    };
  } catch (error) {
    console.error("Error clearing purchased items from cart:", error);
    return {
      type: ShowAlertType.ERROR,
      message: "Failed to update cart",
    };
  }
}
