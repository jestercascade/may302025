"use client";

import { useUpsellReviewStore } from "@/zustand/website/upsellReviewStore";
import { useOverlayStore } from "@/zustand/website/overlayStore";
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
import { X, ChevronRight, Check } from "lucide-react";

// -- UpsellReviewButton Component --

export function UpsellReviewButton({ product }: { product: UpsellReviewProductType }) {
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

// -- UpsellReviewOverlay Component --

export function UpsellReviewOverlay({ cart }: { cart: CartType | null }) {
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
  const [selectedProductForCarousel, setSelectedProductForCarousel] = useState<any>(null);
  const [, startTransition] = useTransition();
  const [isInCart, setIsInCart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (cart && selectedProduct) {
      const upsells = cart.items.filter((item): item is CartUpsellItemType => item.type === "upsell");
      const sameBaseUpsells = upsells.filter((upsell) => upsell.baseUpsellId === selectedProduct.upsell.id);

      const upsellInCart = sameBaseUpsells.some((cartUpsell) => {
        return selectedProduct.upsell.products.every((product, index) => {
          const cartProduct = cartUpsell.products[index];
          const productOptions = selectedOptions[product.id] || {};
          const readableOptions: Record<string, string> = {};
          for (const [groupId, optionId] of Object.entries(productOptions)) {
            const group = product.options.groups.find((g) => g.id === Number(groupId));
            const option = group?.values.find((v) => v.id === optionId);
            if (group && option) {
              readableOptions[group.name.toLowerCase()] = option.value;
            }
          }
          // Assuming CartUpsellItemType is updated to use selectedOptions
          const cartOptions = (cartProduct as any).selectedOptions || {
            color: cartProduct.color,
            size: cartProduct.size,
          };
          return (
            cartProduct.id === product.id &&
            Object.keys(readableOptions).every((key) => cartOptions[key] === readableOptions[key])
          );
        });
      });
      setIsInCart(upsellInCart);
    }
  }, [cart, selectedProduct, selectedOptions]);

  useEffect(() => {
    if (isVisible && selectedProduct) {
      const autoReadyProducts = selectedProduct.upsell.products
        .filter((product) => product.options.groups.every((group) => group.values.every((option) => !option.isActive)))
        .map((product) => product.id);
      setReadyProducts(autoReadyProducts);
      setSelectedOptions({});
    }
  }, [isVisible, selectedProduct, setReadyProducts, setSelectedOptions]);

  const handleOptionSelect = (productId: string, groupId: number, optionId: number) => {
    const updatedOptions = {
      ...selectedOptions,
      [productId]: {
        ...selectedOptions[productId],
        [groupId]: optionId,
      },
    };
    setSelectedOptions(updatedOptions);

    const product = selectedProduct?.upsell.products.find((p) => p.id === productId);
    if (product) {
      const requiredGroups = product.options.groups.filter((group) => group.values.some((option) => option.isActive));
      const isReady = requiredGroups.every((group) => updatedOptions[productId]?.[group.id] !== undefined);
      if (isReady && !readyProducts.includes(productId)) {
        setReadyProducts([...readyProducts, productId]);
      } else if (!isReady && readyProducts.includes(productId)) {
        setReadyProducts(readyProducts.filter((id) => id !== productId));
      }
    }
  };

  const isProductReady = (productId: string) => readyProducts.includes(productId);

  const openCarousel = (product: any) => {
    setSelectedProductForCarousel(product);
    setShowCarousel(true);
  };

  const closeCarousel = () => {
    setShowCarousel(false);
    setSelectedProductForCarousel(null);
  };

  const calculateSavings = (pricing: { salePrice: number; basePrice: number; discountPercentage: number }) => {
    return (Number(pricing.basePrice) - Number(pricing.salePrice)).toFixed(2);
  };

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    startTransition(async () => {
      const productsToAdd = selectedProduct!.upsell.products.map((product) => {
        const productSelectedOptions = selectedOptions[product.id] || {};
        const readableOptions: Record<string, string> = {};
        for (const [groupIdStr, optionId] of Object.entries(productSelectedOptions)) {
          const group = product.options.groups.find((g) => g.id === Number(groupIdStr));
          const option = group?.values.find((v) => v.id === optionId);
          if (group && option) {
            readableOptions[group.name.toLowerCase()] = option.value;
          }
        }
        return {
          id: product.id,
          selectedOptions: readableOptions,
        };
      });

      const upsellToAdd = {
        type: "upsell" as const,
        baseUpsellId: selectedProduct!.upsell.id,
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
              <div className="pl-5 pt-4 pb-24 flex flex-col gap-5 items-center custom-scrollbar overflow-x-hidden overflow-y-visible">
                <div className="w-full h-[600px] flex flex-col gap-5">
                  {selectedProduct.upsell.products.map((product, index) => (
                    <div key={index} className="w-full flex gap-5">
                      <div className="w-full flex gap-3">
                        <div className="h-[161px] w-5 flex items-end">
                          <div
                            className={clsx(
                              "w-5 h-5 rounded-full mb-11 flex items-center justify-center",
                              isProductReady(product.id) ? "bg-black" : "border border-gray"
                            )}
                          >
                            {isProductReady(product.id) && <Check color="#ffffff" size={16} strokeWidth={2} />}
                          </div>
                        </div>
                        <div className="flex gap-5 w-[calc(100%-28px)] overflow-hidden">
                          <div className="w-full flex flex-col gap-2">
                            <div>
                              <div
                                onClick={() => openCarousel(product)}
                                className="mb-[2px] w-max flex items-center gap-[7px] cursor-pointer group"
                              >
                                <span className="pl-[3px] text-sm font-medium line-clamp-1 group-hover:underline">
                                  {product.name}
                                </span>
                                <ChevronRight color="#6c6c6c" size={14} strokeWidth={2} />
                              </div>
                              <div className="pl-[3px] text-[0.813rem] text-gray line-through line-clamp-1 w-max">
                                ${product.basePrice}
                              </div>
                            </div>
                            <ProductOptionGroups
                              product={product}
                              selectedOptions={selectedOptions[product.id] || {}}
                              onOptionSelect={handleOptionSelect}
                            />
                            {index < selectedProduct.upsell.products.length - 1 && <hr className="ml-[3px] mt-2" />}
                          </div>
                        </div>
                      </div>
                    </div>
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
                            className="hidden animate-fade px-4 min-[365px]:flex items-center justify-center w-full h-11 rounded-full cursor-pointer border border-[#c5c3c0] text-blue text-sm font-semibold shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear-gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]"
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
                                : "cursor-pointer hover:bg-[#cc8100] hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]"
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
                              "hidden text-sm min-[375px]:flex items-center justify-center min-w-[160px] max-w-60 min-[425px]:min-w-[172px] px-[10px] min-[425px]:px-4 min-[480px]:px-5 h-11 rounded-full border border-[#b27100] text-white font-semibold shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000] transition-opacity duration-200",
                              readyProducts.length !== selectedProduct?.upsell.products.length || isAddingToCart
                                ? "opacity-50 cursor-context-menu"
                                : "cursor-pointer hover:bg-[#cc8100] hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]"
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
      {showCarousel && selectedProductForCarousel && (
        <ProductImagesOverlay product={selectedProductForCarousel} onClose={closeCarousel} />
      )}
    </>
  );
}

// -- ProductOptionGroups Component --

type ProductOptionGroupsProps = {
  product: UpsellReviewProductType["upsell"]["products"][number];
  selectedOptions: Record<number, number>;
  onOptionSelect: (productId: string, groupId: number, optionId: number) => void;
};

function ProductOptionGroups({ product, selectedOptions, onOptionSelect }: ProductOptionGroupsProps) {
  const getMeasurements = (group: OptionGroupType, selectedOptionId: number) => {
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
    <div className="flex flex-col gap-3 pl-[3px] pr-5">
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
                    onClick={() => onOptionSelect(product.id, group.id, option.id)}
                    className={clsx(
                      "px-3 py-1.5 min-w-12 rounded-full text-sm",
                      selectedOptions[group.id] === option.id
                        ? "bg-black text-white"
                        : "bg-neutral-100 text-black hover:bg-neutral-200"
                    )}
                  >
                    {option.value}
                  </button>
                ))}
            </div>
            {group.sizeChart && selectedOptions[group.id] && (
              <div className="mt-2 bg-lightgray rounded-lg p-2">
                {getMeasurements(group, selectedOptions[group.id]).map((m) => (
                  <div key={m.label} className="text-xs">
                    {m.label}: {m.value}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      {product.options.groups.every((group) => !group.values.some((opt) => opt.isActive)) && (
        <div className="p-[3px]">
          <Image
            src={product.images.main}
            alt={product.name}
            width={108}
            height={108}
            priority
            className="rounded-lg"
          />
        </div>
      )}
    </div>
  );
}

// -- Type Definitions --

// Assuming these are defined elsewhere in the project
type OptionGroupType = {
  id: number;
  name: string;
  displayOrder: number;
  values: Array<{
    id: number;
    value: string;
    isActive: boolean;
  }>;
  sizeChart?: {
    inches?: {
      columns: Array<{ label: string; order: number }>;
      rows: Array<{ [key: string]: string }>;
    };
  };
};

type ProductOptionsType = {
  groups: OptionGroupType[];
};

type UpsellReviewProductType = {
  id: string;
  upsell: {
    id: string;
    mainImage: string;
    pricing: {
      basePrice: number;
      salePrice: number;
      discountPercentage: number;
    };
    visibility: string;
    createdAt: string;
    updatedAt: string;
    products: Array<{
      id: string;
      name: string;
      slug: string;
      basePrice: number;
      images: {
        main: string;
        gallery: string[];
      };
      options: ProductOptionsType;
    }>;
  };
};

type CartUpsellItemType = {
  index: number;
  baseUpsellId: string;
  variantId: string;
  type: "upsell";
  products: Array<{
    id: string;
    selectedOptions: Record<string, string>; // Updated from color/size
  }>;
};

type CartType = {
  id: string;
  device_identifier: string;
  items: Array<any>;
  createdAt: string;
  updatedAt: string;
};
