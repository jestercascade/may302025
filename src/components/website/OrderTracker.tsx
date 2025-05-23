"use client";

import { getOrders } from "@/actions/get/orders";
import { ShowAlertType } from "@/lib/sharedTypes";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { Search, CheckCircle, Truck, Package, AlertCircle, MapPin } from "lucide-react";
import { useState } from "react";

// 373C572C

export default function OrderTracker() {
  const [invoiceId, setInvoiceId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderData, setOrderData] = useState<OrderType | null>(null);
  const { showAlert } = useAlertStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoiceId.trim()) {
      showAlert({
        message: "Please enter an invoice ID",
        type: ShowAlertType.ERROR,
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await getOrders({ invoiceIds: [invoiceId.trim()] });
      console.log("Order data:", result);

      if (!result || result.length === 0) {
        setOrderData(null);
        showAlert({
          message: "We couldn't find any matching order",
          type: ShowAlertType.ERROR,
        });
      } else {
        setOrderData(result[0]);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setOrderData(null);
      showAlert({
        message: "An error occurred while fetching the order",
        type: ShowAlertType.ERROR,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusOptions = ["pending", "processing", "shipped", "delivered"];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
      <div className="p-6">
        <form className="flex flex-col md:flex-row gap-3" onSubmit={handleSubmit}>
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Enter invoice ID"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 bg-white border rounded-lg focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200"
              disabled={isLoading}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto px-6 py-2 rounded-lg font-medium text-white transition-all duration-200 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Tracking..." : "Track"}
            </button>
          </div>
        </form>
      </div>

      {orderData && (
        <div className="p-6 border-t border-gray-200/50">
          {/* Order Header */}
          <div className="bg-blue-50/50 px-6 py-5 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">Order #{invoiceId}</h2>
                  <div
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      orderData.tracking.currentStatus.toLowerCase() === "delivered"
                        ? "bg-green-100 text-green-800"
                        : orderData.tracking.currentStatus.toLowerCase() === "shipped"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {orderData.tracking.currentStatus.charAt(0).toUpperCase() +
                      orderData.tracking.currentStatus.slice(1).toLowerCase()}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Placed {formatDate(orderData.timestamp)}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {orderData.shipping.address.city}, {orderData.shipping.address.country}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-gray-900">${orderData.amount.value}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="py-6">
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute top-3 left-0 w-full h-0.5 bg-gray-200 rounded-full"></div>
              <div
                className="absolute top-3 left-0 h-0.5 bg-blue-500 rounded-full transition-all duration-700"
                style={{
                  width: `${
                    (statusOptions.indexOf(orderData.tracking.currentStatus.toLowerCase()) /
                      (statusOptions.length - 1)) *
                    100
                  }%`,
                }}
              ></div>
              <div className="relative flex justify-between">
                {statusOptions.map((status, index) => {
                  const isCompleted = statusOptions.indexOf(orderData.tracking.currentStatus.toLowerCase()) >= index;
                  const isActive = status === orderData.tracking.currentStatus.toLowerCase();
                  return (
                    <div key={status} className="flex flex-col items-center">
                      <div
                        className={`rounded-full h-5 w-5 flex items-center justify-center mb-2 transition-all duration-300 ${
                          isActive
                            ? "bg-blue-500 ring-4 ring-blue-100 shadow-sm"
                            : isCompleted
                            ? "bg-blue-500"
                            : "bg-gray-200"
                        }`}
                      >
                        {isCompleted && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                        )}
                      </div>
                      <div
                        className={`text-xs font-medium text-center ${isCompleted ? "text-gray-900" : "text-gray-400"}`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center px-4 py-3 rounded-xl text-sm ${
                orderData.tracking.currentStatus.toLowerCase() === "delivered"
                  ? "bg-green-50 text-green-800 border border-green-200/50"
                  : orderData.tracking.currentStatus.toLowerCase() === "shipped"
                  ? "bg-blue-50 text-blue-800 border border-blue-200/50"
                  : "bg-gray-50 text-gray-800 border border-gray-200/50"
              }`}
            >
              {orderData.tracking.currentStatus.toLowerCase() === "shipped" ? (
                <>
                  <Truck className="h-4 w-4 mr-2" />
                  Your package is on the way! Expected delivery in 2-3 business days.
                </>
              ) : orderData.tracking.currentStatus.toLowerCase() === "delivered" ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Your package has been delivered. Thank you for your order!
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  We’re preparing your order. You’ll receive a shipping confirmation soon.
                </>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-8">
            <h3 className="text-base font-medium text-gray-900 mb-4">Order Timeline</h3>
            <div className="space-y-4">
              {orderData.tracking.statusHistory
                .slice()
                .reverse()
                .map((historyItem, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 mt-1.5">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">
                          {historyItem.status.charAt(0).toUpperCase() + historyItem.status.slice(1).toLowerCase()}
                        </p>
                        <time className="text-xs text-gray-500 flex-shrink-0">{formatDate(historyItem.timestamp)}</time>
                      </div>
                      <p className="text-sm text-gray-600">{historyItem.message || "Status updated"}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* <div className="space-y-4 mb-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">Order Timeline</h3>
            {orderData.tracking.statusHistory
              .slice()
              .reverse()
              .map((historyItem, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">
                        {historyItem.status.charAt(0).toUpperCase() + historyItem.status.slice(1).toLowerCase()}
                      </p>
                      <time className="text-xs text-gray-500 flex-shrink-0">{formatDate(historyItem.timestamp)}</time>
                    </div>
                    <p className="text-sm text-gray-600">{historyItem.message || "Status updated"}</p>
                  </div>
                </div>
              ))}
          </div> */}

          {/* Order Items */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-gray-900 mb-4">Items Ordered</h3>
            {orderData.items.map((item, index) => (
              <div key={index} className="flex gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">
                <div className="bg-white rounded-lg p-2 w-16 h-16 flex-shrink-0 overflow-hidden border border-gray-100/50">
                  <img src={item.mainImage} alt={item.name} className="w-full h-full object-cover rounded" />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm leading-5 mb-2 line-clamp-2">{item.name}</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    {Object.entries(item.selectedOptions).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(item.selectedOptions)
                          .slice(0, 2)
                          .map(([key, option]) => (
                            <span key={key} className="bg-white px-2 py-0.5 rounded text-xs border border-gray-200/50">
                              {key}: {option.value}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-gray-900 text-sm">${item.pricing.basePrice.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Support */}
          <div className="mt-6 border-t border-gray-100/50 bg-gray-50/30 px-6 py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                Need help?{" "}
                <a href="mailto:support@cherlygood.com" className="text-blue-600 hover:text-blue-700 font-medium">
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// "use client";

// import { Search, CheckCircle, Truck, Package, Clock, AlertCircle, MapPin } from "lucide-react";
// import { useState } from "react";

// // TypeScript types
// type OrderType = {
//   id: string;
//   timestamp: string;
//   status: string;
//   payer: {
//     email: string;
//     payerId: string;
//     name: {
//       firstName: string;
//       lastName: string;
//     };
//   };
//   amount: {
//     value: string;
//     currency: string;
//   };
//   shipping: {
//     name: string;
//     address: {
//       line1: string;
//       city: string;
//       state: string;
//       postalCode: string;
//       country: string;
//     };
//   };
//   transactionId: string;
//   items: Array<{
//     baseProductId: string;
//     name: string;
//     slug: string;
//     pricing: {
//       basePrice: number;
//       salePrice: number;
//       discountPercentage: number;
//     };
//     mainImage: string;
//     variantId: string;
//     selectedOptions: Record<
//       string,
//       {
//         value: string;
//         optionDisplayOrder: number;
//         groupDisplayOrder: number;
//       }
//     >;
//     index: number;
//     type: "product";
//   }>;
//   invoiceId: string;
//   emails: {
//     confirmed: {
//       sentCount: number;
//       maxAllowed: number;
//       lastSent: string | null;
//     };
//     shipped: {
//       sentCount: number;
//       maxAllowed: number;
//       lastSent: string | null;
//     };
//     delivered: {
//       sentCount: number;
//       maxAllowed: number;
//       lastSent: string | null;
//     };
//   };
//   tracking: {
//     currentStatus: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "COMPLETED";
//     statusHistory: Array<{
//       status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "COMPLETED";
//       timestamp: string;
//       message?: string;
//     }>;
//     trackingNumber?: string;
//     estimatedDeliveryDate?: string;
//     lastUpdated: string;
//   };
// };

// type ShowAlertType = {
//   ERROR: "error";
//   SUCCESS: "success";
//   WARNING: "warning";
// };

// const ShowAlertType: ShowAlertType = {
//   ERROR: "error",
//   SUCCESS: "success",
//   WARNING: "warning",
// };

// const useAlertStore = () => ({
//   showAlert: ({ message, type }: { message: string; type: string }) => {
//     alert(message);
//   },
// });

// export default function OrderTracker() {
//   const [invoiceId, setInvoiceId] = useState<string>("");
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [orderData, setOrderData] = useState<OrderType | null>(null);
//   const { showAlert } = useAlertStore();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!invoiceId.trim()) {
//       showAlert({
//         message: "Please enter an invoice ID",
//         type: ShowAlertType.ERROR,
//       });
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const result = await getOrders({ invoiceIds: [invoiceId.trim()] });
//       console.log("Order data:", result);

//       if (!result || result.length === 0) {
//         setOrderData(null);
//         showAlert({
//           message: "We couldn't find any matching order",
//           type: ShowAlertType.ERROR,
//         });
//       } else {
//         setOrderData(result[0]);
//       }
//     } catch (error) {
//       console.error("Error fetching order:", error);
//       setOrderData(null);
//       showAlert({
//         message: "An error occurred while fetching the order",
//         type: ShowAlertType.ERROR,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const formatDate = (dateString: string): string => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const statusOptions = ["pending", "processing", "shipped", "delivered"];

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4">
//       <div className="max-w-2xl mx-auto">
//         {/* Search Card */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
//           <div className="p-6">
//             <form className="flex flex-col md:flex-row gap-3" onSubmit={handleSubmit}>
//               <div className="flex-grow relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Search className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   type="text"
//                   placeholder="Enter invoice ID (try: 373C572C)"
//                   value={invoiceId}
//                   onChange={(e) => setInvoiceId(e.target.value)}
//                   className="block w-full pl-10 pr-3 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
//                   disabled={isLoading}
//                 />
//               </div>
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="px-6 py-3 rounded-lg font-medium text-white bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
//               >
//                 {isLoading ? "Tracking..." : "Track"}
//               </button>
//             </form>
//           </div>
//         </div>

//         {/* Order Details Card */}
//         {orderData && (
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//             {/* Order Header */}
//             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-100">
//               <div className="flex items-start justify-between">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-3 mb-2">
//                     <h2 className="text-xl font-semibold text-gray-900">Order #{invoiceId}</h2>
//                     <div
//                       className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
//                         orderData.tracking.currentStatus.toLowerCase() === "delivered"
//                           ? "bg-green-100 text-green-800"
//                           : orderData.tracking.currentStatus.toLowerCase() === "shipped"
//                           ? "bg-blue-100 text-blue-800"
//                           : "bg-orange-100 text-orange-800"
//                       }`}
//                     >
//                       {orderData.tracking.currentStatus.charAt(0).toUpperCase() +
//                         orderData.tracking.currentStatus.slice(1).toLowerCase()}
//                     </div>
//                   </div>
//                   <p className="text-sm text-gray-600 mb-1">Placed {formatDate(orderData.timestamp)}</p>
//                   <div className="flex items-center text-sm text-gray-500">
//                     <MapPin className="h-4 w-4 mr-1" />
//                     <span>
//                       {orderData.shipping.address.city}, {orderData.shipping.address.country}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-xl font-semibold text-gray-900">${orderData.amount.value}</p>
//                   <p className="text-xs text-gray-500">Total</p>
//                 </div>
//               </div>
//             </div>

//             <div className="p-6">
//               {/* Progress Tracker */}
//               <div className="mb-8">
//                 <div className="relative">
//                   <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200"></div>
//                   <div
//                     className="absolute top-4 left-0 h-0.5 bg-blue-500 transition-all duration-700"
//                     style={{
//                       width: `${
//                         (statusOptions.indexOf(orderData.tracking.currentStatus.toLowerCase()) /
//                           (statusOptions.length - 1)) *
//                         100
//                       }%`,
//                     }}
//                   ></div>
//                   <div className="relative flex justify-between">
//                     {statusOptions.map((status, index) => {
//                       const isCompleted =
//                         statusOptions.indexOf(orderData.tracking.currentStatus.toLowerCase()) >= index;
//                       const isActive = status === orderData.tracking.currentStatus.toLowerCase();
//                       return (
//                         <div key={status} className="flex flex-col items-center">
//                           <div
//                             className={`rounded-full h-8 w-8 flex items-center justify-center mb-2 transition-all duration-300 ${
//                               isActive
//                                 ? "bg-blue-500 ring-4 ring-blue-100 shadow-lg"
//                                 : isCompleted
//                                 ? "bg-blue-500 shadow-sm"
//                                 : "bg-gray-200"
//                             }`}
//                           >
//                             {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
//                           </div>
//                           <div
//                             className={`text-xs font-medium text-center ${
//                               isCompleted ? "text-gray-900" : "text-gray-400"
//                             }`}
//                           >
//                             {status.charAt(0).toUpperCase() + status.slice(1)}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>

//               {/* Status Message */}
//               <div className="text-center mb-8">
//                 <div
//                   className={`inline-flex items-center px-4 py-3 rounded-xl text-sm font-medium ${
//                     orderData.tracking.currentStatus.toLowerCase() === "delivered"
//                       ? "bg-green-50 text-green-800 border border-green-200"
//                       : orderData.tracking.currentStatus.toLowerCase() === "shipped"
//                       ? "bg-blue-50 text-blue-800 border border-blue-200"
//                       : "bg-orange-50 text-orange-800 border border-orange-200"
//                   }`}
//                 >
//                   {orderData.tracking.currentStatus.toLowerCase() === "shipped" ? (
//                     <>
//                       <Truck className="h-4 w-4 mr-2" />
//                       Your package is on the way! Expected delivery in 2-3 business days.
//                     </>
//                   ) : orderData.tracking.currentStatus.toLowerCase() === "delivered" ? (
//                     <>
//                       <CheckCircle className="h-4 w-4 mr-2" />
//                       Your package has been delivered. Thank you for your order!
//                     </>
//                   ) : (
//                     <>
//                       <Package className="h-4 w-4 mr-2" />
//                       We're preparing your order. You'll receive a shipping confirmation soon.
//                     </>
//                   )}
//                 </div>
//               </div>

//               {/* Timeline */}
//               <div className="mb-8">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h3>
//                 <div className="space-y-4">
//                   {orderData.tracking.statusHistory
//                     .slice()
//                     .reverse()
//                     .map((historyItem, index) => (
//                       <div key={index} className="flex gap-3">
//                         <div className="flex-shrink-0 mt-1.5">
//                           <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center justify-between mb-1">
//                             <p className="text-sm font-medium text-gray-900">
//                               {historyItem.status.charAt(0).toUpperCase() + historyItem.status.slice(1).toLowerCase()}
//                             </p>
//                             <time className="text-xs text-gray-500 flex-shrink-0">
//                               {formatDate(historyItem.timestamp)}
//                             </time>
//                           </div>
//                           <p className="text-sm text-gray-600">{historyItem.message || "Status updated"}</p>
//                         </div>
//                       </div>
//                     ))}
//                 </div>
//               </div>

//               {/* Order Items */}
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Ordered</h3>
//                 <div className="space-y-3">
//                   {orderData.items.map((item, index) => (
//                     <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
//                       <div className="bg-white rounded-lg p-2 w-16 h-16 flex-shrink-0 overflow-hidden border border-gray-200">
//                         <img
//                           src={item.mainImage}
//                           alt={item.name}
//                           className="w-full h-full object-cover rounded-md"
//                           onError={(e) => {
//                             const target = e.target as HTMLImageElement;
//                             target.src =
//                               "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAyNEg0MFY0MEgyNFYyNFoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+";
//                           }}
//                         />
//                       </div>
//                       <div className="flex-grow min-w-0">
//                         <h4 className="font-medium text-gray-900 text-sm leading-5 mb-2 line-clamp-2">{item.name}</h4>
//                         <div className="text-xs text-gray-600 space-y-1">
//                           <p>Qty: 1</p>
//                           {Object.entries(item.selectedOptions).length > 0 && (
//                             <div className="flex flex-wrap gap-1">
//                               {Object.entries(item.selectedOptions)
//                                 .slice(0, 2)
//                                 .map(([key, option]) => (
//                                   <span
//                                     key={key}
//                                     className="bg-white px-2 py-0.5 rounded-md text-xs border border-gray-200"
//                                   >
//                                     {key}: {option.value}
//                                   </span>
//                                 ))}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                       <div className="text-right flex-shrink-0">
//                         <p className="font-semibold text-gray-900 text-sm">${item.pricing.basePrice.toFixed(2)}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Support */}
//               <div className="border-t border-gray-100 pt-6">
//                 <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
//                   <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
//                   <p className="text-sm text-blue-800">
//                     Need help?{" "}
//                     <a href="mailto:support@cherlygood.com" className="font-medium hover:underline">
//                       Contact Support
//                     </a>
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
