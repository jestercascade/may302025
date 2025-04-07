"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";
import { ShowAlertType } from "@/lib/sharedTypes";

/**
 * Updates the discoveryProducts settings document with the provided visibility options.
 * This replaces the entire visibleOnPages object.
 *
 * @param data The complete visibleOnPages object
 * @returns A status object indicating success or failure
 */
export async function UpdateDiscoveryProductsAction(data: {
  visibleOnPages: {
    [key: string]: boolean;
  };
}) {
  try {
    const { visibleOnPages } = data;

    // Using admin SDK to update the document
    await adminDb.collection("discoveryProducts").doc("default").update({ visibleOnPages });

    // Revalidate paths to update data on relevant pages
    revalidatePath("/admin/storefront");
    revalidatePath("/");
    revalidatePath("/cart");

    return {
      type: ShowAlertType.SUCCESS,
      message: "Discovery products settings updated successfully",
    };
  } catch (error) {
    console.error("Error updating discovery products settings:", error);
    return {
      type: ShowAlertType.ERROR,
      message: "Failed to update discovery products settings",
    };
  }
}
