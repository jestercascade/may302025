// import { NavbarWrapper } from "@/components/website/Navbar/NavbarWrapper";
// import { Search } from "lucide-react";
// import Link from "next/link";

// export default function TrackOrder() {
//   return (
//     <>
//       <NavbarWrapper />
//       <main className="pt-[61px] md:pt-[57px] min-h-[calc(100vh-328px)]">
//         <div className="min-h-screen">
//           {/* Header section */}
//           <div className="max-w-6xl mx-auto pt-14 pb-20 px-4">
//             <div className="text-center mb-12">
//               <h1 className="text-3xl md:text-4xl font-bold mb-4">Track Your Order</h1>
//               <p className="text-gray max-w-xl mx-auto">
//                 Enter your order number to check the current status and estimated delivery date of your package.
//               </p>
//             </div>

//             {/* Track order form */}
//             <div className="max-w-2xl mx-auto bg-neutral-100 rounded-xl shadow-sm overflow-hidden mb-8">
//               <div className="p-6 md:p-8">
//                 <div className="flex flex-col md:flex-row gap-4">
//                   <div className="flex-grow relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <Search className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       type="text"
//                       placeholder="Enter your order number (e.g., 21769B81)"
//                       className="block w-full pl-10 pr-4 py-3 bg-neutral-50 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all duration-200"
//                     />
//                   </div>
//                   <div>
//                     <button className="w-full md:w-auto px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 bg-amber-500 hover:bg-amber-600">
//                       Track Order
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* FAQ section */}
//             <div className="max-w-3xl mx-auto mt-16">
//               <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>

//               <div className="space-y-4">
//                 <div className="bg-white rounded-lg border overflow-hidden">
//                   <h3 className="font-medium p-5 border-b">Where's my order?</h3>
//                   <div className="p-5 bg-neutral-100">
//                     <p className="text-gray">
//                       Once your order ships, you'll receive a shipping confirmation email with your tracking number. You
//                       can also find your tracking information by entering your order number on this page.
//                     </p>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-lg border overflow-hidden">
//                   <h3 className="font-medium p-5 border-b">How long will my order take to arrive?</h3>
//                   <div className="p-5 bg-neutral-100">
//                     <p className="text-gray">
//                       Standard shipping typically takes 3-7 business days. Express shipping takes 1-3 business days.
//                       International orders may take 10-14 business days.
//                     </p>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-lg border overflow-hidden">
//                   <h3 className="font-medium p-5 border-b">
//                     What if my package is damaged or missing items?
//                   </h3>
//                   <div className="p-5 bg-neutral-100">
//                     <p className="text-gray">
//                       Please contact our customer service team within 48 hours of delivery. We'll help resolve the issue
//                       as quickly as possible.
//                     </p>
//                   </div>
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
//     <footer className="w-full pt-6 pb-24 border-t bg-neutral-100">
//       <div className="md:hidden max-w-[486px] px-5 mx-auto">
//         <div className="flex flex-col gap-8">
//           <div>
//             <h4 className="block text-sm mb-3">
//               Subscribe to our newsletter <br /> for exclusive deals and updates
//             </h4>
//             <div className="relative h-11 w-[270px]">
//               <button className="peer w-[104px] h-[40px] absolute left-[164px] top-1/2 -translate-y-1/2 rounded font-semibold text-white">
//                 Subscribe
//               </button>
//               <div className="peer-hover:bg-[#cc8100] peer-hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] peer-active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] w-full h-full p-[2px] rounded-lg shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000]">
//                 <input className="w-40 h-[40px] px-3 rounded-md" type="text" placeholder="Enter your email" />
//               </div>
//             </div>
//           </div>
//           <div className="grid grid-cols-2">
//             <div>
//               <h3 className="font-semibold mb-4">Company</h3>
//               <Link href="/about-us" className="block w-max text-sm text-gray mb-2 hover:underline">
//                 About us
//               </Link>
//               <Link href="/privacy-policy" className="block w-max text-sm text-gray mb-2 hover:underline">
//                 Privacy policy
//               </Link>
//               <Link href="/terms-of-use" className="block w-max text-sm text-gray mb-2 hover:underline">
//                 Terms of use
//               </Link>
//             </div>
//             <div>
//               <h3 className="font-semibold mb-4">Get Help</h3>
//               <Link href="/contact-us" className="block w-max text-sm text-gray mb-2 hover:underline">
//                 Contact us
//               </Link>
//               <Link href="/track" className="block w-max text-sm text-gray mb-2 hover:underline">
//                 Track order
//               </Link>
//               <Link href="/returns-and-refunds" className="block w-max text-sm text-gray mb-2 hover:underline">
//                 Returns & refunds
//               </Link>
//               <Link href="/faq" className="block w-max text-sm text-gray mb-2 hover:underline">
//                 FAQs
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="hidden md:block w-full max-w-[1040px] px-9 mx-auto">
//         <div className="flex gap-10">
//           <div className="w-full">
//             <h3 className="font-semibold mb-4">Company</h3>
//             <Link href="/about-us" className="block w-max text-sm text-gray mb-2 hover:underline">
//               About us
//             </Link>
//             <Link href="/privacy-policy" className="block w-max text-sm text-gray mb-2 hover:underline">
//               Privacy policy
//             </Link>
//             <Link href="/terms-of-use" className="block w-max text-sm text-gray mb-2 hover:underline">
//               Terms of use
//             </Link>
//           </div>
//           <div className="w-full">
//             <h3 className="font-semibold mb-4">Get Help</h3>
//             <Link href="/contact-us" className="block w-max text-sm text-gray mb-2 hover:underline">
//               Contact us
//             </Link>
//             <Link href="/track" className="block w-max text-sm text-gray mb-2 hover:underline">
//               Track order
//             </Link>
//             <Link href="/returns-and-refunds" className="block w-max text-sm text-gray mb-2 hover:underline">
//               Returns & refunds
//             </Link>
//             <Link href="/faq" className="block w-max text-sm text-gray mb-2 hover:underline">
//               FAQs
//             </Link>
//           </div>
//           <div className="min-w-[270px]">
//             <h4 className="block text-sm mb-3">
//               Subscribe to our newsletter <br /> for exclusive deals and updates
//             </h4>
//             <div className="relative h-11 w-[270px]">
//               <button className="peer w-[104px] h-[40px] absolute left-[164px] top-1/2 -translate-y-1/2 rounded font-semibold text-white">
//                 Subscribe
//               </button>
//               <div className="peer-hover:bg-[#cc8100] peer-hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] peer-active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] w-full h-full p-[2px] rounded-lg shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000]">
//                 <input className="w-40 h-[40px] px-3 rounded-md" type="text" placeholder="Enter your email" />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }

