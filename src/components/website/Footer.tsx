"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { ShowAlertType } from "@/lib/sharedTypes";
import { useState } from "react";
import { subscribeToNewsletter } from "@/actions/newsletter-subscribers";
import clsx from "clsx";
import { useAlertStore } from "@/zustand/shared/alertStore";

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
    <footer className="w-full pt-6 pb-24 mt-14 bg-lightgray">
      <div className="md:hidden px-5 mx-auto">
        <div className="flex flex-col gap-8">
          <div>
            <h4 className="block text-sm mb-3">
              Subscribe to our newsletter <br /> for exclusive deals and updates
            </h4>
            {showSuccess ? (
              <SuccessMessage />
            ) : (
              <NewsletterForm
                email={email}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}
          </div>
          <div className="grid grid-cols-2">
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <Link
                href="/about-us"
                className="block w-max text-sm text-gray mb-2 hover:underline"
              >
                About us
              </Link>
              <Link
                href="/privacy-policy"
                className="block w-max text-sm text-gray mb-2 hover:underline"
              >
                Privacy policy
              </Link>
              <Link
                href="/terms-of-use"
                className="block w-max text-sm text-gray mb-2 hover:underline"
              >
                Terms of use
              </Link>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Get Help</h3>
              <Link
                href="contact-us"
                className="block w-max text-sm text-gray mb-2 hover:underline"
              >
                Contact us
              </Link>
              <Link
                href="track-order"
                className="block w-max text-sm text-gray mb-2 hover:underline"
              >
                Track order
              </Link>
              <Link
                href="returns-and-refunds"
                className="block w-max text-sm text-gray mb-2 hover:underline"
              >
                Returns & refunds
              </Link>
              <Link
                href="faq"
                className="block w-max text-sm text-gray mb-2 hover:underline"
              >
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden md:block w-full max-w-[1040px] px-9 mx-auto">
        <div className="flex gap-10">
          <div className="w-full">
            <h3 className="font-semibold mb-4">Company</h3>
            <Link
              href="/about-us"
              className="block w-max text-sm text-gray mb-2 hover:underline"
            >
              About us
            </Link>
            <Link
              href="privacy-policy"
              className="block w-max text-sm text-gray mb-2 hover:underline"
            >
              Privacy policy
            </Link>
            <Link
              href="terms-of-use"
              className="block w-max text-sm text-gray mb-2 hover:underline"
            >
              Terms of use
            </Link>
          </div>
          <div className="w-full">
            <h3 className="font-semibold mb-4">Get Help</h3>
            <Link
              href="contact-us"
              className="block w-max text-sm text-gray mb-2 hover:underline"
            >
              Contact us
            </Link>
            <Link
              href="track-order"
              className="block w-max text-sm text-gray mb-2 hover:underline"
            >
              Track order
            </Link>
            <Link
              href="returns-and-refunds"
              className="block w-max text-sm text-gray mb-2 hover:underline"
            >
              Returns & refunds
            </Link>
            <Link
              href="faq"
              className="block w-max text-sm text-gray mb-2 hover:underline"
            >
              FAQ
            </Link>
          </div>
          <div className="min-w-[270px]">
            <h4 className="block text-sm mb-3">
              Subscribe to our newsletter <br /> for exclusive deals and updates
            </h4>
            {showSuccess ? (
              <SuccessMessage />
            ) : (
              <NewsletterForm
                email={email}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

function SuccessMessage() {
  return (
    <div className="h-7 w-[270px] flex items-center gap-2 text-sm text-green">
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
    <form
      onSubmit={onSubmit}
      className={clsx("relative h-11 w-[270px]", isSubmitting && "opacity-45")}
    >
      <button
        type="submit"
        disabled={isSubmitting}
        className={clsx(
          "peer w-[104px] h-[40px] absolute left-[164px] top-1/2 -translate-y-1/2 rounded font-semibold text-white",
          isSubmitting && "cursor-not-allowed"
        )}
      >
        Subscribe
      </button>
      <div className="peer-hover:bg-[#cc8100] peer-hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] peer-active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] w-full h-full p-[2px] rounded-lg shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000]">
        <input
          className="w-40 h-[40px] px-3 rounded-md"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={onChange}
          required
        />
      </div>
    </form>
  );
}
