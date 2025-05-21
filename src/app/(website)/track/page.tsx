// import { NavbarWrapper } from "@/components/website/Navbar/NavbarWrapper";
// import { Search } from "lucide-react";
// import Link from "next/link";

// export default function TrackOrder() {
//   return (
//     <>
//       <NavbarWrapper />
//       <main className="bg-neutral-50 pt-[61px] md:pt-[57px] min-h-[calc(100vh-57px)]">
//         <div className="max-w-3xl mx-auto pt-16 pb-24 px-6">
//           <div className="text-center mb-16">
//             <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Track Your Order</h1>
//             <p className="text-gray max-w-lg mx-auto text-base md:text-lg">
//               Enter your order number to check the current status and estimated delivery date.
//             </p>
//           </div>
//           <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden mb-14">
//             <div className="p-6 md:p-8">
//               <div className="flex flex-col md:flex-row gap-3">
//                 <div className="flex-grow relative">
//                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                     <Search className="h-4 w-4 text-gray-400" />
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Enter order number"
//                     className="block w-full pl-10 pr-4 py-3 bg-white border rounded-lg focus:border-[#c8cdd4] transition-all duration-200"
//                   />
//                 </div>
//                 <div>
//                   <button className="w-full md:w-auto px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 bg-blue-500 hover:bg-blue-600">
//                     Track
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* FAQ section - more Apple-like with cleaner accordions */}
//           <div className="max-w-2xl mx-auto mt-16">
//             <h2 className="text-xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>

//             <div className="space-y-3">
//               <div className="bg-white rounded-xl border border-gray-200/70 overflow-hidden">
//                 <h3 className="font-medium p-4 border-b border-gray-200/70">Where's my order?</h3>
//                 <div className="p-4 text-gray-600 text-sm leading-relaxed">
//                   <p>
//                     Once your order ships, you'll receive a shipping confirmation email with your tracking number. You
//                     can also find your tracking information by entering your order number on this page.
//                   </p>
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl border border-gray-200/70 overflow-hidden">
//                 <h3 className="font-medium p-4 border-b border-gray-200/70">How long will my order take to arrive?</h3>
//                 <div className="p-4 text-gray-600 text-sm leading-relaxed">
//                   <p>
//                     Standard shipping typically takes 3-7 business days. Express shipping takes 1-3 business days.
//                     International orders may take 10-14 business days.
//                   </p>
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl border border-gray-200/70 overflow-hidden">
//                 <h3 className="font-medium p-4 border-b border-gray-200/70">
//                   What if my package is damaged or missing items?
//                 </h3>
//                 <div className="p-4 text-gray-600 text-sm leading-relaxed">
//                   <p>
//                     Please contact our customer service team within 48 hours of delivery. We'll help resolve the issue
//                     as quickly as possible.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//       <Footer />
//     </>
//   );
// }

