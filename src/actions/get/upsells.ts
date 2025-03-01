"use server";

import { adminDb } from "@/lib/firebase/admin";

const BATCH_SIZE = 10;

/**
 * Unified function to retrieve upsells with flexible filtering, field selection, and product inclusion.
 *
 * @example Get a single upsell by ID
 * const upsells = await getUpsells({ ids: ["40"] });
 *
 * @example Get multiple upsells with specific fields
 * const upsells = await getUpsells({
 *   ids: ["50", "60"],
 *   fields: ["mainImage", "pricing", "visibility"]
 * });
 *
 * @example Get upsells with products included
 * const upsells = await getUpsells({
 *   ids: ["70"],
 *   includeProducts: true
 * });
 *
 * @example Get all upsells with specific fields
 * const upsells = await getUpsells({
 *   fields: ["mainImage", "pricing"],
 *   includeProducts: true
 * });
 */
export async function getUpsells(
  options: GetUpsellsOptions = {}
): Promise<UpsellType[] | null> {
  const { ids = [], fields = [], includeProducts } = options;

  let upsells: UpsellType[] = [];

  if (ids.length > 0) {
    // Batch processing for IDs
    const upsellBatches = [];
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      upsellBatches.push(ids.slice(i, i + BATCH_SIZE));
    }

    const snapshots = await Promise.all(
      upsellBatches.map((batch) => {
        const docRefs = batch.map((id) =>
          adminDb.collection("upsells").doc(id)
        );
        return adminDb.getAll(...docRefs);
      })
    );

    const docs = snapshots.flat();
    docs.forEach((doc) => {
      if (!doc.exists) return;
      const data = doc.data();
      const upsell = filterUpsellFields(data, fields, includeProducts, doc.id);
      upsells.push(upsell);
    });
  } else {
    // Fetch all upsells when no IDs are provided
    const snapshot = await adminDb.collection("upsells").get();
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const upsell = filterUpsellFields(data, fields, includeProducts, doc.id);
      upsells.push(upsell);
    });
  }

  return ids.length === 0
    ? upsells.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    : upsells;
}

function filterUpsellFields(
  data: any,
  fields: string[],
  includeProducts: boolean | undefined,
  id: string
): UpsellType {
  const upsell: Partial<UpsellType> = {
    id,
    updatedAt: data.updatedAt,
  };

  if (fields.length > 0) {
    fields.forEach((field) => {
      if (field !== "id" && field !== "updatedAt" && field in data) {
        (upsell[field as keyof UpsellType] as any) = data[field];
      }
    });
  } else {
    Object.assign(upsell, data);
  }

  if (includeProducts && data.products) {
    const products = [...data.products].sort((a, b) => a.index - b.index);
    upsell.products = products;
  }

  return upsell as UpsellType;
}

// -- Type Definitions --

type UpsellType = {
  id: string;
  mainImage: string;
  visibility: "PUBLISHED" | "DRAFT" | "HIDDEN";
  createdAt: string;
  updatedAt: string;
  pricing: {
    basePrice: number;
    salePrice: number;
    discountPercentage: number;
  };
  products: Array<{
    index: number;
    id: string;
    slug: string;
    name: string;
    basePrice: number;
    images: {
      main: string;
      gallery: string[];
    };
    options: {
      colors: Array<{
        name: string;
        image: string;
      }>;
      sizes: {
        inches: {
          columns: Array<{ label: string; order: number }>;
          rows: Array<{ [key: string]: string }>;
        };
        centimeters: {
          columns: Array<{ label: string; order: number }>;
          rows: Array<{ [key: string]: string }>;
        };
      };
    };
  }>;
};

type GetUpsellsOptions = {
  ids?: string[];
  fields?: Array<keyof UpsellType>;
  includeProducts?: boolean;
};
