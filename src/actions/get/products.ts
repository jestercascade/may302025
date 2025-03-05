"use server";

import { adminDb } from "@/lib/firebase/admin";
import { capitalizeFirstLetter } from "@/lib/utils/common";

const BATCH_SIZE = 10;

/**
 * Get products from the database with various filtering options
 *
 * @example Get all products
 * const products = await getProducts();
 *
 * @example Get a single product
 * const product = await getProducts({ ids: ["id1"] });
 *
 * @example Get multiple products with specific fields
 * const products = await getProducts({
 *   ids: ["id1", "id2"],
 *   fields: ["name", "pricing", "upsell"]
 * });
 *
 * @example Get all published products in a category
 * const products = await getProducts({
 *   category: "dresses",
 *   visibility: "PUBLISHED"
 * });
 *
 * @example Get products with upsells
 * const products = await getProducts({
 *   ids: ["id1", "id2"],
 *   fields: ["name", "pricing", "upsell"]
 * });
 */
export async function getProducts(
  options: GetProductsOptionsType = {}
): Promise<(ProductType | ProductWithUpsellType)[] | null> {
  const { ids = [], fields = [], visibility, category } = options;
  const includeUpsell = fields.includes("upsell");

  let products: (ProductType | ProductWithUpsellType)[] = [];
  const upsellIds = new Set<string>();

  // Fetch products by IDs using getAll
  if (ids.length > 0) {
    const productBatches = [];
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      productBatches.push(ids.slice(i, i + BATCH_SIZE));
    }

    const snapshots = await Promise.all(
      productBatches.map((batch) => {
        const docRefs = batch.map((id) =>
          adminDb.collection("products").doc(id)
        );
        return adminDb.getAll(...docRefs);
      })
    );

    const docs = snapshots.flat();
    docs.forEach((doc) => {
      if (!doc.exists) return;
      const data = doc.data();
      const product = filterProductFields(data, fields, doc.id);
      if (
        includeUpsell &&
        product.upsell &&
        typeof product.upsell === "string"
      ) {
        upsellIds.add(product.upsell.trim());
      }
      products.push(product);
    });
  } else {
    // Query with filters when no IDs are provided
    let queryRef = adminDb.collection("products") as FirebaseFirestore.Query;

    if (visibility) {
      queryRef = queryRef.where("visibility", "==", visibility);
    }
    if (category) {
      queryRef = queryRef.where(
        "category",
        "==",
        capitalizeFirstLetter(category)
      );
    }

    const snapshot = await queryRef.get();
    snapshot.docs.forEach((doc) => {
      const product = filterProductFields(doc.data(), fields, doc.id);
      if (
        includeUpsell &&
        product.upsell &&
        typeof product.upsell === "string"
      ) {
        upsellIds.add(product.upsell.trim());
      }
      products.push(product);
    });
  }

  // Fetch and attach upsells if needed
  if (includeUpsell && upsellIds.size > 0) {
    const upsellsMap = await fetchUpsellsInBatches(Array.from(upsellIds));
    products = products.map((product) => {
      if (
        typeof product.upsell === "string" &&
        upsellsMap.has(product.upsell)
      ) {
        return {
          ...product,
          upsell: upsellsMap.get(product.upsell)!,
        } as ProductWithUpsellType;
      }
      return product;
    });
  }

  // Sort only when not fetching by IDs
  return ids.length === 0
    ? products.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    : products;
}

function filterProductFields(
  data: any,
  fields: string[],
  id: string
): ProductType {
  const filtered: Partial<ProductType> = { id };
  // Always include createdAt and updatedAt if they exist
  if (data.createdAt !== undefined) filtered.createdAt = data.createdAt;
  if (data.updatedAt !== undefined) filtered.updatedAt = data.updatedAt;
  if (fields.length > 0) {
    // Include specified fields
    fields.forEach((field) => {
      if (data[field] !== undefined)
        filtered[field as keyof ProductType] = data[field];
    });
  } else {
    // Include all fields
    Object.keys(data).forEach((field) => {
      if (field !== "id")
        // id is already included
        filtered[field as keyof ProductType] = data[field];
    });
  }
  return filtered as ProductType;
}

async function fetchUpsellsInBatches(
  upsellIds: string[]
): Promise<Map<string, UpsellType>> {
  const upsellsMap = new Map<string, UpsellType>();
  const batches = [];

  for (let i = 0; i < upsellIds.length; i += BATCH_SIZE) {
    batches.push(upsellIds.slice(i, i + BATCH_SIZE));
  }

  const upsellPromises = batches.map((batchIds) => {
    const q = adminDb
      .collection("upsells")
      .where("__name__", "in", batchIds)
      .select(
        "mainImage",
        "visibility",
        "createdAt",
        "updatedAt",
        "pricing",
        "products"
      );
    return q.get();
  });

  const upsellSnapshots = await Promise.all(upsellPromises);
  const allProductIds = new Set<string>();

  upsellSnapshots.flat().forEach((snapshot) => {
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      data.products?.forEach((p: { id: string }) => allProductIds.add(p.id));
    });
  });

  const productBatches = [];
  const productIdsArray = Array.from(allProductIds);
  for (let i = 0; i < productIdsArray.length; i += BATCH_SIZE) {
    productBatches.push(productIdsArray.slice(i, i + BATCH_SIZE));
  }

  const productPromises = productBatches.map((batchIds) => {
    const q = adminDb
      .collection("products")
      .where("__name__", "in", batchIds)
      .select("id", "slug", "name", "pricing.basePrice", "images", "options");
    return q.get();
  });

  const productSnapshots = await Promise.all(productPromises);
  const productsMap = new Map<string, ProductType>();

  productSnapshots.flat().forEach((snapshot) => {
    snapshot.docs.forEach((doc) => {
      productsMap.set(doc.id, { id: doc.id, ...doc.data() } as ProductType);
    });
  });

  upsellSnapshots.flat().forEach((snapshot) => {
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const products = data.products
        ?.map((p: any) => ({
          ...productsMap.get(p.id),
          ...p,
        }))
        .filter(Boolean);

      upsellsMap.set(doc.id, {
        id: doc.id,
        mainImage: data.mainImage,
        visibility: data.visibility,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        pricing: data.pricing,
        products,
      } as UpsellType);
    });
  });

  return upsellsMap;
}

type GetProductsOptionsType = {
  ids?: string[];
  fields?: string[];
  visibility?: VisibilityType;
  category?: string;
};
