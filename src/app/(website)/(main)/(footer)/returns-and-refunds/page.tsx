import Link from "next/link";
import styles from "../styles.module.css";
import { CircleCheck } from "lucide-react";

export default function TermsOfUse() {
  return (
    <div className={`min-h-screen relative`}>
      <div className="max-w-[1024px] mx-auto pt-8 pb-4 px-7">
        <div className="bg-lightgray/45 border-l-4 border-neutral-200 shadow-sm rounded-lg py-6 px-8">
          <h1 className="font-bold text-2xl">Returns and Refunds</h1>
          <p className="text-gray text-sm mt-1 italic">
            Returns made simple—follow this guide for a stress-free experience!
          </p>
        </div>
      </div>
      <div className="pt-12 max-w-[1024px] px-[30px] mx-auto">
        <div className="w-[736px]">
          <div className={styles.richtext}>
            <div>
              <h3>Before You Start: Mandatory Requirements</h3>
              <p>
                <strong>READ THIS FIRST</strong>:<br />
                To avoid denied returns, <strong>you MUST</strong>:
              </p>
              <ol>
                <li>
                  <strong>
                    Email{" "}
                    <Link href="mailto:support@cherlygood.com">
                      support@cherlygood.com
                    </Link>{" "}
                    BEFORE starting a return
                  </strong>
                  . Include:
                  <ul>
                    <li>
                      Order number (e.g., <code>ORD-7892J</code>) and item name
                      (e.g., <code>Bathroom Mat</code>
                      ).
                    </li>
                    <li>
                      A <strong>detailed reason</strong> (e.g., “Motor stopped
                      working” or “Waistband too small”).
                    </li>
                    <li>
                      <strong>3-5 photos</strong> showing the issue (see
                      examples below).
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Do NOT wear, wash, or alter items</strong> if claiming
                  defects or sizing issues.
                </li>
                <li>
                  <strong>Wait for approval</strong> before shipping anything
                  back.
                </li>
              </ol>
              <p>
                <strong>
                  ⚠️ Returns started without emailing photos first will be
                  denied.
                </strong>
              </p>
            </div>
            <hr />
            <div>
              <h3>Step 1: Check Eligibility & Gather Evidence</h3>
              <p>
                <strong>Do you qualify?</strong>
              </p>
              <ol>
                <li>
                  <strong>Timeframe</strong>:
                  <ul>
                    <li>
                      You have <strong>15 days</strong> from when your item was
                      delivered to start the return.
                    </li>
                    <li>
                      <em>Example</em>: If your item arrived on January 1, the
                      end date is January 16.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Item Conditions</strong>:
                  <ul>
                    <li>
                      <strong>Returnable</strong>: Unused, in original packaging
                      with tags, undamaged.
                    </li>
                    <li>
                      <strong>Non-Returnable</strong> (unless defective):
                      Swimwear, intimates, beauty products, final sale items.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Document the Issue</strong>:
                  <ul>
                    <li>
                      <strong>Clothing (e.g., Women’s Blue Jeans)</strong>:
                      <ul>
                        <li>
                          Lay flat with measuring tape (e.g., waistband measures
                          14” vs. advertised 15”).
                        </li>
                        <li>
                          <em>Denied Example</em>: Sarah stretched the jeans
                          trying them on.
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>Home Items (e.g., Bathroom Mat)</strong>:
                      <ul>
                        <li>Show defects like peeling backing.</li>
                        <li>
                          <em>Denied Example</em>: John cut the mat with
                          scissors.
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>Electronics (e.g., Car Vacuum)</strong>:
                      <ul>
                        <li>Record a video of the motor failing.</li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ol>
              <p>
                <strong>Pro Tip</strong>: Use natural light for clear, crisp
                photos!
              </p>
            </div>
            <hr />
            <div>
              <h3>Step 2: Email Support (Required)</h3>
              <div className="w-full max-w-2xl my-6 bg-neutral-50 rounded-xl border overflow-hidden shadow-sm">
                {/* Header */}
                <div className="bg-neutral-200/50 px-4 py-3">
                  <div className="text-blue text-center font-semibold">
                    Recommended Format
                  </div>
                </div>

                {/* Subject line */}
                <div className="p-4 border-b">
                  <div className="text-sm text-gray mb-1">Subject Line:</div>
                  <strong>
                    Return Request – Order #ORD-7892J – Women's Blue Jeans (Size
                    8)
                  </strong>
                </div>

                {/* Email body */}
                <div className="p-4">
                  <div className="space-y-4">
                    <p>Hi Cherlygood Team,</p>

                    <p>
                      I'd like to return the{" "}
                      <span className="font-semibold">Women's Blue Jeans</span>{" "}
                      (Order <code>#ORD-7892J</code>) because the waistband
                      measures 14" laid flat, not 15" as advertised.
                    </p>

                    <p className="font-semibold mb-2">Attached:</p>
                    <ul className="list-decimal ml-5 !text-sm">
                      <li>Photo 1: Measuring tape across waistband.</li>
                      <li>Photo 2: Size tag (Size 8).</li>
                      <li>Photo 3: Full front/back view.</li>
                    </ul>

                    <p>Please advise next steps.</p>

                    <p>
                      Thanks,
                      <br />
                      <strong>Emily Johnson</strong>
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t mt-2 px-4 py-2">
                  <div className="flex items-center gap-1.5 text-sm text-gray">
                    <CircleCheck size={18} className="text-green" />
                    <span>
                      This format ensures quick processing of your return
                      request
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <hr />
            <div>
              <div>
                <h3>Step 3: Wait for Our Email Response</h3>
                <ul>
                  <li>
                    After emailing support, wait for our reply within{" "}
                    <strong>24–48 hours</strong>.
                  </li>
                  <li>
                    <strong>If approved</strong>, we’ll email you packing and
                    shipping instructions (including a prepaid label if
                    applicable).
                  </li>
                  <li>
                    <strong>If denied</strong>, we’ll explain why (e.g.,
                    insufficient photos or item was altered).
                  </li>
                </ul>
                <p>
                  <strong>Pro Tip</strong>: Check your spam folder if you don’t
                  hear back within 48 hours!
                </p>
              </div>
              <div>
                <div className="w-full max-w-2xl my-6 bg-neutral-50 rounded-xl border overflow-hidden shadow-sm">
                  {/* Header */}
                  <div className="bg-neutral-200/50 px-4 py-3">
                    <div className="text-blue text-center font-semibold">
                      Approved Email
                    </div>
                  </div>

                  {/* Subject line */}
                  <div className="p-4 border-b">
                    <div className="text-sm text-gray mb-1">Subject Line:</div>
                    <strong>
                      ✅ Return Approved – Order #ORD-7892J – Women's Blue Jeans
                      (Size 8)
                    </strong>
                  </div>

                  {/* Email body */}
                  <div className="p-4">
                    <div className="space-y-4">
                      <p>Dear Emily,</p>
                      <p>
                        Good news! Your return request for the{" "}
                        <strong>Women's Blue Jeans (Size 8)</strong> from order{" "}
                        <code>#ORD-7892J</code> has been approved.
                      </p>
                      <div>
                        <h3>Next Steps</h3>
                        <p>Please follow these instructions carefully:</p>
                      </div>
                      <ul className="list-decimal ml-5 !text-sm">
                        <li>
                          Pack your item in its original packaging with all tags
                          attached
                        </li>
                        <li>
                          Print and attach the return label → [DOWNLOAD LABEL
                          HERE]
                        </li>
                        <li>
                          Drop off your package at any UPS location by January
                          20, 2025
                        </li>
                      </ul>
                      <h3>What to Expect</h3>
                      <ul className="list-decimal ml-5 !text-sm">
                        <li>
                          Delivery confirmation: We'll email you when we receive
                          your return (3-5 business days)
                        </li>
                        <li>Inspection: 1-2 business days after receipt</li>
                        <li>
                          Refund: $43.05 ($50.00 minus $6.95 return shipping
                          fee)
                        </li>
                        <li>
                          Payment: Processed to your PayPal account within 5-7
                          business days
                        </li>
                      </ul>
                      <h3>Need Help?</h3>
                      <p>
                        If you have any questions about your return, simply
                        reply to this email.
                      </p>
                      <p>
                        We're sorry the jeans didn't work out this time, but we
                        appreciate your business and hope to serve you better
                        with your next purchase!
                      </p>

                      <p>Sincerely,</p>
                      <p>
                        Sarah Williams
                        <br /> Customer Support Specialist
                        <br />
                        <strong> Cherlygood Team</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <hr />
            <div>
              <h3>Step 4: Pack Your Item Correctly</h3>
              <p>
                <strong>Avoid Denials</strong>:
              </p>
              <ul>
                <li>
                  <strong>Clothing</strong>: Fold neatly into original garment
                  bag with tags (e.g., jeans in plastic sleeve).
                </li>
                <li>
                  <strong>Electronics</strong>: Include all accessories (e.g.,
                  vacuum nozzles in box).
                </li>
                <li>
                  <strong>Home Items</strong>: Reuse original packaging (e.g.,
                  bathroom mat in plastic wrap).
                </li>
              </ul>
              <p>
                <strong>❌ Never</strong>:
              </p>
              <ul>
                <li>Stretch fabric to “prove” sizing.</li>
                <li>Use or damage items before documenting.</li>
              </ul>
            </div>
            <hr />
            <div>
              <h3>Step 5: Choose Shipping Method</h3>
              <ol>
                <li>
                  <strong>Prepaid Label</strong> ($6.95 fee deducted):
                  <ul>
                    <li>
                      <em>Example</em>: $25 shirt refund → $18.05.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Self-Shipped</strong> (you pay shipping):
                  <ul>
                    <li>
                      Use tracked shipping (e.g., $5 for a scarf via USPS).
                    </li>
                  </ul>
                </li>
              </ol>
              <p>
                <strong>Defective Items</strong>: Free prepaid label (e.g.,
                broken vacuum).
              </p>
            </div>
            <hr />
            <div>
              <h3>Step 6: Ship & Track Refund</h3>
              <ol>
                <li>
                  <strong>Attach Label</strong>: Secure it to the package (e.g.,
                  bathroom mat in a sturdy mailer).
                </li>
                <li>
                  <strong>Drop Off</strong>: At the carrier’s location (e.g.,
                  UPS for prepaid labels).
                </li>
                <li>
                  <strong>Refund Timeline</strong>:
                  <ul>
                    <li>
                      <strong>Inspection</strong>: 1–3 business days.
                    </li>
                    <li>
                      <strong>Processing</strong>: 5–7 business days.
                    </li>
                    <li>
                      <em>Example</em>: $50 jacket → $43.05 refund after prepaid
                      label fee.
                    </li>
                  </ul>
                </li>
              </ol>
            </div>
            <hr />
            <div>
              <h3>FAQs & Troubleshooting</h3>
              <p>
                <strong>Q: Can I exchange an item?</strong>
                <br />
                A: No—return it and place a new order.
              </p>
              <p>
                <strong>Q: What if my return is denied?</strong>
                <br />
                A: We’ll email the reason (e.g., stretched jeans) and return it
                at your expense.
              </p>
              <p>
                <strong>Q: What if I got the wrong item?</strong>
                <br />
                A: Email us with photos—we’ll send a free label and fix it fast!
              </p>
              <p>
                <strong>Q: Late-discovered defect?</strong>
                <br />
                A: Email{" "}
                <Link href="mailto:support@cherlygood.com">
                  support@cherlygood.com
                </Link>
                —we’ll review case-by-case (e.g., zipper fails after 20 days).
              </p>
            </div>
            <hr />
            <div>
              <h3>Photo Guide</h3>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Good Photo</th>
                    <th>Bad Photo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Jeans</strong>
                    </td>
                    <td>Measuring tape on waistband (flat).</td>
                    <td>Stretched on a hanger.</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Bathroom Mat</strong>
                    </td>
                    <td>Peeling backing close-up.</td>
                    <td>Crumpled in a corner.</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Car Vacuum</strong>
                    </td>
                    <td>Plugged in (power light on).</td>
                    <td>Covered in mud.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <hr />
            <div>
              <h3>Why This Works</h3>
              <ul>
                <li>
                  <strong>No Guesswork</strong>: Examples (jeans, mats, vacuums)
                  reflect real issues.
                </li>
                <li>
                  <strong>Simple</strong>: Clear steps and generic names avoid
                  confusion.
                </li>
                <li>
                  <strong>Proof-Driven</strong>: Photos cut down on disputes.
                </li>
              </ul>
              <p>
                <strong>Questions?</strong> Email us at{" "}
                <Link href="mailto:support@cherlygood.com">
                  support@cherlygood.com
                </Link>
              </p>
              <p>
                <em>Ready to return? Start with Step 1 now!</em> 🛍️
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
