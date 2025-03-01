"use server";

import { adminDb } from "@/lib/firebase/admin";

const BATCH_SIZE = 10;

/**
 * Get collections from the database with various filtering options.
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
 * @example Get all published collections with embedded products
 * const collections = await getCollections({
 *   visibility: "PUBLISHED",
 *   includeProducts: true
 * });
 */
export async function getCollections(
  options: GetCollectionsOptionsType = {}
): Promise<CollectionType[] | null> {
  const { ids = [], fields = [], visibility, includeProducts } = options;

  let collections: CollectionType[] = [];
  const allProductIds = new Set<string>();

  if (ids.length > 0) {
    const collectionBatches = [];
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      collectionBatches.push(ids.slice(i, i + BATCH_SIZE));
    }

    const snapshots = await Promise.all(
      collectionBatches.map((batch) => {
        const docRefs = batch.map((id) =>
          adminDb.collection("collections").doc(id)
        );
        return adminDb.getAll(...docRefs);
      })
    );

    const docs = snapshots.flat();
    docs.forEach((doc) => {
      if (!doc.exists) return;
      const data = doc.data() || {};
      const collection = filterCollectionFields(data, fields, doc.id);

      if (includeProducts && data.products?.length) {
        data.products.forEach((product: { id: string }) => {
          if (product?.id) {
            allProductIds.add(product.id);
          }
        });
      }

      collections.push(collection);
    });
  } else {
    let queryRef = adminDb.collection("collections") as FirebaseFirestore.Query;

    if (visibility) {
      queryRef = queryRef.where("visibility", "==", visibility);
    }

    const snapshot = await queryRef.get();

    if (snapshot.empty) {
      return null;
    }

    snapshot.docs.forEach((doc) => {
      const data = doc.data() || {};
      const collection = filterCollectionFields(data, fields, doc.id);

      if (includeProducts && data.products?.length) {
        data.products.forEach((product: { id: string }) => {
          if (product?.id) {
            allProductIds.add(product.id);
          }
        });
      }

      collections.push(collection);
    });
  }

  if (includeProducts && allProductIds.size > 0) {
    const productsMap = await fetchProductsInBatches(Array.from(allProductIds));

    collections = collections.map((collection) => {
      const collectionProducts = collection.products?.map((productRef) => {
        const productData = productsMap.get(productRef.id);
        return productData
          ? { ...productData, index: productRef.index }
          : productRef;
      });

      return {
        ...collection,
        products: collectionProducts,
      };
    });
  }

  return collections.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
}

function filterCollectionFields(
  data: FirebaseFirestore.DocumentData,
  fields: string[],
  id: string
): CollectionType {
  const filtered: Partial<CollectionType> = { id };

  if (fields.length > 0) {
    fields.forEach((field) => {
      if (data[field] !== undefined) {
        filtered[field as keyof CollectionType] = data[field];
      }
    });
  } else {
    Object.assign(filtered, data);
  }

  filtered.index = data.index;
  filtered.visibility = data.visibility;
  filtered.title = data.title;
  filtered.collectionType = data.collectionType;
  filtered.updatedAt = data.updatedAt;

  if (data.collectionType === "BANNER" && data.bannerImages) {
    filtered.bannerImages = data.bannerImages;
  }

  if (data.products?.length) {
    filtered.products = data.products;
  }

  return filtered as CollectionType;
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

  const productPromises = batches.map((batchIds) => {
    return adminDb
      .collection("products")
      .where("__name__", "in", batchIds)
      .get();
  });

  const snapshots = await Promise.all(productPromises);

  snapshots.forEach((snapshot) => {
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
  });

  // Fetch upsells if needed
  if (upsellIds.size > 0) {
    const upsellsMap = await fetchUpsellsInBatches(Array.from(upsellIds));

    for (const [productId, product] of productsMap.entries()) {
      if (
        "upsell" in product &&
        product.upsell &&
        typeof product.upsell === "string" &&
        upsellsMap.has(product.upsell)
      ) {
        const upsell = upsellsMap.get(product.upsell);
        if (upsell) {
          productsMap.set(productId, {
            ...product,
            upsell,
          } as ProductWithUpsellType);
        }
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

  const upsellPromises = batches.map((batchIds) => {
    return adminDb
      .collection("upsells")
      .where("__name__", "in", batchIds)
      .select(
        "mainImage",
        "visibility",
        "createdAt",
        "updatedAt",
        "pricing",
        "products"
      )
      .get();
  });

  const upsellSnapshots = await Promise.all(upsellPromises);
  const allProductIds = new Set<string>();

  upsellSnapshots.forEach((snapshot) => {
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      data.products?.forEach((p: { id: string }) => {
        if (p?.id) {
          allProductIds.add(p.id);
        }
      });
    });
  });

  // Fetch products for upsells
  const productBatches = [];
  const productIdsArray = Array.from(allProductIds);

  for (let i = 0; i < productIdsArray.length; i += BATCH_SIZE) {
    productBatches.push(productIdsArray.slice(i, i + BATCH_SIZE));
  }

  const productPromises = productBatches.map((batchIds) => {
    return adminDb
      .collection("products")
      .where("__name__", "in", batchIds)
      .select("id", "slug", "name", "pricing.basePrice", "images", "options")
      .get();
  });

  const productSnapshots = await Promise.all(productPromises);
  const productsMap = new Map<string, ProductType>();

  productSnapshots.forEach((snapshot) => {
    snapshot.docs.forEach((doc) => {
      productsMap.set(doc.id, { id: doc.id, ...doc.data() } as ProductType);
    });
  });

  // Build upsells with their products
  upsellSnapshots.forEach((snapshot) => {
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const productsInUpsell = data.products
        ?.map((p: { id: string; index: number; name: string }) => {
          if (!p?.id) return null;

          const productData = productsMap.get(p.id);
          if (!productData) return null;

          return {
            index: p.index ?? 0,
            id: productData.id,
            slug: productData.slug,
            name: p.name || productData.name,
            images: productData.images || [],
            basePrice: productData.pricing?.basePrice || 0,
            options: productData.options || [],
          };
        })
        .filter(Boolean);

      upsellsMap.set(doc.id, {
        id: doc.id,
        mainImage: data.mainImage,
        visibility: data.visibility || "DRAFT",
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        products: productsInUpsell || [],
        pricing: data.pricing || {},
      } as UpsellType);
    });
  });

  return upsellsMap;
}

type GetCollectionsOptionsType = {
  ids?: string[];
  fields?: string[];
  visibility?: VisibilityType;
  includeProducts?: boolean;
};
