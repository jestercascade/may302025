// "use client";

// import { isGifImage, isValidRemoteImage } from "@/lib/utils/common";
// import { useState, useEffect } from "react";
// import { Spinner } from "@/ui/Spinners/Default";
// import { useOverlayStore } from "@/zustand/admin/overlayStore";
// import { ArrowLeft, X, Image as ImageIcon, Eye, EyeOff } from "lucide-react";
// import Overlay from "@/ui/Overlay";
// import { UpdatePageHeroAction } from "@/actions/page-hero";
// import Image from "next/image";
// import clsx from "clsx";
// import { ShowAlertType } from "@/lib/sharedTypes";
// import { useBodyOverflowStore } from "@/zustand/shared/bodyOverflowStore";
// import { useAlertStore } from "@/zustand/shared/alertStore";

// // TypeScript interface for Hero section
// export interface HeroSection {
//   id: string;

//   // Content fields
//   overline?: string; // "WHEN YOUR MOTHER-IN-LAW VISITS..."
//   hook: string; // "PROVE YOURSELF" - main headline
//   sell?: string; // "She raised the man you love. Now show her he chose wisely..."

//   // Main visual content
//   mainImage: {
//     url: string;
//     alt: string;
//   };

//   // Action configuration
//   item_type: "PRODUCT" | "LINK";
//   product_id?: string; // For PRODUCT type - product identifier
//   link_url?: string; // For LINK type - absolute URL
//   cta_text: "GET YOURS" | "SHOP NOW" | "CLAIM NOW";

//   // Styling
//   background_color?: string;
//   text_color?: string;

//   // Metadata
//   visibility: "VISIBLE" | "HIDDEN";
//   created_at: Date;
//   updated_at: Date;
// }

// // Firestore document structure (JSON serializable)
// export interface HeroSectionDoc {
//   id: string;
//   overline?: string;
//   hook: string;
//   sell?: string;
//   mainImage: {
//     url: string;
//     alt: string;
//   };
//   item_type: "PRODUCT" | "LINK";
//   product_id?: string;
//   link_url?: string;
//   cta_text: "GET YOURS" | "SHOP NOW" | "CLAIM NOW";
//   background_color?: string;
//   text_color?: string;
//   visibility: "VISIBLE" | "HIDDEN";
//   created_at: string; // ISO string for Firestore
//   updated_at: string; // ISO string for Firestore
// }

// export function PageHeroButton({ visibility }: { visibility: string }) {
//   const HIDDEN = "HIDDEN";
//   const VISIBLE = "VISIBLE";

//   const showOverlay = useOverlayStore((state) => state.showOverlay);
//   const pageName = useOverlayStore((state) => state.pages.storefront.name);
//   const overlayName = useOverlayStore((state) => state.pages.storefront.overlays.editPageHero.name);

//   return (
//     <button
//       onClick={() => showOverlay({ pageName, overlayName })}
//       className="group flex flex-col w-full min-[560px]:w-[calc(100%/2-4px)] min-[824px]:w-64 rounded-2xl p-4 relative cursor-pointer bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-sm transition-all duration-200 hover:shadow-lg hover:bg-white hover:border-gray-300/80 active:scale-[0.98]"
//     >
//       <div className="w-full mb-3 flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           {visibility === VISIBLE ? (
//             <Eye size={14} className="text-blue-500" />
//           ) : (
//             <EyeOff size={14} className="text-gray-400" />
//           )}
//           <h2 className="text-left font-medium text-sm text-gray-900">Page Hero</h2>
//         </div>
//         <div
//           className={clsx("w-8 h-[18px] rounded-full relative transition-all duration-300", {
//             "bg-gray-200": visibility === HIDDEN,
//             "bg-blue-500": visibility === VISIBLE,
//           })}
//         >
//           <div
//             className={clsx("w-[14px] h-[14px] rounded-full transition-all duration-300 absolute top-[2px] shadow-sm", {
//               "left-[2px] bg-white": visibility === HIDDEN,
//               "left-[18px] bg-white": visibility === VISIBLE,
//             })}
//           />
//         </div>
//       </div>
//       <p className="text-left text-gray-500 text-xs leading-relaxed">
//         Create compelling hero sections with overlines, hooks, and powerful calls-to-action.
//       </p>
//     </button>
//   );
// }

// export function PageHeroOverlay({ pageHero }: { pageHero: Partial<HeroSection> }) {
//   const HIDDEN = "HIDDEN";
//   const VISIBLE = "VISIBLE";

//   const [loading, setLoading] = useState(false);
//   const [overline, setOverline] = useState<string>(pageHero.overline || "");
//   const [hook, setHook] = useState<string>(pageHero.hook || "");
//   const [sell, setSell] = useState<string>(pageHero.sell || "");
//   const [mainImageUrl, setMainImageUrl] = useState<string>(pageHero.mainImage?.url || "");
//   const [mainImageAlt, setMainImageAlt] = useState<string>(pageHero.mainImage?.alt || "");
//   const [itemType, setItemType] = useState<"PRODUCT" | "LINK">(pageHero.item_type || "PRODUCT");
//   const [productId, setProductId] = useState<string>(pageHero.product_id || "");
//   const [linkUrl, setLinkUrl] = useState<string>(pageHero.link_url || "");
//   const [ctaText, setCtaText] = useState<"GET YOURS" | "SHOP NOW" | "CLAIM NOW">(pageHero.cta_text || "GET YOURS");
//   const [backgroundColor, setBackgroundColor] = useState<string>(pageHero.background_color || "#1e88e5");
//   const [textColor, setTextColor] = useState<string>(pageHero.text_color || "#ffffff");
//   const [visibility, setVisibility] = useState<string>(pageHero.visibility?.toUpperCase() || HIDDEN);

//   const showAlert = useAlertStore((state) => state.showAlert);
//   const hideOverlay = useOverlayStore((state) => state.hideOverlay);
//   const pageName = useOverlayStore((state) => state.pages.storefront.name);
//   const overlayName = useOverlayStore((state) => state.pages.storefront.overlays.editPageHero.name);
//   const isOverlayVisible = useOverlayStore((state) => state.pages.storefront.overlays.editPageHero.isVisible);
//   const setPreventBodyOverflowChange = useBodyOverflowStore((state) => state.setPreventBodyOverflowChange);

//   useEffect(() => {
//     if (isOverlayVisible) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "visible";
//       setPreventBodyOverflowChange(false);
//     }

//     return () => {
//       if (!isOverlayVisible) {
//         document.body.style.overflow = "visible";
//         setPreventBodyOverflowChange(false);
//       }
//     };
//   }, [isOverlayVisible, setPreventBodyOverflowChange]);

//   const handleSave = async () => {
//     setLoading(true);

//     try {
//       if (visibility === VISIBLE) {
//         let errorMessage = "";

//         if (!hook) {
//           errorMessage = "Please enter a hook (main headline)";
//         } else if (!mainImageUrl) {
//           errorMessage = "Please provide the main image URL";
//         } else if (!mainImageAlt) {
//           errorMessage = "Please provide alt text for the image";
//         } else if (itemType === "PRODUCT" && !productId) {
//           errorMessage = "Please enter a product ID for product type";
//         } else if (itemType === "LINK" && !linkUrl) {
//           errorMessage = "Please enter a link URL for link type";
//         }

//         if (errorMessage) {
//           showAlert({
//             message: errorMessage,
//             type: ShowAlertType.ERROR,
//           });
//           setLoading(false);
//           return;
//         }
//       }

