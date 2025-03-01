"use server";

import { adminDb } from "@/lib/firebase/admin";
import { generateId, currentTimestamp } from "@/lib/utils/common";
import { revalidatePath } from "next/cache";
import { ShowAlertType } from "@/lib/sharedTypes";
import { Resend } from "resend";

export async function CreateNewsletterAction(data: {
  emailSubject: string;
  content: string;
}) {
  try {
    const newsletterId = generateId();
    const currentTime = currentTimestamp();

    const newsletter: NewsletterType = {
      id: newsletterId,
      emailSubject: data.emailSubject ?? "",
      content: data.content ?? "",
      createdAt: currentTime,
      updatedAt: currentTime,
      lastSentAt: "",
      visibility: "DRAFT",
    };

    await adminDb.collection("newsletters").doc(newsletterId).set(newsletter);
    revalidatePath("/admin/newsletters");

    return {
      type: ShowAlertType.SUCCESS,
      message: "Newsletter created successfully",
    };
  } catch (error) {
    console.error("Error creating newsletter:", error);
    return {
      type: ShowAlertType.ERROR,
      message: "Failed to create newsletter",
    };
  }
}

export async function UpdateNewsletterAction(
  data: Partial<Omit<NewsletterType, "createdAt" | "updatedAt">> & {
    id: string;
  }
) {
  try {
    const newsletterRef = adminDb.collection("newsletters").doc(data.id);
    const newsletterSnap = await newsletterRef.get();

    if (!newsletterSnap.exists) {
      return {
        type: ShowAlertType.ERROR,
        message: "Newsletter not found",
      };
    }

    const updatedNewsletter: NewsletterType = {
      ...newsletterSnap.data(),
      ...data,
      updatedAt: currentTimestamp(),
    } as NewsletterType;

    await newsletterRef.set(updatedNewsletter);
    revalidatePath("/admin/newsletters");

    return {
      type: ShowAlertType.SUCCESS,
      message: "Newsletter updated successfully",
    };
  } catch (error) {
    console.error("Error updating newsletter:", error);
    return {
      type: ShowAlertType.ERROR,
      message: "Failed to update newsletter",
    };
  }
}

export async function SendNewsletterEmailAction(
  newsletterContent: string,
  subscribers: string[],
  subject: string
): Promise<{
  type: ShowAlertType;
  message: string;
  successCount?: number;
  failedEmails?: string[];
}> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      // to: subscribers,
      to: "khanofemperia@gmail.com", // email used only for dev tests
      subject,
      html: newsletterContent,
    });

    if (error) {
      return {
        type: ShowAlertType.ERROR,
        message: "Failed to send email",
      };
    }

    revalidatePath("/admin/newsletters");

    return {
      type: ShowAlertType.SUCCESS,
      message: "Email sent successfully",
    };
  } catch {
    return {
      type: ShowAlertType.ERROR,
      message: "Failed to send email",
    };
  }
}
