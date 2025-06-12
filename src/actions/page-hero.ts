"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";
import { ShowAlertType } from "@/lib/sharedTypes";
import * as admin from "firebase-admin";

type UpdateHeroData = {
  overline?: string;
  hook: string;
  sell?: string;
  mainImage: {
    url: string;
    alt: string;
  };
  item_type: "PRODUCT" | "LINK";
  product_id?: string;
  link_url?: string;
  cta_text: "GET YOURS" | "SHOP NOW" | "CLAIM NOW";
  background_color?: string;
  text_color?: string;
  visibility: "VISIBLE" | "HIDDEN";
};

export async function UpdatePageHeroAction(data: UpdateHeroData) {
  try {
    const updateData: { [key: string]: any } = {
      overline: data.overline,
      hook: data.hook,
      sell: data.sell,
      mainImage: data.mainImage,
      item_type: data.item_type,
      product_id: data.product_id,
      link_url: data.link_url,
      cta_text: data.cta_text,
      background_color: data.background_color,
      text_color: data.text_color,
      visibility: data.visibility,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined fields to prevent Firestore update errors
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        updateData[key] = admin.firestore.FieldValue.delete();
      }
    });

    // Ensure only relevant field is kept based on item_type
    if (data.item_type === "PRODUCT") {
      updateData.link_url = admin.firestore.FieldValue.delete();
    } else if (data.item_type === "LINK") {
      updateData.product_id = admin.firestore.FieldValue.delete();
    }

    await adminDb.collection("pageHero").doc("homepageHero").update(updateData);

    revalidatePath("/admin/storefront");
    revalidatePath("/");

    return {
      type: ShowAlertType.SUCCESS,
      message: "Page hero updated successfully",
    };
  } catch (error) {
    console.error("Error updating page hero:", error);
    return {
      type: ShowAlertType.ERROR,
      message: "Failed to update page hero",
    };
  }
}