//       const heroData: Partial<HeroSection> = {
//         overline: overline || undefined,
//         hook,
//         sell: sell || undefined,
//         mainImage: {
//           url: mainImageUrl,
//           alt: mainImageAlt,
//         },
//         item_type: itemType,
//         product_id: itemType === "PRODUCT" ? productId : undefined,
//         link_url: itemType === "LINK" ? linkUrl : undefined,
//         cta_text: ctaText,
//         background_color: backgroundColor,
//         text_color: textColor,
//         visibility: visibility as "VISIBLE" | "HIDDEN",
//       };

//       // const result = await UpdatePageHeroAction(heroData);
//       // showAlert({
//       //   message: result.message,
//       //   type: result.type,
//       // });
//     } catch {
//       showAlert({
//         message: "Failed to update page hero",
//         type: ShowAlertType.ERROR,
//       });
//     } finally {
//       setLoading(false);
//       setPreventBodyOverflowChange(true);
//     }
//   };

//   const onHideOverlay = () => {
//     setLoading(false);
//     hideOverlay({ pageName, overlayName });
//     // Reset form to original values
//     setOverline(pageHero.overline || "");
//     setHook(pageHero.hook || "");
//     setSell(pageHero.sell || "");
//     setMainImageUrl(pageHero.mainImage?.url || "");
//     setMainImageAlt(pageHero.mainImage?.alt || "");
//     setItemType(pageHero.item_type || "PRODUCT");
//     setProductId(pageHero.product_id || "");
//     setLinkUrl(pageHero.link_url || "");
//     setCtaText(pageHero.cta_text || "GET YOURS");
//     setBackgroundColor(pageHero.background_color || "#1e88e5");
//     setTextColor(pageHero.text_color || "#ffffff");
//     setVisibility(pageHero.visibility?.toUpperCase() || HIDDEN);
//   };

//   return (
//     <>
//       {isOverlayVisible && (
//         <Overlay>
//           <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-3xl overflow-hidden bg-white/95 backdrop-blur-xl md:w-[520px] md:rounded-3xl md:shadow-2xl md:shadow-black/20 md:h-max md:mx-auto md:mt-16 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0 border border-gray-200/50">
//             <div className="w-full h-[calc(100vh-188px)] md:h-auto">
//               {/* Mobile Header */}
//               <div className="md:hidden flex items-center justify-between pt-5 pb-4 px-5 bg-white/80 backdrop-blur-sm border-b border-gray-100">
//                 <h2 className="font-semibold text-lg text-gray-900">Edit Page Hero</h2>
//                 <button
//                   onClick={onHideOverlay}
//                   type="button"
//                   className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 bg-gray-100 hover:bg-gray-200 active:scale-95"
//                 >
//                   <X size={16} className="text-gray-600" strokeWidth={2.5} />
//                 </button>
//               </div>

//               {/* Desktop Header */}
//               <div className="hidden md:flex md:items-center md:justify-between py-4 px-5 bg-white/80 backdrop-blur-sm border-b border-gray-100">
//                 <button
//                   onClick={onHideOverlay}
//                   type="button"
//                   className="h-8 px-3 rounded-full flex items-center gap-2 transition-all duration-200 hover:bg-gray-100 active:scale-95"
//                 >
//                   <ArrowLeft size={16} className="text-blue-500" strokeWidth={2.5} />
//                   <span className="font-medium text-sm text-blue-500">Back</span>
//                 </button>
//                 <button
//                   onClick={handleSave}
//                   disabled={loading}
//                   className={clsx(
//                     "relative h-8 px-4 rounded-full font-medium text-sm transition-all duration-200 shadow-sm",
//                     {
//                       "bg-gray-300 text-gray-500": loading,
//                       "bg-blue-500 text-white hover:bg-blue-600 active:scale-95 shadow-blue-500/25": !loading,
//                     }
//                   )}
//                 >
//                   {loading ? (
//                     <div className="flex gap-2 items-center">
//                       <Spinner color="gray" />
//                       <span>Saving</span>
//                     </div>
//                   ) : (
//                     "Save"
//                   )}
//                 </button>
//               </div>

//               {/* Form Content */}
//               <div className="w-full h-full mt-0 p-5 flex flex-col gap-6 overflow-x-hidden overflow-y-auto">
//                 {/* Visibility Toggle */}
//                 <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-4">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       {visibility === VISIBLE ? (
//                         <Eye size={18} className="text-blue-500" />
//                       ) : (
//                         <EyeOff size={18} className="text-gray-400" />
//                       )}
//                       <div>
//                         <div className="font-medium text-sm text-gray-900">Hero Visibility</div>
//                         <div className="text-xs text-gray-500 mt-0.5">
//                           {visibility === VISIBLE ? "Visible on storefront" : "Hidden from storefront"}
//                         </div>
//                       </div>
//                     </div>
//                     <button
//                       onClick={() => setVisibility((prev) => (prev === VISIBLE ? HIDDEN : VISIBLE))}
//                       className={clsx("w-12 h-7 rounded-full relative transition-all duration-300 shadow-inner", {
//                         "bg-gray-200": visibility === HIDDEN,
//                         "bg-blue-500 shadow-blue-500/30": visibility === VISIBLE,
//                       })}
//                     >
//                       <div
//                         className={clsx(
//                           "w-5 h-5 rounded-full transition-all duration-300 absolute top-1 bg-white shadow-md",
//                           {
//                             "left-1": visibility === HIDDEN,
//                             "left-6": visibility === VISIBLE,
//                           }
//                         )}
//                       />
//                     </button>
//                   </div>
//                 </div>

//                 {/* Content Section */}
//                 <div className="space-y-4">
//                   <h3 className="font-semibold text-sm text-gray-900 mb-3">Content</h3>

//                   {/* Overline */}
//                   <div className="space-y-2">
//                     <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Overline</label>
//                     <input
//                       type="text"
//                       placeholder="WHEN YOUR MOTHER-IN-LAW VISITS..."
//                       value={overline}
//                       onChange={(e) => setOverline(e.target.value)}
//                       className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
//                     />
//                   </div>

//                   {/* Hook */}
//                   <div className="space-y-2">
//                     <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Main Headline *</label>
//                     <input
//                       type="text"
//                       placeholder="PROVE YOURSELF"
//                       value={hook}
//                       onChange={(e) => setHook(e.target.value)}
//                       className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
//                       required
//                     />
//                   </div>

//                   {/* Sell */}
//                   <div className="space-y-2">
//                     <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Supporting Text</label>
//                     <textarea
//                       placeholder="She raised the man you love. Now show her he chose wisely. Turn her doubt into respect."
//                       value={sell}
//                       onChange={(e) => setSell(e.target.value)}
//                       className="w-full h-20 px-3 py-2 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 resize-none"
//                     />
//                   </div>
//                 </div>

//                 {/* Image Section */}
//                 <div className="space-y-4">
//                   <h3 className="font-semibold text-sm text-gray-900">Hero Image</h3>

//                   <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-4 space-y-4">
//                     <div className="w-full border border-gray-200 rounded-xl overflow-hidden bg-white">
//                       <div className="w-full aspect-[2/1] flex items-center justify-center bg-gray-50">
//                         {mainImageUrl && isValidRemoteImage(mainImageUrl) ? (
//                           isGifImage(mainImageUrl) ? (
//                             <Image
//                               src={mainImageUrl}
//                               alt={mainImageAlt || hook}
//                               width={400}
//                               height={200}
//                               priority={true}
//                               unoptimized={true}
//                               className="object-cover w-full h-full"
//                             />
//                           ) : (
//                             <Image
//                               src={mainImageUrl}
//                               alt={mainImageAlt || hook}
//                               width={400}
//                               height={200}
//                               priority={true}
//                               className="object-cover w-full h-full"
//                             />
//                           )
//                         ) : (
//                           <ImageIcon size={32} className="text-gray-300" strokeWidth={1.5} />
//                         )}
//                       </div>
//                       <div className="border-t border-gray-200">
//                         <input
//                           type="text"
//                           placeholder="Paste image URL"
//                           value={mainImageUrl}
//                           onChange={(e) => setMainImageUrl(e.target.value)}
//                           className="h-10 w-full px-3 text-sm text-gray-600 placeholder-gray-400 bg-transparent border-0 focus:outline-none"
//                         />
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Alt Text *</label>
//                       <input
//                         type="text"
//                         placeholder="Professional stainless steel cooking pot with beef stew"
//                         value={mainImageAlt}
//                         onChange={(e) => setMainImageAlt(e.target.value)}
//                         className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
//                         required
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Action Configuration */}
//                 <div className="space-y-4">
//                   <h3 className="font-semibold text-sm text-gray-900">Call to Action</h3>

