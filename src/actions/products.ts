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
      highlights: {
        headline: "",
        keyPoints: [],
      },
      pricing: {
        basePrice: data.basePrice,
        salePrice: 0,
        discountPercentage: 0,
      },
      images: {
        main: data.mainImage,
        gallery: [],
      },
      options: {
        colors: [],
        sizes: {},
      },
      seo: {
        metaTitle: "",
        metaDescription: "",
        keywords: [],
      },
      visibility: "DRAFT",
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
    return {
      type: ShowAlertType.ERROR,
      message: "Failed to create product",
    };
  }
}

export async function UpdateProductAction(
  data: {
    id: string;
    options?: Partial<ProductType["options"]>;
  } & Partial<Omit<ProductType, "options">>
) {
  try {
    const productRef = adminDb.collection("products").doc(data.id);
    const productSnap = await productRef.get();
    const currentProduct = productSnap.data() as ProductType;

    const updatedProduct = {
      ...currentProduct,
      ...data,
      options: {
        ...currentProduct.options,
        ...data.options,
      },
      updatedAt: currentTimestamp(),
    };

    await productRef.set(updatedProduct);

    // Only proceed with upsell updates if pricing changed
    if (
      data.pricing &&
      (data.pricing.basePrice !== currentProduct.pricing.basePrice ||
        data.pricing.salePrice !== currentProduct.pricing.salePrice)
    ) {
      // Find all upsells containing this product
      const upsellsSnap = await adminDb.collection("upsells").get();

      const upsellsToUpdate: {
        id: string;
        products: UpsellType["products"];
        currentPricing: PricingType;
      }[] = [];

      upsellsSnap.forEach((doc) => {
        const upsell = doc.data() as UpsellType;
        if (upsell.products.some((product) => product.id === data.id)) {
          const updatedProducts = upsell.products.map((product) =>
            product.id === data.id
              ? { ...product, basePrice: Number(data.pricing!.basePrice) || 0 }
              : product
          );

          upsellsToUpdate.push({
            id: doc.id,
            products: updatedProducts,
            currentPricing: upsell.pricing,
          });
        }
      });

      // Batch update upsells
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

    // Revalidate paths
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
    return {
      type: ShowAlertType.ERROR,
      message: "Failed to update product",
    };
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
      return {
        type: ShowAlertType.ERROR,
        message: "Upsell not found",
      };
    }

    await adminDb.collection("products").doc(data.productId).update({
      upsell: data.upsellId,
    });

    // Revalidate paths
    const productData = productDoc.data() as ProductType;
    // Revalidate paths
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
    const productData = productSnap.data() as ProductType;

    await productRef.update({
      upsell: "",
    });

    // Revalidate paths
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
      return {
        type: ShowAlertType.ERROR,
        message: "Product not found",
      };
    }

    await productRef.delete();

    const paths = ["/admin/products", "/"];

    paths.forEach((path) => revalidatePath(path));

    return {
      type: ShowAlertType.SUCCESS,
      message: "Product deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      type: ShowAlertType.ERROR,
      message: "Failed to delete product",
    };
  }
}

// -- Logic & Utilities --

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

  return {
    basePrice,
    salePrice,
    discountPercentage,
  };
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
