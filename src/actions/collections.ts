"use server";

import { adminDb } from "@/lib/firebase/admin";
import { generateId } from "@/lib/utils/common";
import { currentTimestamp } from "@/lib/utils/common";
import { revalidatePath } from "next/cache";
import { ShowAlertType } from "@/lib/sharedTypes";

export async function CreateCollectionAction(data: {
  title: string;
  slug: string;
  bannerImages?: BannerImagesType;
  collectionType: string;
  campaignDuration: {
    startDate: string;
    endDate: string;
  };
}) {
  try {
    const collectionsRef = adminDb.collection("collections");
    const documentRef = collectionsRef.doc(generateId());
    const currentTime = currentTimestamp();

    const newCollection = {
      title: data.title,
      slug: data.slug,
      collectionType: data.collectionType,
      campaignDuration: data.campaignDuration,
      index: 1,
      products: [],
      visibility: "DRAFT",
      updatedAt: currentTime,
      createdAt: currentTime,
      ...(data.bannerImages && { bannerImages: data.bannerImages }),
    };

    const existingCollections = await collectionsRef.get();

    type CollectionData = {
      id: string;
      index: number;
    };

    const sortedCollections: CollectionData[] = existingCollections.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as { index: number }) }))
      .sort((a, b) => a.index - b.index);

    const batch = adminDb.batch();
    batch.set(documentRef, newCollection);

    sortedCollections.forEach((collection, index) => {
      const collectionRef = collectionsRef.doc(collection.id);
      batch.update(collectionRef, { index: index + 2 });
    });

    await batch.commit();

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
    const collectionOneRef = collectionsRef.doc(id);
    const collectionOneSnapshot = await collectionOneRef.get();
    const existingCollections = await collectionsRef.get();

    if (
      !collectionOneSnapshot.exists ||
      isNaN(index) ||
      index < 1 ||
      index > existingCollections.size
    ) {
      return {
        type: ShowAlertType.ERROR,
        message: !collectionOneSnapshot.exists
          ? "Collection not found"
          : "Index is invalid or out of range",
      };
    }

    const collectionTwoId = existingCollections.docs.find(
      (collection) => collection.data().index === index
    )?.id;

    if (!collectionTwoId) {
      return {
        type: ShowAlertType.ERROR,
        message: "No collection found to swap index with",
      };
    }

    const collectionOneBeforeUpdate = collectionOneSnapshot.data();
    const collectionTwoRef = collectionsRef.doc(collectionTwoId);

    const batch = adminDb.batch();
    batch.update(collectionOneRef, { index, updatedAt: currentTimestamp() });
    batch.update(collectionTwoRef, {
      index: collectionOneBeforeUpdate?.index,
    });
    await batch.commit();

    // Revalidate paths to update collections data
    const collectionData = collectionOneBeforeUpdate;
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
  visibility?: string;
}) {
  try {
    const collectionRef = adminDb.collection("collections").doc(data.id);
    const collectionSnapshot = await collectionRef.get();

    if (!collectionSnapshot.exists) {
      return {
        type: ShowAlertType.ERROR,
        message: "Collection not found",
      };
    }

    const updateData: Record<string, any> = {};

    if (data.campaignDuration) {
      updateData.campaignDuration = data.campaignDuration;
    }

    if (data.bannerImages) {
      updateData.bannerImages = data.bannerImages;
    }

    if (data.title) {
      updateData.title = data.title;
    }

    if (data.slug) {
      updateData.slug = data.slug;
    }

    if (data.visibility) {
      updateData.visibility = data.visibility;
    }

    await collectionRef.update({
      ...updateData,
      updatedAt: currentTimestamp(),
    });

    // Revalidate paths to update collections data
    const collectionData = collectionSnapshot.data();
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

export async function AddProductAction(data: {
  collectionId: string;
  productId: string;
}) {
  try {
    const { collectionId, productId } = data;

    // Fetch both documents in parallel
    const [productSnapshot, collectionSnapshot] = await Promise.all([
      adminDb.collection("products").doc(productId).get(),
      adminDb.collection("collections").doc(collectionId).get(),
    ]);

    if (!productSnapshot.exists) {
      return { type: ShowAlertType.ERROR, message: "Product not found" };
    }

    if (!collectionSnapshot.exists) {
      return {
        type: ShowAlertType.ERROR,
        message: "Collection not found",
      };
    }

    const collectionData = collectionSnapshot.data();
    const collectionProducts = Array.isArray(collectionData?.products)
      ? collectionData?.products
      : [];

    const productAlreadyExists = collectionProducts.some(
      (product) => product.id === productId
    );

    if (productAlreadyExists) {
      return {
        type: ShowAlertType.ERROR,
        message: "Product already in the collection",
      };
    }

    // Sort and update indices in memory
    collectionProducts.sort((a, b) => a.index - b.index);
    const updatedProducts = collectionProducts.map((product, index) => ({
      ...product,
      index: index + 2,
    }));

    // Add new product at the beginning
    updatedProducts.unshift({ id: productId, index: 1 });

    await adminDb.collection("collections").doc(collectionId).update({
      products: updatedProducts,
      updatedAt: currentTimestamp(),
    });

    // Revalidate paths
    const paths = [
      "/admin/storefront",
      `/admin/collections/${collectionData?.slug}-${collectionId}`,
      "/",
      `/collections/${collectionData?.slug}-${collectionId}`,
    ];
    paths.forEach((path) => revalidatePath(path));

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
    const productRef = adminDb.collection("products").doc(productId);
    const productSnapshot = await productRef.get();

    if (!productSnapshot.exists) {
      return { type: ShowAlertType.ERROR, message: "Product not found" };
    }

    const collectionRef = adminDb.collection("collections").doc(collectionId);
    const collectionSnapshot = await collectionRef.get();

    if (!collectionSnapshot.exists) {
      return {
        type: ShowAlertType.ERROR,
        message: "Collection not found",
      };
    }

    const collectionData = collectionSnapshot.data() as DataType;

    const updatedProducts = collectionData.products.filter(
      (product) => product.id !== productId
    );

    updatedProducts.forEach((product, index) => {
      product.index = index + 1;
    });

    await collectionRef.update({
      products: updatedProducts,
      updatedAt: currentTimestamp(),
    });

    // Revalidate paths to update collections data
    revalidatePath("/admin/storefront");
    revalidatePath(`/admin/collections/${collectionData.slug}-${collectionId}`);
    revalidatePath("/");
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
  product: {
    id: string;
    index: number;
  };
}) {
  try {
    const { collectionId, product: productOneChanges } = data;

    // Fetch both documents in parallel
    const [productSnapshot, collectionSnapshot] = await Promise.all([
      adminDb.collection("products").doc(productOneChanges.id).get(),
      adminDb.collection("collections").doc(collectionId).get(),
    ]);

    if (!productSnapshot.exists) {
      return { type: ShowAlertType.ERROR, message: "Product not found" };
    }

    if (!collectionSnapshot.exists) {
      return {
        type: ShowAlertType.ERROR,
        message: "Collection not found",
      };
    }

    const collectionData = collectionSnapshot.data() as DataType;

    if (
      isNaN(productOneChanges.index) ||
      productOneChanges.index < 1 ||
      productOneChanges.index > collectionData.products.length
    ) {
      return {
        type: ShowAlertType.ERROR,
        message: "Index is invalid or out of range",
      };
    }

    const productOne = collectionData.products.find(
      (item) => item.id === productOneChanges.id
    );

    const productOneIndexBeforeSwap = productOne?.index;

    const productTwo = collectionData.products.find(
      (item) => item.index === productOneChanges.index
    );

    if (!productTwo || !productOne || productOneIndexBeforeSwap === undefined) {
      return {
        type: ShowAlertType.ERROR,
        message: "Products not found for index swap",
      };
    }

    // Perform swap in memory
    productOne.index = productOneChanges.index;
    productTwo.index = productOneIndexBeforeSwap;

    await adminDb.collection("collections").doc(collectionId).update({
      products: collectionData.products,
      updatedAt: currentTimestamp(),
    });

    // Revalidate paths
    const paths = [
      "/admin/storefront",
      `/admin/collections/${collectionData.slug}-${collectionId}`,
      "/",
      `/collections/${collectionData.slug}-${collectionId}`,
    ];
    paths.forEach((path) => revalidatePath(path));

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
      return {
        type: ShowAlertType.ERROR,
        message: "Collection not found",
      };
    }

    await collectionRef.delete();

    const reorderResult = await ReorderCollectionIndicesAction();

    if (reorderResult.type === ShowAlertType.ERROR) {
      return reorderResult;
    }

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

// -- Logic & Utilities --

async function ReorderCollectionIndicesAction() {
  try {
    const collectionsRef = adminDb.collection("collections");
    const collectionsSnapshot = await collectionsRef.get();

    const sortedCollections = collectionsSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        index: doc.data().index,
      }))
      .sort((a, b) => a.index - b.index);

    const batch = adminDb.batch();

    sortedCollections.forEach((collection, idx) => {
      const collectionRef = collectionsRef.doc(collection.id);
      batch.update(collectionRef, {
        index: idx + 1,
        updatedAt: currentTimestamp(),
      });
    });

    await batch.commit();

    revalidatePath("/admin/storefront");
    revalidatePath("/");

    return {
      type: ShowAlertType.SUCCESS,
      message: "Collection indices reordered successfully",
    };
  } catch (error) {
    console.error("Error reordering collection indices:", error);
    return {
      type: ShowAlertType.ERROR,
      message: "Failed to reorder collection indices",
    };
  }
}

// -- Type Definitions --

type DataType = {
  image: string;
  title: string;
  slug: string;
  campaignDuration: {
    startDate: string;
    endDate: string;
  };
  visibility: string;
  collectionType: string;
  index: number;
  updatedAt: string;
  createdAt: string;
  products: Array<{ id: string; index: number }>;
};

type BannerImagesType = {
  desktopImage: string;
  mobileImage: string;
};
