import { NavbarWrapper } from "@/components/website/Navbar/NavbarWrapper";
import OrderTrackingGuide from "@/components/website/OrderTrackingGuide";
import OrderTracker from "@/components/website/OrderTracker";
import Link from "next/link";

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

function Footer() {
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
            <div className="w-full max-w-md flex justify-center">
              <div className="relative h-11 w-[290px]">
                <button className="peer w-[104px] h-[40px] absolute left-[184px] top-1/2 -translate-y-1/2 rounded font-semibold text-white">
                  Subscribe
                </button>
                <div className="peer-hover:bg-[#cc8100] peer-hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] peer-active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] w-full h-full p-[2px] rounded-lg shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000]">
                  <input className="w-[180px] h-[40px] px-3 rounded-md" type="text" placeholder="Enter your email" />
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray/90 text-center">You can unsubscribe any time</div>
          </div>
        </div>
        <div className="flex justify-center text-xs text-gray">
          <p>© {new Date().getFullYear()} Cherlygood. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
