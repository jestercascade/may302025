"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Info, Monitor, Smartphone } from "lucide-react";

export default function OrderTrackingGuide() {
  const [expandedSection, setExpandedSection] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [viewMode, setViewMode] = useState("desktop");

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
          <div className="px-5 pb-3">
            <div className="flex items-center justify-center gap-1 bg-gray-100 rounded-lg p-1 w-fit mx-auto">
              <button
                onClick={() => setViewMode("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === "desktop" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Monitor size={14} />
                Desktop
              </button>
              <button
                onClick={() => setViewMode("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === "mobile" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Smartphone size={14} />
                Mobile
              </button>
            </div>
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
                    <ul className="space-y-2 text-gray-600 text-sm mb-4">
                      <li className="flex items-start">
                        <span className="text-gray mr-2">•</span>
                        <span>Check your PayPal receipt email or account</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray mr-2">•</span>
                        <span>Look for the "Invoice ID" in transaction details</span>
                      </li>
                    </ul>
                    {viewMode === "desktop" ? (
                      <div className="space-y-3">
                        <div className="bg-gray-200 rounded-lg h-32 flex items-center justify-center text-gray-500 text-sm">
                          PayPal Activity Page Screenshot
                        </div>
                        <div className="bg-gray-200 rounded-lg h-40 flex items-center justify-center text-gray-500 text-sm">
                          PayPal Transaction Details Screenshot
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-gray-200 rounded-lg h-32 flex items-center justify-center text-gray-500 text-sm">
                          PayPal Mobile Activity Screenshot
                        </div>
                        <div className="bg-gray-200 rounded-lg h-40 flex items-center justify-center text-gray-500 text-sm">
                          PayPal Mobile Transaction Details Screenshot
                        </div>
                        <div className="bg-gray-200 rounded-lg h-32 flex items-center justify-center text-gray-500 text-sm">
                          PayPal Mobile Invoice ID Screenshot
                        </div>
                      </div>
                    )}
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
                    <h3 className="font-medium text-sm">Go to Track Order Page</h3>
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
                          Visit <span className="font-medium">cherlygood.com/track</span>
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray mr-2">•</span>
                        <span>Or click "Track Order" in main navigation</span>
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
                        <span>Enter complete Invoice ID in search field</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray mr-2">•</span>
                        <span>Click blue "Track" button to submit</span>
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
                        <span>View current processing status</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray mr-2">•</span>
                        <span>Get shipping info and delivery updates</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-gray text-xs">Need help? Contact support@cherlygood.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
