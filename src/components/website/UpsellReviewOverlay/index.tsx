"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useNavigation } from "@/components/shared/NavigationLoadingIndicator";
import { useUpsellReviewStore } from "@/zustand/website/upsellReviewStore";
import { useQuickviewStore } from "@/zustand/website/quickviewStore";
import { useOverlayStore } from "@/zustand/website/overlayStore";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { X, Ruler, Check, ChevronDown } from "lucide-react";
import { formatThousands } from "@/lib/utils/common";
import { ShowAlertType } from "@/lib/sharedTypes";
import { AddToCartAction } from "@/actions/cart";
import { Spinner } from "@/ui/Spinners/Default";
import { usePathname } from "next/navigation";
import styles from "./styles.module.css";
import Image from "next/image";
import clsx from "clsx";

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

export function UpsellReviewOverlay({ cart }: { cart: CartType | null }) {
  const [selectedProductForOptions, setSelectedProductForOptions] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [isInCart, setIsInCart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const hideQuickviewOverlay = useQuickviewStore((state) => state.hideOverlay);
  const showAlert = useAlertStore((state) => state.showAlert);
  const pathname = usePathname();
  const { push } = useNavigation();
  const {
    hideOverlay,
    selectedOptions,
    readyProducts,
    isVisible,
    selectedProduct,
    setSelectedOptions,
    setReadyProducts,
  } = useUpsellReviewStore();

  const initialRender = useRef(true);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
    } else {
      hideOverlay();
    }
  }, [pathname, hideOverlay]);

  const isUpsellInCart = useCallback((): boolean => {
    if (!cart?.items || !selectedProduct?.upsell) return false;

    const allProductsReady = selectedProduct.upsell.products.every((product) => {
      const requiresOptions = product.options.groups.some((group) => group.values.some((option) => option.isActive));
      if (!requiresOptions) return true;
      return readyProducts.includes(product.id);
    });

    if (!allProductsReady) return false;

    return cart.items.some((item) => {
      if (item.type !== "upsell" || item.baseUpsellId !== selectedProduct.upsell.id) {
        return false;
      }

      const upsellProducts = selectedProduct.upsell.products;
      const cartProducts = (item as CartUpsellItemType).products;

      if (upsellProducts.length !== cartProducts.length) return false;

      for (const upsellProduct of upsellProducts) {
        const cartProduct = cartProducts.find((p) => p.id === upsellProduct.id);
        if (!cartProduct) return false;

        const productSelectedOptions = selectedOptions[upsellProduct.id] || {};

        const upsellOptions: Record<string, SelectedOptionType> = {};
        for (const [groupIdStr, optionId] of Object.entries(productSelectedOptions)) {
          const groupId = Number(groupIdStr);
          const group = upsellProduct.options.groups.find((g) => g.id === groupId);
          const optionIndex = group?.values.findIndex((v) => v.id === optionId);

          if (group && optionIndex !== undefined && optionIndex !== -1) {
            const option = group.values[optionIndex];
            upsellOptions[group.name.toLowerCase()] = {
              value: option.value,
              optionDisplayOrder: optionIndex,
              groupDisplayOrder: group.displayOrder,
            };
          }
        }

        const cartOptionKeys = Object.keys(cartProduct.selectedOptions);
        const upsellOptionKeys = Object.keys(upsellOptions);

        if (cartOptionKeys.length !== upsellOptionKeys.length) return false;

        for (const key of upsellOptionKeys) {
          if (
            !cartProduct.selectedOptions[key] ||
            cartProduct.selectedOptions[key].value !== upsellOptions[key].value
          ) {
            return false;
          }
        }
      }

      return true;
    });
  }, [cart, selectedProduct, readyProducts, selectedOptions]);

  useEffect(() => {
    if (isVisible && selectedProduct) {
      const autoReadyProducts = selectedProduct.upsell.products
        .filter((product) => product.options.groups.every((group) => group.values.every((option) => !option.isActive)))
        .map((product) => product.id);

      setReadyProducts(autoReadyProducts);
      setSelectedOptions({});
    }
  }, [isVisible, selectedProduct, setReadyProducts, setSelectedOptions]);

  useEffect(() => {
    if (isVisible && selectedProduct) {
      const cartStatus = isUpsellInCart();
      setIsInCart(cartStatus);
    }
  }, [isVisible, selectedProduct, isUpsellInCart]);

  const calculateSavings = (pricing: { basePrice: number; salePrice: number }): string => {
    return (Number(pricing.basePrice) - Number(pricing.salePrice)).toFixed(2);
  };

  const areAllProductsReady = useMemo(() => {
    if (!selectedProduct) return false;

    return selectedProduct.upsell.products.every((product) => {
      const hasActiveOptions = product.options.groups.some((group) => group.values.some((option) => option.isActive));

      if (!hasActiveOptions) return true;

      return readyProducts.includes(product.id);
    });
  }, [selectedProduct, readyProducts]);

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    startTransition(async () => {
      if (!selectedProduct) return;

      const productsToAdd = selectedProduct.upsell.products.map((product) => {
        const productSelectedOptions = selectedOptions[product.id] || {};
        const readableOptions: Record<string, SelectedOptionType> = {};
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

      const upsellToAdd: CartUpsellItemType = {
        type: "upsell",
        baseUpsellId: selectedProduct.upsell.id,
        products: productsToAdd,
      };

      const result = await AddToCartAction(upsellToAdd);
      showAlert({
        message: result.message,
        type: result.type === ShowAlertType.ERROR ? ShowAlertType.ERROR : ShowAlertType.SUCCESS,
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
      push("/cart");
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
                          <span className="block min-[425px]:hidden font-semibold text-sm">
                            Selected ({readyProducts.length}/{selectedProduct.upsell.products.length})
                          </span>
                          <span className="hidden min-[425px]:block min-[480px]:hidden font-semibold text-sm">
                            Selections ({readyProducts.length}/{selectedProduct.upsell.products.length})
                          </span>
                          <span className="hidden min-[480px]:block pl-[3px] font-semibold text-sm min-[520px]:text-base">
                            Confirm selections ({readyProducts.length}/{selectedProduct.upsell.products.length})
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="min-[480px]:hidden font-semibold text-sm">
                            Selections (0/{selectedProduct.upsell.products.length})
                          </span>
                          <span className="hidden min-[480px]:block font-semibold text-sm min-[520px]:text-base">
                            Selections (0/{selectedProduct.upsell.products.length})
                          </span>
                        </>
                      )}
                    </div>
                    <div className="relative">
                      {isInCart ? (
                        <>
                          <button
                            onClick={handleInCartButtonClick}
                            className="min-[425px]:hidden animate-fade px-3 flex items-center justify-center w-full h-11 rounded-full cursor-pointer border border-[#c5c3c0] text-blue text-sm font-semibold shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear-gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]"
                          >
                            View in Cart
                          </button>
                          <button
                            onClick={handleInCartButtonClick}
                            className="hidden animate-fade px-4 min-[425px]:flex items-center justify-center w-full h-11 rounded-full cursor-pointer border border-[#c5c3c0] text-blue font-semibold shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear-gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]"
                          >
                            In Cart - See Now
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className={clsx(
                              "min-[375px]:hidden text-sm flex items-center justify-center min-w-28 max-w-28 px-[10px] h-11 rounded-full border border-[#b27100] text-white font-semibold shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000] transition-opacity duration-200",
                              !areAllProductsReady || isAddingToCart
                                ? "opacity-50 cursor-context-menu"
                                : "cursor-pointer hover:bg-[#cc8100] hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]"
                            )}
                            disabled={!areAllProductsReady || isAddingToCart}
                            onClick={handleAddToCart}
                          >
                            {isAddingToCart ? <Spinner size={24} color="white" /> : "Get Upgrade"}
                          </button>
                          <button
                            className={clsx(
                              "hidden text-sm min-[375px]:flex items-center justify-center min-w-[160px] max-w-60 min-[425px]:min-w-[172px] px-[10px] min-[425px]:px-4 min-[480px]:px-5 h-11 rounded-full border border-[#b27100] text-white font-semibold shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000] transition-opacity duration-200",
                              !areAllProductsReady || isAddingToCart
                                ? "opacity-50 cursor-context-menu"
                                : "cursor-pointer hover:bg-[#cc8100] hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]"
                            )}
                            disabled={!areAllProductsReady || isAddingToCart}
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
                            hidden: !areAllProductsReady || isInCart,
                          }
                        )}
                      >
                        <p className="text-white text-sm">
                          <span className="text-[#ffe6ba]">
                            {selectedProduct.upsell.pricing.salePrice
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
      {selectedProduct && selectedProductForOptions && (
        <OptionSelectionModal
          product={selectedProduct.upsell.products.find((p) => p.id === selectedProductForOptions)!}
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
    </>
  );
}

// -- Helper Functions --

function UpsellProductSummary({ product, selectedOptions, onSelectOptions }: UpsellProductSummaryProps) {
  const hasActiveOptions = product.options.groups.some((group) => group.values.some((opt) => opt.isActive));

  const isOptionsSelected = useMemo(() => {
    if (!hasActiveOptions) return true;

    return product.options.groups
      .filter((group) => group.values.some((opt) => opt.isActive))
      .every((group) => selectedOptions[group.id] !== undefined);
  }, [product, selectedOptions, hasActiveOptions]);

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
        .filter((tag): tag is string => tag !== null)
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
            isOptionsSelected ? "bg-black" : "border border-gray-300"
          )}
        >
          {isOptionsSelected && <Check color="#ffffff" size={16} strokeWidth={2} />}
        </div>
      </div>
      <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-3 border border-[#e5e7eb] shadow-sm transition-all duration-200 hover:shadow-md hover:bg-opacity-100 flex-1">
        <div className="flex flex-col min-[580px]:flex-row gap-4">
          {/* Mobile image (visible below 580px) */}
          <div className="min-[580px]:hidden aspect-square h-[160px]">
            <div className="flex items-center justify-center h-full w-max mx-auto overflow-hidden rounded-lg bg-gradient-to-br from-[#f3f4f6] to-[#e5e7eb] border border-[#e5e7eb]">
              <Image
                src={product.images.main}
                alt={product.name}
                width={160}
                height={160}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Desktop image (visible above 580px) */}
          <div className="hidden min-[580px]:flex items-center justify-center min-[580px]:min-w-[128px] min-[580px]:max-w-[128px] min-[580px]:min-h-[128px] min-[580px]:max-h-[128px] overflow-hidden rounded-lg bg-gradient-to-br from-[#f3f4f6] to-[#e5e7eb] border border-[#e5e7eb]">
            <Image
              src={product.images.main}
              alt={product.name}
              width={128}
              height={128}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          <div className="space-y-3 w-full">
            <button onClick={() => onSelectOptions(product.id)} className="text-xs line-clamp-1 hover:underline">
              {product.name}
            </button>

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

function OptionSelectionModal({
  product,
  currentSelectedOptions,
  onOptionsSelected,
  onClose,
}: OptionSelectionModalProps) {
  const [localSelectedOptions, setLocalSelectedOptions] = useState<Record<number, number>>(
    currentSelectedOptions || {}
  );
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const productDetailsPage = useOverlayStore((state) => state.pages.productDetails);

  const chaining = product.options.config?.chaining;
  const isChainingEnabled = chaining?.enabled ?? false;
  const relationships = isChainingEnabled ? chaining.relationships || [] : [];
  const validParentOptions = new Map<number, Set<number>>();
  const validChildOptions = new Map<number, Set<number>>();

  relationships.forEach((relationship) => {
    const { parentGroupId, childGroupId, constraints } = relationship;

    if (!validParentOptions.has(parentGroupId)) {
      validParentOptions.set(parentGroupId, new Set<number>());
    }
    if (!validChildOptions.has(childGroupId)) {
      validChildOptions.set(childGroupId, new Set<number>());
    }

    const childGroup = product.options.groups.find((group) => group.id === childGroupId);
    const parentGroup = product.options.groups.find((group) => group.id === parentGroupId);
    if (!childGroup || !parentGroup) return;

    Object.entries(constraints).forEach(([parentOptionIdStr, allowedChildIds]) => {
      const parentOptionId = Number(parentOptionIdStr);

      const parentOption = parentGroup.values.find((opt) => opt.id === parentOptionId);
      if (!parentOption?.isActive) return;

      const hasValidChild = allowedChildIds.some((childId) => {
        const childOption = childGroup.values.find((opt) => opt.id === childId);
        return childOption && childOption.isActive;
      });

      if (hasValidChild) {
        validParentOptions.get(parentGroupId)?.add(parentOptionId);

        allowedChildIds.forEach((childId) => {
          const childOption = childGroup.values.find((opt) => opt.id === childId);
          if (childOption?.isActive) {
            validChildOptions.get(childGroupId)?.add(childId);
          }
        });
      }
    });
  });

  const isOptionDisabled = (groupId: number, optionId: number): boolean => {
    const group = product.options.groups.find((g) => g.id === groupId);
    const option = group?.values.find((o) => o.id === optionId);
    if (!option?.isActive) return true;

    if (isChainingEnabled) {
      const isParent = relationships.some((rel) => rel.parentGroupId === groupId);
      if (isParent) {
        if (!validParentOptions.get(groupId)?.has(optionId)) {
          return true;
        }

        const childSelectionsInvalid = relationships.some((rel) => {
          if (rel.parentGroupId !== groupId) return false;

          const childGroupId = rel.childGroupId;
          const selectedChildId = localSelectedOptions[childGroupId];

          if (selectedChildId !== undefined) {
            const allowedChildIds = rel.constraints[optionId] || [];
            return !allowedChildIds.includes(selectedChildId);
          }

          return false;
        });

        if (childSelectionsInvalid) {
          return true;
        }
      }

      const relationshipAsChild = relationships.find((rel) => rel.childGroupId === groupId);
      if (relationshipAsChild) {
        const { parentGroupId, constraints } = relationshipAsChild;
        const selectedParentId = localSelectedOptions[parentGroupId];

        if (selectedParentId !== undefined) {
          const allowedChildIds = constraints[selectedParentId] || [];
          return !allowedChildIds.includes(optionId);
        } else {
          const hasAnyValidParent = Object.entries(constraints).some(([parentIdStr, allowedChildIds]) => {
            const parentId = Number(parentIdStr);
            return validParentOptions.get(parentGroupId)?.has(parentId) && allowedChildIds.includes(optionId);
          });
          return !hasAnyValidParent;
        }
      }
    }

    return false;
  };

  const handleSelectOption = (groupId: number, optionId: number) => {
    if (isOptionDisabled(groupId, optionId)) return;

    const updated = { ...localSelectedOptions, [groupId]: optionId };

    if (isChainingEnabled) {
      relationships.forEach((rel) => {
        if (rel.parentGroupId === groupId) {
          const childGroupId = rel.childGroupId;
          const selectedChildId = localSelectedOptions[childGroupId];

          if (selectedChildId !== undefined) {
            const allowedChildIds = rel.constraints[optionId] || [];
            if (!allowedChildIds.includes(selectedChildId)) {
              delete updated[childGroupId];
            }
          }
        }
      });
    }

    setLocalSelectedOptions(updated);
  };

  const requiredGroups = product.options.groups.filter((group) => group.values.some((opt) => opt.isActive));
  const isAllSelected = requiredGroups.every((group) => localSelectedOptions[group.id] !== undefined);

  const hasOptions = product.options.groups.some((group) => group.values.some((opt) => opt.isActive));
  const hasGallery = Array.isArray(product.images.gallery) && product.images.gallery.length > 0;

  type MeasurementType = {
    label: string;
    value: string;
  };

  const getMeasurements = (group: OptionGroupType, selectedOptionId: number): MeasurementType[] => {
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

  const sizeLabels = new Set(["XXXS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "2XL", "3XL", "4XL", "5XL"]);
  const countryCodes = new Set(["US", "UK", "EU", "FR", "IT", "JP", "AU", "CN"]);

  const formatMeasurement = (label: string, value: string): string => {
    if (sizeLabels.has(value) || countryCodes.has(value)) return value;
    if (value.includes("'") || value.includes('"') || value.includes("cm") || value.includes("in")) return value;
    if (/^\d+(\/\d+)?$/.test(value)) return value;
    if (label.toLowerCase() === "height" && value.includes("-")) return value + "cm";
    return value + " in";
  };

  const handleSizeChartClick = () => {
    showOverlay({
      pageName: productDetailsPage.name,
      overlayName: productDetailsPage.overlays.sizeChart.name,
    });
  };

  const sections: React.ReactNode[] = [];

  sections.push(
    <div key="main-image" className="w-[320px] h-[320px] rounded-lg overflow-hidden">
      <Image
        src={product.images.main}
        alt={product.name}
        width={320}
        height={320}
        className="w-full h-auto object-cover"
      />
    </div>
  );

  if (hasOptions) {
    sections.push(
      <div key="options" className="flex flex-col gap-4">
        {product.options.groups.map((group) => (
          <div key={group.id}>
            <h3 className="text-sm font-medium mb-2">{group.name}</h3>
            <div className="flex flex-wrap gap-2">
              {group.values.map((option) => {
                const disabled = isOptionDisabled(group.id, option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(group.id, option.id)}
                    disabled={disabled}
                    className={`px-3 py-1.5 min-w-[3rem] rounded-full text-sm transition-all duration-150 ease-in-out ${
                      localSelectedOptions[group.id] === option.id
                        ? "bg-black text-white"
                        : disabled
                        ? "border-2 border-dashed border-gray-300 text-gray-400 opacity-50 cursor-not-allowed"
                        : "bg-neutral-100 text-black hover:bg-neutral-200"
                    }`}
                  >
                    {option.value}
                  </button>
                );
              })}
            </div>
            {group.name.toLowerCase() === "size" && localSelectedOptions[group.id] !== undefined && (
              <div className="mt-3">
                <div className="bg-neutral-50 rounded-lg px-3 py-2.5 max-w-72 border border-neutral-100">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    {getMeasurements(group, localSelectedOptions[group.id]).map((m) => {
                      if (!m.value) return null;
                      return (
                        <div key={m.label} className="flex items-center text-xs text-black">
                          <span className="mr-1">{m.label}:</span>
                          <span className="font-semibold">{formatMeasurement(m.label, m.value)}</span>
                        </div>
                      );
                    })}
                  </div>
                  {group.sizeChart && (
                    <button
                      onClick={handleSizeChartClick}
                      className="mt-2 text-xs text-blue hover:text-blue-dimmed transition-colors flex items-center"
                    >
                      <Ruler size={12} className="mr-1.5" />
                      View Measurements
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (hasGallery) {
    sections.push(
      <div key="gallery" className="flex flex-col gap-3">
        {product.images.gallery.map((image, index) => (
          <div key={index} className="w-full rounded-lg overflow-hidden border border-gray-100">
            <Image
              src={image}
              alt={`${product.name} - Image ${index + 1}`}
              width={320}
              height={320}
              className="w-full h-auto"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-start pt-16 z-40">
      <div className="bg-white relative rounded-2xl shadow-lg py-5 max-w-md w-[calc(100%-36px)] h-[calc(90vh)] max-h-[564px] flex flex-col">
        <div className="flex justify-between items-center mb-4 px-5">
          <h2 className="text-lg font-semibold">{product.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full absolute top-[6px] right-[6px] flex items-center justify-center ease-in-out transition duration-300 active:bg-lightgray lg:hover:bg-lightgray"
        >
          <X color="#6c6c6c" strokeWidth={1.5} />
        </button>
        <div className="overflow-y-auto flex-1 pl-5 pr-3 pb-5 rounded-y-scrollbar">
          {sections.map((section, index) => (
            <div key={index}>
              {index > 0 && <div className="h-px bg-lightgray w-full my-5"></div>}
              {section}
            </div>
          ))}
        </div>
        <div className="pt-3 px-5 border-t border-gray-200">
          <button
            disabled={!isAllSelected}
            onClick={() => {
              onOptionsSelected(localSelectedOptions);
              onClose();
            }}
            className={`w-full py-2 rounded-lg font-semibold transition-colors ${
              isAllSelected ? "bg-blue text-white hover:bg-blue-dimmed" : "bg-neutral-100 text-gray cursor-not-allowed"
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// -- Type Definitions --

type UpsellProductSummaryProps = {
  product: UpsellProductType;
  selectedOptions: Record<number, number>;
  onSelectOptions: (productId: string) => void;
};

type OptionSelectionModalProps = {
  product: UpsellProductType;
  currentSelectedOptions: Record<number, number>;
  onOptionsSelected: (newOptions: Record<number, number>) => void;
  onClose: () => void;
};

type VisibilityType = "DRAFT" | "PUBLISHED" | "HIDDEN";

type SizeChartType = {
  centimeters?: {
    columns: Array<{ label: string; order: number }>;
    rows: Array<{ [key: string]: string }>;
  };
  inches?: {
    columns: Array<{ label: string; order: number }>;
    rows: Array<{ [key: string]: string }>;
  };
};

type OptionGroupType = {
  id: number;
  name: string;
  displayOrder: number;
  values: Array<{
    id: number;
    value: string;
    isActive: boolean;
  }>;
  sizeChart?: SizeChartType;
};

type ProductOptionsType = {
  groups: Array<OptionGroupType>;
  config: {
    chaining: {
      enabled: boolean;
      relationships: Array<{
        parentGroupId: number;
        childGroupId: number;
        constraints: { [parentOptionId: string]: number[] };
      }>;
    };
  };
};

type UpsellProductType = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  images: {
    main: string;
    gallery: string[];
  };
  options: ProductOptionsType;
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
    visibility: VisibilityType;
    createdAt: string;
    updatedAt: string;
    products: UpsellProductType[];
  };
};

type SelectedOptionType = {
  value: string;
  optionDisplayOrder: number;
  groupDisplayOrder: number;
};

type CartProductItemType = {
  type: "product";
  baseProductId: string;
  selectedOptions: Record<string, SelectedOptionType>;
  variantId: string;
  index: number;
};

type CartUpsellItemType = {
  type: "upsell";
  baseUpsellId: string;
  products: Array<{
    id: string;
    selectedOptions: Record<string, SelectedOptionType>;
  }>;
};

type CartType = {
  id: string;
  device_identifier: string;
  items: Array<CartProductItemType | CartUpsellItemType>;
  createdAt: string;
  updatedAt: string;
};
