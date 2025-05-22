"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Info, Mail } from "lucide-react";

export default function OrderTrackingGuide() {
  const [expandedSection, setExpandedSection] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  const toggleSection = (sectionId: any) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
    }
  };

  const toggleGuide = () => {
    setShowGuide(!showGuide);
  };

  return (
    <div>
      <button
        onClick={toggleGuide}
        className="flex items-center justify-center gap-1.5 mx-auto text-gray rounded-lg px-3 py-2 transition-all duration-200 text-sm font-medium"
      >
        <Info size={14} />
        {showGuide ? "Hide" : "Need help?"}
        {showGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {showGuide && (
        <div className="mt-4 bg-white rounded-xl border border-gray-200/70 overflow-hidden transition-all duration-300 max-w-2xl mx-auto">
          <div className="px-5 pt-4 pb-2">
            <h2 className="text-xl text-center font-semibold">How to Track Your Order</h2>
          </div>
          <div className="px-5 pb-5">
            <p className="text-gray text-sm text-center mb-3">
              Follow these simple steps to track your order status and estimated delivery.
            </p>
            <div className="*:py-1 *:border-b *:border-gray-200/70">
              <div>
                <button
                  onClick={() => toggleSection("step1")}
                  className="w-full flex items-center justify-between py-3 text-left"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gray-100 text-gray rounded-full h-6 w-6 flex items-center justify-center font-medium mr-3 text-xs">
                      1
                    </div>
                    <h3 className="font-medium text-sm">Find Your Invoice ID in PayPal Receipt</h3>
                  </div>
                  {expandedSection === "step1" ? (
                    <ChevronUp size={16} className="text-gray" />
                  ) : (
                    <ChevronDown size={16} className="text-gray" />
                  )}
                </button>

                {expandedSection === "step1" && (
                  <div className="pb-4 pl-9 pr-2">
                    <ul className="space-y-2 text-gray-600 text-sm">
                      <li className="flex items-start">
                        <span className="text-gray mr-2">•</span>
                        <span>Check your PayPal receipt email or account</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray mr-2">•</span>
                        <span>Look for the "Invoice ID" section in your transaction details</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray mr-2">•</span>
                        <span>
                          The Invoice ID format looks like:{" "}
                          <code className="bg-gray-50 px-1 py-0.5 rounded text-gray-600 font-medium">21769B81</code>
                        </span>
                      </li>
                    </ul>
                    <div className="mt-3 bg-blue-50 border-l-2 border-blue-300 p-2 rounded-r-sm text-xs text-blue-700">
                      Make sure to enter the exact ID as shown in your PayPal receipt.
                    </div>
                  </div>
                )}
              </div>
              <div>
                <button
                  onClick={() => toggleSection("step2")}
                  className="w-full flex items-center justify-between py-3 text-left"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gray-100 text-gray rounded-full h-6 w-6 flex items-center justify-center font-medium mr-3 text-xs">
                      2
                    </div>
                    <h3 className="font-medium text-sm">Go to the Track Order Page</h3>
                  </div>
                  {expandedSection === "step2" ? (
                    <ChevronUp size={16} className="text-gray" />
                  ) : (
                    <ChevronDown size={16} className="text-gray" />
                  )}
                </button>

                {expandedSection === "step2" && (
                  <div className="pb-4 pl-9 pr-2">
                    <ul className="space-y-2 text-gray-600 text-sm">
                      <li className="flex items-start">
                        <span className="text-gray mr-2">•</span>
                        <span>
                          Visit <span className="font-medium">cherlygood.com/track</span> directly
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray mr-2">•</span>
                        <span>Or click the "Track Order" link in the website's main navigation</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <div>
                <button
                  onClick={() => toggleSection("step3")}
                  className="w-full flex items-center justify-between py-3 text-left"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gray-100 text-gray rounded-full h-6 w-6 flex items-center justify-center font-medium mr-3 text-xs">
                      3
                    </div>
                    <h3 className="font-medium text-sm">Enter Your Invoice ID</h3>
                  </div>
                  {expandedSection === "step3" ? (
                    <ChevronUp size={16} className="text-gray" />
                  ) : (
                    <ChevronDown size={16} className="text-gray" />
                  )}
                </button>

                {expandedSection === "step3" && (
                  <div className="pb-4 pl-9 pr-2">
                    <ul className="space-y-2 text-gray-600 text-sm">
                      <li className="flex items-start">
                        <span className="text-gray mr-2">•</span>
                        <span>Type your complete Invoice ID into the search field</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray mr-2">•</span>
                        <span>Double-check that you've entered it correctly</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray mr-2">•</span>
                        <span>Click the blue "Track" button to submit</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <div>
                <button
                  onClick={() => toggleSection("step4")}
                  className="w-full flex items-center justify-between py-3 text-left"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gray-100 text-gray rounded-full h-6 w-6 flex items-center justify-center font-medium mr-3 text-xs">
                      4
                    </div>
                    <h3 className="font-medium text-sm">View Your Order Status</h3>
                  </div>
                  {expandedSection === "step4" ? (
                    <ChevronUp size={16} className="text-gray" />
                  ) : (
                    <ChevronDown size={16} className="text-gray" />
                  )}
                </button>

                {expandedSection === "step4" && (
                  <div className="pb-4 pl-9 pr-2">
                    <ul className="space-y-2 text-gray-600 text-sm">
                      <li className="flex items-start">
                        <span className="text-gray mr-2">•</span>
                        <span>You'll see your order's current processing status</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray mr-2">•</span>
                        <span>Shipping information and carrier details</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray mr-2">•</span>
                        <span>Estimated delivery date when available</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray mr-2">•</span>
                        <span>Tracking number for shipped orders</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-gray text-xs">Need additional help? Contact support@cherlygood.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
