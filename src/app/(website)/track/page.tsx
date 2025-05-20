import { NavbarWrapper } from "@/components/website/Navbar/NavbarWrapper";
import { Package, Truck, CheckCircle, AlertCircle, Clock, Search } from "lucide-react";
import Link from "next/link";

export default function TrackOrder() {
  return (
    <>
      <NavbarWrapper />
      <main className="pt-[61px] md:pt-[57px] min-h-[calc(100vh-328px)]">
        <div className="bg-gray-50 min-h-screen font-sans">
          {/* Header section */}
          <div className="max-w-6xl mx-auto pt-8 pb-20 px-4">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Track Your Order</h1>
              <p className="text-gray max-w-xl mx-auto">
                Enter your order number to check the current status and estimated delivery date of your package.
              </p>
            </div>

            {/* Track order form */}
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden mb-8">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-grow relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter your order number (e.g., 21769B81)"
                      className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all duration-200"
                    />
                  </div>
                  <div>
                    <button className="w-full md:w-auto px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 bg-amber-500 hover:bg-amber-600">
                      Track Order
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ section */}
            <div className="max-w-3xl mx-auto mt-16">
              <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>

              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <h3 className="font-medium p-5 border-b border-gray-100">Where's my order?</h3>
                  <div className="p-5">
                    <p className="text-gray">
                      Once your order ships, you'll receive a shipping confirmation email with your tracking number. You
                      can also find your tracking information by entering your order number on this page.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <h3 className="font-medium p-5 border-b border-gray-100">How long will my order take to arrive?</h3>
                  <div className="p-5">
                    <p className="text-gray">
                      Standard shipping typically takes 3-7 business days. Express shipping takes 1-3 business days.
                      International orders may take 10-14 business days.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <h3 className="font-medium p-5 border-b border-gray-100">
                    What if my package is damaged or missing items?
                  </h3>
                  <div className="p-5">
                    <p className="text-gray">
                      Please contact our customer service team within 48 hours of delivery. We'll help resolve the issue
                      as quickly as possible.
                    </p>
                  </div>
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
    <footer className="w-full pt-6 pb-24 border-t bg-neutral-100">
      <div className="md:hidden max-w-[486px] px-5 mx-auto">
        <div className="flex flex-col gap-8">
          <div>
            <h4 className="block text-sm mb-3">
              Subscribe to our newsletter <br /> for exclusive deals and updates
            </h4>
            <div className="relative h-11 w-[270px]">
              <button className="peer w-[104px] h-[40px] absolute left-[164px] top-1/2 -translate-y-1/2 rounded font-semibold text-white">
                Subscribe
              </button>
              <div className="peer-hover:bg-[#cc8100] peer-hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] peer-active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] w-full h-full p-[2px] rounded-lg shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000]">
                <input className="w-40 h-[40px] px-3 rounded-md" type="text" placeholder="Enter your email" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <Link href="/about-us" className="block w-max text-sm text-gray mb-2 hover:underline">
                About us
              </Link>
              <Link href="/privacy-policy" className="block w-max text-sm text-gray mb-2 hover:underline">
                Privacy policy
              </Link>
              <Link href="/terms-of-use" className="block w-max text-sm text-gray mb-2 hover:underline">
                Terms of use
              </Link>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Get Help</h3>
              <Link href="/contact-us" className="block w-max text-sm text-gray mb-2 hover:underline">
                Contact us
              </Link>
              <Link href="/track" className="block w-max text-sm text-gray mb-2 hover:underline">
                Track order
              </Link>
              <Link href="/returns-and-refunds" className="block w-max text-sm text-gray mb-2 hover:underline">
                Returns & refunds
              </Link>
              <Link href="/faq" className="block w-max text-sm text-gray mb-2 hover:underline">
                FAQs
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden md:block w-full max-w-[1040px] px-9 mx-auto">
        <div className="flex gap-10">
          <div className="w-full">
            <h3 className="font-semibold mb-4">Company</h3>
            <Link href="/about-us" className="block w-max text-sm text-gray mb-2 hover:underline">
              About us
            </Link>
            <Link href="/privacy-policy" className="block w-max text-sm text-gray mb-2 hover:underline">
              Privacy policy
            </Link>
            <Link href="/terms-of-use" className="block w-max text-sm text-gray mb-2 hover:underline">
              Terms of use
            </Link>
          </div>
          <div className="w-full">
            <h3 className="font-semibold mb-4">Get Help</h3>
            <Link href="/contact-us" className="block w-max text-sm text-gray mb-2 hover:underline">
              Contact us
            </Link>
            <Link href="/track" className="block w-max text-sm text-gray mb-2 hover:underline">
              Track order
            </Link>
            <Link href="/returns-and-refunds" className="block w-max text-sm text-gray mb-2 hover:underline">
              Returns & refunds
            </Link>
            <Link href="/faq" className="block w-max text-sm text-gray mb-2 hover:underline">
              FAQs
            </Link>
          </div>
          <div className="min-w-[270px]">
            <h4 className="block text-sm mb-3">
              Subscribe to our newsletter <br /> for exclusive deals and updates
            </h4>
            <div className="relative h-11 w-[270px]">
              <button className="peer w-[104px] h-[40px] absolute left-[164px] top-1/2 -translate-y-1/2 rounded font-semibold text-white">
                Subscribe
              </button>
              <div className="peer-hover:bg-[#cc8100] peer-hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] peer-active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] w-full h-full p-[2px] rounded-lg shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000]">
                <input className="w-40 h-[40px] px-3 rounded-md" type="text" placeholder="Enter your email" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