//                   {/* Item Type */}
//                   <div className="space-y-3">
//                     <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Action Type</label>
//                     <div className="flex gap-2">
//                       <button
//                         type="button"
//                         onClick={() => setItemType("PRODUCT")}
//                         className={clsx(
//                           "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
//                           {
//                             "bg-blue-500 text-white shadow-lg shadow-blue-500/25": itemType === "PRODUCT",
//                             "bg-gray-100 text-gray-600 hover:bg-gray-200": itemType !== "PRODUCT",
//                           }
//                         )}
//                       >
//                         Product
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => setItemType("LINK")}
//                         className={clsx(
//                           "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
//                           {
//                             "bg-blue-500 text-white shadow-lg shadow-blue-500/25": itemType === "LINK",
//                             "bg-gray-100 text-gray-600 hover:bg-gray-200": itemType !== "LINK",
//                           }
//                         )}
//                       >
//                         Link
//                       </button>
//                     </div>
//                   </div>

//                   {/* Dynamic Field */}
//                   {itemType === "PRODUCT" ? (
//                     <div className="space-y-2">
//                       <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Product ID *</label>
//                       <input
//                         type="text"
//                         placeholder="premium-cooking-pot-001"
//                         value={productId}
//                         onChange={(e) => setProductId(e.target.value)}
//                         className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
//                         required
//                       />
//                     </div>
//                   ) : (
//                     <div className="space-y-2">
//                       <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Link URL *</label>
//                       <input
//                         type="url"
//                         placeholder="https://cherlygood.com/collections/summer-cooling-gadgets"
//                         value={linkUrl}
//                         onChange={(e) => setLinkUrl(e.target.value)}
//                         className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
//                         required
//                       />
//                     </div>
//                   )}

//                   {/* CTA Text */}
//                   <div className="space-y-2">
//                     <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Button Text</label>
//                     <select
//                       value={ctaText}
//                       onChange={(e) => setCtaText(e.target.value as "GET YOURS" | "SHOP NOW" | "CLAIM NOW")}
//                       className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
//                     >
//                       <option value="GET YOURS">GET YOURS</option>
//                       <option value="SHOP NOW">SHOP NOW</option>
//                       <option value="CLAIM NOW">CLAIM NOW</option>
//                     </select>
//                   </div>
//                 </div>

//                 {/* Styling */}
//                 <div className="space-y-4">
//                   <h3 className="font-semibold text-sm text-gray-900">Design</h3>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Background</label>
//                       <div className="relative">
//                         <input
//                           type="color"
//                           value={backgroundColor}
//                           onChange={(e) => setBackgroundColor(e.target.value)}
//                           className="w-full h-10 rounded-xl border border-gray-200 bg-white cursor-pointer"
//                         />
//                         <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
//                           {backgroundColor}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Text Color</label>
//                       <div className="relative">
//                         <input
//                           type="color"
//                           value={textColor}
//                           onChange={(e) => setTextColor(e.target.value)}
//                           className="w-full h-10 rounded-xl border border-gray-200 bg-white cursor-pointer"
//                         />
//                         <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
//                           {textColor}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Mobile Save Button */}
//             <div className="md:hidden w-full p-5 bg-white/80 backdrop-blur-sm border-t border-gray-100">
//               <button
//                 onClick={handleSave}
//                 disabled={loading}
//                 className={clsx("relative h-12 w-full rounded-2xl font-medium transition-all duration-200 shadow-lg", {
//                   "bg-gray-300 text-gray-500": loading,
//                   "bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.98] shadow-blue-500/25": !loading,
//                 })}
//               >
//                 {loading ? (
//                   <div className="flex gap-2 items-center justify-center">
//                     <Spinner color="gray" />
//                     <span>Saving</span>
//                   </div>
//                 ) : (
//                   "Save Changes"
//                 )}
//               </button>
//             </div>
//           </div>
//         </Overlay>
//       )}
//     </>
//   );
// }

//--------------------------------------

// "use client";

// import { isGifImage, isValidRemoteImage } from "@/lib/utils/common";
// import { useState, useEffect } from "react";
// import { Spinner } from "@/ui/Spinners/Default";
// import { useOverlayStore } from "@/zustand/admin/overlayStore";
// import { ArrowLeft, X, Image as ImageIcon, ChevronDown } from "lucide-react";
// import Overlay from "@/ui/Overlay";
// import { UpdatePageHeroAction } from "@/actions/page-hero";
// import Image from "next/image";
// import clsx from "clsx";
// import { ShowAlertType } from "@/lib/sharedTypes";
// import { useBodyOverflowStore } from "@/zustand/shared/bodyOverflowStore";
// import { useAlertStore } from "@/zustand/shared/alertStore";

// // TypeScript interface for Hero section
// export interface HeroSection {
//   id: string;

//   // Content fields
//   overline?: string; // "WHEN YOUR MOTHER-IN-LAW VISITS..."
//   hook: string; // "PROVE YOURSELF" - main headline
//   sell?: string; // "She raised the man you love. Now show her he chose wisely..."

//   // Main visual content
//   mainImage: {
//     url: string;
//     alt: string;
//   };

//   // Action configuration
//   item_type: "PRODUCT" | "LINK";
//   product_id?: string; // For PRODUCT type - product identifier
//   link_url?: string; // For LINK type - absolute URL
//   cta_text: "GET YOURS" | "SHOP NOW" | "CLAIM NOW";

//   // Styling
//   background_color?: string;
//   text_color?: string;

//   // Metadata
//   visibility: "VISIBLE" | "HIDDEN";
//   created_at: Date;
//   updated_at: Date;
// }

// // Firestore document structure (JSON serializable)
// export interface HeroSectionDoc {
//   id: string;
//   overline?: string;
//   hook: string;
//   sell?: string;
//   mainImage: {
//     url: string;
//     alt: string;
//   };
//   item_type: "PRODUCT" | "LINK";
//   product_id?: string;
//   link_url?: string;
//   cta_text: "GET YOURS" | "SHOP NOW" | "CLAIM NOW";
//   background_color?: string;
//   text_color?: string;
//   visibility: "VISIBLE" | "HIDDEN";
//   created_at: string; // ISO string for Firestore
//   updated_at: string; // ISO string for Firestore
// }

// export function PageHeroButton({ visibility }: { visibility: string }) {
//   const HIDDEN = "HIDDEN";
//   const VISIBLE = "VISIBLE";

//   const showOverlay = useOverlayStore((state) => state.showOverlay);
//   const pageName = useOverlayStore((state) => state.pages.storefront.name);
//   const overlayName = useOverlayStore((state) => state.pages.storefront.overlays.editPageHero.name);

