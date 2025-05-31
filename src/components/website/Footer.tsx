"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { ShowAlertType } from "@/lib/sharedTypes";
import { useState } from "react";
import { subscribeToNewsletter } from "@/actions/newsletter-subscribers";
import { useAlertStore } from "@/zustand/shared/alertStore";
import clsx from "clsx";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const showAlert = useAlertStore((state) => state.showAlert);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await subscribeToNewsletter(email);

      showAlert({
        message: response.message,
        type: response.success ? ShowAlertType.SUCCESS : ShowAlertType.NEUTRAL,
      });

      if (response.success) {
        setEmail("");
        setShowSuccess(true);
      } else {
        if (response.message.includes("You're subscribed")) {
          setEmail("");
        }
      }
    } catch {
      showAlert({
        message: "Something went wrong. Please try subscribing again later.",
        type: ShowAlertType.NEUTRAL,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="w-full py-8 border-t bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center mb-8">
          <nav className="flex flex-wrap justify-center mb-10">
            <Link href="/about" className="px-4 py-2 text-sm text-gray hover:text-black transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="px-4 py-2 text-sm text-gray hover:text-black transition-colors">
              Contact
            </Link>
            <Link href="/faq" className="px-4 py-2 text-sm text-gray hover:text-black transition-colors">
              FAQs
            </Link>
            <Link href="/privacy" className="px-4 py-2 text-sm text-gray hover:text-black transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="px-4 py-2 text-sm text-gray hover:text-black transition-colors">
              Terms
            </Link>
            <Link href="/returns" className="px-4 py-2 text-sm text-gray hover:text-black transition-colors">
              Returns
            </Link>
            <Link href="/track" className="px-4 py-2 text-sm text-gray hover:text-black transition-colors">
              Track Order
            </Link>
          </nav>
          <div className="w-full max-w-md mb-10 rounded-xl p-6 bg-blue-600/5 border border-blue-100/65">
            <div className="text-center mb-4">
              <h3 className="font-semibold text-lg mb-1.5">Get the latest releases and special offers</h3>
              <p className="text-black text-sm">Be first in line for the good stuff</p>
            </div>
            {showSuccess ? (
              <SuccessMessage />
            ) : (
              <>
                <div className="w-full max-w-md flex justify-center">
                  <NewsletterForm
                    email={email}
                    isSubmitting={isSubmitting}
                    onSubmit={handleSubmit}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="mt-2 text-xs text-gray/90 text-center">You can unsubscribe any time</div>
              </>
            )}
          </div>
        </div>
        <div className="flex justify-center text-xs text-gray">
          <p>© {new Date().getFullYear()} Cherlygood. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function SuccessMessage() {
  return (
    <div className="h-7 w-[270px] mx-auto flex items-center justify-center gap-2 text-sm text-green">
      <CheckCircle size={16} />
      <span>Thanks for subscribing!</span>
    </div>
  );
}

function NewsletterForm({
  email,
  isSubmitting,
  onSubmit,
  onChange,
}: {
  email: string;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className={clsx("relative h-11 w-[290px]", isSubmitting && "opacity-45")}>
      <button
        type="submit"
        disabled={isSubmitting}
        className={clsx(
          "peer w-[104px] h-[40px] absolute left-[184px] top-1/2 -translate-y-1/2 rounded font-semibold text-white",
          isSubmitting && "cursor-not-allowed"
        )}
      >
        Subscribe
      </button>
      <div className="peer-hover:bg-[#cc8100] peer-hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] peer-active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] w-full h-full p-[2px] rounded-lg shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000]">
        <input
          className="w-[180px] h-[40px] px-3 rounded-md bg-white"
          type="email"
          name="email"
          id="newsletter-email"
          autoComplete="email"
          placeholder="Enter your email"
          value={email}
          onChange={onChange}
          required
        />
      </div>
    </form>
  );
}
