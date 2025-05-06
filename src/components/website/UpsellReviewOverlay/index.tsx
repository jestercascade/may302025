// "use client";

// import { useUpsellReviewStore } from "@/zustand/website/upsellReviewStore";
// import { ProductImagesOverlay } from "../ProductImagesOverlay";
// import { useAlertStore } from "@/zustand/shared/alertStore";
// import { useEffect, useState, useTransition } from "react";
// import { AddToCartAction } from "@/actions/cart";
// import { ShowAlertType } from "@/lib/sharedTypes";
// import { formatThousands } from "@/lib/utils/common";
// import Image from "next/image";
// import clsx from "clsx";
// import styles from "./styles.module.css";
// import { usePathname, useRouter } from "next/navigation";
// import { useQuickviewStore } from "@/zustand/website/quickviewStore";
// import { Spinner } from "@/ui/Spinners/Default";
// import { X, ChevronRight, Check, ChevronDown } from "lucide-react";

// // -- UpsellReviewButton Component --

// export function UpsellReviewButton({ product }) {
//   const showOverlay = useUpsellReviewStore((state) => state.showOverlay);
//   const setSelectedProduct = useUpsellReviewStore((state) => state.setSelectedProduct);

//   const openOverlay = () => {
//     setSelectedProduct(product);
//     showOverlay();
//   };

//   return (
//     <button
//       type="button"
//       onClick={openOverlay}
//       className={`flex items-center justify-center w-full h-11 min-[896px]:h-12 max-w-60 rounded-full cursor-pointer border border-[#b27100] text-white ${styles.button} font-semibold shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000] hover:bg-[#cc8100] hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]`}
//     >
//       Yes, Let's Upgrade
//     </button>
//   );
// }

// // -- UpsellProductSummary Component --

// function UpsellProductSummary({ product, selectedOptions, onSelectOptions }) {
//   const hasActiveOptions = product.options.groups.some((group) => group.values.some((opt) => opt.isActive));
//   const isOptionsSelected =
//     hasActiveOptions &&
//     product.options.groups
//       .filter((group) => group.values.some((opt) => opt.isActive))
//       .every((group) => selectedOptions[group.id] !== undefined);
//   const optionsTags = isOptionsSelected
//     ? product.options.groups
//         .map((group) => {
//           const selectedOptionId = selectedOptions[group.id];
//           if (selectedOptionId !== undefined) {
//             const option = group.values.find((opt) => opt.id === selectedOptionId);
//             return option ? `${group.name}: ${option.value}` : null;
//           }
//           return null;
//         })
//         .filter((tag) => tag !== null)
//     : [];

//   const showButton = hasActiveOptions;
//   const buttonVariant = isOptionsSelected ? "text" : "filled";
//   const buttonLabel = isOptionsSelected ? "Change Options" : "Select Options";

//   return (
//     <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-3 border border-[#e5e7eb] shadow-sm transition-all duration-200 hover:shadow-md hover:bg-opacity-100">
//       <div className="flex gap-4">
//         <div className="flex items-center justify-center min-w-20 max-w-20 aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-[#f3f4f6] to-[#e5e7eb] border border-[#e5e7eb]">
//           <Image
//             src={product.images.main}
//             alt={product.name}
//             width={80}
//             height={80}
//             className="w-full h-full object-cover"
//           />
//         </div>
//         <div className="space-y-3">
//           <a target="_blank" className="text-xs line-clamp-1 hover:underline" href="#">
//             {product.name}
//           </a>
//           {optionsTags.length > 0 && (
//             <div className="flex flex-wrap gap-1 mt-1 max-w-xs">
//               {optionsTags.map((opt, i) => (
//                 <span
//                   key={i}
//                   className="inline-flex text-xs px-1.5 py-0.5 rounded border border-[#e5e7eb] text-gray-500 bg-[#f3f4f6]"
//                 >
//                   {opt}
//                 </span>
//               ))}
//             </div>
//           )}
//           {showButton && (
//             <button
//               onClick={() => onSelectOptions(product.id)}
//               className={`text-xs inline-flex items-center gap-1.5 transition-colors w-max font-medium ${
//                 buttonVariant === "filled"
//                   ? "px-2 py-1 rounded-md bg-[#e5e7eb] text-[#374151] hover:bg-[#d1d5db]"
//                   : "text-[#2563eb] hover:text-[#1d4ed8] hover:underline"
//               }`}
//             >
//               {buttonVariant === "filled" && <ChevronDown size={14} className="text-[#2563eb]" />}
//               {buttonLabel}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // -- OptionSelectionModal Component --

// function OptionSelectionModal({ product, currentSelectedOptions, onOptionsSelected, onClose }) {
//   const [localSelectedOptions, setLocalSelectedOptions] = useState(currentSelectedOptions || {});

//   const requiredGroups = product.options.groups.filter((group) => group.values.some((opt) => opt.isActive));
//   const isAllSelected = requiredGroups.every((group) => localSelectedOptions[group.id] !== undefined);

