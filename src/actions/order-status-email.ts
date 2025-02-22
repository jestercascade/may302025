"use server";

import { OrderConfirmedTemplate } from "@/components/admin/emails/OrderConfirmedTemplate";
import { OrderShippedTemplate } from "@/components/admin/emails/OrderShippedTemplate";
import { OrderDeliveredTemplate } from "@/components/admin/emails/OrderDeliveredTemplate";
import { Resend } from "resend";
import { EmailType, AlertMessageType } from "@/lib/sharedTypes";
import { adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";
import { ReactElement } from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_TEMPLATES: Record<EmailType, EmailTemplateType> = {
  [EmailType.ORDER_CONFIRMED]: OrderConfirmedTemplate,
  [EmailType.ORDER_SHIPPED]: OrderShippedTemplate,
  [EmailType.ORDER_DELIVERED]: OrderDeliveredTemplate,
};

const EMAIL_TYPE_TO_KEY: Record<EmailType, string> = {
  [EmailType.ORDER_CONFIRMED]: "confirmed",
  [EmailType.ORDER_SHIPPED]: "shipped",
  [EmailType.ORDER_DELIVERED]: "delivered",
};

export async function OrderStatusEmailAction(
  orderId: string,
  customerEmailAddress: string,
  emailSubject: string,
  emailType: EmailType
) {
  try {
    const emailStatusResult = await updateEmailStatus(orderId, emailType);
    if (emailStatusResult.type === AlertMessageType.ERROR) {
      return {
        type: AlertMessageType.ERROR,
        message: emailStatusResult.message,
      };
    }

    const { orderData, orderRef, emailKey } = emailStatusResult as {
      orderData: any;
      orderRef: any;
      emailKey: string;
      emailStatus: any;
    };

    const EmailTemplate = EMAIL_TEMPLATES[emailType];
    const { error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: customerEmailAddress,
      subject: emailSubject,
      react: EmailTemplate(),
    });

    if (error) {
      return {
        type: AlertMessageType.ERROR,
        message: "Failed to send email",
      };
    }

    const updateResult = await incrementEmailCount(
      orderRef,
      emailKey,
      orderData
    );

    revalidatePath("/admin/orders/[id]", "page");

    if (updateResult.type === AlertMessageType.ERROR) {
      console.error("Failed to update email count:", updateResult.message);
      return {
        type: AlertMessageType.SUCCESS,
        message: "Email sent successfully",
      };
    }

    return {
      type: AlertMessageType.SUCCESS,
      message: "Email sent and count updated successfully",
    };
  } catch (error) {
    console.error("Internal server error:", error);
    return {
      type: AlertMessageType.ERROR,
      message: "Failed to send email",
    };
  }
}

// -- Logic & Utilities --

async function updateEmailStatus(orderId: string, emailType: EmailType) {
  try {
    const orderRef = adminDb.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return {
        type: AlertMessageType.ERROR,
        message: "Order not found",
      };
    }

    const orderData = orderSnap.data();
    const emailKey = EMAIL_TYPE_TO_KEY[emailType];

    if (!emailKey) {
      return {
        type: AlertMessageType.ERROR,
        message: "Invalid email type",
      };
    }

    if (!orderData?.emails || !orderData.emails[emailKey]) {
      return {
        type: AlertMessageType.ERROR,
        message: "Email configuration not found",
      };
    }

    const emailStatus = orderData.emails[emailKey];

    if (emailStatus.sentCount >= emailStatus.maxAllowed) {
      return {
        type: AlertMessageType.ERROR,
        message: "Max email send limit reached",
      };
    }

    return { emailStatus, orderData, orderRef, emailKey };
  } catch (error) {
    console.error("Error fetching email status:", error);
    return {
      type: AlertMessageType.ERROR,
      message: "Failed to fetch email status",
    };
  }
}

async function incrementEmailCount(
  orderRef: any,
  emailKey: string,
  orderData: any
) {
  try {
    const currentEmailStatus = orderData.emails[emailKey];

    const updatedOrderData = {
      ...orderData,
      emails: {
        ...orderData.emails,
        [emailKey]: {
          ...currentEmailStatus,
          sentCount: (currentEmailStatus.sentCount || 0) + 1,
          lastSent: new Date().toISOString(),
        },
      },
    };

    await orderRef.set(updatedOrderData);

    return {
      type: AlertMessageType.SUCCESS,
      message: `Email count updated for ${emailKey}`,
    };
  } catch (error) {
    console.error("Error updating email count:", error);
    return {
      type: AlertMessageType.ERROR,
      message: "Failed to update email count",
    };
  }
}

// -- Type Definitions --

type EmailTemplateType = () => ReactElement;
