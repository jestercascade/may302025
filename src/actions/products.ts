"use server";

import { adminDb } from "@/lib/firebase/admin";
import { generateId, currentTimestamp } from "@/lib/utils/common";
import { revalidatePath } from "next/cache";
import { ShowAlertType } from "@/lib/sharedTypes";

const BATCH_SIZE = 500; // Firestore batch limit

export async function CreateProductAction(data: CreateProductType) {
  try {
    const productId = generateId();
    const currentTime = currentTimestamp();

    const product = {
      name: data.name,
      slug: data.slug,
      category: data.category,
      description: "",
      highlights: { headline: "", keyPoints: [] },
      pricing: {
        basePrice: Number(data.basePrice),
        salePrice: 0,
        discountPercentage: 0,
      },
      images: { main: data.mainImage, gallery: [] },
      options: { colors: [], sizes: {} },
      seo: { metaTitle: "", metaDescription: "", keywords: [] },
      visibility: "DRAFT" as const,
      createdAt: currentTime,
      updatedAt: currentTime,
      sourceInfo: {
        platform: "",
        url: "",
        storeId: "",
        storeName: "",
        storeUrl: "",
      },
      upsell: "",
    };

    await adminDb.collection("products").doc(productId).set(product);
    revalidatePath("/admin/products");

    return {
      type: ShowAlertType.SUCCESS,
      message: "Product created successfully",
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return { type: ShowAlertType.ERROR, message: "Failed to create product" };
  }
}

export async function UpdateProductAction(
  data: { id: string; options?: Partial<ProductType["options"]> } & Partial<
    Omit<ProductType, "options">
  >
) {
  try {
    const productRef = adminDb.collection("products").doc(data.id);
    const productSnap = await productRef.get();
    if (!productSnap.exists) {
      return { type: ShowAlertType.ERROR, message: "Product not found" };
    }

    const currentProduct = productSnap.data() as ProductType;
    const isPricingChanged = hasPricingChanged(
      data.pricing,
      currentProduct.pricing
    );

    const updatedProduct = {
      ...currentProduct,
      ...data,
      options: { ...currentProduct.options, ...data.options },
      updatedAt: currentTimestamp(),
    };

    await productRef.set(updatedProduct);

    if (isPricingChanged && data.pricing?.basePrice !== undefined) {
      await updateRelatedUpsells(data.id, Number(data.pricing.basePrice));
    }

    revalidatePath(
      `/admin/products/${currentProduct.slug}-${currentProduct.id}`
    );
    revalidatePath("/admin/products");
    revalidatePath("/admin/upsells/[id]", "page");
    revalidatePath("page");
    revalidatePath("/admin/collections/[slug]", "page");
    revalidatePath("page");
    revalidatePath("/");
    revalidatePath(`/${currentProduct.slug}-${currentProduct.id}`);
    revalidatePath("/collections/[slug]", "page");
    revalidatePath("page");
    revalidatePath("/categories/[slug]", "page");
    revalidatePath("page");
    revalidatePath("/cart");
    revalidatePath("/checkout");

    return {
      type: ShowAlertType.SUCCESS,
      message: "Product updated successfully",
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return { type: ShowAlertType.ERROR, message: "Failed to update product" };
  }
}

export async function SetUpsellAction(data: {
  productId: string;
  upsellId: string;
}) {
  try {
    const [upsellDoc, productDoc] = await Promise.all([
      adminDb.collection("upsells").doc(data.upsellId).get(),
      adminDb.collection("products").doc(data.productId).get(),
    ]);

    if (!upsellDoc.exists) {
      return { type: ShowAlertType.ERROR, message: "Upsell not found" };
    }
    if (!productDoc.exists) {
      return { type: ShowAlertType.ERROR, message: "Product not found" };
    }

    await adminDb
      .collection("products")
      .doc(data.productId)
      .update({ upsell: data.upsellId });
    const productData = productDoc.data() as ProductType;

    revalidatePath(`/admin/products/${productData.slug}-${productData.id}`);
    revalidatePath("/admin/products");
    revalidatePath("/admin/upsells/[id]", "page");
    revalidatePath("page");
    revalidatePath("/admin/collections/[slug]", "page");
    revalidatePath("page");
    revalidatePath("/");
    revalidatePath(`/${productData.slug}-${productData.id}`);
    revalidatePath("/collections/[slug]", "page");
    revalidatePath("page");
    revalidatePath("/categories/[slug]", "page");
    revalidatePath("page");
    revalidatePath("/cart");
    revalidatePath("/checkout");

    return {
      type: ShowAlertType.SUCCESS,
      message: "Upsell set to product successfully",
    };
  } catch (error) {
    console.error("Error setting upsell to product:", error);
    return {
      type: ShowAlertType.ERROR,
      message: "Failed to set upsell to product",
    };
  }
}

export async function RemoveUpsellAction(data: { productId: string }) {
  try {
    const productRef = adminDb.collection("products").doc(data.productId);
    const productSnap = await productRef.get();
    if (!productSnap.exists) {
      return { type: ShowAlertType.ERROR, message: "Product not found" };
    }

    const productData = productSnap.data() as ProductType;
    await productRef.update({ upsell: "" });

    revalidatePath(`/admin/products/${productData.slug}-${productData.id}`);
    revalidatePath("/admin/products");
    revalidatePath("/admin/upsells/[id]", "page");
    revalidatePath("/admin/collections/[slug]", "page");
    revalidatePath("/");
    revalidatePath(`/${productData.slug}-${productData.id}`);
    revalidatePath("/collections/[slug]", "page");
    revalidatePath("/categories/[slug]", "page");
    revalidatePath("/cart");
    revalidatePath("/checkout");

    return {
      type: ShowAlertType.SUCCESS,
      message: "Upsell removed successfully",
    };
  } catch (error) {
    console.error("Error removing upsell from product:", error);
    return {
      type: ShowAlertType.ERROR,
      message: "Failed to remove upsell from product",
    };
  }
}

export async function DeleteProductAction(data: { id: string }) {
  try {
    const productRef = adminDb.collection("products").doc(data.id);
    const productSnap = await productRef.get();
    if (!productSnap.exists) {
      return { type: ShowAlertType.ERROR, message: "Product not found" };
    }

    const productData = productSnap.data() as ProductType;
    const upsellsSnap = await adminDb
      .collection("upsells")
      .where("products", "array-contains", { id: data.id })
      .get();

    if (!upsellsSnap.empty) {
      return {
        type: ShowAlertType.ERROR,
        message: "Cannot delete product used in active upsells",
      };
    }

    await productRef.delete();

    revalidatePath("/");
    revalidatePath("/admin/products");

    return {
      type: ShowAlertType.SUCCESS,
      message: "Product deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { type: ShowAlertType.ERROR, message: "Failed to delete product" };
  }
}

// -- Helper Functions --

function hasPricingChanged(
  newPricing?: Partial<PricingType>,
  currentPricing?: PricingType
): boolean {
  if (!newPricing || !currentPricing) return false;
  return (
    (newPricing.basePrice !== undefined &&
      newPricing.basePrice !== currentPricing.basePrice) ||
    (newPricing.salePrice !== undefined &&
      newPricing.salePrice !== currentPricing.salePrice)
  );
}

async function updateRelatedUpsells(
  productId: string,
  newBasePrice: number
): Promise<void> {
  const upsellsSnap = await adminDb
    .collection("upsells")
    .where("products", "array-contains", { id: productId })
    .get();

  const upsellsToUpdate: {
    id: string;
    products: UpsellType["products"];
    currentPricing: PricingType;
  }[] = [];

  upsellsSnap.forEach((doc) => {
    const upsell = doc.data() as UpsellType;
    const updatedProducts = upsell.products.map((product) =>
      product.id === productId
        ? { ...product, basePrice: newBasePrice }
        : product
    );
    upsellsToUpdate.push({
      id: doc.id,
      products: updatedProducts,
      currentPricing: upsell.pricing,
    });
  });

  if (upsellsToUpdate.length > 0) {
    const batches = [];
    for (let i = 0; i < upsellsToUpdate.length; i += BATCH_SIZE) {
      batches.push(upsellsToUpdate.slice(i, i + BATCH_SIZE));
    }

    for (const batchItems of batches) {
      const batch = adminDb.batch();
      batchItems.forEach(({ id, products, currentPricing }) => {
        const newPricing = calculateUpsellPricing(products, currentPricing);
        batch.update(adminDb.collection("upsells").doc(id), {
          products,
          pricing: newPricing,
          updatedAt: currentTimestamp(),
        });
      });
      await batch.commit();
    }
  }
}

function calculateUpsellPricing(
  products: UpsellType["products"],
  currentPricing: PricingType
): PricingType {
  const totalBasePrice = products.reduce(
    (total, product) => total + (Number(product.basePrice) || 0),
    0
  );
  const roundedBasePrice = Math.floor(totalBasePrice) + 0.99;
  const basePrice = Number(roundedBasePrice.toFixed(2));
  const discountPercentage = currentPricing.discountPercentage ?? 0;
  let salePrice = 0;

  if (discountPercentage > 0) {
    const rawSalePrice = basePrice * (1 - discountPercentage / 100);
    const roundedSalePrice = Math.floor(rawSalePrice) + 0.99;
    salePrice = Number(roundedSalePrice.toFixed(2));
  }

  return { basePrice, salePrice, discountPercentage };
}

// -- Type Definitions --

type CreateProductType = {
  name: string;
  slug: string;
  category: string;
  basePrice: string;
  mainImage: string;
};

type PricingType = {
  basePrice: number;
  salePrice: number;
  discountPercentage: number;
};

type ProductType = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  highlights: { headline: string; keyPoints: string[] };
  pricing: PricingType;
  images: { main: string; gallery: string[] };
  options: { colors: string[]; sizes: Record<string, number> };
  seo: { metaTitle: string; metaDescription: string; keywords: string[] };
  visibility: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
  sourceInfo: {
    platform: string;
    url: string;
    storeId: string;
    storeName: string;
    storeUrl: string;
  };
  upsell: string;
};

type UpsellType = {
  id: string;
  mainImage: string;
  visibility: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
  pricing: PricingType;
  products: { id: string; basePrice: number }[];
};