//   return (
//     <button
//       onClick={() => showOverlay({ pageName, overlayName })}
//       className="group flex flex-col items-start w-full min-[560px]:w-[calc(100%/2-4px)] min-[824px]:w-64 rounded-2xl p-6 relative cursor-pointer border-0 bg-white/90 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] transition-all duration-300 hover:shadow-[0_8px_25px_rgba(0,0,0,0.08),0_3px_10px_rgba(0,0,0,0.1)] hover:scale-[1.02] active:scale-[0.98]"
//     >
//       <div className="w-full mb-5 flex items-center justify-between relative">
//         <h2 className="text-left font-semibold text-[15px] text-gray-900 tracking-[-0.01em]">Page Hero</h2>
//         <div
//           className={clsx(
//             "w-[51px] h-[31px] rounded-full relative cursor-pointer transition-all duration-300 ease-out",
//             {
//               "bg-gray-200/80": visibility === HIDDEN,
//               "bg-blue-500 shadow-[0_2px_8px_rgba(59,130,246,0.3)]": visibility === VISIBLE,
//             }
//           )}
//         >
//           <div
//             className={clsx(
//               "w-[27px] h-[27px] rounded-full transition-all duration-300 ease-out absolute top-[2px] shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]",
//               {
//                 "left-[2px] bg-white": visibility === HIDDEN,
//                 "left-[22px] bg-white": visibility === VISIBLE,
//               }
//             )}
//           ></div>
//         </div>
//       </div>
//       <p className="w-full text-left text-gray-600 text-[13px] leading-[18px] font-normal">
//         Create compelling hero sections with overlines, hooks, and powerful calls-to-action.
//       </p>
//     </button>
//   );
// }

// export function PageHeroOverlay({ pageHero }: { pageHero: Partial<HeroSection> }) {
//   const HIDDEN = "HIDDEN";
//   const VISIBLE = "VISIBLE";

//   const [loading, setLoading] = useState(false);
//   const [overline, setOverline] = useState<string>(pageHero.overline || "");
//   const [hook, setHook] = useState<string>(pageHero.hook || "");
//   const [sell, setSell] = useState<string>(pageHero.sell || "");
//   const [mainImageUrl, setMainImageUrl] = useState<string>(pageHero.mainImage?.url || "");
//   const [mainImageAlt, setMainImageAlt] = useState<string>(pageHero.mainImage?.alt || "");
//   const [itemType, setItemType] = useState<"PRODUCT" | "LINK">(pageHero.item_type || "PRODUCT");
//   const [productId, setProductId] = useState<string>(pageHero.product_id || "");
//   const [linkUrl, setLinkUrl] = useState<string>(pageHero.link_url || "");
//   const [ctaText, setCtaText] = useState<"GET YOURS" | "SHOP NOW" | "CLAIM NOW">(pageHero.cta_text || "GET YOURS");
//   const [backgroundColor, setBackgroundColor] = useState<string>(pageHero.background_color || "#1e88e5");
//   const [textColor, setTextColor] = useState<string>(pageHero.text_color || "#ffffff");
//   const [visibility, setVisibility] = useState<string>(pageHero.visibility?.toUpperCase() || HIDDEN);

//   const showAlert = useAlertStore((state) => state.showAlert);
//   const hideOverlay = useOverlayStore((state) => state.hideOverlay);
//   const pageName = useOverlayStore((state) => state.pages.storefront.name);
//   const overlayName = useOverlayStore((state) => state.pages.storefront.overlays.editPageHero.name);
//   const isOverlayVisible = useOverlayStore((state) => state.pages.storefront.overlays.editPageHero.isVisible);
//   const setPreventBodyOverflowChange = useBodyOverflowStore((state) => state.setPreventBodyOverflowChange);

//   useEffect(() => {
//     if (isOverlayVisible) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "visible";
//       setPreventBodyOverflowChange(false);
//     }

//     return () => {
//       if (!isOverlayVisible) {
//         document.body.style.overflow = "visible";
//         setPreventBodyOverflowChange(false);
//       }
//     };
//   }, [isOverlayVisible, setPreventBodyOverflowChange]);

//   const handleSave = async () => {
//     setLoading(true);

//     try {
//       if (visibility === VISIBLE) {
//         let errorMessage = "";

//         if (!hook) {
//           errorMessage = "Please enter a hook (main headline)";
//         } else if (!mainImageUrl) {
//           errorMessage = "Please provide the main image URL";
//         } else if (!mainImageAlt) {
//           errorMessage = "Please provide alt text for the image";
//         } else if (itemType === "PRODUCT" && !productId) {
//           errorMessage = "Please enter a product ID for product type";
//         } else if (itemType === "LINK" && !linkUrl) {
//           errorMessage = "Please enter a link URL for link type";
//         }

//         if (errorMessage) {
//           showAlert({
//             message: errorMessage,
//             type: ShowAlertType.ERROR,
//           });
//           setLoading(false);
//           return;
//         }
//       }

//       const heroData: Partial<HeroSection> = {
//         overline: overline || undefined,
//         hook,
//         sell: sell || undefined,
//         mainImage: {
//           url: mainImageUrl,
//           alt: mainImageAlt,
//         },
//         item_type: itemType,
//         product_id: itemType === "PRODUCT" ? productId : undefined,
//         link_url: itemType === "LINK" ? linkUrl : undefined,
//         cta_text: ctaText,
//         background_color: backgroundColor,
//         text_color: textColor,
//         visibility: visibility as "VISIBLE" | "HIDDEN",
//       };

//       // const result = await UpdatePageHeroAction(heroData);
//       // showAlert({
//       //   message: result.message,
//       //   type: result.type,
//       // });
//     } catch {
//       showAlert({
//         message: "Failed to update page hero",
//         type: ShowAlertType.ERROR,
//       });
//     } finally {
//       setLoading(false);
//       setPreventBodyOverflowChange(true);
//     }
//   };

//   const onHideOverlay = () => {
//     setLoading(false);
//     hideOverlay({ pageName, overlayName });
//     // Reset form to original values
//     setOverline(pageHero.overline || "");
//     setHook(pageHero.hook || "");
//     setSell(pageHero.sell || "");
//     setMainImageUrl(pageHero.mainImage?.url || "");
//     setMainImageAlt(pageHero.mainImage?.alt || "");
//     setItemType(pageHero.item_type || "PRODUCT");
//     setProductId(pageHero.product_id || "");
//     setLinkUrl(pageHero.link_url || "");
//     setCtaText(pageHero.cta_text || "GET YOURS");
//     setBackgroundColor(pageHero.background_color || "#1e88e5");
//     setTextColor(pageHero.text_color || "#ffffff");
//     setVisibility(pageHero.visibility?.toUpperCase() || HIDDEN);
//   };

//   return (
//     <>
//       {isOverlayVisible && (
//         <Overlay>
//           <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[28px] overflow-hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50 md:w-[680px] md:rounded-3xl md:shadow-[0_20px_60px_rgba(0,0,0,0.1),0_8px_25px_rgba(0,0,0,0.1)] md:h-max md:mx-auto md:mt-16 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0 md:border md:border-gray-200/50">
//             <div className="w-full h-[calc(100vh-188px)] md:h-auto">
//               {/* Mobile Header */}
//               <div className="md:hidden flex items-end justify-center pt-4 pb-3 absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-100">
//                 <div className="relative flex justify-center items-center w-full h-8">
//                   <h2 className="font-semibold text-[17px] text-gray-900 tracking-[-0.02em]">Edit Page Hero</h2>
//                   <button
//                     onClick={onHideOverlay}
//                     type="button"
//                     className="w-8 h-8 rounded-full flex items-center justify-center absolute right-4 transition-all duration-200 ease-out bg-gray-100/80 active:bg-gray-200/80 active:scale-95"
//                   >
//                     <X color="#6b7280" size={18} strokeWidth={2.5} />
//                   </button>
//                 </div>
//               </div>