// function Footer() {
//   return (
//     <footer className="w-full py-8 border-t bg-neutral-50">
//       <div className="max-w-6xl mx-auto px-6">
//         <div className="flex flex-col items-center mb-8">
//           <nav className="flex flex-wrap justify-center mb-10">
//             <Link href="/about" className="px-4 py-2 text-sm text-gray hover:text-black transition-colors">
//               About Us
//             </Link>
//             <Link href="/contact" className="px-4 py-2 text-sm text-gray hover:text-black transition-colors">
//               Contact
//             </Link>
//             <Link href="/faq" className="px-4 py-2 text-sm text-gray hover:text-black transition-colors">
//               FAQs
//             </Link>
//             <Link href="/privacy" className="px-4 py-2 text-sm text-gray hover:text-black transition-colors">
//               Privacy
//             </Link>
//             <Link href="/terms" className="px-4 py-2 text-sm text-gray hover:text-black transition-colors">
//               Terms
//             </Link>
//             <Link href="/returns" className="px-4 py-2 text-sm text-gray hover:text-black transition-colors">
//               Returns
//             </Link>
//             <Link href="/track" className="px-4 py-2 text-sm text-gray hover:text-black transition-colors">
//               Track Order
//             </Link>
//           </nav>
//           <div className="w-full max-w-md mb-10 rounded-xl p-6 bg-blue-600/5 border border-blue-100/65">
//             <div className="text-center mb-4">
//               <h3 className="font-semibold text-lg mb-1.5">Get the latest releases and special offers</h3>
//               <p className="text-black text-sm">Be first in line for the good stuff</p>
//             </div>
//             <div className="w-full max-w-md flex justify-center">
//               <div className="relative h-11 w-[290px]">
//                 <button className="peer w-[104px] h-[40px] absolute left-[184px] top-1/2 -translate-y-1/2 rounded font-semibold text-white">
//                   Subscribe
//                 </button>
//                 <div className="peer-hover:bg-[#cc8100] peer-hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] peer-active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] w-full h-full p-[2px] rounded-lg shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000]">
//                   <input className="w-[180px] h-[40px] px-3 rounded-md" type="text" placeholder="Enter your email" />
//                 </div>
//               </div>
//             </div>
//             <div className="mt-2 text-xs text-gray/90 text-center">You can unsubscribe any time</div>
//           </div>
//         </div>
//         <div className="flex justify-center text-xs text-gray">
//           <p>© {new Date().getFullYear()} Cherlygood. All rights reserved.</p>
//         </div>
//       </div>
//     </footer>
//   );
// }

// import { useState } from "react";
// import { Package, Truck, CheckCircle, AlertCircle, Clock, Search } from "lucide-react";

// export default function TrackOrder() {
//   const [orderNumber, setOrderNumber] = useState("");
//   const [isTracking, setIsTracking] = useState(false);
//   const [orderFound, setOrderFound] = useState(false);

//   // This function would handle the actual tracking in a real implementation
//   const handleTrackOrder = () => {
//     if (orderNumber.trim() === "") return;
//     setIsTracking(true);

//     // Simulate finding an order after a delay
//     setTimeout(() => {
//       setIsTracking(false);
//       setOrderFound(true);
//     }, 1000);
//   };

//   return (
//     <div className="bg-gray-50 min-h-screen font-sans">
//       {/* Header section */}
//       <div className="max-w-6xl mx-auto pt-8 pb-20 px-4">
//         <div className="text-center mb-12">
//           <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Track Your Order</h1>
//           <p className="text-gray-600 max-w-xl mx-auto">Enter your order number to check the current status and estimated delivery date of your package.</p>
//         </div>

//         {/* Track order form */}
//         <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden mb-8">
//           <div className="p-6 md:p-8">
//             <div className="flex flex-col md:flex-row gap-4">
//               <div className="flex-grow relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Search className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   type="text"
//                   value={orderNumber}
//                   onChange={(e) => setOrderNumber(e.target.value)}
//                   placeholder="Enter your order number (e.g., 21769B81)"
//                   className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all duration-200"
//                 />
//               </div>
//               <div>
//                 <button
//                   onClick={handleTrackOrder}
//                   disabled={isTracking || orderNumber.trim() === ""}
//                   className={`w-full md:w-auto px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 ${
//                     isTracking || orderNumber.trim() === "" ? "bg-amber-400 cursor-not-allowed" : "bg-amber-500 hover:bg-amber-600"
//                   }`}
//                 >
//                   {isTracking ? "Tracking..." : "Track Order"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Order details - shown after tracking */}
//         {orderFound && (
//           <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
//             <div className="border-b border-gray-100 bg-amber-50 px-6 py-4">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h2 className="font-semibold text-gray-900">Order #21769B81</h2>
//                   <p className="text-sm text-gray-600">Placed on May 15, 2025</p>
//                 </div>
//                 <div>
//                   <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">Shipped</span>
//                 </div>
//               </div>
//             </div>

//             {/* Order status timeline */}
//             <div className="p-6">
//               <h3 className="text-lg font-medium text-gray-900 mb-6">Tracking Information</h3>

