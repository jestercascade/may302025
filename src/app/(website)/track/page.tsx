import { NavbarWrapper } from "@/components/website/Navbar/NavbarWrapper";
import OrderTrackingGuide from "@/components/website/OrderTrackingGuide";
import OrderTracker from "@/components/website/OrderTracker";
import { Footer } from "@/components/website/Footer";

export default async function TrackOrder() {
  return (
    <>
      <NavbarWrapper />
      <main className="bg-neutral-50 pt-[61px] md:pt-[57px] min-h-[calc(100vh-57px)]">
        <div className="max-w-3xl mx-auto pt-16 pb-24 px-6 space-y-12">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Track Your Order</h1>
            <p className="text-gray max-w-md mx-auto">
              Enter your <span className="bg-amber/10 text-amber font-mono px-1 rounded-md">invoice ID</span> to check
              the current status and estimated delivery date
            </p>
          </div>
          <OrderTracker />
          <OrderTrackingGuide />
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-3">
              <div className="bg-white rounded-xl border border-gray-200/70 overflow-hidden">
                <h3 className="font-medium p-4 border-b border-gray-200/70">Where's my order?</h3>
                <div className="p-4 text-gray-600 text-sm leading-relaxed">
                  <p>
                    Once your order ships, you'll receive a shipping confirmation email with your tracking number. You
                    can also find your tracking information by entering your invoice ID on this page.
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/70 overflow-hidden">
                <h3 className="font-medium p-4 border-b border-gray-200/70">How long will my order take to arrive?</h3>
                <div className="p-4 text-gray-600 text-sm leading-relaxed">
                  <p>
                    Standard shipping typically takes 3-7 business days. Express shipping takes 1-3 business days.
                    International orders may take 10-14 business days.
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/70 overflow-hidden">
                <h3 className="font-medium p-4 border-b border-gray-200/70">
                  What if my package is damaged or missing items?
                </h3>
                <div className="p-4 text-gray-600 text-sm leading-relaxed">
                  <p>
                    Please contact our customer service team within 48 hours of delivery. We'll help resolve the issue
                    as quickly as possible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
