"use server";

import { adminDb } from "@/lib/firebase/admin";
import { generateId, currentTimestamp } from "@/lib/utils/common";
import { revalidatePath } from "next/cache";
import { ShowAlertType } from "@/lib/sharedTypes";

export async function CreateUpsellAction(
  data: Partial<Omit<UpsellType, "products">> & {
    products?: ProductWithoutOptions[];
  }
) {
  try {
    const upsellId = generateId();
    const currentTime = currentTimestamp();

    const upsell = {
      ...data,
      visibility: "DRAFT",
      updatedAt: currentTime,
      createdAt: currentTime,
    };

    await adminDb.collection("upsells").doc(upsellId).set(upsell);
    revalidatePath("/admin/upsells");

    return {
      type: ShowAlertType.SUCCESS,
      message: "Upsell created successfully",
    };
  } catch (error) {
    console.error("Error creating upsell:", error);
    return { type: ShowAlertType.ERROR, message: "Failed to create upsell" };
  }
}

export async function UpdateUpsellAction(
  data: { id: string } & Partial<Omit<UpsellType, "products">> & {
      products?: ProductWithoutOptions[];
    }
) {
  try {
    const upsellRef = adminDb.collection("upsells").doc(data.id);
    const upsellSnap = await upsellRef.get();
    const currentUpsell = upsellSnap.data() as UpsellType;

    const updatedUpsell = {
      ...currentUpsell,
      ...data,
      updatedAt: currentTimestamp(),
    };

    await upsellRef.set(updatedUpsell);

    revalidatePath(`/admin/upsells/${data.id}`, "page");
    revalidatePath("/admin/upsells");
    revalidatePath("/admin");
    revalidatePath(`/`);

    if (currentUpsell.products.length > 0) {
      // Revalidate products related to the updated upsell
      currentUpsell.products.forEach((product) => {
        revalidatePath(`/${product.slug}-${product.id}`);
        revalidatePath(`/admin/products/${product.slug}-${product.id}`);
      });
    }

    return {
      type: ShowAlertType.SUCCESS,
      message: "Upsell updated successfully",
    };
  } catch (error) {
    console.error("Error updating upsell:", error);
    return { type: ShowAlertType.ERROR, message: "Failed to update upsell" };
  }
}

export async function DeleteUpsellAction(data: { id: string }) {
  try {
    const upsellRef = adminDb.collection("upsells").doc(data.id);
    const upsellSnap = await upsellRef.get();

    if (!upsellSnap.exists) {
      return {
        type: ShowAlertType.ERROR,
        message: "Upsell not found",
      };
    }

    await upsellRef.delete();

    revalidatePath("/admin");
    revalidatePath("/admin/upsells");
    revalidatePath("/");

    return {
      type: ShowAlertType.SUCCESS,
      message: "Upsell deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting upsell:", error);
    return {
      type: ShowAlertType.ERROR,
      message: "Failed to delete upsell",
    };
  }
}

// -- Logic & Utilities --

type ProductWithoutOptions = {
  index: number;
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  images: {
    main: string;
    gallery: string[];
  };
};