//               <div className="relative">
//                 {/* Progress line */}
//                 <div className="absolute left-6 top-0 h-full w-0.5 bg-gray-200 z-0"></div>

//                 {/* Status steps */}
//                 <div className="space-y-8 relative z-10">
//                   {/* Completed: Order confirmed */}
//                   <div className="flex gap-4">
//                     <div className="mt-0.5 bg-green-500 rounded-full p-1.5 ring-4 ring-green-50">
//                       <CheckCircle className="h-4 w-4 text-white" />
//                     </div>
//                     <div>
//                       <h4 className="font-medium text-gray-900">Order Confirmed</h4>
//                       <time className="block text-sm text-gray-500 mb-1">May 15, 2025 at 10:32 AM</time>
//                       <p className="text-sm text-gray-600">Your order has been received and confirmed.</p>
//                     </div>
//                   </div>

//                   {/* Completed: Processing */}
//                   <div className="flex gap-4">
//                     <div className="mt-0.5 bg-green-500 rounded-full p-1.5 ring-4 ring-green-50">
//                       <CheckCircle className="h-4 w-4 text-white" />
//                     </div>
//                     <div>
//                       <h4 className="font-medium text-gray-900">Processing</h4>
//                       <time className="block text-sm text-gray-500 mb-1">May 16, 2025 at 2:15 PM</time>
//                       <p className="text-sm text-gray-600">Your order is being prepared for shipping.</p>
//                     </div>
//                   </div>

//                   {/* Active: Shipped */}
//                   <div className="flex gap-4">
//                     <div className="mt-0.5 bg-blue-500 rounded-full p-1.5 ring-4 ring-blue-50">
//                       <Truck className="h-4 w-4 text-white" />
//                     </div>
//                     <div>
//                       <h4 className="font-medium text-gray-900">Shipped</h4>
//                       <time className="block text-sm text-gray-500 mb-1">May 18, 2025 at 9:47 AM</time>
//                       <p className="text-sm text-gray-600">Your package is on the way with Express Courier.</p>
//                       <div className="mt-3 bg-blue-50 rounded-lg p-3">
//                         <p className="text-sm text-blue-800 flex items-center">
//                           <Clock className="h-4 w-4 mr-2" />
//                           Expected delivery: May 22, 2025
//                         </p>
//                         <p className="text-sm text-blue-800 mt-1">
//                           Tracking number: <span className="font-medium">EC781235498US</span>
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Pending: Out for delivery */}
//                   <div className="flex gap-4">
//                     <div className="mt-0.5 bg-gray-200 rounded-full p-1.5">
//                       <Package className="h-4 w-4 text-gray-400" />
//                     </div>
//                     <div>
//                       <h4 className="font-medium text-gray-400">Out for Delivery</h4>
//                       <p className="text-sm text-gray-400">Your package will be delivered to your address.</p>
//                     </div>
//                   </div>

//                   {/* Pending: Delivered */}
//                   <div className="flex gap-4">
//                     <div className="mt-0.5 bg-gray-200 rounded-full p-1.5">
//                       <CheckCircle className="h-4 w-4 text-gray-400" />
//                     </div>
//                     <div>
//                       <h4 className="font-medium text-gray-400">Delivered</h4>
//                       <p className="text-sm text-gray-400">Your package will be delivered to your doorstep.</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Order items */}
//             <div className="border-t border-gray-100 px-6 py-6">
//               <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>

