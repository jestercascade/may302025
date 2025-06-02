"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const emailSchema = z.string().email("Invalid email format").min(3, "Email is too short").max(254, "Email is too long");

const UNSUBSCRIBED = "UNSUBSCRIBED";
const ACTIVE = "ACTIVE";

export type NewsletterResponse = {
  success: boolean;
  message: string;
};

export async function subscribeToNewsletter(email: string): Promise<NewsletterResponse> {
  try {
    const validatedEmail = emailSchema.parse(email.toLowerCase().trim());
    const newslettersRef = adminDb.collection("newsletter-subscribers");
    const existingSubscriber = await newslettersRef.doc(validatedEmail).get();

    if (existingSubscriber.exists) {
      const data = existingSubscriber.data();

      if (data?.status === ACTIVE) {
        return {
          success: false,
          message: "You're in! New releases and offers coming to your inbox.",
        };
      }

      if (data?.status === UNSUBSCRIBED) {
        await newslettersRef.doc(validatedEmail).update({
          status: ACTIVE,
          updatedAt: FieldValue.serverTimestamp(),
        });

        revalidatePath("/admin/newsletters");

        return {
          success: true,
          message: "Welcome back! Your subscription is active again.",
        };
      }
    }

    await newslettersRef.doc(validatedEmail).set({
      status: ACTIVE,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath("/admin/newsletters");

    return {
      success: true,
      message: "Thank you for subscribing to our newsletter!",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0].message,
      };
    }

    console.error("Newsletter subscription error:", error);

    return {
      success: false,
      message: "Something went wrong. Please try subscribing again later.",
    };
  }
}

export async function unsubscribeFromNewsletter(email: string): Promise<NewsletterResponse> {
  try {
    const validatedEmail = emailSchema.parse(email.toLowerCase().trim());
    const newslettersRef = adminDb.collection("newsletter-subscribers");

    const subscriberDoc = await newslettersRef.doc(validatedEmail).get();

    if (!subscriberDoc.exists) {
      return {
        success: false,
        message: "Subscription not found for this email",
      };
    }

    await newslettersRef.doc(validatedEmail).update({
      status: UNSUBSCRIBED,
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath("/admin/newsletters");

    return {
      success: true,
      message: "Unsubscribed successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0].message,
      };
    }

    console.error("Newsletter unsubscribe error:", error);

    return {
      success: false,
      message: "Something went wrong. Please try unsubscribing again later.",
    };
  }
}
