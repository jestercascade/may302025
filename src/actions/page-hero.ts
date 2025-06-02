"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";
import { ShowAlertType } from "@/lib/sharedTypes";

export async function UpdatePageHeroAction(data: {
  images: {
    desktop: string;
    mobile: string;
  };
  title: string;
  destinationUrl: string;
  visibility: "VISIBLE" | "HIDDEN";
}) {
  try {
    const { ...updatedPageHeroData } = data;

    await adminDb.collection("pageHero").doc("homepageHero").update(updatedPageHeroData);

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
