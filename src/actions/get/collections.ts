"use server";

import { adminDb } from "@/lib/firebase/admin";

const BATCH_SIZE = 10;

/**
 * Get collections from the database with various filtering options.
 *
 * @example // Get a single collection (no products)
 * const collection = await getCollections({
 *   ids: ["id1"],
 *   excludeProducts: true
 * });
 *
 * @example // Get multiple collections with just refs (id & index)
 * const collections = await getCollections({
 *   ids: ["id1", "id2"],
 *   fields: ["title", "slug"],
 *   // excludeProducts: false (default)
 *   // publishedProductsOnly: false (default)
 *   // includeProductDetails: false (default)
 * });
 *
 * @example // Get all published collections, only published product refs
 * const collections = await getCollections({
 *   visibility: "PUBLISHED",
 *   publishedProductsOnly: true
 * });
 *
 * @example // Get all published collections, embed full product details
 * const collections = await getCollections({
 *   visibility: "PUBLISHED",
 *   publishedProductsOnly: true,
 *   includeProductDetails: true
 * });
 */
export async function getCollections(
  options: GetCollectionsOptionsType = {}
): Promise<CollectionType[] | null> {
  const {
    ids = [],
    fields = [],
    visibility,
    excludeProducts = false,
    publishedProductsOnly = false,
    includeProductDetails = false,
  } = options;

  let collections: CollectionType[] = [];
  const allProductIds = new Set<string>();

  // ─── 1️⃣ Load collections & collect product IDs ──────────────────────────────
  if (ids.length > 0) {
    const batches: string[][] = [];
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      batches.push(ids.slice(i, i + BATCH_SIZE));
    }

    const snapshots = await Promise.all(
      batches.map((batch) => {
        const refs = batch.map((id) =>
          adminDb.collection("collections").doc(id)
        );
        return adminDb.getAll(...refs);
      })
    );

    for (const snapArr of snapshots) {
      for (const doc of snapArr) {
        if (!doc.exists) continue;
        const data = doc.data() || {};
        const col = filterCollectionFields(data, fields, doc.id);

        (data.products || []).forEach((p: any) => {
          if (p?.id) allProductIds.add(p.id);
        });

        collections.push(col);
      }
    }
  } else {
    let q: FirebaseFirestore.Query = adminDb.collection("collections");
    if (visibility) {
      q = q.where("visibility", "==", visibility);
    }
    const snap = await q.get();
    if (snap.empty) return null;

    for (const doc of snap.docs) {
      const data = doc.data() || {};
      const col = filterCollectionFields(data, fields, doc.id);

      (data.products || []).forEach((p: any) => {
        if (p?.id) allProductIds.add(p.id);
      });

      collections.push(col);
    }
  }

  // ─── 2️⃣ Optionally filter & embed products ─────────────────────────────────
  if (
    !excludeProducts &&
    (publishedProductsOnly || includeProductDetails) &&
    allProductIds.size > 0
  ) {
    // a) determine published IDs if needed
    let publishedIds: Set<string> | null = null;
    if (publishedProductsOnly) {
      publishedIds = await getPublishedProductIds(Array.from(allProductIds));
    }

    // b) decide which IDs to fetch details for
    const idsToFetch = publishedProductsOnly
      ? Array.from(publishedIds!)
      : Array.from(allProductIds);

    // c) fetch full product details if requested
    let productsMap = new Map<string, ProductType | ProductWithUpsellType>();
    if (includeProductDetails) {
      productsMap = await fetchProductsInBatches(
        idsToFetch,
        publishedProductsOnly
      );
    }

    // d) one pass over collections
    collections = collections.map((col) => {
      let refs = col.products || [];

      if (publishedProductsOnly && publishedIds) {
        refs = refs.filter((r) => publishedIds!.has(r.id));
      }

      const finalProducts = includeProductDetails
        ? refs.map((r) => {
            const pd = productsMap.get(r.id);
            return pd ? { ...pd, index: r.index } : r;
          })
        : refs;

      return {
        ...col,
        products: finalProducts,
      };
    });
  }

  // ─── 3️⃣ If products were excluded, zero out the array ───────────────────────
  if (excludeProducts) {
    collections = collections.map((col) => ({
      ...col,
      products: [],
    }));
  }

  // ─── 4️⃣ Sort by updatedAt desc & return ────────────────────────────────────
  return collections.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/** Helper: which of these IDs are published? */
async function getPublishedProductIds(
  productIds: string[]
): Promise<Set<string>> {
  const published = new Set<string>();
  if (productIds.length === 0) return published;

  const batches: string[][] = [];
  for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
    batches.push(productIds.slice(i, i + BATCH_SIZE));
  }

  for (const batch of batches) {
    const snap = await adminDb
      .collection("products")
      .where("__name__", "in", batch)
      .where("visibility", "==", "PUBLISHED")
      .select()
      .get();
    snap.docs.forEach((d) => published.add(d.id));
  }

  return published;
}

