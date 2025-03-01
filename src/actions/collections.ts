"use server";

import { adminDb } from "@/lib/firebase/admin";
import { generateId, currentTimestamp } from "@/lib/utils/common";
import { revalidatePath } from "next/cache";
import { ShowAlertType } from "@/lib/sharedTypes";

export async function CreateCollectionAction(data: {
  title: string;
  slug: string;
  bannerImages?: BannerImagesType;
  collectionType: string;
  campaignDuration: { startDate: string; endDate: string };
}) {
  try {
    const collectionsRef = adminDb.collection("collections");
    const collectionId = generateId();
    const currentTime = currentTimestamp();

    const maxIndexSnapshot = await collectionsRef
      .orderBy("index", "desc")
      .limit(1)
      .get();
    const newIndex = maxIndexSnapshot.empty
      ? 1
      : maxIndexSnapshot.docs[0].data().index + 1;

    const newCollection = {
      id: collectionId,
      title: data.title,
      slug: data.slug,
      collectionType: data.collectionType,
      campaignDuration: data.campaignDuration,
      index: newIndex,
      products: [],
      visibility: "DRAFT" as const,
      updatedAt: currentTime,
      createdAt: currentTime,
      ...(data.bannerImages && { bannerImages: data.bannerImages }),
    };

    await collectionsRef.doc(collectionId).set(newCollection);

    revalidatePath("/admin/storefront");

    return {
      type: ShowAlertType.SUCCESS,
      message: "Collection created successfully",
    };
  } catch (error) {
    console.error("Error creating collection:", error);
    return {
      type: ShowAlertType.ERROR,
      message: "Failed to create collection",
    };
  }
}

export async function ChangeCollectionIndexAction(data: {
  id: string;
  index: number;
}) {
  try {
    const { id, index } = data;
    const collectionsRef = adminDb.collection("collections");

    const collectionRef = collectionsRef.doc(id);
    const collectionSnap = await collectionRef.get();
    if (!collectionSnap.exists) {
      return { type: ShowAlertType.ERROR, message: "Collection not found" };
    }
    const collectionData = collectionSnap.data() as CollectionType;
    const oldIndex = collectionData.index;

    if (isNaN(index) || index < 1) {
      return { type: ShowAlertType.ERROR, message: "Invalid index" };
    }

    const targetSnap = await collectionsRef
      .where("index", "==", index)
      .limit(1)
      .get();
    if (targetSnap.empty) {
      // If no collection exists at the target index, just update the current one
      await collectionRef.update({ index, updatedAt: currentTimestamp() });
    } else {
      // Swap indices using a batch
      const targetCollectionRef = targetSnap.docs[0].ref;
      const batch = adminDb.batch();
      batch.update(collectionRef, { index, updatedAt: currentTimestamp() });
      batch.update(targetCollectionRef, {
        index: oldIndex,
        updatedAt: currentTimestamp(),
      });
      await batch.commit();
    }

    revalidatePath("/admin/storefront");
    revalidatePath(
      `/admin/collections/${collectionData?.slug}-${collectionData?.id}`
    );
    revalidatePath("/");
    revalidatePath(
      `/collections/${collectionData?.slug}-${collectionData?.id}`
    );

    return {
      type: ShowAlertType.SUCCESS,
      message: "Collection index updated successfully",
    };
  } catch (error) {
    console.error("Error changing collection index:", error);
    return {
      type: ShowAlertType.ERROR,
      message: "Failed to update collection index",
    };
  }
}

export async function UpdateCollectionAction(data: {
  id: string;
  campaignDuration?: { startDate: string; endDate: string };
  bannerImages?: BannerImagesType;
  title?: string;
  slug?: string;
  visibility?: VisibilityType;
}) {
  try {
    const { id, ...updates } = data;
    const collectionRef = adminDb.collection("collections").doc(id);
    const collectionSnap = await collectionRef.get();
    if (!collectionSnap.exists) {
      return { type: ShowAlertType.ERROR, message: "Collection not found" };
    }

    const collectionData = collectionSnap.data() as CollectionType;
    const updateData: Partial<CollectionType> = {
      ...(updates.campaignDuration && {
        campaignDuration: updates.campaignDuration,
      }),
      ...(updates.bannerImages && { bannerImages: updates.bannerImages }),
      ...(updates.title && { title: updates.title }),
      ...(updates.slug && { slug: updates.slug }),
      ...(updates.visibility && { visibility: updates.visibility }),
      updatedAt: currentTimestamp(),
    };

    await collectionRef.update(updateData);

    revalidatePath("/admin/storefront");
    revalidatePath(`/admin/collections/${collectionData?.slug}-${data.id}`);
    revalidatePath("/");
    revalidatePath(`/collections/${collectionData?.slug}-${data.id}`);

    return {
      type: ShowAlertType.SUCCESS,
      message: "Collection updated successfully",
    };
  } catch (error) {
    console.error("Error updating collection:", error);
    return {
      type: ShowAlertType.ERROR,
      message: "Failed to update collection",
    };
  }
}

/**
 * Adds a product to a collection
 */
