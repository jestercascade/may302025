// "use client";

// import { useState } from "react";
// import { ChevronDown, ChevronUp, Info, Mail } from "lucide-react";

// export default function OrderTrackingGuide() {
//   const [expandedSection, setExpandedSection] = useState(null);
//   const [showGuide, setShowGuide] = useState(false);

//   // Toggle section expansion
//   const toggleSection = (sectionId: any) => {
//     if (expandedSection === sectionId) {
//       setExpandedSection(null);
//     } else {
//       setExpandedSection(sectionId);
//     }
//   };

//   // Toggle entire guide visibility
//   const toggleGuide = () => {
//     setShowGuide(!showGuide);
//   };

//   return (
//     <div className="max-w-3xl mx-auto my-10">
//       {/* Guide toggle button */}
//       <button
//         onClick={toggleGuide}
//         className="flex items-center justify-center gap-2 mx-auto bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-2.5 transition-all duration-200 font-medium"
//       >
//         <Info size={18} />
//         {showGuide ? "Hide Tracking Guide" : "Need Help? View Tracking Guide"}
//         {showGuide ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//       </button>

//       {showGuide && (
//         <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden transition-all duration-300">
//           {/* Guide header */}
//           <div className="bg-gray-50 border-b border-gray-200/80 px-5 py-4">
//             <h2 className="text-xl font-semibold text-gray-800">How to Track Your Order</h2>
//           </div>

//           <div className="p-5">
//             {/* Introduction */}
//             <p className="text-gray-600 mb-6">
//               Follow these simple steps to track your Cherlygood order status and estimated delivery date.
//             </p>

//             {/* Step 1 */}
//             <div className="mb-4 bg-white rounded-xl border border-gray-200/80 overflow-hidden">
//               <button
//                 onClick={() => toggleSection("step1")}
//                 className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
//               >
//                 <div className="flex items-center">
//                   <div className="flex-shrink-0 bg-blue-500 text-white rounded-full h-7 w-7 flex items-center justify-center font-medium mr-3">
//                     1
//                   </div>
//                   <h3 className="font-medium text-gray-800">Find Your Invoice ID in PayPal Receipt</h3>
//                 </div>
//                 {expandedSection === "step1" ? (
//                   <ChevronUp size={18} className="text-gray-400" />
//                 ) : (
//                   <ChevronDown size={18} className="text-gray-400" />
//                 )}
//               </button>

//               {expandedSection === "step1" && (
//                 <div className="p-4 pt-0 border-t border-gray-100">
//                   <div className="flex flex-col gap-4 mt-4">
//                     <div className="md:w-1/2">
//                       <img
//                         src="/api/placeholder/400/320"
//                         alt="PayPal receipt with Invoice ID"
//                         className="w-full rounded-lg border border-gray-200 shadow-sm"
//                       />
//                       <p className="text-xs text-gray-500 mt-2 text-center italic">
//                         PayPal receipt with highlighted Invoice ID
//                       </p>
//                     </div>
//                     <div className="md:w-1/2">
//                       <ul className="space-y-2 text-gray-600">
//                         <li className="flex items-start">
//                           <span className="text-blue-500 mr-2">•</span>
//                           <span>Check your PayPal receipt email or account.</span>
//                         </li>
//                         <li className="flex items-start">
//                           <span className="text-blue-500 mr-2">•</span>
//                           <span>Look for the "Invoice ID" section in your transaction details.</span>
//                         </li>
//                         <li className="flex items-start">
//                           <span className="text-blue-500 mr-2">•</span>
//                           <span>
//                             The Invoice ID format looks like:{" "}
//                             <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600 font-medium">21769B81</code>
//                           </span>
//                         </li>
//                       </ul>
//                       <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg">
//                         <p className="text-sm text-amber-800">
//                           In the example image, the Invoice ID is <span className="font-medium">21769B81</span> which
//                           you can see in the yellow highlighted box.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Step 2 */}
//             <div className="mb-4 bg-white rounded-xl border border-gray-200/80 overflow-hidden">
//               <button
//                 onClick={() => toggleSection("step2")}
//                 className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
//               >
//                 <div className="flex items-center">
//                   <div className="flex-shrink-0 bg-blue-500 text-white rounded-full h-7 w-7 flex items-center justify-center font-medium mr-3">
//                     2
//                   </div>
//                   <h3 className="font-medium text-gray-800">Go to the Track Order Page</h3>
//                 </div>
//                 {expandedSection === "step2" ? (
//                   <ChevronUp size={18} className="text-gray-400" />
//                 ) : (
//                   <ChevronDown size={18} className="text-gray-400" />
//                 )}
//               </button>

