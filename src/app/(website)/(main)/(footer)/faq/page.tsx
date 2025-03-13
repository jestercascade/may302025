import Link from "next/link";
import styles from "../styles.module.css";
import { CircleCheck } from "lucide-react";

export default function TermsOfUse() {
  return (
    <div className={`min-h-screen relative`}>
      <div className="max-w-[1024px] mx-auto pt-8 pb-4 px-7">
        <div className="bg-lightgray/45 border-l-4 border-neutral-200 shadow-sm rounded-lg py-6 px-8">
          <h1 className="font-bold text-2xl">Frequently Asked Questions</h1>
          <p className="text-gray text-sm mt-1 italic">
            Got questions? We’ve got answers—quick, honest, and easy to
            understand.
          </p>
        </div>
      </div>
      <div className="pt-5 max-w-[1024px] px-[30px] mx-auto">
        <div className="w-[736px]">
          <div className={styles.richtext}>
            <div>
              <h3>Ordering & Payments</h3>

              <h4>How do I place an order?</h4>
              <p>
                Just browse, add to your cart, and check out as a guest. No
                account needed—just your email and payment info. Easy!
              </p>

              <h4>What payment methods do you accept?</h4>
              <p>
                We take Visa, Mastercard, PayPal, and other secure options. Your
                info’s safe with us.
              </p>

              <h4>Can I change or cancel my order?</h4>
              <p>
                We work fast, so you’ve got 30 minutes after ordering to email{" "}
                <Link href="mailto:support@cherlygood.com" target="_blank">
                  support@cherlygood.com
                </Link>{" "}
                for changes or cancellations. After that, your order is already
                on its way!
              </p>
            </div>
            <hr className="!mb-8" />
            <div>
              <h3>Shipping & Delivery</h3>

              <h4>Where do you ship?</h4>
              <p>
                We ship almost everywhere! If you’re in the U.S. or beyond,
                we’ve got you covered.
              </p>

              <h4>How long does shipping take?</h4>
              <p>
                We pack and ship your order in{" "}
                <strong>1–2 business days</strong>. Delivery time depends on
                your location—we’ll email you a tracking link so you can follow
                your package’s journey.
              </p>

              <h4>How do I track my order?</h4>
              <p>
                Once your order ships, we’ll email you a tracking link. No
                account needed—just click and see where your package is.
              </p>
            </div>
            <hr className="!mb-8" />
            <div>
              <h3>Product Info</h3>

              <h4>How do I pick the right size?</h4>
              <p>
                Check the <strong>size chart</strong> on each product page.
                Measure yourself, match it up, and if you’re still unsure, email
                us—we’re happy to help!
              </p>

              <h4>What’s the Catch-All category?</h4>
              <p>
                It’s where we keep the random-but-awesome stuff—like hair fixes,
                home upgrades, and other little things that make life easier and
                more fun.
              </p>
            </div>
            <hr className="!mb-8" />
            <div>
              <h3>Returns & Refunds</h3>

              <h4>What’s your return policy?</h4>
              <p>
                You’ve got 15 days from delivery to return items—unworn,
                unwashed, and with tags on. Email us first (see below) or check
                our{" "}
                <Link href="/returns-and-refunds" target="_blank">
                  Returns Policy
                </Link>{" "}
                for all the details.
              </p>

              <h4>How do I start a return?</h4>
              <ol>
                <li>
                  Email{" "}
                  <Link href="mailto:support@cherlygood.com" target="_blank">
                    support@cherlygood.com
                  </Link>{" "}
                  within 15 days. Include:
                </li>
                <ul>
                  <li>
                    Your order number (e.g., <code>ORD-7892J</code>)
                  </li>
                  <li>
                    The item name and reason (e.g., “Waistband too tight”)
                  </li>
                  <li>
                    <strong>3–5 clear photos</strong> (e.g., a measuring tape on
                    the waistband).
                  </li>
                </ul>
                <li>
                  Wait for our approval <strong>before</strong> shipping
                  anything back. No email = no refund.
                </li>
              </ol>

              <h4>What if my item’s defective or wrong?</h4>
              <p>
                Our mistake! Email us with photos ASAP, and we’ll send a free
                label to fix it fast.
              </p>
            </div>
            <hr className="!mb-8" />
            <div>
              <h3>Privacy & Security</h3>

              <h4>Is my info safe?</h4>
              <p>
                Absolutely. We protect your data like it’s our own. Check out
                our{" "}
                <Link href="/privacy-policy" target="_blank">
                  Privacy Policy
                </Link>{" "}
                for more details.
              </p>
            </div>
            <hr className="!mb-8" />
            <div>
              <h3>Contact Us</h3>
              <p>
                Need help? Email{" "}
                <Link href="mailto:support@cherlygood.com" target="_blank">
                  support@cherlygood.com
                </Link>
                . We’ll reply quickly and get you sorted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