import { NavbarWrapper } from "@/components/website/Navbar/NavbarWrapper";
import { Search } from "lucide-react";
import Link from "next/link";

export default function TrackOrder() {
  return (
    <>
      <NavbarWrapper />
      <main className="bg-neutral-50 pt-[61px] md:pt-[57px] min-h-[calc(100vh-57px)]">
        {/* Header section with more whitespace and refined typography */}
        <div className="max-w-3xl mx-auto pt-16 pb-24 px-6">
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Track Your Order</h1>
            <p className="text-gray max-w-lg mx-auto text-base md:text-lg">
              Enter your order number to check the current status and estimated delivery date.
            </p>
          </div>

          {/* Track order form - cleaner with more subtle shadows */}
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
                    className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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

// function Footer() {
//   return (
//     <footer className="w-full py-12 border-t border-gray-200 bg-white">
//       <div className="max-w-5xl mx-auto px-6">
//         <div className="flex flex-col md:flex-row justify-between gap-12">
//           <div className="md:w-1/3">
//             <h3 className="text-sm font-semibold text-gray-900 mb-6">Stay Updated</h3>
//             <p className="text-sm text-gray-500 mb-4">Subscribe to our newsletter for exclusive deals and updates.</p>
//             <div className="flex">
//               <input
//                 className="flex-grow max-w-xs px-4 py-2 text-sm border border-gray-200 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                 type="email"
//                 placeholder="Enter your email"
//               />
//               <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-r-lg hover:bg-blue-600 transition-colors">
//                 Subscribe
//               </button>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-2 gap-8 md:w-2/3">
//             <div>
//               <h3 className="text-sm font-semibold text-gray-900 mb-6">Company</h3>
//               <ul className="space-y-3">
//                 <li>
//                   <Link href="/about-us" className="text-sm text-gray-500 hover:text-blue-500 transition-colors">
//                     About Us
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="/privacy-policy" className="text-sm text-gray-500 hover:text-blue-500 transition-colors">
//                     Privacy Policy
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="/terms-of-use" className="text-sm text-gray-500 hover:text-blue-500 transition-colors">
//                     Terms of Use
//                   </Link>
//                 </li>
//               </ul>
//             </div>

//             <div>
//               <h3 className="text-sm font-semibold text-gray-900 mb-6">Support</h3>
//               <ul className="space-y-3">
//                 <li>
//                   <Link href="/contact-us" className="text-sm text-gray-500 hover:text-blue-500 transition-colors">
//                     Contact Us
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="/track" className="text-sm text-gray-500 hover:text-blue-500 transition-colors">
//                     Track Order
//                   </Link>
//                 </li>
//                 <li>
//                   <Link
//                     href="/returns-and-refunds"
//                     className="text-sm text-gray-500 hover:text-blue-500 transition-colors"
//                   >
//                     Returns & Refunds
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="/faq" className="text-sm text-gray-500 hover:text-blue-500 transition-colors">
//                     FAQs
//                   </Link>
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </div>

//         <div className="mt-12 pt-8 border-t border-gray-100">
//           <p className="text-xs text-gray-400 text-center">
//             © {new Date().getFullYear()} Your Company. All rights reserved.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// }