//               {expandedSection === "step2" && (
//                 <div className="p-4 pt-0 border-t border-gray-100">
//                   <div className="flex flex-col gap-4 mt-4">
//                     <div className="md:w-1/2">
//                       <img
//                         src="/api/placeholder/400/320"
//                         alt="Cherlygood website header with Track Order option"
//                         className="w-full rounded-lg border border-gray-200 shadow-sm"
//                       />
//                       <p className="text-xs text-gray-500 mt-2 text-center italic">
//                         Cherlygood navigation with Track Order option
//                       </p>
//                     </div>
//                     <div className="md:w-1/2">
//                       <ul className="space-y-2 text-gray-600">
//                         <li className="flex items-start">
//                           <span className="text-blue-500 mr-2">•</span>
//                           <span>
//                             Visit <span className="font-medium">cherlygood.com/track</span> directly
//                           </span>
//                         </li>
//                         <li className="flex items-start">
//                           <span className="text-blue-500 mr-2">•</span>
//                           <span>Or click the "Track Order" link in the website's main navigation</span>
//                         </li>
//                       </ul>
//                       <div className="mt-4 bg-gray-50 border-l-4 border-gray-300 p-3 rounded-r-lg">
//                         <p className="text-sm text-gray-700">
//                           The Track Order page lets you check your order status without needing to log in to an account.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Step 3 */}
//             <div className="mb-4 bg-white rounded-xl border border-gray-200/80 overflow-hidden">
//               <button
//                 onClick={() => toggleSection("step3")}
//                 className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
//               >
//                 <div className="flex items-center">
//                   <div className="flex-shrink-0 bg-blue-500 text-white rounded-full h-7 w-7 flex items-center justify-center font-medium mr-3">
//                     3
//                   </div>
//                   <h3 className="font-medium text-gray-800">Enter Your Invoice ID</h3>
//                 </div>
//                 {expandedSection === "step3" ? (
//                   <ChevronUp size={18} className="text-gray-400" />
//                 ) : (
//                   <ChevronDown size={18} className="text-gray-400" />
//                 )}
//               </button>

//               {expandedSection === "step3" && (
//                 <div className="p-4 pt-0 border-t border-gray-100">
//                   <div className="flex flex-col gap-4 mt-4">
//                     <div className="md:w-1/2">
//                       <img
//                         src="/api/placeholder/400/320"
//                         alt="Track order search box"
//                         className="w-full rounded-lg border border-gray-200 shadow-sm"
//                       />
//                       <p className="text-xs text-gray-500 mt-2 text-center italic">Order tracking search field</p>
//                     </div>
//                     <div className="md:w-1/2">
//                       <ul className="space-y-2 text-gray-600">
//                         <li className="flex items-start">
//                           <span className="text-blue-500 mr-2">•</span>
//                           <span>Type your complete Invoice ID into the search field</span>
//                         </li>
//                         <li className="flex items-start">
//                           <span className="text-blue-500 mr-2">•</span>
//                           <span>Double-check that you've entered it correctly</span>
//                         </li>
//                         <li className="flex items-start">
//                           <span className="text-blue-500 mr-2">•</span>
//                           <span>Click the blue "Track" button to submit</span>
//                         </li>
//                       </ul>
//                       <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg">
//                         <p className="text-sm text-amber-800">
//                           Make sure to enter the exact ID as shown in your PayPal receipt - any errors will prevent you
//                           from finding your order.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Step 4 */}
//             <div className="mb-4 bg-white rounded-xl border border-gray-200/80 overflow-hidden">
//               <button
//                 onClick={() => toggleSection("step4")}
//                 className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
//               >
//                 <div className="flex items-center">
//                   <div className="flex-shrink-0 bg-blue-500 text-white rounded-full h-7 w-7 flex items-center justify-center font-medium mr-3">
//                     4
//                   </div>
//                   <h3 className="font-medium text-gray-800">View Your Order Status</h3>
//                 </div>
//                 {expandedSection === "step4" ? (
//                   <ChevronUp size={18} className="text-gray-400" />
//                 ) : (
//                   <ChevronDown size={18} className="text-gray-400" />
//                 )}
//               </button>

//               {expandedSection === "step4" && (
//                 <div className="p-4 pt-0 border-t border-gray-100">
//                   <div className="flex flex-col gap-4 mt-4">
//                     <div className="md:w-1/2">
//                       <img
//                         src="/api/placeholder/400/320"
//                         alt="Order status results"
//                         className="w-full rounded-lg border border-gray-200 shadow-sm"
//                       />
//                       <p className="text-xs text-gray-500 mt-2 text-center italic">Order status results</p>
//                     </div>
//                     <div className="md:w-1/2">
//                       <ul className="space-y-2 text-gray-600">
//                         <li className="flex items-start">
//                           <span className="text-blue-500 mr-2">•</span>
//                           <span>You'll see your order's current processing status</span>
//                         </li>
//                         <li className="flex items-start">
//                           <span className="text-blue-500 mr-2">•</span>
//                           <span>Shipping information and carrier details</span>
//                         </li>
//                         <li className="flex items-start">
//                           <span className="text-blue-500 mr-2">•</span>
//                           <span>Estimated delivery date when available</span>
//                         </li>
//                         <li className="flex items-start">
//                           <span className="text-blue-500 mr-2">•</span>
//                           <span>Tracking number for shipped orders</span>
//                         </li>
//                       </ul>
//                       <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
//                         <p className="text-sm text-green-800">
//                           Your order status will be updated in real-time as it moves through our fulfillment process.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Help section */}
//             <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200/80">
//               <h3 className="font-medium text-gray-800 mb-2">Need Additional Help?</h3>
//               <p className="text-gray-600 text-sm mb-3">
//                 If you're having trouble tracking your order, our support team is here to help:
//               </p>
//               <div className="flex flex-wrap gap-3">
//                 <div className="flex items-center bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100">
//                   <Mail className="h-4 w-4 text-gray-500 mr-2" />
//                   <span className="text-gray-700 font-medium text-sm">cherlygood@gmail.com</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Info, Mail } from "lucide-react";

