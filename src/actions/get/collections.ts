"use server";

import { adminDb } from "@/lib/firebase/admin";

const BATCH_SIZE = 10; // Firestore limitation for 'in' queries

/**
 *
 * @example Get a single collection
 * const collection = await getCollections({ ids: ["collection-id"] });
 *
 * @example Get multiple collections with specific fields
 * const collections = await getCollections({
 *   ids: ["id1", "id2"],
 *   fields: ["title", "description"]
 * });
 *
 * @example Get all published collections with products and their upsells
 * const collections = await getCollections({
 *   visibility: "PUBLISHED",
 *   includeProducts: true
 * });
 */
export async function getCollections(
  options: GetCollectionsOptionsType = {}
): Promise<CollectionType[] | null> {
  const { ids = [], fields = [], visibility, includeProducts } = options;

  const collectionsRef = adminDb.collection("collections");
  let queryRef: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
    collectionsRef;

  if (ids.length > 0) {
    queryRef = collectionsRef.where("__name__", "in", ids);
  }
  if (visibility) {
    queryRef = queryRef.where("visibility", "==", visibility);
  }

  const snapshot = await queryRef.get();

  if (snapshot.empty) {
    return null;
  }

  const collections: CollectionType[] = [];

  snapshot.docs.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    let selectedFields: Partial<CollectionType> = {};

    if (fields.length) {
      fields.forEach((field) => {
        if (data.hasOwnProperty(field)) {
          selectedFields[field as keyof CollectionType] = data[field];
        }
      });
    } else {
      selectedFields = data;
    }

    const collection = {
      id: docSnapshot.id,
      ...selectedFields,
      ...(data.collectionType === "BANNER" &&
        data.bannerImages && {
          bannerImages: data.bannerImages,
        }),
      updatedAt: data["updatedAt"],
      index: data["index"],
      visibility: data["visibility"],
      collectionType: data["collectionType"],
    };

    collections.push(collection as CollectionType);
  });

  if (includeProducts) {
    const allProductIds = new Set<string>();
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.products?.length) {
        data.products.forEach((product: { id: string }) => {
          allProductIds.add(product.id);
        });
      }
    });

    if (allProductIds.size > 0) {
      const productsMap = await fetchProductsInBatches(
        Array.from(allProductIds)
      );

      return collections
        .map((collection) => {
          const collectionData = snapshot.docs
            .find((doc) => doc.id === collection.id)
            ?.data();

          if (!collectionData?.products?.length) {
            return collection;
          }

          const collectionProducts = collectionData.products
            .map((productRef: { id: string; index: number }) => {
              const productData = productsMap.get(productRef.id);
              return productData
                ? { ...productData, index: productRef.index }
                : productRef;
            })
            .filter(Boolean);

          return {
            ...collection,
            products: collectionProducts,
          };
        })
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    }
  }

  return collections.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
}

async function fetchProductsInBatches(
  productIds: string[]
): Promise<Map<string, ProductType | ProductWithUpsellType>> {
  const productsMap = new Map<string, ProductType | ProductWithUpsellType>();
  const upsellIds = new Set<string>();
  const batches = [];

  for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
    batches.push(productIds.slice(i, i + BATCH_SIZE));
  }

  for (const batchIds of batches) {
    const productsRef = adminDb.collection("products");
    const batchQuery = productsRef.where("__name__", "in", batchIds);
    const snapshot = await batchQuery.get();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.upsell && typeof data.upsell === "string") {
        upsellIds.add(data.upsell.trim());
      }

      productsMap.set(doc.id, {
        id: doc.id,
        ...data,
      } as ProductType);
    });
  }

  if (upsellIds.size > 0) {
    const upsellsMap = await fetchUpsellsInBatches(Array.from(upsellIds));

    for (const [productId, product] of productsMap) {
      if (
        "upsell" in product &&
        product.upsell &&
        typeof product.upsell === "string" &&
        upsellsMap.has(product.upsell)
      ) {
        productsMap.set(productId, {
          ...product,
          upsell: upsellsMap.get(product.upsell),
        } as ProductWithUpsellType);
      }
    }
  }

  return productsMap;
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
        productsMap.set(doc.id, {
          id: doc.id,
          ...doc.data(),
        } as ProductType);
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
            id: productData.id,
            slug: productData.slug,
            name: productItem.name,
            images: productData.images,
            basePrice: productData.pricing.basePrice,
            options: productData.options,
          };
        })
        .filter(
          (item: any): item is UpsellType["products"][number] => item !== null
        );

      upsellsMap.set(doc.id, {
        ...upsellData,
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

type GetCollectionsOptionsType = {
  ids?: string[];
  fields?: string[];
  visibility?: VisibilityType;
  includeProducts?: boolean;
};