//   const getMeasurements = (group, selectedOptionId) => {
//     if (!group.sizeChart?.inches) return [];
//     const selectedOption = group.values.find((v) => v.id === selectedOptionId);
//     if (!selectedOption) return [];
//     const keyColumn = group.sizeChart.inches.columns[0].label;
//     const row = group.sizeChart.inches.rows.find((r) => r[keyColumn] === selectedOption.value);
//     if (!row) return [];
//     return group.sizeChart.inches.columns
//       .filter((col) => col.label !== keyColumn)
//       .map((col) => ({ label: col.label, value: row[col.label] }));
//   };

//   return (
//     <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-40">
//       <div className="bg-white rounded-2xl shadow-lg py-5 max-w-md w-full max-h-[90vh] flex flex-col">
//         <div className="flex justify-between items-center mb-4 px-5">
//           <h2 className="text-lg font-semibold">{product.name}</h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <X size={24} />
//           </button>
//         </div>

//         <div className="overflow-y-auto flex-1 pl-5 pr-3 pb-5 rounded-y-scrollbar">
//           <div className="mb-4">
//             <Image
//               src={product.images.main}
//               alt={product.name}
//               width={200}
//               height={200}
//               className="w-full rounded-lg"
//             />
//           </div>

//           <div className="flex flex-col gap-3">
//             {product.options.groups
//               .filter((group) => group.values.some((opt) => opt.isActive))
//               .map((group) => (
//                 <div key={group.id}>
//                   <h3 className="text-sm font-medium mb-2">{group.name}</h3>
//                   <div className="flex flex-wrap gap-2">
//                     {group.values
//                       .filter((option) => option.isActive)
//                       .map((option) => (
//                         <button
//                           key={option.id}
//                           onClick={() =>
//                             setLocalSelectedOptions({
//                               ...localSelectedOptions,
//                               [group.id]: option.id,
//                             })
//                           }
//                           className={`px-3 py-1.5 min-w-[3rem] rounded-full text-sm ${
//                             localSelectedOptions[group.id] === option.id
//                               ? "bg-black text-white"
//                               : "bg-gray-100 text-black hover:bg-gray-200"
//                           }`}
//                         >
//                           {option.value}
//                         </button>
//                       ))}
//                   </div>
//                   {group.sizeChart && localSelectedOptions[group.id] && (
//                     <div className="mt-2 bg-gray-100 rounded-lg p-2">
//                       {getMeasurements(group, localSelectedOptions[group.id]).map((m) => (
//                         <div key={m.label} className="text-xs">
//                           {m.label}: {m.value}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               ))}
//           </div>
//         </div>

//         <div className="pt-3 px-5 border-t border-gray-200">
//           <button
//             disabled={!isAllSelected}
//             onClick={() => {
//               onOptionsSelected(localSelectedOptions);
//               onClose();
//             }}
//             className={`w-full py-2 rounded-lg font-semibold ${
//               isAllSelected
//                 ? "bg-blue-500 text-white hover:bg-blue-600"
//                 : "bg-gray-300 text-gray-500 cursor-not-allowed"
//             }`}
//           >
//             Done
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // -- UpsellReviewOverlay Component --

// export function UpsellReviewOverlay({ cart }) {
//   const {
//     hideOverlay,
//     selectedOptions,
//     readyProducts,
//     isVisible,
//     selectedProduct,
//     setSelectedOptions,
//     setReadyProducts,
//   } = useUpsellReviewStore();
//   const hideQuickviewOverlay = useQuickviewStore((state) => state.hideOverlay);
//   const showAlert = useAlertStore((state) => state.showAlert);
//   const pathname = usePathname();
//   const router = useRouter();
//   const [showCarousel, setShowCarousel] = useState(false);
//   const [selectedProductForCarousel, setSelectedProductForCarousel] = useState(null);
//   const [selectedProductForOptions, setSelectedProductForOptions] = useState(null);
//   const [, startTransition] = useTransition();
//   const [isInCart, setIsInCart] = useState(false);
//   const [isAddingToCart, setIsAddingToCart] = useState(false);

//   const isUpsellInCart = () => {
//     if (!cart?.items || !selectedProduct?.upsell) return false;
//     return cart.items.some((item) => item.type === "upsell" && item.baseUpsellId === selectedProduct.upsell.id);
//   };

//   useEffect(() => {
//     if (isVisible && selectedProduct) {
//       const autoReadyProducts = selectedProduct.upsell.products
//         .filter((product) => product.options.groups.every((group) => group.values.every((option) => !option.isActive)))
//         .map((product) => product.id);
//       setReadyProducts(autoReadyProducts);
//       setSelectedOptions({});
//       setIsInCart(isUpsellInCart());
//     }
//   }, [isVisible, selectedProduct, setReadyProducts, setSelectedOptions, cart]);

//   const openCarousel = (product) => {
//     setSelectedProductForCarousel(product);
//     setShowCarousel(true);
//   };