function filterCollectionFields(
  data: FirebaseFirestore.DocumentData,
  fields: string[],
  id: string
): CollectionType {
  const out: Partial<CollectionType> = { id };

  if (fields.length > 0) {
    for (const f of fields) {
      if (data[f] !== undefined) {
        (out as any)[f] = data[f];
      }
    }
  } else {
    Object.assign(out, data);
  }

  out.index = data.index;
  out.visibility = data.visibility;
  out.title = data.title;
  out.collectionType = data.collectionType;
  out.updatedAt = data.updatedAt;

  if (data.collectionType === "BANNER" && data.bannerImages) {
    out.bannerImages = data.bannerImages;
  }

  if (Array.isArray(data.products)) {
    out.products = data.products.map((p: any) => ({
      id: p.id,
      index: p.index,
    }));
  }

  return out as CollectionType;
}

/**
 * Fetch product (and optional upsell) data in batches.
 * @param onlyPublished if true, skips products not marked "PUBLISHED"
 */
async function fetchProductsInBatches(
  productIds: string[],
  onlyPublished = true
): Promise<Map<string, ProductType | ProductWithUpsellType>> {
  const map = new Map<string, ProductType | ProductWithUpsellType>();
  const upsellIds = new Set<string>();
  if (productIds.length === 0) return map;

  const batches: string[][] = [];
  for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
    batches.push(productIds.slice(i, i + BATCH_SIZE));
  }

  for (const batch of batches) {
    const refs = batch.map((id) => adminDb.collection("products").doc(id));
    const snaps = await adminDb.getAll(...refs);

    snaps.forEach((doc) => {
      if (!doc.exists) return;
      const d = doc.data() || {};

      if (onlyPublished && d.visibility !== "PUBLISHED") {
        return;
      }

      if (d.upsell && typeof d.upsell === "string") {
        upsellIds.add(d.upsell.trim());
      }

      map.set(doc.id, { id: doc.id, ...d } as ProductType);
    });
  }

  if (upsellIds.size) {
    const upsellsMap = await fetchUpsellsInBatches(Array.from(upsellIds));
    for (const [pid, prod] of map.entries()) {
      if (
        "upsell" in prod &&
        typeof prod.upsell === "string" &&
        upsellsMap.has(prod.upsell)
      ) {
        map.set(pid, {
          ...prod,
          upsell: upsellsMap.get(prod.upsell)!,
        } as ProductWithUpsellType);
      }
    }
  }

  return map;
}

async function fetchUpsellsInBatches(
  upsellIds: string[]
): Promise<Map<string, UpsellType>> {
  const upsellsMap = new Map<string, UpsellType>();
  if (!upsellIds.length) return upsellsMap;

  const batches: string[][] = [];
  for (let i = 0; i < upsellIds.length; i += BATCH_SIZE) {
    batches.push(upsellIds.slice(i, i + BATCH_SIZE));
  }

  const snapsArr = await Promise.all(
    batches.map((batch) =>
      adminDb
        .collection("upsells")
        .where("__name__", "in", batch)
        .select(
          "mainImage",
          "visibility",
          "createdAt",
          "updatedAt",
          "pricing",
          "products"
        )
        .get()
    )
  );

  const prodIds = new Set<string>();
  for (const snap of snapsArr) {
    snap.docs.forEach((d) => {
      const data = d.data();
      (data.products || []).forEach((p: any) => {
        if (p?.id) prodIds.add(p.id);
      });
    });
  }

  const prodBatches: string[][] = [];
  const pIdsArr = Array.from(prodIds);
  for (let i = 0; i < pIdsArr.length; i += BATCH_SIZE) {
    prodBatches.push(pIdsArr.slice(i, i + BATCH_SIZE));
  }

  const prodSnapsArr = await Promise.all(
    prodBatches.map((batch) =>
      adminDb
        .collection("products")
        .where("__name__", "in", batch)
        .select("slug", "name", "pricing.basePrice", "images", "options")
        .get()
    )
  );

  const prodMap = new Map<string, ProductType>();
  for (const snap of prodSnapsArr) {
    snap.docs.forEach((d) => {
      prodMap.set(d.id, { id: d.id, ...d.data() } as ProductType);
    });
  }

  for (const snap of snapsArr) {
    snap.docs.forEach((doc) => {
      const d = doc.data();
      const items = (d.products || [])
        .map((p: any) => {
          const pd = prodMap.get(p.id);
          if (!pd) return null;
          return {
            index: p.index ?? 0,
            id: pd.id,
            slug: pd.slug,
            name: p.name || pd.name,
            images: pd.images || [],
            basePrice: pd.pricing?.basePrice || 0,
            options: pd.options || [],
          };
        })
        .filter(Boolean) as UpsellType["products"];

      upsellsMap.set(doc.id, {
        id: doc.id,
        mainImage: d.mainImage,
        visibility: d.visibility || "DRAFT",
        createdAt: d.createdAt || new Date().toISOString(),
        updatedAt: d.updatedAt || new Date().toISOString(),
        products: items,
        pricing: d.pricing || {},
      });
    });
  }

  return upsellsMap;
}

type GetCollectionsOptionsType = {
  ids?: string[];
  fields?: string[];
  visibility?: VisibilityType;
  /** drop the products array entirely */
  excludeProducts?: boolean;
  /** only include refs for products with visibility === "PUBLISHED" */
  publishedProductsOnly?: boolean;
  /** fetch & embed full product details (images, pricing, upsells) */
  includeProductDetails?: boolean;
};