export async function AddProductAction(data: {
  collectionId: string;
  productId: string;
}) {
  try {
    const { collectionId, productId } = data;
    const collectionRef = adminDb.collection("collections").doc(collectionId);
    const collectionSnap = await collectionRef.get();
    if (!collectionSnap.exists) {
      return { type: ShowAlertType.ERROR, message: "Collection not found" };
    }

    const collectionData = collectionSnap.data() as CollectionType;
    if (collectionData.products.some((p) => p.id === productId)) {
      return {
        type: ShowAlertType.ERROR,
        message: "Product already in collection",
      };
    }

    // Add product at index 1, shift others
    const updatedProducts = [
      { id: productId, index: 1 },
      ...collectionData.products.map((p) => ({ ...p, index: p.index + 1 })),
    ];

    await collectionRef.update({
      products: updatedProducts,
      updatedAt: currentTimestamp(),
    });

    revalidatePath("/");
    revalidatePath("/admin/storefront");
    revalidatePath(
      `/admin/collections/${collectionData?.slug}-${collectionId}`
    );
    revalidatePath(`/collections/${collectionData?.slug}-${collectionId}`);

    return {
      type: ShowAlertType.SUCCESS,
      message: "Product added to collection successfully",
    };
  } catch (error) {
    console.error("Error adding product to collection:", error);
    return {
      type: ShowAlertType.ERROR,
      message: "Failed to add product to collection",
    };
  }
}

export async function RemoveProductAction(data: {
  collectionId: string;
  productId: string;
}) {
  try {
    const { collectionId, productId } = data;
    const collectionRef = adminDb.collection("collections").doc(collectionId);
    const collectionSnap = await collectionRef.get();
    if (!collectionSnap.exists) {
      return { type: ShowAlertType.ERROR, message: "Collection not found" };
    }

    const collectionData = collectionSnap.data() as CollectionType;
    const updatedProducts = collectionData.products
      .filter((p) => p.id !== productId)
      .map((p, idx) => ({ ...p, index: idx + 1 }));

    await collectionRef.update({
      products: updatedProducts,
      updatedAt: currentTimestamp(),
    });

    revalidatePath("/");
    revalidatePath("/admin/storefront");
    revalidatePath(`/admin/collections/${collectionData.slug}-${collectionId}`);
    revalidatePath(`/collections/${collectionData.slug}-${collectionId}`);

    return {
      type: ShowAlertType.SUCCESS,
      message: "Product removed from collection successfully",
    };
  } catch (error) {
    console.error("Error removing product from collection:", error);
    return {
      type: ShowAlertType.ERROR,
      message: "Failed to remove product from collection",
    };
  }
}

export async function ChangeProductIndexAction(data: {
  collectionId: string;
  product: { id: string; index: number };
}) {
  try {
    const { collectionId, product } = data;
    const collectionRef = adminDb.collection("collections").doc(collectionId);
    const collectionSnap = await collectionRef.get();
    if (!collectionSnap.exists) {
      return { type: ShowAlertType.ERROR, message: "Collection not found" };
    }

    const collectionData = collectionSnap.data() as CollectionType;
    const products = collectionData.products;
    const currentProduct = products.find((p) => p.id === product.id);
    if (!currentProduct) {
      return {
        type: ShowAlertType.ERROR,
        message: "Product not found in collection",
      };
    }
    if (product.index < 1 || product.index > products.length) {
      return { type: ShowAlertType.ERROR, message: "Index out of range" };
    }

    // Remove and reinsert product at new index
    const filteredProducts = products.filter((p) => p.id !== product.id);
    filteredProducts.splice(product.index - 1, 0, {
      id: product.id,
      index: product.index,
    });
    const updatedProducts = filteredProducts.map((p, idx) => ({
      ...p,
      index: idx + 1,
    }));

    await collectionRef.update({
      products: updatedProducts,
      updatedAt: currentTimestamp(),
    });

    revalidatePath("/");
    revalidatePath("/admin/storefront");
    revalidatePath(`/admin/collections/${collectionData.slug}-${collectionId}`);
    revalidatePath(`/collections/${collectionData.slug}-${collectionId}`);

    return {
      type: ShowAlertType.SUCCESS,
      message: "Product index updated successfully",
    };
  } catch (error) {
    console.error("Error updating product index:", error);
    return {
      type: ShowAlertType.ERROR,
      message: "Failed to update product index",
    };
  }
}

export async function DeleteCollectionAction(data: { id: string }) {
  try {
    const collectionRef = adminDb.collection("collections").doc(data.id);
    const collectionSnap = await collectionRef.get();
    if (!collectionSnap.exists) {
      return { type: ShowAlertType.ERROR, message: "Collection not found" };
    }

    await collectionRef.delete();

    // Revalidate relevant paths
    revalidatePath("/admin/storefront");
    revalidatePath("/");

    return {
      type: ShowAlertType.SUCCESS,
      message: "Collection deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting collection:", error);
    return {
      type: ShowAlertType.ERROR,
      message: "Failed to delete collection",
    };
  }
}

// Type Definitions

type BannerImagesType = {
  desktopImage: string;
  mobileImage: string;
};
