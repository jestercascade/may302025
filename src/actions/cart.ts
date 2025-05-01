"use server";

import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { generateId } from "@/lib/utils/common";
import { ShowAlertType } from "@/lib/sharedTypes";
import { FieldValue } from "firebase-admin/firestore";

// Type for selected options with index information
type SelectedOptionType = {
  value: string;
  optionDisplayOrder: number;
  groupDisplayOrder: number;
};

type SelectedOptionsType = Record<string, SelectedOptionType>;

export async function AddToCartAction(data: {
  type: "product" | "upsell";
  baseProductId?: string;
  selectedOptions?: SelectedOptionsType;
  baseUpsellId?: string;
  products?: Array<{ id: string; selectedOptions?: SelectedOptionsType }>;
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
        selectedOptions: data.selectedOptions || {},
        variantId: generateId(),
        index,
      };
    } else {
      return {
        type: "upsell",
        baseUpsellId: data.baseUpsellId,
        products: data.products?.map((product) => ({
          id: product.id,
          selectedOptions: product.selectedOptions || {},
        })),
        variantId: generateId(),
        index,
      };
    }
  };

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
      };
    }
  };

  const updateExistingCart = async (cartDoc: FirebaseFirestore.DocumentReference, items: any[]) => {
    const nextIndex = items.length + 1;
    const newItem = createCartItem(nextIndex);

    if (data.type === "product") {
      // Check if item with same product ID and options already exists
      const exists = items.some((item) => {
        if (item.type !== "product" || item.baseProductId !== data.baseProductId) {
          return false;
        }

        // Compare selectedOptions values
        const existingOptions = item.selectedOptions || {};
        const newOptions = data.selectedOptions || {};

        // Check if both have the same number of options
        if (Object.keys(existingOptions).length !== Object.keys(newOptions).length) {
          return false;
        }

        // Check if all option values match
        for (const key in newOptions) {
          if (!existingOptions[key] || existingOptions[key].value !== newOptions[key].value) {
            return false;
          }
        }

        return true;
      });

      if (exists) {
        return {
          success: false,
          type: ShowAlertType.ERROR,
          message: "Item already in cart",
        };
      }
    } else if (data.type === "upsell") {
      // Check for duplicate upsell bundles
      const exists = items.some((item) => {
        if (item.type !== "upsell" || item.baseUpsellId !== data.baseUpsellId) {
          return false;
        }

        // Must have same number of products
        if (!item.products || !data.products || item.products.length !== data.products.length) {
          return false;
        }

        // Check if all products in bundle match
        return item.products.every((itemProduct: any, index: number) => {
          const newProduct = data.products?.[index];

          // First check if newProduct exists
          if (!newProduct || itemProduct.id !== newProduct.id) {
            return false;
          }

          // Compare options (safely access selectedOptions)
          const itemOptions = itemProduct.selectedOptions || {};
          const newOptions = newProduct?.selectedOptions || {};

          // Check if both have the same number of options
          if (Object.keys(itemOptions).length !== Object.keys(newOptions).length) {
            return false;
          }

          // Check all option values match
          for (const key in newOptions) {
            if (!itemOptions[key] || itemOptions[key].value !== newOptions[key].value) {
              return false;
            }
          }

          return true;
        });
      });

      if (exists) {
        return {
          success: false,
          type: ShowAlertType.ERROR,
          message: "Item already in cart",
        };
      }
    }

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
      success: false,
      type: ShowAlertType.ERROR,
      message: "Please reload and try again",
    };
  }
}