//               {/* Desktop Header */}
//               <div className="hidden md:flex md:items-center md:justify-between py-4 pr-6 pl-4 border-b border-gray-100">
//                 <button
//                   onClick={onHideOverlay}
//                   type="button"
//                   className="h-10 px-4 rounded-full flex items-center gap-2 transition-all duration-200 ease-out hover:bg-gray-100/80 active:bg-gray-200/80 active:scale-95"
//                 >
//                   <ArrowLeft size={18} strokeWidth={2.5} className="stroke-blue-500" />
//                   <span className="font-semibold text-[15px] text-blue-500 tracking-[-0.01em]">Edit Page Hero</span>
//                 </button>
//                 <button
//                   onClick={handleSave}
//                   disabled={loading}
//                   className={clsx(
//                     "relative h-10 px-6 rounded-full overflow-hidden transition-all duration-200 ease-out text-white font-semibold text-[15px] tracking-[-0.01em] shadow-[0_2px_8px_rgba(0,0,0,0.12)]",
//                     {
//                       "bg-gray-400 cursor-not-allowed": loading,
//                       "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 active:scale-95": !loading,
//                     }
//                   )}
//                 >
//                   {loading ? (
//                     <div className="flex gap-2 items-center justify-center w-full h-full">
//                       <Spinner color="white" />
//                       <span className="text-white">Saving</span>
//                     </div>
//                   ) : (
//                     <span className="text-white">Save</span>
//                   )}
//                 </button>
//               </div>

//               {/* Form Content */}
//               <div className="w-full h-full mt-[60px] md:mt-0 p-6 flex flex-col gap-8 overflow-x-hidden overflow-y-auto">
//                 {/* Visibility */}
//                 <div className="flex flex-col gap-3">
//                   <h3 className="text-[13px] font-semibold text-gray-500 uppercase tracking-[0.5px]">Visibility</h3>
//                   <div className="p-4 w-full rounded-2xl flex items-center justify-between bg-gray-50/80 border border-gray-200/50">
//                     <div className="text-[15px] font-medium text-gray-900 tracking-[-0.01em]">
//                       Show hero on storefront
//                     </div>
//                     <div
//                       onClick={() => setVisibility((prev) => (prev === VISIBLE ? HIDDEN : VISIBLE))}
//                       className={clsx(
//                         "w-[51px] h-[31px] rounded-full relative cursor-pointer transition-all duration-300 ease-out",
//                         {
//                           "bg-gray-300": visibility === HIDDEN,
//                           "bg-blue-500 shadow-[0_2px_8px_rgba(59,130,246,0.3)]": visibility === VISIBLE,
//                         }
//                       )}
//                     >
//                       <div
//                         className={clsx(
//                           "w-[27px] h-[27px] rounded-full transition-all duration-300 ease-out absolute top-[2px] shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]",
//                           {
//                             "left-[2px] bg-white": visibility === HIDDEN,
//                             "left-[22px] bg-white": visibility === VISIBLE,
//                           }
//                         )}
//                       ></div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Content Fields */}
//                 <div className="flex flex-col gap-6">
//                   <h3 className="text-[13px] font-semibold text-gray-500 uppercase tracking-[0.5px]">Content</h3>

//                   {/* Overline */}
//                   <div className="flex flex-col gap-2">
//                     <label htmlFor="overline" className="text-[13px] font-medium text-gray-700">
//                       Overline <span className="text-gray-400 font-normal">(Optional)</span>
//                     </label>
//                     <input
//                       type="text"
//                       name="overline"
//                       placeholder="WHEN YOUR MOTHER-IN-LAW VISITS..."
//                       value={overline}
//                       onChange={(e) => setOverline(e.target.value)}
//                       className="w-full h-11 px-4 rounded-xl border border-gray-200/80 bg-white/50 backdrop-blur-sm text-[15px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
//                     />
//                   </div>

//                   {/* Hook */}
//                   <div className="flex flex-col gap-2">
//                     <label htmlFor="hook" className="text-[13px] font-medium text-gray-700">
//                       Hook <span className="text-red-500">*</span>{" "}
//                       <span className="text-gray-400 font-normal">(Main Headline)</span>
//                     </label>
//                     <input
//                       type="text"
//                       name="hook"
//                       placeholder="PROVE YOURSELF"
//                       value={hook}
//                       onChange={(e) => setHook(e.target.value)}
//                       className="w-full h-11 px-4 rounded-xl border border-gray-200/80 bg-white/50 backdrop-blur-sm text-[15px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
//                       required
//                     />
//                   </div>

//                   {/* Sell */}
//                   <div className="flex flex-col gap-2">
//                     <label htmlFor="sell" className="text-[13px] font-medium text-gray-700">
//                       Sell Text <span className="text-gray-400 font-normal">(Optional)</span>
//                     </label>
//                     <textarea
//                       name="sell"
//                       placeholder="She raised the man you love. Now show her he chose wisely. Turn her doubt into respect."
//                       value={sell}
//                       onChange={(e) => setSell(e.target.value)}
//                       className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200/80 bg-white/50 backdrop-blur-sm text-[15px] placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
//                     />
//                   </div>
//                 </div>

//                 {/* Main Image */}
//                 <div className="flex flex-col gap-3">
//                   <h3 className="text-[13px] font-semibold text-gray-500 uppercase tracking-[0.5px]">Main Image</h3>
//                   <div className="p-5 rounded-2xl border border-gray-200/80 bg-gray-50/30 backdrop-blur-sm flex flex-col gap-4">
//                     <div className="w-full border border-gray-200/80 rounded-xl overflow-hidden bg-white">
//                       <div className="w-full min-h-[220px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
//                         {mainImageUrl && isValidRemoteImage(mainImageUrl) ? (
//                           isGifImage(mainImageUrl) ? (
//                             <Image
//                               src={mainImageUrl}
//                               alt={mainImageAlt || hook}
//                               width={400}
//                               height={220}
//                               priority={true}
//                               unoptimized={true}
//                               className="object-cover w-full h-full"
//                             />
//                           ) : (
//                             <Image
//                               src={mainImageUrl}
//                               alt={mainImageAlt || hook}
//                               width={400}
//                               height={220}
//                               priority={true}
//                               className="object-cover w-full h-full"
//                             />
//                           )
//                         ) : (
//                           <ImageIcon color="#d1d5db" size={48} strokeWidth={1} />
//                         )}
//                       </div>
//                       <div className="w-full h-11 border-t border-gray-200/80 overflow-hidden">
//                         <input
//                           type="text"
//                           name="mainImageUrl"
//                           placeholder="Paste image URL"
//                           value={mainImageUrl}
//                           onChange={(e) => setMainImageUrl(e.target.value)}
//                           className="h-full w-full px-4 text-[14px] text-gray-600 placeholder-gray-400 bg-transparent focus:outline-none"
//                         />
//                       </div>
//                     </div>
//                     <div className="flex flex-col gap-2">
//                       <label htmlFor="mainImageAlt" className="text-[13px] font-medium text-gray-700">
//                         Alt Text <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         name="mainImageAlt"
//                         placeholder="Professional stainless steel cooking pot with beef stew"
//                         value={mainImageAlt}
//                         onChange={(e) => setMainImageAlt(e.target.value)}
//                         className="w-full h-11 px-4 rounded-xl border border-gray-200/80 bg-white/50 backdrop-blur-sm text-[15px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
//                         required
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Action Configuration */}
//                 <div className="flex flex-col gap-6">
//                   <h3 className="text-[13px] font-semibold text-gray-500 uppercase tracking-[0.5px]">
//                     Action Configuration
//                   </h3>