//   const closeCarousel = () => {
//     setShowCarousel(false);
//     setSelectedProductForCarousel(null);
//   };

//   const calculateSavings = (pricing) => {
//     return (Number(pricing.basePrice) - Number(pricing.salePrice)).toFixed(2);
//   };

//   const handleAddToCart = () => {
//     setIsAddingToCart(true);
//     startTransition(async () => {
//       const productsToAdd = selectedProduct.upsell.products.map((product) => {
//         const productSelectedOptions = selectedOptions[product.id] || {};
//         const readableOptions = {};
//         for (const [groupIdStr, optionId] of Object.entries(productSelectedOptions)) {
//           const groupId = Number(groupIdStr);
//           const group = product.options.groups.find((g) => g.id === groupId);
//           const optionIndex = group?.values.findIndex((v) => v.id === optionId);
//           if (group && optionIndex !== undefined && optionIndex !== -1) {
//             const option = group.values[optionIndex];
//             readableOptions[group.name.toLowerCase()] = {
//               value: option.value,
//               optionDisplayOrder: optionIndex,
//               groupDisplayOrder: group.displayOrder,
//             };
//           }
//         }
//         return {
//           id: product.id,
//           selectedOptions: readableOptions,
//         };
//       });

//       const upsellToAdd = {
//         type: "upsell",
//         baseUpsellId: selectedProduct.upsell.id,
//         products: productsToAdd,
//       };

//       const result = await AddToCartAction(upsellToAdd);
//       showAlert({
//         message: result.message,
//         type: result.type === ShowAlertType.ERROR ? ShowAlertType.ERROR : ShowAlertType.NEUTRAL,
//       });

//       setIsAddingToCart(false);
//       if (result.type !== ShowAlertType.ERROR) {
//         setIsInCart(true);
//       }
//     });
//   };

//   const handleInCartButtonClick = () => {
//     if (pathname === "/cart") {
//       hideOverlay();
//       hideQuickviewOverlay();
//       document.getElementById("scrollable-parent")?.scrollTo({ top: 0, behavior: "smooth" });
//     } else {
//       router.push("/cart");
//     }
//   };

