"use server";

import { adminDb } from "@/lib/firebase/admin";

/**
 * Get all subscribers, optionally filtered by status.
 *
 * @example Get all subscribers (both active and unsubscribed)
 * const subscribers = await getNewsletterSubscribers();
 *
 * @example Get all active subscribers
 * const activeSubscribers = await getNewsletterSubscribers({ status: "ACTIVE" });
 *
 * @example Get all unsubscribed subscribers
 * const unsubscribedSubscribers = await getNewsletterSubscribers({ status: "UNSUBSCRIBED" });
 */
export async function getNewsletterSubscribers(options?: {
  status?: "ACTIVE" | "UNSUBSCRIBED";
}): Promise<SubscriberType[] | null> {
  const { status } = options || {};
  const subscribersRef = adminDb.collection("newsletter-subscribers");

  let queryRef =
    subscribersRef as FirebaseFirestore.Query<FirebaseFirestore.DocumentData>;

  if (status) {
    queryRef = queryRef.where("status", "==", status);
  }

  const snapshot = await queryRef.get();

  if (snapshot.empty) {
    return null;
  }

  const subscribers: SubscriberType[] = [];

  snapshot.docs.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    const subscriber = {
      email: docSnapshot.id,
      status: data["status"],
      createdAt: data["createdAt"]?.toDate().toISOString(),
      updatedAt: data["updatedAt"]?.toDate().toISOString(),
    } as SubscriberType;

    subscribers.push(subscriber);
  });

  return subscribers;
}