//                   {/* Item Type */}
//                   <div className="flex flex-col gap-3">
//                     <label className="text-[13px] font-medium text-gray-700">Item Type</label>
//                     <div className="flex gap-2">
//                       <button
//                         type="button"
//                         onClick={() => setItemType("PRODUCT")}
//                         className={clsx(
//                           "px-5 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 border",
//                           {
//                             "bg-blue-500 text-white border-blue-500 shadow-[0_2px_8px_rgba(59,130,246,0.25)]":
//                               itemType === "PRODUCT",
//                             "bg-white text-gray-600 border-gray-200/80 hover:bg-gray-50": itemType !== "PRODUCT",
//                           }
//                         )}
//                       >
//                         Product
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => setItemType("LINK")}
//                         className={clsx(
//                           "px-5 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 border",
//                           {
//                             "bg-blue-500 text-white border-blue-500 shadow-[0_2px_8px_rgba(59,130,246,0.25)]":
//                               itemType === "LINK",
//                             "bg-white text-gray-600 border-gray-200/80 hover:bg-gray-50": itemType !== "LINK",
//                           }
//                         )}
//                       >
//                         Link
//                       </button>
//                     </div>
//                   </div>

//                   {/* Product ID or Link URL */}
//                   {itemType === "PRODUCT" ? (
//                     <div className="flex flex-col gap-2">
//                       <label htmlFor="productId" className="text-[13px] font-medium text-gray-700">
//                         Product ID <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         name="productId"
//                         placeholder="premium-cooking-pot-001"
//                         value={productId}
//                         onChange={(e) => setProductId(e.target.value)}
//                         className="w-full h-11 px-4 rounded-xl border border-gray-200/80 bg-white/50 backdrop-blur-sm text-[15px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
//                         required
//                       />
//                     </div>
//                   ) : (
//                     <div className="flex flex-col gap-2">
//                       <label htmlFor="linkUrl" className="text-[13px] font-medium text-gray-700">
//                         Link URL <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="url"
//                         name="linkUrl"
//                         placeholder="https://cherlygood.com/collections/summer-cooling-gadgets"
//                         value={linkUrl}
//                         onChange={(e) => setLinkUrl(e.target.value)}
//                         className="w-full h-11 px-4 rounded-xl border border-gray-200/80 bg-white/50 backdrop-blur-sm text-[15px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
//                         required
//                       />
//                     </div>
//                   )}

//                   {/* CTA Text */}
//                   <div className="flex flex-col gap-2">
//                     <label className="text-[13px] font-medium text-gray-700">CTA Text</label>
//                     <div className="relative">
//                       <select
//                         value={ctaText}
//                         onChange={(e) => setCtaText(e.target.value as "GET YOURS" | "SHOP NOW" | "CLAIM NOW")}
//                         className="w-full h-11 px-4 pr-10 rounded-xl border border-gray-200/80 bg-white/50 backdrop-blur-sm text-[15px] appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
//                       >
//                         <option value="GET YOURS">GET YOURS</option>
//                         <option value="SHOP NOW">SHOP NOW</option>
//                         <option value="CLAIM NOW">CLAIM NOW</option>
//                       </select>
//                       <ChevronDown
//                         className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
//                         size={18}
//                         strokeWidth={2}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Styling */}
//                 <div className="flex flex-col gap-6 pb-6">
//                   <h3 className="text-[13px] font-semibold text-gray-500 uppercase tracking-[0.5px]">Styling</h3>

//                   <div className="grid grid-cols-2 gap-4">
//                     {/* Background Color */}
//                     <div className="flex flex-col gap-2">
//                       <label htmlFor="backgroundColor" className="text-[13px] font-medium text-gray-700">
//                         Background Color
//                       </label>
//                       <div className="relative">
//                         <input
//                           type="color"
//                           name="backgroundColor"
//                           value={backgroundColor}
//                           onChange={(e) => setBackgroundColor(e.target.value)}
//                           className="w-full h-11 rounded-xl border border-gray-200/80 bg-white cursor-pointer"
//                         />
//                         <div
//                           className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow-sm pointer-events-none"
//                           style={{ backgroundColor: backgroundColor }}
//                         ></div>
//                       </div>
//                     </div>

//                     {/* Text Color */}
//                     <div className="flex flex-col gap-2">
//                       <label htmlFor="textColor" className="text-[13px] font-medium text-gray-700">
//                         Text Color
//                       </label>
//                       <div className="relative">
//                         <input
//                           type="color"
//                           name="textColor"
//                           value={textColor}
//                           onChange={(e) => setTextColor(e.target.value)}
//                           className="w-full h-11 rounded-xl border border-gray-200/80 bg-white cursor-pointer"
//                         />
//                         <div
//                           className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow-sm pointer-events-none"
//                           style={{ backgroundColor: textColor }}
//                         ></div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Mobile Save Button */}
//             <div className="md:hidden w-full pb-6 pt-4 px-6 absolute bottom-0 bg-white/95 backdrop-blur-xl border-t border-gray-100">
//               <button
//                 onClick={handleSave}
//                 disabled={loading}
//                 className={clsx(
//                   "relative h-12 w-full rounded-2xl overflow-hidden transition-all duration-200 ease-out text-white font-semibold text-[16px] tracking-[-0.01em] shadow-[0_2px_12px_rgba(0,0,0,0.15)]",
//                   {
//                     "bg-gray-400 cursor-not-allowed": loading,
//                     "bg-blue-500 active:bg-blue-600 active:scale-95": !loading,
//                   }
//                 )}
//               >
//                 {loading ? (
//                   <div className="flex gap-2 items-center justify-center w-full h-full">
//                     <Spinner color="white" />
//                     <span className="text-white">Saving</span>
//                   </div>
//                 ) : (
//                   <span className="text-white">Save</span>
//                 )}
//               </button>
//             </div>
//           </div>
//         </Overlay>
//       )}
//     </>
//   );
// }

//------------------------------------------------------

"use client";

import { isGifImage, isValidRemoteImage } from "@/lib/utils/common";
import { useState, useEffect } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { ArrowLeft, X, Image as ImageIcon } from "lucide-react";
import Overlay from "@/ui/Overlay";
import { UpdatePageHeroAction } from "@/actions/page-hero";
import Image from "next/image";
import clsx from "clsx";
import { ShowAlertType } from "@/lib/sharedTypes";
import { useBodyOverflowStore } from "@/zustand/shared/bodyOverflowStore";
import { useAlertStore } from "@/zustand/shared/alertStore";

// TypeScript interface for Hero section
export interface HeroSection {
  id: string;

  // Content fields
  overline?: string; // "WHEN YOUR MOTHER-IN-LAW VISITS..."
  hook: string; // "PROVE YOURSELF" - main headline
  sell?: string; // "She raised the man you love. Now show her he chose wisely..."

  // Main visual content
  mainImage: {
    url: string;
    alt: string;
  };

  // Action configuration
  item_type: "PRODUCT" | "LINK";
  product_id?: string; // For PRODUCT type - product identifier
  link_url?: string; // For LINK type - absolute URL
  cta_text: "GET YOURS" | "SHOP NOW" | "CLAIM NOW";

  // Styling
  background_color?: string;
  text_color?: string;

  // Metadata
  visibility: "VISIBLE" | "HIDDEN";
  created_at: Date;
  updated_at: Date;
}

// Firestore document structure (JSON serializable)
export interface HeroSectionDoc {
  id: string;
  overline?: string;
  hook: string;
  sell?: string;
  mainImage: {
    url: string;
    alt: string;
  };
  item_type: "PRODUCT" | "LINK";
  product_id?: string;
  link_url?: string;
  cta_text: "GET YOURS" | "SHOP NOW" | "CLAIM NOW";
  background_color?: string;
  text_color?: string;
  visibility: "VISIBLE" | "HIDDEN";
  created_at: string; // ISO string for Firestore
  updated_at: string; // ISO string for Firestore
}

