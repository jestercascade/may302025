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
        className="flex items-center justify-center gap-1.5 mx-auto text-gray-600 rounded-lg px-3 py-2 transition-all duration-200 text-sm font-medium hover:bg-gray-50"
      >
        <Info size={14} />
        {showGuide ? "Hide" : "Need help?"}
        {showGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {showGuide && (
        <div className="mt-4 bg-white rounded-xl border border-gray-200/70 overflow-hidden transition-all duration-300 max-w-2xl mx-auto">
          <div className="px-5 pt-4 pb-2">
            <h2 className="text-xl text-center font-semibold text-gray-900">How to Track Your Order</h2>
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
            <p className="text-gray-600 text-sm text-center mb-3">
              Follow these simple steps to track your order status and estimated delivery.
            </p>
            <div className="space-y-0">
              <div className="border-b border-gray-200/70">
                <button
                  onClick={() => toggleSection("step1")}
                  className="w-full flex items-center justify-between py-3 text-left"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gray-100 text-gray-700 rounded-full h-6 w-6 flex items-center justify-center font-medium mr-3 text-xs">
                      1
                    </div>
                    <h3 className="font-medium text-sm text-gray-900">Find Your Invoice ID in PayPal Receipt</h3>
                  </div>
                  {expandedSection === "step1" ? (
                    <ChevronUp size={16} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-500" />
                  )}
                </button>
                {expandedSection === "step1" && (
                  <div className="pb-4 pl-9 pr-2">
                    {viewMode === "desktop" ? (
                      <div>
                        <ul className="space-y-2 text-gray-600 text-sm mb-4">
                          <li className="flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            <span>Go to PayPal.com and click "Activity" in the top navigation</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            <span>Find your Cherlygood payment transaction and click on it</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            <span>
                              Look for "Invoice ID" in the transaction details (e.g., "C4O8B1T3 — enter at
                              cherlygood.com/track")
                            </span>
                          </li>
                        </ul>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs text-blue-800">
                            <strong>💡 Desktop Tip:</strong> The Invoice ID appears prominently in the transaction
                            details page, along with instructions to "enter at cherlygood.com/track"
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <ul className="space-y-2 text-gray-600 text-sm mb-4">
                          <li className="flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            <span>Open PayPal app and find your Cherlygood transaction</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            <span>Tap the transaction to open details</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            <span>Tap the blue "Show payment info" link in the "From" section</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            <span>Look for "Merchant order ID" - this is your Invoice ID</span>
                          </li>
                        </ul>
                        <div className="space-y-3">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <h4 className="font-medium text-sm text-blue-900 mb-2">Mobile Steps in Detail:</h4>
                            <ol className="text-xs text-blue-800 space-y-1">
                              <li>1. Open PayPal mobile app</li>
                              <li>2. Look for "Cherlygood" payment in your recent activity</li>
                              <li>3. Tap the transaction (shows "Completed" status)</li>
                              <li>4. In payment details, tap "Show payment info" button</li>
                              <li>5. Find "Merchant order ID" (e.g., "C4O8B1T3 — enter at cherlygood.com/track")</li>
                            </ol>
                          </div>
                          <div className="bg-gray-100 rounded-lg p-3">
                            <p className="text-xs text-gray-600">
                              📱 <strong>Important:</strong> The Invoice ID is labeled as "Merchant order ID" in the
                              mobile app's payment info modal. It will include instructions to enter it at
                              cherlygood.com/track
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="border-b border-gray-200/70">
                <button
                  onClick={() => toggleSection("step2")}
                  className="w-full flex items-center justify-between py-3 text-left"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gray-100 text-gray-700 rounded-full h-6 w-6 flex items-center justify-center font-medium mr-3 text-xs">
                      2
                    </div>
                    <h3 className="font-medium text-sm text-gray-900">Go to Track Order Page</h3>
                  </div>
                  {expandedSection === "step2" ? (
                    <ChevronUp size={16} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-500" />
                  )}
                </button>
                {expandedSection === "step2" && (
                  <div className="pb-4 pl-9 pr-2">
                    <ul className="space-y-2 text-gray-600 text-sm">
                      <li className="flex items-start">
                        <span className="text-gray-400 mr-2">•</span>
                        <span>
                          Visit <span className="font-medium text-blue-600">cherlygood.com/track</span>
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray-400 mr-2">•</span>
                        <span>Or click "Track Order" in the main navigation menu</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <div className="border-b border-gray-200/70">
                <button
                  onClick={() => toggleSection("step3")}
                  className="w-full flex items-center justify-between py-3 text-left"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gray-100 text-gray-700 rounded-full h-6 w-6 flex items-center justify-center font-medium mr-3 text-xs">
                      3
                    </div>
                    <h3 className="font-medium text-sm text-gray-900">Enter Your Invoice ID</h3>
                  </div>
                  {expandedSection === "step3" ? (
                    <ChevronUp size={16} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-500" />
                  )}
                </button>
                {expandedSection === "step3" && (
                  <div className="pb-4 pl-9 pr-2">
                    <ul className="space-y-2 text-gray-600 text-sm mb-3">
                      <li className="flex items-start">
                        <span className="text-gray-400 mr-2">•</span>
                        <span>Enter the complete Invoice ID in the search field (e.g., "C4O8B1T3")</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray-400 mr-2">•</span>
                        <span>Click the blue "Track" button to submit your request</span>
                      </li>
                    </ul>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-xs text-yellow-800">
                        <strong>⚠️ Note:</strong> Enter only the Invoice ID number (like "C4O8B1T3"), not the full text
                        with instructions.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <button
                  onClick={() => toggleSection("step4")}
                  className="w-full flex items-center justify-between py-3 text-left"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gray-100 text-gray-700 rounded-full h-6 w-6 flex items-center justify-center font-medium mr-3 text-xs">
                      4
                    </div>
                    <h3 className="font-medium text-sm text-gray-900">View Your Order Status</h3>
                  </div>
                  {expandedSection === "step4" ? (
                    <ChevronUp size={16} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-500" />
                  )}
                </button>
                {expandedSection === "step4" && (
                  <div className="pb-4 pl-9 pr-2">
                    <ul className="space-y-2 text-gray-600 text-sm">
                      <li className="flex items-start">
                        <span className="text-gray-400 mr-2">•</span>
                        <span>View your current order processing status</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray-400 mr-2">•</span>
                        <span>Get shipping information and tracking updates</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray-400 mr-2">•</span>
                        <span>Check estimated delivery date for your location</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-xs">Need help? Contact support@cherlygood.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
