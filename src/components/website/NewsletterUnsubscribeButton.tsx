"use client";

import { useState } from "react";
import { unsubscribeFromNewsletter } from "@/actions/newsletter-subscribers";
import { useAlertStore } from "@/zustand/website/alertStore";
import { AlertMessageType } from "@/lib/sharedTypes";
import { Mail } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

export function NewsletterUnsubscribeButton({ email }: { email: string }) {
  const { showAlert } = useAlertStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);

  const handleUnsubscribe = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await unsubscribeFromNewsletter(email);

      showAlert({
        message: response.message,
        type: response.success
          ? AlertMessageType.SUCCESS
          : AlertMessageType.NEUTRAL,
      });

      if (response.success) {
        setIsUnsubscribed(true);
      }
    } catch {
      showAlert({
        message: "Something went wrong. Please try unsubscribing again later.",
        type: AlertMessageType.NEUTRAL,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUnsubscribed) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div>
          <h1 className="text-2xl font-semibold mb-3">You're unsubscribed</h1>
          <p className="text-sm text-gray">
            You’re welcome to subscribe again for updates and exclusive offers
          </p>
        </div>
        <Link
          href="/"
          className="mt-6 mx-auto w-max px-7 flex items-center justify-center rounded-full cursor-pointer border border-[#c5c3c0] text-sm font-semibold h-[44px] shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear-gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] min-[896px]:text-base min-[896px]:h-12"
        >
          See trending items
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[294px] flex items-center justify-center">
      <div className="max-w-lg mx-auto text-center">
        <div className="space-y-5">
          <div className="flex items-center justify-center">
            <Mail size={32} color="#dadada" strokeWidth={1.25} />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-center">
              Unsubscribe from our newsletter
            </h1>
            <p className="text-sm text-center text-gray">{email}</p>
          </div>
        </div>
        <button
          onClick={handleUnsubscribe}
          disabled={isSubmitting}
          className={clsx(
            "mt-6 px-4 h-9 bg-black text-white text-sm font-semibold rounded-full transition disabled:opacity-50",
            !isSubmitting && "hover:bg-black/85"
          )}
        >
          {isSubmitting ? "Processing..." : "Unsubscribe"}
        </button>
      </div>
    </div>
  );
}