export function PageHeroButton({ visibility }: { visibility: string }) {
  const HIDDEN = "HIDDEN";
  const VISIBLE = "VISIBLE";

  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.storefront.name);
  const overlayName = useOverlayStore((state) => state.pages.storefront.overlays.editPageHero.name);

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      className="flex flex-col items-start w-full min-[560px]:w-[calc(100%/2-4px)] min-[824px]:w-64 rounded-xl p-5 relative cursor-pointer border transition bg-white active:border-[#b9bfc9] lg:hover:border-[#b9bfc9]"
    >
      <div className="w-full mb-4 flex items-center justify-between relative">
        <h2 className="text-left font-semibold text-sm">Page hero</h2>
        <div
          className={clsx("w-10 h-5 rounded-full relative cursor-pointer ease-in-out duration-200", {
            "bg-white border": visibility === HIDDEN,
            "bg-blue border border-blue": visibility === VISIBLE,
          })}
        >
          <div
            className={clsx(
              "w-[10px] h-[10px] rounded-full ease-in-out duration-300 absolute [top:50%] [transform:translateY(-50%)]",
              {
                "left-[5px] bg-black": visibility === HIDDEN,
                "left-[23px] bg-white": visibility === VISIBLE,
              }
            )}
          ></div>
        </div>
      </div>
      <p className="w-52 text-left text-gray text-xs leading-[18px]">
        Create compelling hero sections with overlines, hooks, and powerful calls-to-action.
      </p>
    </button>
  );
}

