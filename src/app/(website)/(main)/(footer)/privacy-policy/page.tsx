import Link from "next/link";
import styles from "../styles.module.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Privacy, Always Protected",
  description:
    "Your secrets are safe with us—locked down, never spilled, and always respected. Pinky swear.",
};

export default function PrivacyPolicy() {
  return (
    <div className={`min-h-screen relative`}>
      <div className="max-w-[1024px] mx-auto pt-8 pb-4 px-7">
        <div className="bg-lightgray/45 border-l-4 border-neutral-200 shadow-sm rounded-lg py-6 px-8">
          <h1 className="font-bold text-2xl">Privacy Policy</h1>
          <p className="text-gray text-sm mt-1">Last Updated: March 10, 2025</p>
        </div>
      </div>
      <div className="pt-12 max-w-[1024px] px-[30px] mx-auto">
        <div className="w-[736px]">
          <div className={styles.richtext}>
            <div>
              <p>
                Welcome to Cherlygood.com! This Privacy Policy explains how
                Cherlygood.com (“Cherlygood,” “we,” “us,” or “our”) collects,
                uses, and shares your personal information when you visit or
                shop on our website (the “Site”). By using the Site, you agree
                to the practices described in this policy. If you don’t agree,
                please don’t use the Site.
              </p>
              <p>
                <strong>For International Visitors:</strong> Our Site is hosted
                in the United States. If you’re accessing it from outside the
                U.S., your information will be transferred to and stored in the
                U.S., where privacy laws may differ from your country. Using the
                Site means you consent to this.
              </p>
            </div>
            <hr className="!mb-8" />
            <div>
              <h2>Table of Contents</h2>
              <ol>
                <li>
                  <Link href="#1-what-information-do-we-collect">
                    What Information Do We Collect?
                  </Link>
                </li>
                <li>
                  <Link href="#2-how-do-we-use-your-information">
                    How Do We Use Your Information?
                  </Link>
                </li>
                <li>
                  <Link href="#3-who-do-we-share-your-information-with">
                    Who Do We Share Your Information With?
                  </Link>
                </li>
                <li>
                  <Link href="#4-cookies-and-tracking">
                    Cookies and Tracking
                  </Link>
                </li>
                <li>
                  <Link href="#5-your-rights">Your Rights</Link>
                </li>
                <li>
                  <Link href="#6-data-security-and-retention">
                    Data Security and Retention
                  </Link>
                </li>
                <li>
                  <Link href="#7-childrens-privacy">Children’s Privacy</Link>
                </li>
                <li>
                  <Link href="#8-international-users">International Users</Link>
                </li>
                <li>
                  <Link href="#9-updates-to-this-policy">
                    Updates to This Policy
                  </Link>
                </li>
                <li>
                  <Link href="#10-contact-us">Contact Us</Link>
                </li>
              </ol>
            </div>
            <hr className="!mb-8" />
            <div>
              <h3 id="1-what-information-do-we-collect">
                1. What Information Do We Collect?
              </h3>
              <p>
                We collect information to help you shop with us and to improve
                your experience. Here’s what we may collect:
              </p>
              <ul>
                <li>
                  <strong>Personal Details</strong>: Your name, email address,
                  shipping address, billing address, and phone number when you
                  place an order or create an account.
                </li>
                <li>
                  <strong>Payment Info</strong>: Credit card or other payment
                  details. (Don’t worry—we don’t store this; it’s handled
                  securely by our payment processors.)
                </li>
                <li>
                  <strong>Online Activity</strong>: Your IP address, browser
                  type, device info, pages you visit, and how you use the Site.
                </li>
                <li>
                  <strong>Location</strong>: An approximate location based on
                  your IP address.
                </li>
                <li>
                  <strong>Preferences</strong>: Insights about your shopping
                  habits to personalize your experience.
                </li>
                <li>
                  <strong>Your Input</strong>: Reviews, comments, or questions
                  you share with us.
                </li>
              </ul>
            </div>
            <hr className="!mb-8" />
            <div>
              <h3 id="2-how-do-we-use-your-information">
                2. How Do We Use Your Information?
              </h3>
              <p>
                We use your information to run our business and make your
                shopping experience better:
              </p>
              <ul>
                <li>
                  <strong>Orders & Support</strong>: To process your purchases,
                  ship products, and assist you with customer service.
                </li>
                <li>
                  <strong>Marketing</strong>: To send you emails about new
                  arrivals, sales, or promotions (you can unsubscribe anytime).
                </li>
                <li>
                  <strong>Improvement</strong>: To analyze how the Site is used
                  and make it better for everyone.
                </li>
                <li>
                  <strong>Personalization</strong>: To suggest products you
                  might like based on your browsing or purchases.
                </li>
                <li>
                  <strong>Legal Stuff</strong>: To follow laws, prevent fraud,
                  or respond to legal requests.
                </li>
              </ul>
            </div>
            <hr className="!mb-8" />
            <div>
              <h3 id="3-who-do-we-share-your-information-with">
                3. Who Do We Share Your Information With?
              </h3>
              <p>
                We don’t sell your info for others to use as they please, but we
                do share it when needed:
              </p>
              <ul>
                <li>
                  <strong>Service Helpers</strong>: With companies that help us
                  run the Site—like payment processors, shipping services, or
                  analytics tools.
                </li>
                <li>
                  <strong>Legal Needs</strong>: If the law requires it, like
                  responding to a court order, or to protect our business.
                </li>
                <li>
                  <strong>Business Changes</strong>: If we sell or merge our
                  company, your info might be part of that deal.
                </li>
              </ul>
            </div>
            <hr className="!mb-8" />
            <div>
              <h3 id="4-cookies-and-tracking">4. Cookies and Tracking</h3>
              <p>We use cookies and similar tools (like pixels) to:</p>
              <ul>
                <li>Keep the Site working (e.g., saving your cart).</li>
                <li>Understand how you use the Site.</li>
                <li>Show you ads or content tailored to you.</li>
              </ul>
              <p>
                You can control cookies through your browser settings. We also
                respect Global Privacy Control (GPC) signals to opt you out of
                certain tracking. Want to learn more? Check out{" "}
                <Link href="https://allaboutcookies.org/" target="_blank">
                  AllAboutCookies.org
                </Link>
                .
              </p>
            </div>
            <hr className="!mb-8" />
            <div>
              <h3 id="5-your-rights">5. Your Rights</h3>
              <p>You’re in control of your info. Here’s what you can do:</p>
              <ul>
                <li>
                  <strong>See Your Data</strong>: Ask for a copy of what we
                  have.
                </li>
                <li>
                  <strong>Delete It</strong>: Request we delete your info (some
                  exceptions apply, like keeping order records for taxes).
                </li>
                <li>
                  <strong>Fix It</strong>: Ask us to correct anything that’s
                  wrong.
                </li>
                <li>
                  <strong>Opt Out</strong>: Stop marketing emails with the
                  “unsubscribe” link in any email we send.
                </li>
              </ul>
              <p>
                To make a request, email{" "}
                <Link href="mailto:privacy@cherlygood.com" target="_blank">
                  privacy@cherlygood.com
                </Link>
                . We might need to verify your identity first.
              </p>
              <p>
                <strong>California Shoppers</strong>: The CCPA and CPRA give you
                extra rights, like opting out of data “sales” or sharing. We
                don’t sell or share info of anyone under 16 without clear
                permission.
              </p>
            </div>
            <hr className="!mb-8" />
            <div>
              <h3 id="6-data-security-and-retention">
                6. Data Security and Retention
              </h3>
              <p>
                We protect your info with encryption and other safeguards, but
                no system is 100% safe. We keep your data only as long as we
                need it—like for fulfilling orders or meeting legal rules. For
                example, we hold onto order details for accounting purposes.
              </p>
            </div>
            <hr className="!mb-8" />
            <div>
              <h3 id="7-childrens-privacy">7. Children’s Privacy</h3>
              <p>
                Our Site isn’t for kids under 13. We don’t knowingly collect
                their info. If we find out we have, we’ll delete it fast.
              </p>
            </div>
            <hr className="!mb-8" />
            <div>
              <h3 id="8-international-users">8. International Users</h3>
              <p>
                Since our Site is U.S.-based, your info comes to the U.S. when
                you use it. Privacy laws here might not match your home
                country’s, but by shopping with us, you’re okay with that.
              </p>
            </div>
            <hr className="!mb-8" />
            <div>
              <h3 id="9-updates-to-this-policy">9. Updates to This Policy</h3>
              <p>
                We might tweak this policy as our business grows. Changes will
                show up here with a new “Last Updated” date. Keep using the
                Site, and you’re agreeing to the updates.
              </p>
            </div>
            <hr className="!mb-8" />
            <div>
              <h3 id="10-contact-us">10. Contact Us</h3>
              <p>
                Got questions? Email us at{" "}
                <Link href="mailto:privacy@cherlygood.com" target="_blank">
                  privacy@cherlygood.com
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
