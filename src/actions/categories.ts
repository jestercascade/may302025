"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";
import { ShowAlertType } from "@/lib/sharedTypes";

export async function UpdateCategoriesAction(data: StoreCategoriesType) {
  try {
    if (!data.categories || !Array.isArray(data.categories)) {
      return {
        type: ShowAlertType.ERROR,
        message: "Invalid categories data provided",
      };
    }

    for (const category of data.categories) {
      if (
        typeof category.index !== "number" ||
        typeof category.name !== "string" ||
        typeof category.image !== "string" ||
        !["VISIBLE", "HIDDEN"].includes(category.visibility) ||
        typeof category.createdAt !== "string" ||
        typeof category.updatedAt !== "string"
      ) {
        return {
          type: ShowAlertType.ERROR,
          message: `Invalid category data for ${
            category.name || "unknown category"
          }`,
        };
      }
    }

    if (
      data.showOnPublicSite &&
      data.categories.every((category) => category.visibility === "HIDDEN")
    ) {
      return {
        type: ShowAlertType.ERROR,
        message:
          "Cannot show categories section when all categories are hidden",
      };
    }

    const sortedCategories = [...data.categories].sort(
      (a, b) => a.index - b.index
    );

    const currentTimestamp = new Date().toISOString();
    const updateData: StoreCategoriesType = {
      showOnPublicSite: data.showOnPublicSite,
      categories: sortedCategories.map((category) => ({
        ...category,
        createdAt: category.createdAt,
        updatedAt: currentTimestamp,
      })),
    };

    const categoriesRef = adminDb
      .collection("categories")
      .doc("storeCategories");
    await categoriesRef.set(updateData);

    revalidatePath("/admin/storefront");
    revalidatePath("/", "layout");

    return {
      type: ShowAlertType.SUCCESS,
      message: "Categories updated successfully",
    };
  } catch (error) {
    console.error("Error updating categories:", error);

    return {
      type: ShowAlertType.ERROR,
      message: "Failed to update categories",
    };
  }
}

// Type Definitions

type StoreCategoriesType = {
  showOnPublicSite: boolean;
  categories: CategoryType[];
};
