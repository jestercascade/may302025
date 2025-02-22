"use server";

import { adminDb } from "@/lib/firebase/admin";

type GetNewslettersOptionsType = {
  ids?: string[];
  visibility?: "DRAFT" | "PUBLISHED" | "HIDDEN";
};

/**
 * Get newsletters from the database with various filtering options, sorted by updatedAt descending
 *
 * @example Get all newsletters
 * const newsletters = await getNewsletters();
 *
 * @example Get a single newsletter
 * const newsletter = await getNewsletters({ ids: ["id1"] });
 *
 * @example Get all published newsletters
 * const newsletters = await getNewsletters({ visibility: "PUBLISHED" });
 */
export async function getNewsletters(
  options: GetNewslettersOptionsType = {}
): Promise<NewsletterType[] | null> {
  const { ids = [], visibility } = options;

  let queryRef: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
    adminDb.collection("newsletters");

  if (ids.length > 0) {
    queryRef = queryRef.where("__name__", "in", ids);
  }

  if (visibility) {
    queryRef = queryRef.where("visibility", "==", visibility);
  }

  queryRef = queryRef.orderBy("updatedAt", "desc");

  const snapshot = await queryRef.get();

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      emailSubject: data.emailSubject || "",
      content: data.content || "",
      visibility: data.visibility || "DRAFT",
      createdAt: data.createdAt || "",
      updatedAt: data.updatedAt || "",
      lastSentAt: data.lastSentAt || "",
    } as NewsletterType;
  });
}