//               <div className="space-y-4">
//                 <div className="flex items-center gap-4">
//                   <div className="bg-gray-100 rounded-md w-16 h-16 flex-shrink-0"></div>
//                   <div className="flex-grow">
//                     <h4 className="font-medium text-gray-900">Modern Ceramic Vase</h4>
//                     <p className="text-sm text-gray-600">Quantity: 1</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-medium text-gray-900">$45.99</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-4">
//                   <div className="bg-gray-100 rounded-md w-16 h-16 flex-shrink-0"></div>
//                   <div className="flex-grow">
//                     <h4 className="font-medium text-gray-900">Bamboo Kitchen Utensils Set</h4>
//                     <p className="text-sm text-gray-600">Quantity: 2</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-medium text-gray-900">$32.50</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-6 pt-4 border-t border-gray-100">
//                 <div className="flex justify-between mb-2">
//                   <p className="text-gray-600">Subtotal</p>
//                   <p className="font-medium text-gray-900">$78.49</p>
//                 </div>
//                 <div className="flex justify-between mb-2">
//                   <p className="text-gray-600">Shipping</p>
//                   <p className="font-medium text-gray-900">$5.99</p>
//                 </div>
//                 <div className="flex justify-between font-medium">
//                   <p className="text-gray-900">Total</p>
//                   <p className="text-gray-900">$84.48</p>
//                 </div>
//               </div>
//             </div>

//             {/* Help section */}
//             <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
//               <div className="flex items-start gap-3">
//                 <div className="mt-0.5">
//                   <AlertCircle className="h-5 w-5 text-amber-500" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">
//                     Need help with your order? <a href="#" className="text-amber-600 hover:text-amber-700 font-medium">Contact our support team</a> or email us at support@cherlygood.com
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* FAQ section */}
//         <div className="max-w-3xl mx-auto mt-16">
//           <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>

//           <div className="space-y-4">
//             <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//               <h3 className="font-medium p-5 border-b border-gray-100">Where's my order?</h3>
//               <div className="p-5">
//                 <p className="text-gray-600">Once your order ships, you'll receive a shipping confirmation email with your tracking number. You can also find your tracking information by entering your order number on this page.</p>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//               <h3 className="font-medium p-5 border-b border-gray-100">How long will my order take to arrive?</h3>
//               <div className="p-5">
//                 <p className="text-gray-600">Standard shipping typically takes 3-7 business days. Express shipping takes 1-3 business days. International orders may take 10-14 business days.</p>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//               <h3 className="font-medium p-5 border-b border-gray-100">What if my package is damaged or missing items?</h3>
//               <div className="p-5">
//                 <p className="text-gray-600">Please contact our customer service team within 48 hours of delivery. We'll help resolve the issue as quickly as possible.</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { NavbarWrapper } from "@/components/website/Navbar/NavbarWrapper";
import { Search } from "lucide-react";
import Link from "next/link";
import OrderTrackingGuide from "./OrderTrackingGuide";

export default function TrackOrder() {
  return (
    <>
      <NavbarWrapper />
      <main className="bg-neutral-50 pt-[61px] md:pt-[57px] min-h-[calc(100vh-57px)]">
        <div className="max-w-3xl mx-auto pt-16 pb-24 px-6">
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Track Your Order</h1>
            <p className="text-gray max-w-lg mx-auto text-base md:text-lg">
              Enter your order number to check the current status and estimated delivery date.
            </p>
          </div>
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden mb-14">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-grow relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter order number"
                    className="block w-full pl-10 pr-4 py-3 bg-white border rounded-lg focus:border-[#c8cdd4] transition-all duration-200"
                  />
                </div>
                <div>
                  <button className="w-full md:w-auto px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 bg-blue-500 hover:bg-blue-600">
                    Track
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Order Tracking Guide - collapsed by default */}
          <OrderTrackingGuide />

          {/* FAQ section - more Apple-like with cleaner accordions */}
          <div className="max-w-2xl mx-auto mt-16">
            <h2 className="text-xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>

            <div className="space-y-3">
              <div className="bg-white rounded-xl border border-gray-200/70 overflow-hidden">
                <h3 className="font-medium p-4 border-b border-gray-200/70">Where's my order?</h3>
                <div className="p-4 text-gray-600 text-sm leading-relaxed">
                  <p>
                    Once your order ships, you'll receive a shipping confirmation email with your tracking number. You
                    can also find your tracking information by entering your order number on this page.
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