//   return (
//     <>
//       {isVisible && selectedProduct && (
//         <div className="custom-scrollbar flex justify-center py-20 w-full h-dvh overflow-x-hidden overflow-y-visible z-30 fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-40 backdrop-blur-sm">
//           <div className="w-[calc(100%-36px)] max-w-[500px] max-h-[764px] relative overflow-hidden rounded-2xl shadow-[0px_0px_36px_0px_rgba(255,185,56,0.6)] bg-white">
//             <div className="h-full pt-5 pb-[80px] flex flex-col relative">
//               <div className="pb-3">
//                 <div className="w-max mx-auto flex items-center justify-center">
//                   {Number(selectedProduct.upsell.pricing.salePrice) ? (
//                     <div className="flex items-center gap-[6px]">
//                       <div className="flex items-baseline text-[rgb(168,100,0)]">
//                         <span className="text-[0.813rem] leading-3 font-semibold">$</span>
//                         <span className="text-xl font-bold">
//                           {Math.floor(Number(selectedProduct.upsell.pricing.salePrice))}
//                         </span>
//                         <span className="text-[0.813rem] leading-3 font-semibold">
//                           {(Number(selectedProduct.upsell.pricing.salePrice) % 1).toFixed(2).substring(1)}
//                         </span>
//                       </div>
//                       <span className="text-[0.813rem] leading-3 text-gray line-through">
//                         ${formatThousands(Number(selectedProduct.upsell.pricing.basePrice))}
//                       </span>
//                     </div>
//                   ) : (
//                     <div className="flex items-baseline text-[rgb(168,100,0)]">
//                       <span className="text-[0.813rem] leading-3 font-semibold">$</span>
//                       <span className="text-lg font-bold">
//                         {Math.floor(Number(selectedProduct.upsell.pricing.basePrice))}
//                       </span>
//                       <span className="text-[0.813rem] leading-3 font-semibold">
//                         {(Number(selectedProduct.upsell.pricing.basePrice) % 1).toFixed(2).substring(1)}
//                       </span>
//                       <span className="ml-1 text-[0.813rem] leading-3 font-semibold">today</span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <div className="px-5 pt-4 pb-24 flex flex-col gap-5 items-center custom-scrollbar overflow-x-hidden overflow-y-visible">
//                 <div className="w-full flex flex-col gap-3">
//                   {selectedProduct.upsell.products.map((product) => (
//                     <UpsellProductSummary
//                       key={product.id}
//                       product={product}
//                       selectedOptions={selectedOptions[product.id] || {}}
//                       onSelectOptions={(productId) => setSelectedProductForOptions(productId)}
//                     />
//                   ))}
//                 </div>
//               </div>
//               <div className="absolute left-0 right-0 bottom-0">
//                 <div className="h-[80px] px-5 flex items-start shadow-[0_-12px_16px_2px_white]">
//                   <div className="w-full h-11 flex justify-between items-center">
//                     <div className="flex gap-3">
//                       <div className="flex items-center">
//                         <div
//                           className={clsx(
//                             "w-5 h-5 rounded-full flex items-center justify-center",
//                             readyProducts.length > 0 ? "bg-black" : "border border-gray"
//                           )}
//                         >
//                           {readyProducts.length > 0 && <Check color="#ffffff" size={16} strokeWidth={2} />}
//                         </div>
//                       </div>
//                       {readyProducts.length > 0 ? (
//                         <>
//                           <span className="min-[480px]:hidden font-semibold text-sm">
//                             Selections ({readyProducts.length})
//                           </span>
//                           <span className="hidden min-[480px]:block pl-[3px] font-semibold text-sm min-[520px]:text-base">
//                             Confirm selections ({readyProducts.length})
//                           </span>
//                         </>
//                       ) : (
//                         <>
//                           <span className="min-[480px]:hidden font-semibold text-sm">Selections (0)</span>
//                           <span className="hidden min-[480px]:block font-semibold text-sm min-[520px]:text-base">
//                             Selections (0)
//                           </span>
//                         </>
//                       )}
//                     </div>
//                     <div className="relative">
//                       {isInCart ? (
//                         <>
//                           <button
//                             onClick={handleInCartButtonClick}
//                             className="min-[365px]:hidden animate-fade px-3 flex items-center justify-center w-full h-11 rounded-full cursor-pointer border border-[#c5c3c0] text-blue text-sm font-semibold shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear-gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]"
//                           >
//                             View in Cart
//                           </button>
//                           <button
//                             onClick={handleInCartButtonClick}
//                             className="hidden animate-fade px-4 min-[365px]:flex items-center justify-center w-full h-11 rounded-full cursor-pointer border border-[#c5c3c0] text-blue text-sm font-semibold shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear_gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]"
//                           >
//                             In Cart - See Now
//                           </button>
//                         </>
//                       ) : (
//                         <>
//                           <button
//                             className={clsx(
//                               "min-[375px]:hidden text-sm flex items-center justify-center min-w-28 max-w-28 px-[10px] h-11 rounded-full border border-[#b27100] text-white font-semibold shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000] transition-opacity duration-200",
//                               readyProducts.length !== selectedProduct?.upsell.products.length || isAddingToCart
//                                 ? "opacity-50 cursor-context-menu"
//                                 : "cursor-pointer hover:bg-[#cc8100] hover:[background:linear_gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]"
//                             )}
//                             disabled={
//                               readyProducts.length !== selectedProduct?.upsell.products.length || isAddingToCart
//                             }
//                             onClick={handleAddToCart}
//                           >
//                             {isAddingToCart ? <Spinner size={24} color="white" /> : "Get Upgrade"}
//                           </button>
//                           <button
//                             className={clsx(
//                               "hidden text-sm min-[375px]:flex items-center justify-center min-w-[160px] max-w-60 min-[425px]:min-w-[172px] px-[10px] min-[425px]:px-4 min-[480px]:px-5 h-11 rounded-full border border-[#b27100] text-white font-semibold shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear_gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000] transition-opacity duration-200",
//                               readyProducts.length !== selectedProduct?.upsell.products.length || isAddingToCart
//                                 ? "opacity-50 cursor-context-menu"
//                                 : "cursor-pointer hover:bg-[#cc8100] hover:[background:linear_gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]"
//                             )}
//                             disabled={
//                               readyProducts.length !== selectedProduct?.upsell.products.length || isAddingToCart
//                             }
//                             onClick={handleAddToCart}
//                           >
//                             {isAddingToCart ? <Spinner size={24} color="white" /> : "Add Upgrade to Cart"}
//                           </button>
//                         </>
//                       )}
//                       <div
//                         className={clsx(
//                           "animate-fade-right absolute right-0 bottom-12 min-[520px]:bottom-14 w-[248px] py-3 px-4 rounded-xl bg-[#373737] before:content-[''] before:w-[10px] before:h-[10px] before:bg-[#373737] before:rounded-br-[2px] before:rotate-45 before:origin-bottom-left before:absolute before:-bottom-0 before:right-12",
//                           {
//                             hidden: readyProducts.length !== selectedProduct?.upsell.products.length || isInCart,
//                           }
//                         )}
//                       >
//                         <p className="text-white text-sm">
//                           <span className="text-[#ffe6ba]">
//                             {selectedProduct?.upsell.pricing.salePrice
//                               ? `Congrats! Saved $${calculateSavings(selectedProduct.upsell.pricing)} -`
//                               : `Congrats! You're all set -`}
//                           </span>{" "}
//                           <b>grab it before it's gone!</b>
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <button
//               type="button"
//               onClick={hideOverlay}
//               className="w-9 h-9 rounded-full absolute top-[6px] right-[6px] flex items-center justify-center ease-in-out transition duration-300 active:bg-lightgray lg:hover:bg-lightgray"
//             >
//               <X color="#6c6c6c" strokeWidth={1.5} />
//             </button>
//           </div>
//         </div>
//       )}
//       {selectedProductForOptions && (
//         <OptionSelectionModal
//           product={selectedProduct.upsell.products.find((p) => p.id === selectedProductForOptions)}
//           currentSelectedOptions={selectedOptions[selectedProductForOptions] || {}}
//           onOptionsSelected={(newOptions) => {
//             setSelectedOptions({
//               ...selectedOptions,
//               [selectedProductForOptions]: newOptions,
//             });
//             if (!readyProducts.includes(selectedProductForOptions)) {
//               setReadyProducts([...readyProducts, selectedProductForOptions]);
//             }
//             setSelectedProductForOptions(null);
//           }}
//           onClose={() => setSelectedProductForOptions(null)}
//         />
//       )}
//       {showCarousel && selectedProductForCarousel && (
//         <ProductImagesOverlay product={selectedProductForCarousel} onClose={closeCarousel} />
//       )}
//     </>
//   );
// }
"use client";

