import { Package, Truck, CheckCircle, AlertCircle, Clock, Search } from "lucide-react";

export default function TrackOrder() {
  return (
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
                  Once your order ships, you'll receive a shipping confirmation email with your tracking number. You can
                  also find your tracking information by entering your order number on this page.
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
                  Please contact our customer service team within 48 hours of delivery. We'll help resolve the issue as
                  quickly as possible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