export default function OrderTrackingGuide() {
  const [expandedSection, setExpandedSection] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  // Toggle section expansion
  const toggleSection = (sectionId: any) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
    }
  };

  // Toggle entire guide visibility
  const toggleGuide = () => {
    setShowGuide(!showGuide);
  };

  return (
    <div className="w-full mt-8">
      {/* Guide toggle button - more subtle, iOS/macOS style */}
      <button
        onClick={toggleGuide}
        className="flex items-center justify-center gap-1.5 mx-auto text-gray-500 hover:text-gray-700 rounded-lg px-3 py-2 transition-all duration-200 text-sm font-medium"
      >
        <Info size={14} />
        {showGuide ? "Hide" : "Need help?"} 
        {showGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {showGuide && (
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden transition-all duration-300 max-w-2xl mx-auto">
          {/* Guide header - iOS/macOS style with subtle title */}
          <div className="px-5 py-4">
            <h2 className="text-lg font-medium text-gray-800">How to Track Your Order</h2>
          </div>

          <div className="px-5 pb-5">
            {/* Introduction - clean, concise text */}
            <p className="text-gray-600 text-sm mb-6">
              Follow these simple steps to track your Cherlygood order status and estimated delivery.
            </p>

            {/* Step 1 - iOS/macOS style accordion */}
            <div className="mb-2 border-b border-gray-100">
              <button
                onClick={() => toggleSection("step1")}
                className="w-full flex items-center justify-between py-3 text-left"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gray-100 text-gray-500 rounded-full h-6 w-6 flex items-center justify-center font-medium mr-3 text-xs">
                    1
                  </div>
                  <h3 className="font-medium text-sm text-gray-800">Find Your Invoice ID in PayPal Receipt</h3>
                </div>
                {expandedSection === "step1" ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>

              {expandedSection === "step1" && (
                <div className="pb-4 pl-9 pr-2">
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span>Check your PayPal receipt email or account</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span>Look for the "Invoice ID" section in your transaction details</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
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

            {/* Step 2 - iOS/macOS style accordion */}
            <div className="mb-2 border-b border-gray-100">
              <button
                onClick={() => toggleSection("step2")}
                className="w-full flex items-center justify-between py-3 text-left"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gray-100 text-gray-500 rounded-full h-6 w-6 flex items-center justify-center font-medium mr-3 text-xs">
                    2
                  </div>
                  <h3 className="font-medium text-sm text-gray-800">Go to the Track Order Page</h3>
                </div>
                {expandedSection === "step2" ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>

              {expandedSection === "step2" && (
                <div className="pb-4 pl-9 pr-2">
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span>
                        Visit <span className="font-medium">cherlygood.com/track</span> directly
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span>Or click the "Track Order" link in the website's main navigation</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Step 3 - iOS/macOS style accordion */}
            <div className="mb-2 border-b border-gray-100">
              <button
                onClick={() => toggleSection("step3")}
                className="w-full flex items-center justify-between py-3 text-left"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gray-100 text-gray-500 rounded-full h-6 w-6 flex items-center justify-center font-medium mr-3 text-xs">
                    3
                  </div>
                  <h3 className="font-medium text-sm text-gray-800">Enter Your Invoice ID</h3>
                </div>
                {expandedSection === "step3" ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>

              {expandedSection === "step3" && (
                <div className="pb-4 pl-9 pr-2">
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span>Type your complete Invoice ID into the search field</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span>Double-check that you've entered it correctly</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span>Click the blue "Track" button to submit</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Step 4 - iOS/macOS style accordion */}
            <div className="mb-2 border-b border-gray-100">
              <button
                onClick={() => toggleSection("step4")}
                className="w-full flex items-center justify-between py-3 text-left"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gray-100 text-gray-500 rounded-full h-6 w-6 flex items-center justify-center font-medium mr-3 text-xs">
                    4
                  </div>
                  <h3 className="font-medium text-sm text-gray-800">View Your Order Status</h3>
                </div>
                {expandedSection === "step4" ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>

              {expandedSection === "step4" && (
                <div className="pb-4 pl-9 pr-2">
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span>You'll see your order's current processing status</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span>Shipping information and carrier details</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span>Estimated delivery date when available</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span>Tracking number for shipped orders</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Help section - minimal iOS/macOS style */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-xs">
                Need additional help? Contact our support team:
              </p>
              <div className="flex justify-center mt-1.5">
                <div className="flex items-center">
                  <Mail className="h-3 w-3 text-gray-400 mr-1.5" />
                  <span className="text-gray-600 text-xs">cherlygood@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}