import { useUpsellReviewStore } from "@/zustand/website/upsellReviewStore";
import { ProductImagesOverlay } from "../ProductImagesOverlay";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { useEffect, useState, useTransition } from "react";
import { AddToCartAction } from "@/actions/cart";
import { ShowAlertType } from "@/lib/sharedTypes";
import { formatThousands } from "@/lib/utils/common";
import Image from "next/image";
import clsx from "clsx";
import styles from "./styles.module.css";
import { usePathname, useRouter } from "next/navigation";
import { useQuickviewStore } from "@/zustand/website/quickviewStore";
import { Spinner } from "@/ui/Spinners/Default";
import { X, ChevronRight, Check, ChevronDown } from "lucide-react";

// -- UpsellReviewButton Component --

export function UpsellReviewButton({ product }) {
  const showOverlay = useUpsellReviewStore((state) => state.showOverlay);
  const setSelectedProduct = useUpsellReviewStore((state) => state.setSelectedProduct);

  const openOverlay = () => {
    setSelectedProduct(product);
    showOverlay();
  };

  return (
    <button
      type="button"
      onClick={openOverlay}
      className={`flex items-center justify-center w-full h-11 min-[896px]:h-12 max-w-60 rounded-full cursor-pointer border border-[#b27100] text-white ${styles.button} font-semibold shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000] hover:bg-[#cc8100] hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]`}
    >
      Yes, Let's Upgrade
    </button>
  );
}