export function PageHeroOverlay({ pageHero }: { pageHero: Partial<HeroSection> }) {
  const HIDDEN = "HIDDEN";
  const VISIBLE = "VISIBLE";

  const [loading, setLoading] = useState(false);
  const [overline, setOverline] = useState<string>(pageHero.overline || "");
  const [hook, setHook] = useState<string>(pageHero.hook || "");
  const [sell, setSell] = useState<string>(pageHero.sell || "");
  const [mainImageUrl, setMainImageUrl] = useState<string>(pageHero.mainImage?.url || "");
  const [mainImageAlt, setMainImageAlt] = useState<string>(pageHero.mainImage?.alt || "");
  const [itemType, setItemType] = useState<"PRODUCT" | "LINK">(pageHero.item_type || "PRODUCT");
  const [productId, setProductId] = useState<string>(pageHero.product_id || "");
  const [linkUrl, setLinkUrl] = useState<string>(pageHero.link_url || "");
  const [ctaText, setCtaText] = useState<"GET YOURS" | "SHOP NOW" | "CLAIM NOW">(pageHero.cta_text || "GET YOURS");
  const [backgroundColor, setBackgroundColor] = useState<string>(pageHero.background_color || "#1e88e5");
  const [textColor, setTextColor] = useState<string>(pageHero.text_color || "#ffffff");
  const [visibility, setVisibility] = useState<string>(pageHero.visibility?.toUpperCase() || HIDDEN);

  const showAlert = useAlertStore((state) => state.showAlert);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.storefront.name);
  const overlayName = useOverlayStore((state) => state.pages.storefront.overlays.editPageHero.name);
  const isOverlayVisible = useOverlayStore((state) => state.pages.storefront.overlays.editPageHero.isVisible);
  const setPreventBodyOverflowChange = useBodyOverflowStore((state) => state.setPreventBodyOverflowChange);

  useEffect(() => {
    if (isOverlayVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
      setPreventBodyOverflowChange(false);
    }

    return () => {
      if (!isOverlayVisible) {
        document.body.style.overflow = "visible";
        setPreventBodyOverflowChange(false);
      }
    };
  }, [isOverlayVisible, setPreventBodyOverflowChange]);

  const handleSave = async () => {
    setLoading(true);

    try {
      if (visibility === VISIBLE) {
        let errorMessage = "";

        if (!hook) {
          errorMessage = "Please enter a hook (main headline)";
        } else if (!mainImageUrl) {
          errorMessage = "Please provide the main image URL";
        } else if (!mainImageAlt) {
          errorMessage = "Please provide alt text for the image";
        } else if (itemType === "PRODUCT" && !productId) {
          errorMessage = "Please enter a product ID for product type";
        } else if (itemType === "LINK" && !linkUrl) {
          errorMessage = "Please enter a link URL for link type";
        }

        if (errorMessage) {
          showAlert({
            message: errorMessage,
            type: ShowAlertType.ERROR,
          });
          setLoading(false);
          return;
        }
      }

      const heroData: Partial<HeroSection> = {
        overline: overline || undefined,
        hook,
        sell: sell || undefined,
        mainImage: {
          url: mainImageUrl,
          alt: mainImageAlt,
        },
        item_type: itemType,
        product_id: itemType === "PRODUCT" ? productId : undefined,
        link_url: itemType === "LINK" ? linkUrl : undefined,
        cta_text: ctaText,
        background_color: backgroundColor,
        text_color: textColor,
        visibility: visibility as "VISIBLE" | "HIDDEN",
      };

      // const result = await UpdatePageHeroAction(heroData);
      // showAlert({
      //   message: result.message,
      //   type: result.type,
      // });
    } catch {
      showAlert({
        message: "Failed to update page hero",
        type: ShowAlertType.ERROR,
      });
    } finally {
      setLoading(false);
      setPreventBodyOverflowChange(true);
    }
  };

  const onHideOverlay = () => {
    setLoading(false);
    hideOverlay({ pageName, overlayName });
    // Reset form to original values
    setOverline(pageHero.overline || "");
    setHook(pageHero.hook || "");
    setSell(pageHero.sell || "");
    setMainImageUrl(pageHero.mainImage?.url || "");
    setMainImageAlt(pageHero.mainImage?.alt || "");
    setItemType(pageHero.item_type || "PRODUCT");
    setProductId(pageHero.product_id || "");
    setLinkUrl(pageHero.link_url || "");
    setCtaText(pageHero.cta_text || "GET YOURS");
    setBackgroundColor(pageHero.background_color || "#1e88e5");
    setTextColor(pageHero.text_color || "#ffffff");
    setVisibility(pageHero.visibility?.toUpperCase() || HIDDEN);
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[20px] overflow-hidden bg-white md:w-[600px] md:rounded-2xl md:shadow-lg md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              {/* Mobile Header */}
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">Edit page hero</h2>
                  <button
                    onClick={onHideOverlay}
                    type="button"
                    className="w-7 h-7 rounded-full flex items-center justify-center absolute right-4 transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed"
                  >
                    <X color="#6c6c6c" size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Desktop Header */}
              <div className="hidden md:flex md:items-center md:justify-between py-2 pr-4 pl-2">
                <button
                  onClick={onHideOverlay}
                  type="button"
                  className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
                >
                  <ArrowLeft size={20} strokeWidth={2} className="-ml-1 stroke-blue" />
                  <span className="font-semibold text-sm text-blue">Edit page hero</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={clsx(
                    "relative h-9 w-max px-4 rounded-full overflow-hidden transition-colors text-white bg-neutral-700",
                    {
                      "bg-opacity-50": loading,
                      "hover:bg-neutral-600 active:bg-neutral-800": !loading,
                    }
                  )}
                >
                  {loading ? (
                    <div className="flex gap-1 items-center justify-center w-full h-full">
                      <Spinner color="white" />
                      <span className="text-white">Saving</span>
                    </div>
                  ) : (
                    <span className="text-white">Save</span>
                  )}
                </button>
              </div>

              {/* Form Content */}
              <div className="w-full h-full mt-[52px] md:mt-0 p-5 flex flex-col gap-5 overflow-x-hidden overflow-y-visible invisible-scrollbar md:overflow-y-auto">
                {/* Visibility */}
                <div className="flex flex-col gap-2">
                  <h2 className="text-xs text-gray">Visibility</h2>
                  <div className="px-[10px] py-2 w-full min-[425px]:w-max rounded-md flex gap-4 min-[425px]:gap-4 items-start justify-between bg-lightgray">
                    <div className="text-sm">Show hero on storefront</div>
                    <div
                      onClick={() => setVisibility((prev) => (prev === VISIBLE ? HIDDEN : VISIBLE))}
                      className={clsx("w-10 h-5 rounded-full relative cursor-pointer ease-in-out duration-200", {
                        "bg-white border": visibility === HIDDEN,
                        "bg-blue border border-blue": visibility === VISIBLE,
                      })}
                    >
                      <div
                        className={clsx(
                          "w-[10px] h-[10px] rounded-full ease-in-out duration-300 absolute [top:50%] [transform:translateY(-50%)]",
                          {
                            "left-[5px] bg-black": visibility === HIDDEN,
                            "left-[23px] bg-white": visibility === VISIBLE,
                          }
                        )}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Content Fields */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-xs text-gray">Content</h2>

                  {/* Overline */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="overline" className="text-xs text-gray">
                      Overline (Optional)
                    </label>
                    <input
                      type="text"
                      name="overline"
                      placeholder="WHEN YOUR MOTHER-IN-LAW VISITS..."
                      value={overline}
                      onChange={(e) => setOverline(e.target.value)}
                      className="w-full h-9 px-3 rounded-md border"
                    />
                  </div>

                  {/* Hook */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="hook" className="text-xs text-gray">
                      Hook (Main Headline) *
                    </label>
                    <input
                      type="text"
                      name="hook"
                      placeholder="PROVE YOURSELF"
                      value={hook}
                      onChange={(e) => setHook(e.target.value)}
                      className="w-full h-9 px-3 rounded-md border"
                      required
                    />
                  </div>

                  {/* Sell */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="sell" className="text-xs text-gray">
                      Sell Text (Optional)
                    </label>
                    <textarea
                      name="sell"
                      placeholder="She raised the man you love. Now show her he chose wisely. Turn her doubt into respect."
                      value={sell}
                      onChange={(e) => setSell(e.target.value)}
                      className="w-full h-20 px-3 py-2 rounded-md border resize-none"
                    />
                  </div>
                </div>

                {/* Main Image */}
                <div className="flex flex-col gap-2">
                  <h2 className="text-xs text-gray">Main Image</h2>
                  <div className="p-5 rounded-md border flex flex-col gap-4">
                    <div className="w-full border rounded-md overflow-hidden">
                      <div className="w-full min-h-[200px] flex items-center justify-center overflow-hidden">
                        {mainImageUrl && isValidRemoteImage(mainImageUrl) ? (
                          isGifImage(mainImageUrl) ? (
                            <Image
                              src={mainImageUrl}
                              alt={mainImageAlt || hook}
                              width={400}
                              height={200}
                              priority={true}
                              unoptimized={true}
                              className="object-cover"
                            />
                          ) : (
                            <Image
                              src={mainImageUrl}
                              alt={mainImageAlt || hook}
                              width={400}
                              height={200}
                              priority={true}
                              className="object-cover"
                            />
                          )
                        ) : (
                          <ImageIcon color="#e5e5e5" size={52} strokeWidth={0.75} />
                        )}
                      </div>
                      <div className="w-full h-9 border-t overflow-hidden">
                        <input
                          type="text"
                          name="mainImageUrl"
                          placeholder="Paste image URL"
                          value={mainImageUrl}
                          onChange={(e) => setMainImageUrl(e.target.value)}
                          className="h-full w-full px-3 text-sm text-gray"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="mainImageAlt" className="text-xs text-gray">
                        Alt Text *
                      </label>
                      <input
                        type="text"
                        name="mainImageAlt"
                        placeholder="Professional stainless steel cooking pot with beef stew"
                        value={mainImageAlt}
                        onChange={(e) => setMainImageAlt(e.target.value)}
                        className="w-full h-9 px-3 rounded-md border"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Action Configuration */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-xs text-gray">Action Configuration</h2>

                  {/* Item Type */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray">Item Type</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setItemType("PRODUCT")}
                        className={clsx("px-3 py-2 rounded-md border text-sm", {
                          "bg-blue text-white border-blue": itemType === "PRODUCT",
                          "bg-white text-gray border-gray": itemType !== "PRODUCT",
                        })}
                      >
                        Product
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemType("LINK")}
                        className={clsx("px-3 py-2 rounded-md border text-sm", {
                          "bg-blue text-white border-blue": itemType === "LINK",
                          "bg-white text-gray border-gray": itemType !== "LINK",
                        })}
                      >
                        Link
                      </button>
                    </div>
                  </div>

                  {/* Product ID or Link URL */}
                  {itemType === "PRODUCT" ? (
                    <div className="flex flex-col gap-2">
                      <label htmlFor="productId" className="text-xs text-gray">
                        Product ID *
                      </label>
                      <input
                        type="text"
                        name="productId"
                        placeholder="premium-cooking-pot-001"
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        className="w-full h-9 px-3 rounded-md border"
                        required
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <label htmlFor="linkUrl" className="text-xs text-gray">
                        Link URL *
                      </label>
                      <input
                        type="url"
                        name="linkUrl"
                        placeholder="https://cherlygood.com/collections/summer-cooling-gadgets"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="w-full h-9 px-3 rounded-md border"
                        required
                      />
                    </div>
                  )}

                  {/* CTA Text */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray">CTA Text</label>
                    <select
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value as "GET YOURS" | "SHOP NOW" | "CLAIM NOW")}
                      className="w-full h-9 px-3 rounded-md border"
                    >
                      <option value="GET YOURS">GET YOURS</option>
                      <option value="SHOP NOW">SHOP NOW</option>
                      <option value="CLAIM NOW">CLAIM NOW</option>
                    </select>
                  </div>
                </div>

                {/* Styling */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-xs text-gray">Styling</h2>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Background Color */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="backgroundColor" className="text-xs text-gray">
                        Background Color
                      </label>
                      <input
                        type="color"
                        name="backgroundColor"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-full h-9 rounded-md border"
                      />
                    </div>

                    {/* Text Color */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="textColor" className="text-xs text-gray">
                        Text Color
                      </label>
                      <input
                        type="color"
                        name="textColor"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full h-9 rounded-md border"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Save Button */}
            <div className="md:hidden w-full pb-5 pt-2 px-5 absolute bottom-0 bg-white">
              <button
                onClick={handleSave}
                disabled={loading}
                className={clsx(
                  "relative h-12 w-full rounded-full overflow-hidden transition-colors text-white bg-neutral-700",
                  {
                    "bg-opacity-50": loading,
                    "hover:bg-neutral-600 active:bg-neutral-800": !loading,
                  }
                )}
              >
                {loading ? (
                  <div className="flex gap-1 items-center justify-center w-full h-full">
                    <Spinner color="white" />
                    <span className="text-white">Saving</span>
                  </div>
                ) : (
                  <span className="text-white">Save</span>
                )}
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
}

// Action handler function for the frontend
export const handleHeroAction = (hero: HeroSection) => {
  if (hero.item_type === "PRODUCT" && hero.product_id) {
    // Show product quickview overlay
    // You'll need to implement showProductQuickview function
    console.log("Show product quickview for:", hero.product_id);
  } else if (hero.item_type === "LINK" && hero.link_url) {
    // Navigate to the absolute URL
    window.location.href = hero.link_url;
  }
};
