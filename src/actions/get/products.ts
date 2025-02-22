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

  const productsRef = adminDb.collection("products");
  let queryRef: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
    productsRef;

  if (ids.length > 0) {
    queryRef = queryRef.where("__name__", "in", ids);
  }

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

  if (snapshot.empty) {
    return null;
  }

  const products: ProductType[] = [];
  const upsellIds = new Set<string>();

  snapshot.docs.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    let selectedFields: Partial<ProductType> = {};

    if (fields.length) {
      fields.forEach((field) => {
        if (data.hasOwnProperty(field)) {
          selectedFields[field as keyof ProductType] = data[field];
        }
      });
    } else {
      selectedFields = data;
    }

    const product = {
      id: docSnapshot.id,
      ...selectedFields,
      updatedAt: data["updatedAt"],
      visibility: data["visibility"],
    } as ProductType;

    if (includeUpsell && product.upsell && typeof product.upsell === "string") {
      upsellIds.add(product.upsell.trim());
    }

    products.push(product);
  });

  let upsellsMap: Map<string, UpsellType> = new Map();

  if (includeUpsell && upsellIds.size > 0) {
    upsellsMap = await fetchUpsellsInBatches(Array.from(upsellIds));
  }

  const enhancedProducts = products.map((product) => {
    if (
      includeUpsell &&
      product.upsell &&
      typeof product.upsell === "string" &&
      upsellsMap.has(product.upsell)
    ) {
      return {
        ...product,
        upsell: upsellsMap.get(product.upsell),
      } as ProductWithUpsellType;
    }
    return product;
  });

  return enhancedProducts.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

async function fetchUpsellsInBatches(
  upsellIds: string[]
): Promise<Map<string, UpsellType>> {
  const upsellsMap = new Map<string, UpsellType>();
  const batches = [];

  for (let i = 0; i < upsellIds.length; i += BATCH_SIZE) {
    batches.push(upsellIds.slice(i, i + BATCH_SIZE));
  }

  for (const batchIds of batches) {
    const upsellsRef = adminDb.collection("upsells");
    const batchQuery = upsellsRef.where("__name__", "in", batchIds);
    const batchSnapshot = await batchQuery.get();

    const productIds = new Set<string>();
    batchSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      data.products.forEach((product: { id: string }) => {
        productIds.add(product.id);
      });
    });

    const productsMap = new Map<string, ProductType>();
    const productBatches = [];
    const productIdsArray = Array.from(productIds);

    for (let i = 0; i < productIdsArray.length; i += BATCH_SIZE) {
      productBatches.push(productIdsArray.slice(i, i + BATCH_SIZE));
    }

    for (const productBatchIds of productBatches) {
      const productsRef = adminDb.collection("products");
      const productsQuery = productsRef.where(
        "__name__",
        "in",
        productBatchIds
      );
      const productsSnapshot = await productsQuery.get();

      productsSnapshot.docs.forEach((doc) => {
        productsMap.set(doc.id, { id: doc.id, ...doc.data() } as ProductType);
      });
    }

    batchSnapshot.docs.forEach((doc) => {
      const upsellData = doc.data();
      const productsInUpsell = upsellData.products
        .map((productItem: { id: string; index: number; name: string }) => {
          const productData = productsMap.get(productItem.id);
          if (!productData) return null;

          return {
            index: productItem.index,
            name: productItem.name,
            id: productData.id,
            slug: productData.slug,
            images: productData.images,
            basePrice: productData.pricing.basePrice,
            options: productData.options,
          };
        })
        .filter(
          (item: any): item is UpsellType["products"][number] => item !== null
        );

      upsellsMap.set(doc.id, {
        id: doc.id,
        mainImage: upsellData.mainImage,
        visibility: upsellData.visibility,
        createdAt: upsellData.createdAt,
        updatedAt: upsellData.updatedAt,
        products: productsInUpsell,
        pricing: upsellData.pricing,
      } as UpsellType);
    });
  }

  return upsellsMap;
}

type GetProductsOptionsType = {
  ids?: string[];
  fields?: string[];
  visibility?: VisibilityType;
  category?: string;
};