// -- UpsellProductSummary Component --
function UpsellProductSummary({ product, selectedOptions, onSelectOptions }) {
  const hasActiveOptions = product.options.groups.some((group) => group.values.some((opt) => opt.isActive));
  const isOptionsSelected =
    hasActiveOptions &&
    product.options.groups
      .filter((group) => group.values.some((opt) => opt.isActive))
      .every((group) => selectedOptions[group.id] !== undefined);
  const isReady = !hasActiveOptions || isOptionsSelected;

  const optionsTags = isOptionsSelected
    ? product.options.groups
        .map((group) => {
          const selectedOptionId = selectedOptions[group.id];
          if (selectedOptionId !== undefined) {
            const option = group.values.find((opt) => opt.id === selectedOptionId);
            return option ? `${group.name}: ${option.value}` : null;
          }
          return null;
        })
        .filter((tag) => tag !== null)
    : [];

  const showButton = hasActiveOptions;
  const buttonVariant = isOptionsSelected ? "text" : "filled";
  const buttonLabel = isOptionsSelected ? "Change Options" : "Select Options";

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center">
        <div
          className={clsx(
            "w-5 h-5 rounded-full flex items-center justify-center",
            isReady ? "bg-black" : "border border-gray-300"
          )}
        >
          {isReady && <Check color="#ffffff" size={16} strokeWidth={2} />}
        </div>
      </div>
      <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-3 border border-[#e5e7eb] shadow-sm transition-all duration-200 hover:shadow-md hover:bg-opacity-100 flex-1">
        <div className="flex gap-4">
          <div className="flex items-center justify-center min-w-[120px] max-w-[120px] aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-[#f3f4f6] to-[#e5e7eb] border border-[#e5e7eb]">
            <Image
              src={product.images.main}
              alt={product.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-3">
            <a target="_blank" className="text-xs line-clamp-1 hover:underline" href="#">
              {product.name}
            </a>
            {optionsTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1 max-w-xs">
                {optionsTags.map((opt, i) => (
                  <span
                    key={i}
                    className="inline-flex text-xs px-1.5 py-0.5 rounded border border-[#e5e7eb] text-gray-500 bg-[#f3f4f6]"
                  >
                    {opt}
                  </span>
                ))}
              </div>
            )}
            {showButton && (
              <button
                onClick={() => onSelectOptions(product.id)}
                className={`text-xs inline-flex items-center gap-1 transition-colors w-max font-medium ${
                  buttonVariant === "filled"
                    ? "px-2 py-1 rounded bg-lightgray hover:bg-lightgray-dimmed"
                    : "text-blue hover:text-blue-dimmed hover:underline"
                }`}
              >
                {buttonVariant === "filled" && <ChevronDown size={14} />}
                {buttonLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// -- OptionSelectionModal Component --

function OptionSelectionModal({ product, currentSelectedOptions, onOptionsSelected, onClose }) {
  const [localSelectedOptions, setLocalSelectedOptions] = useState(currentSelectedOptions || {});

  const requiredGroups = product.options.groups.filter((group) => group.values.some((opt) => opt.isActive));
  const isAllSelected = requiredGroups.every((group) => localSelectedOptions[group.id] !== undefined);

  const getMeasurements = (group, selectedOptionId) => {
    if (!group.sizeChart?.inches) return [];
    const selectedOption = group.values.find((v) => v.id === selectedOptionId);
    if (!selectedOption) return [];
    const keyColumn = group.sizeChart.inches.columns[0].label;
    const row = group.sizeChart.inches.rows.find((r) => r[keyColumn] === selectedOption.value);
    if (!row) return [];
    return group.sizeChart.inches.columns
      .filter((col) => col.label !== keyColumn)
      .map((col) => ({ label: col.label, value: row[col.label] }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-40">
      <div className="bg-white rounded-2xl shadow-lg pt-4 pb-5 max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-2 pl-5 pr-4">
          <h2 className="text-lg font-semibold">{product.name}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors active:bg-lightgray lg:hover:bg-lightgray"
          >
            <X color="#6c6c6c" strokeWidth={1.5} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pl-5 pr-3 pb-5 rounded-y-scrollbar">
          <div className="mb-4">
            <Image
              src={product.images.main}
              alt={product.name}
              width={200}
              height={200}
              className="w-full rounded-lg"
            />
          </div>

          <div className="flex flex-col gap-3">
            {product.options.groups
              .filter((group) => group.values.some((opt) => opt.isActive))
              .map((group) => (
                <div key={group.id}>
                  <h3 className="text-sm font-medium mb-2">{group.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {group.values
                      .filter((option) => option.isActive)
                      .map((option) => (
                        <button
                          key={option.id}
                          onClick={() =>
                            setLocalSelectedOptions({
                              ...localSelectedOptions,
                              [group.id]: option.id,
                            })
                          }
                          className={`px-3 py-1.5 min-w-[3rem] rounded-full text-sm ${
                            localSelectedOptions[group.id] === option.id
                              ? "bg-black text-white"
                              : "bg-gray-100 text-black hover:bg-gray-200"
                          }`}
                        >
                          {option.value}
                        </button>
                      ))}
                  </div>
                  {group.sizeChart && localSelectedOptions[group.id] && (
                    <div className="mt-2 bg-gray-100 rounded-lg p-2">
                      {getMeasurements(group, localSelectedOptions[group.id]).map((m) => (
                        <div key={m.label} className="text-xs">
                          {m.label}: {m.value}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        <div className="pt-3 px-5 border-t border-gray-200">
          <button
            disabled={!isAllSelected}
            onClick={() => {
              onOptionsSelected(localSelectedOptions);
              onClose();
            }}
            className={`w-full py-2 rounded-lg font-semibold ${
              isAllSelected
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// -- UpsellReviewOverlay Component --

export function UpsellReviewOverlay({ cart }) {
  const {
    hideOverlay,
    selectedOptions,
    readyProducts,
    isVisible,
    selectedProduct,
    setSelectedOptions,
    setReadyProducts,
  } = useUpsellReviewStore();
  const hideQuickviewOverlay = useQuickviewStore((state) => state.hideOverlay);
  const showAlert = useAlertStore((state) => state.showAlert);
  const pathname = usePathname();
  const router = useRouter();
  const [showCarousel, setShowCarousel] = useState(false);
  const [selectedProductForCarousel, setSelectedProductForCarousel] = useState(null);
  const [selectedProductForOptions, setSelectedProductForOptions] = useState(null);
  const [, startTransition] = useTransition();
  const [isInCart, setIsInCart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const isUpsellInCart = () => {
    if (!cart?.items || !selectedProduct?.upsell) return false;
    return cart.items.some((item) => item.type === "upsell" && item.baseUpsellId === selectedProduct.upsell.id);
  };

  useEffect(() => {
    if (isVisible && selectedProduct) {
      const autoReadyProducts = selectedProduct.upsell.products
        .filter((product) => product.options.groups.every((group) => group.values.every((option) => !option.isActive)))
        .map((product) => product.id);
      setReadyProducts(autoReadyProducts);
      setSelectedOptions({});
      setIsInCart(isUpsellInCart());
    }
  }, [isVisible, selectedProduct, setReadyProducts, setSelectedOptions, cart]);

  const openCarousel = (product) => {
    setSelectedProductForCarousel(product);
    setShowCarousel(true);
  };

  const closeCarousel = () => {
    setShowCarousel(false);
    setSelectedProductForCarousel(null);
  };

  const calculateSavings = (pricing) => {
    return (Number(pricing.basePrice) - Number(pricing.salePrice)).toFixed(2);
  };

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    startTransition(async () => {
      const productsToAdd = selectedProduct.upsell.products.map((product) => {
        const productSelectedOptions = selectedOptions[product.id] || {};
        const readableOptions = {};
        for (const [groupIdStr, optionId] of Object.entries(productSelectedOptions)) {
          const groupId = Number(groupIdStr);
          const group = product.options.groups.find((g) => g.id === groupId);
          const optionIndex = group?.values.findIndex((v) => v.id === optionId);
          if (group && optionIndex !== undefined && optionIndex !== -1) {
            const option = group.values[optionIndex];
            readableOptions[group.name.toLowerCase()] = {
              value: option.value,
              optionDisplayOrder: optionIndex,
              groupDisplayOrder: group.displayOrder,
            };
          }
        }
        return {
          id: product.id,
          selectedOptions: readableOptions,
        };
      });

      const upsellToAdd = {
        type: "upsell",
        baseUpsellId: selectedProduct.upsell.id,
        products: productsToAdd,
      };

      const result = await AddToCartAction(upsellToAdd);
      showAlert({
        message: result.message,
        type: result.type === ShowAlertType.ERROR ? ShowAlertType.ERROR : ShowAlertType.NEUTRAL,
      });

      setIsAddingToCart(false);
      if (result.type !== ShowAlertType.ERROR) {
        setIsInCart(true);
      }
    });
  };

  const handleInCartButtonClick = () => {
    if (pathname === "/cart") {
      hideOverlay();
      hideQuickviewOverlay();
      document.getElementById("scrollable-parent")?.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/cart");
    }
  };

  return (
    <>
      {isVisible && selectedProduct && (
        <div className="custom-scrollbar flex justify-center py-20 w-full h-dvh overflow-x-hidden overflow-y-visible z-30 fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="w-[calc(100%-36px)] max-w-[500px] max-h-[764px] relative overflow-hidden rounded-2xl shadow-[0px_0px_36px_0px_rgba(255,185,56,0.6)] bg-white">
            <div className="h-full pt-5 pb-[80px] flex flex-col relative">
              <div className="pb-3">
                <div className="w-max mx-auto flex items-center justify-center">
                  {Number(selectedProduct.upsell.pricing.salePrice) ? (
                    <div className="flex items-center gap-[6px]">
                      <div className="flex items-baseline text-[rgb(168,100,0)]">
                        <span className="text-[0.813rem] leading-3 font-semibold">$</span>
                        <span className="text-xl font-bold">
                          {Math.floor(Number(selectedProduct.upsell.pricing.salePrice))}
                        </span>
                        <span className="text-[0.813rem] leading-3 font-semibold">
                          {(Number(selectedProduct.upsell.pricing.salePrice) % 1).toFixed(2).substring(1)}
                        </span>
                      </div>
                      <span className="text-[0.813rem] leading-3 text-gray line-through">
                        ${formatThousands(Number(selectedProduct.upsell.pricing.basePrice))}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-baseline text-[rgb(168,100,0)]">
                      <span className="text-[0.813rem] leading-3 font-semibold">$</span>
                      <span className="text-lg font-bold">
                        {Math.floor(Number(selectedProduct.upsell.pricing.basePrice))}
                      </span>
                      <span className="text-[0.813rem] leading-3 font-semibold">
                        {(Number(selectedProduct.upsell.pricing.basePrice) % 1).toFixed(2).substring(1)}
                      </span>
                      <span className="ml-1 text-[0.813rem] leading-3 font-semibold">today</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-5 pt-4 pb-24 flex flex-col gap-5 items-center custom-scrollbar overflow-x-hidden overflow-y-visible">
                <div className="w-full flex flex-col gap-3">
                  {selectedProduct.upsell.products.map((product) => (
                    <UpsellProductSummary
                      key={product.id}
                      product={product}
                      selectedOptions={selectedOptions[product.id] || {}}
                      onSelectOptions={(productId) => setSelectedProductForOptions(productId)}
                    />
                  ))}
                </div>
              </div>
              <div className="absolute left-0 right-0 bottom-0">
                <div className="h-[80px] px-5 flex items-start shadow-[0_-12px_16px_2px_white]">
                  <div className="w-full h-11 flex justify-between items-center">
                    <div className="flex gap-3">
                      <div className="flex items-center">
                        <div
                          className={clsx(
                            "w-5 h-5 rounded-full flex items-center justify-center",
                            readyProducts.length > 0 ? "bg-black" : "border border-gray"
                          )}
                        >
                          {readyProducts.length > 0 && <Check color="#ffffff" size={16} strokeWidth={2} />}
                        </div>
                      </div>
                      {readyProducts.length > 0 ? (
                        <>
                          <span className="min-[480px]:hidden font-semibold text-sm">
                            Selections ({readyProducts.length})
                          </span>
                          <span className="hidden min-[480px]:block pl-[3px] font-semibold text-sm min-[520px]:text-base">
                            Confirm selections ({readyProducts.length})
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="min-[480px]:hidden font-semibold text-sm">Selections (0)</span>
                          <span className="hidden min-[480px]:block font-semibold text-sm min-[520px]:text-base">
                            Selections (0)
                          </span>
                        </>
                      )}
                    </div>
                    <div className="relative">
                      {isInCart ? (
                        <>
                          <button
                            onClick={handleInCartButtonClick}
                            className="min-[365px]:hidden animate-fade px-3 flex items-center justify-center w-full h-11 rounded-full cursor-pointer border border-[#c5c3c0] text-blue text-sm font-semibold shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear-gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]"
                          >
                            View in Cart
                          </button>
                          <button
                            onClick={handleInCartButtonClick}
                            className="hidden animate-fade px-4 min-[365px]:flex items-center justify-center w-full h-11 rounded-full cursor-pointer border border-[#c5c3c0] text-blue text-sm font-semibold shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear_gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]"
                          >
                            In Cart - See Now
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className={clsx(
                              "min-[375px]:hidden text-sm flex items-center justify-center min-w-28 max-w-28 px-[10px] h-11 rounded-full border border-[#b27100] text-white font-semibold shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000] transition-opacity duration-200",
                              readyProducts.length !== selectedProduct?.upsell.products.length || isAddingToCart
                                ? "opacity-50 cursor-context-menu"
                                : "cursor-pointer hover:bg-[#cc8100] hover:[background:linear_gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]"
                            )}
                            disabled={
                              readyProducts.length !== selectedProduct?.upsell.products.length || isAddingToCart
                            }
                            onClick={handleAddToCart}
                          >
                            {isAddingToCart ? <Spinner size={24} color="white" /> : "Get Upgrade"}
                          </button>
                          <button
                            className={clsx(
                              "hidden text-sm min-[375px]:flex items-center justify-center min-w-[160px] max-w-60 min-[425px]:min-w-[172px] px-[10px] min-[425px]:px-4 min-[480px]:px-5 h-11 rounded-full border border-[#b27100] text-white font-semibold shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear_gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000] transition-opacity duration-200",
                              readyProducts.length !== selectedProduct?.upsell.products.length || isAddingToCart
                                ? "opacity-50 cursor-context-menu"
                                : "cursor-pointer hover:bg-[#cc8100] hover:[background:linear_gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]"
                            )}
                            disabled={
                              readyProducts.length !== selectedProduct?.upsell.products.length || isAddingToCart
                            }
                            onClick={handleAddToCart}
                          >
                            {isAddingToCart ? <Spinner size={24} color="white" /> : "Add Upgrade to Cart"}
                          </button>
                        </>
                      )}
                      <div
                        className={clsx(
                          "animate-fade-right absolute right-0 bottom-12 min-[520px]:bottom-14 w-[248px] py-3 px-4 rounded-xl bg-[#373737] before:content-[''] before:w-[10px] before:h-[10px] before:bg-[#373737] before:rounded-br-[2px] before:rotate-45 before:origin-bottom-left before:absolute before:-bottom-0 before:right-12",
                          {
                            hidden: readyProducts.length !== selectedProduct?.upsell.products.length || isInCart,
                          }
                        )}
                      >
                        <p className="text-white text-sm">
                          <span className="text-[#ffe6ba]">
                            {selectedProduct?.upsell.pricing.salePrice
                              ? `Congrats! Saved $${calculateSavings(selectedProduct.upsell.pricing)} -`
                              : `Congrats! You're all set -`}
                          </span>{" "}
                          <b>grab it before it's gone!</b>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={hideOverlay}
              className="w-9 h-9 rounded-full absolute top-[6px] right-[6px] flex items-center justify-center ease-in-out transition duration-300 active:bg-lightgray lg:hover:bg-lightgray"
            >
              <X color="#6c6c6c" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
      {selectedProductForOptions && (
        <OptionSelectionModal
          product={selectedProduct.upsell.products.find((p) => p.id === selectedProductForOptions)}
          currentSelectedOptions={selectedOptions[selectedProductForOptions] || {}}
          onOptionsSelected={(newOptions) => {
            setSelectedOptions({
              ...selectedOptions,
              [selectedProductForOptions]: newOptions,
            });
            if (!readyProducts.includes(selectedProductForOptions)) {
              setReadyProducts([...readyProducts, selectedProductForOptions]);
            }
            setSelectedProductForOptions(null);
          }}
          onClose={() => setSelectedProductForOptions(null)}
        />
      )}
      {showCarousel && selectedProductForCarousel && (
        <ProductImagesOverlay product={selectedProductForCarousel} onClose={closeCarousel} />
      )}
    </>
  );
}
