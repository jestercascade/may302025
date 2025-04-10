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

export function UpsellReviewButton({
  product,
}: {
  product: UpsellReviewProductType;
}) {
  const showOverlay = useUpsellReviewStore((state) => state.showOverlay);
  const setSelectedProduct = useUpsellReviewStore(
    (state) => state.setSelectedProduct
  );

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
  const hideOverlay = useUpsellReviewStore((state) => state.hideOverlay);
  const selectedOptions = useUpsellReviewStore(
    (state) => state.selectedOptions
  );
  const readyProducts = useUpsellReviewStore((state) => state.readyProducts);
  const isVisible = useUpsellReviewStore((state) => state.isVisible);
  const selectedProduct = useUpsellReviewStore(
    (state) => state.selectedProduct
  );
  const setSelectedOptions = useUpsellReviewStore(
    (state) => state.setSelectedOptions
  );
  const setReadyProducts = useUpsellReviewStore(
    (state) => state.setReadyProducts
  );
  const hideQuickviewOverlay = useQuickviewStore((state) => state.hideOverlay);
  const showAlert = useAlertStore((state) => state.showAlert);

  const pathname = usePathname();
  const router = useRouter();
  const [showCarousel, setShowCarousel] = useState(false);
  const [selectedProductForCarousel, setSelectedProductForCarousel] =
    useState<any>(null);
  const [, startTransition] = useTransition();
  const [isInCart, setIsInCart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (cart && selectedProduct) {
      const upsells = cart.items.filter(
        (cartItem): cartItem is CartUpsellItemType => cartItem.type === "upsell"
      );

      const sameBaseUpsells = upsells.filter(
        (upsell) => upsell.baseUpsellId === selectedProduct.upsell.id
      );

      const upsellInCart = sameBaseUpsells.some((cartUpsell) => {
        return selectedProduct.upsell.products.every((product, index) => {
          const cartProduct = cartUpsell.products[index];
          const selectedOption = selectedOptions[product.id];
          return (
            cartProduct.id === product.id &&
            cartProduct.color === (selectedOption?.color || "") &&
            cartProduct.size === (selectedOption?.size || "")
          );
        });
      });

      setIsInCart(upsellInCart);
    }
  }, [cart, selectedProduct, selectedOptions]);

  useEffect(() => {
    if (isVisible && selectedProduct) {
      setSelectedOptions({});
      setReadyProducts([]);

      const autoSelectedProducts = selectedProduct.upsell.products
        .filter(
          (product) =>
            product.options.colors.length === 0 &&
            Object.keys(product.options.sizes).length === 0
        )
        .map((product) => product.id);

      setReadyProducts(autoSelectedProducts);
    }
  }, [isVisible, selectedProduct, setReadyProducts, setSelectedOptions]);

  const updateSelectedOptions = (
    productId: string,
    option: string,
    value: string
  ) => {
    const updatedOptions = {
      ...selectedOptions,
      [productId]: { ...selectedOptions[productId], [option]: value },
    };
    setSelectedOptions(updatedOptions);

    const product = selectedProduct?.upsell.products.find(
      (p) => p.id === productId
    );

    if (product) {
      const allOptionsSelected =
        (!product.options.colors.length || updatedOptions[productId].color) &&
        (!Object.keys(product.options.sizes).length ||
          updatedOptions[productId].size);

      if (allOptionsSelected && !readyProducts.includes(productId)) {
        setReadyProducts([...readyProducts, productId]);
      } else if (!allOptionsSelected && readyProducts.includes(productId)) {
        setReadyProducts(readyProducts.filter((id) => id !== productId));
      }
    }
  };

  const isProductReady = (productId: string) =>
    readyProducts.includes(productId);

  const openCarousel = (product: any) => {
    setSelectedProductForCarousel(product);
    setShowCarousel(true);
  };

  const closeCarousel = () => {
    setShowCarousel(false);
    setSelectedProductForCarousel(null);
  };

  const calculateSavings = (pricing: {
    salePrice: number;
    basePrice: number;
    discountPercentage: number;
  }) => {
    return (Number(pricing.basePrice) - Number(pricing.salePrice)).toFixed(2);
  };

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    startTransition(async () => {
      const productsToAdd = selectedProduct?.upsell.products
        .filter((product) => readyProducts.includes(product.id))
        .map((product) => ({
          id: product.id,
          color: selectedOptions[product.id]?.color || "",
          size: selectedOptions[product.id]?.size || "",
        }));

      const upsellToAdd: {
        type: "upsell";
        baseUpsellId?: string;
        products: Array<{ id: string; color: string; size: string }>;
      } = {
        type: "upsell",
        baseUpsellId: selectedProduct?.upsell.id,
        products: productsToAdd || [],
      };

      const result = await AddToCartAction(upsellToAdd);
      showAlert({
        message: result.message,
        type:
          result.type === ShowAlertType.ERROR
            ? ShowAlertType.ERROR
            : ShowAlertType.NEUTRAL,
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
      document
        .getElementById("scrollable-parent")
        ?.scrollTo({ top: 0, behavior: "smooth" });
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
                        <span className="text-[0.813rem] leading-3 font-semibold">
                          $
                        </span>
                        <span className="text-xl font-bold">
                          {Math.floor(
                            Number(selectedProduct.upsell.pricing.salePrice)
                          )}
                        </span>
                        <span className="text-[0.813rem] leading-3 font-semibold">
                          {(
                            Number(selectedProduct.upsell.pricing.salePrice) % 1
                          )
                            .toFixed(2)
                            .substring(1)}
                        </span>
                      </div>
                      <span className="text-[0.813rem] leading-3 text-gray line-through">
                        $
                        {formatThousands(
                          Number(selectedProduct.upsell.pricing.basePrice)
                        )}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-baseline text-[rgb(168,100,0)]">
                      <span className="text-[0.813rem] leading-3 font-semibold">
                        $
                      </span>
                      <span className="text-lg font-bold">
                        {Math.floor(
                          Number(selectedProduct.upsell.pricing.basePrice)
                        )}
                      </span>
                      <span className="text-[0.813rem] leading-3 font-semibold">
                        {(Number(selectedProduct.upsell.pricing.basePrice) % 1)
                          .toFixed(2)
                          .substring(1)}
                      </span>
                      <span className="ml-1 text-[0.813rem] leading-3 font-semibold">
                        today
                      </span>
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
                              isProductReady(product.id)
                                ? "bg-black"
                                : "border border-gray"
                            )}
                          >
                            {isProductReady(product.id) && (
                              <Check
                                color="#ffffff"
                                size={16}
                                strokeWidth={2}
                              />
                            )}
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
                                <ChevronRight
                                  color="#6c6c6c"
                                  size={14}
                                  strokeWidth={2}
                                />
                              </div>
                              <div className="pl-[3px] text-[0.813rem] text-gray line-through line-clamp-1 w-max">
                                ${product.basePrice}
                              </div>
                            </div>
                            <ProductOptions
                              product={product}
                              selectedOptions={
                                selectedOptions[product.id] || {}
                              }
                              onOptionSelect={(option: string, value: string) =>
                                updateSelectedOptions(product.id, option, value)
                              }
                            />
                            {index <
                              selectedProduct.upsell.products.length - 1 && (
                              <hr className="ml-[3px] mt-2" />
                            )}
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
                            readyProducts.length > 0
                              ? "bg-black"
                              : "border border-gray"
                          )}
                        >
                          {readyProducts.length > 0 && (
                            <Check color="#ffffff" size={16} strokeWidth={2} />
                          )}
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
                          <span className="min-[480px]:hidden font-semibold text-sm">
                            Selections (0)
                          </span>
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
                              readyProducts.length !==
                                selectedProduct?.upsell.products.length ||
                                isAddingToCart
                                ? "opacity-50 cursor-context-menu"
                                : "cursor-pointer hover:bg-[#cc8100] hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]"
                            )}
                            disabled={
                              readyProducts.length !==
                                selectedProduct?.upsell.products.length ||
                              isAddingToCart
                            }
                            onClick={handleAddToCart}
                          >
                            {isAddingToCart ? (
                              <Spinner size={24} color="white" />
                            ) : (
                              "Get Upgrade"
                            )}
                          </button>
                          <button
                            className={clsx(
                              "hidden text-sm min-[375px]:flex items-center justify-center min-w-[160px] max-w-60 min-[425px]:min-w-[172px] px-[10px] min-[425px]:px-4 min-[480px]:px-5 h-11 rounded-full border border-[#b27100] text-white font-semibold shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000] transition-opacity duration-200",
                              readyProducts.length !==
                                selectedProduct?.upsell.products.length ||
                                isAddingToCart
                                ? "opacity-50 cursor-context-menu"
                                : "cursor-pointer hover:bg-[#cc8100] hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]"
                            )}
                            disabled={
                              readyProducts.length !==
                                selectedProduct?.upsell.products.length ||
                              isAddingToCart
                            }
                            onClick={handleAddToCart}
                          >
                            {isAddingToCart ? (
                              <Spinner size={24} color="white" />
                            ) : (
                              "Add Upgrade to Cart"
                            )}
                          </button>
                        </>
                      )}
                      <div
                        className={clsx(
                          "animate-fade-right absolute right-0 bottom-12 min-[520px]:bottom-14 w-[248px] py-3 px-4 rounded-xl bg-[#373737] before:content-[''] before:w-[10px] before:h-[10px] before:bg-[#373737] before:rounded-br-[2px] before:rotate-45 before:origin-bottom-left before:absolute before:-bottom-0 before:right-12",
                          {
                            hidden:
                              readyProducts.length !==
                                selectedProduct?.upsell.products.length ||
                              isInCart,
                          }
                        )}
                      >
                        <p className="text-white text-sm">
                          <span className="text-[#ffe6ba]">
                            {selectedProduct?.upsell.pricing.salePrice
                              ? `Congrats! Saved $${calculateSavings(
                                  selectedProduct.upsell.pricing
                                )} -`
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
        <ProductImagesOverlay
          product={selectedProductForCarousel}
          onClose={closeCarousel}
        />
      )}
    </>
  );
}

// -- UI Components --

function ProductColors({
  colors,
  selectedColor,
  onColorSelect,
}: ProductColorsType) {
  return (
    <div
      className={`p-[3px] pr-5 flex gap-2 overflow-x-auto ${styles.customScrollbar}`}
    >
      {colors.map(({ name, image }, index) => (
        <div
          onClick={() => onColorSelect(name)}
          key={index}
          className={clsx(
            "relative min-w-[108px] max-w-[108px] min-h-[108px] max-h-[108px] flex items-center justify-center rounded-lg cursor-pointer overflow-hidden",
            { "ring-1 ring-black/60 ring-offset-2": selectedColor === name }
          )}
        >
          <Image src={image} alt={name} width={108} height={108} priority />
        </div>
      ))}
    </div>
  );
}

function ProductSizeChart({
  sizeChart,
  selectedSize,
  onSizeSelect,
}: ProductSizeChartProps) {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.productDetails.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.productDetails.overlays.sizeChart.name
  );

  const { columns, rows } = sizeChart.inches;
  const sizes = rows.map((row) => row[columns[0].label]);

  const isFeetInchFormat = (value: string) =>
    /\d+'(?:\d{1,2}")?-?\d*'?(?:\d{1,2}")?/.test(value);

  return (
    <div className="w-full pl-[3px] pr-5">
      <div className="w-full max-w-[298px] flex flex-wrap gap-2">
        {sizes.map((size, index) => (
          <div key={index} className="relative cursor-pointer">
            <div
              onClick={() => onSizeSelect(size)}
              className={clsx(
                "font-medium text-sm bg-lightgray rounded-full relative px-4 h-7 flex items-center justify-center",
                { "ring-1 ring-black/60 ring-offset-2": selectedSize === size }
              )}
            >
              {size}
            </div>
          </div>
        ))}
      </div>
      {selectedSize && (
        <div
          onClick={() => {
            showOverlay({ pageName, overlayName });
          }}
          className="w-full py-3 pl-[14px] pr-8 mt-2 rounded-lg relative cursor-pointer bg-lightgray"
        >
          <div>
            {rows.find((row) => row[columns[0].label] === selectedSize) && (
              <ul className="leading-3 max-w-[calc(100%-20px)] flex flex-row flex-wrap gap-2">
                {columns
                  .filter(
                    (column) =>
                      column.label !== "Size" &&
                      !["US", "EU", "UK", "NZ", "AU", "DE"].includes(
                        column.label
                      )
                  )
                  .sort((a, b) => a.order - b.order)
                  .map((column) => {
                    const selectedRow = rows.find(
                      (row) => row[columns[0].label] === selectedSize
                    );
                    const measurement = selectedRow
                      ? selectedRow[column.label]
                      : "";
                    return (
                      <li key={column.label} className="text-nowrap">
                        <span className="text-xs font-medium text-gray">{`${column.label}: `}</span>
                        <span className="text-xs font-semibold">
                          {measurement}
                          {!isFeetInchFormat(measurement) && measurement !== ""
                            ? " in"
                            : ""}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
          <ChevronRight
            color="#828282"
            size={18}
            strokeWidth={2}
            className="absolute top-[50%] -translate-y-1/2 right-[6px]"
          />
        </div>
      )}
    </div>
  );
}

function ProductOptions({
  product,
  selectedOptions,
  onOptionSelect,
}: ProductOptionsProps) {
  const hasColor = product.options.colors.length > 0;
  const hasSize = Object.keys(product.options.sizes).length > 0;

  return (
    <div className="flex flex-col gap-3 select-none">
      {hasColor ? (
        <ProductColors
          colors={product.options.colors}
          selectedColor={selectedOptions.color || ""}
          onColorSelect={(color) => onOptionSelect("color", color)}
        />
      ) : (
        <div className="p-[3px] pr-5">
          <div className="relative min-w-[108px] max-w-[108px] min-h-[108px] max-h-[108px] flex items-center justify-center rounded-lg overflow-hidden">
            <Image
              src={product.images.main}
              alt={product.name}
              width={108}
              height={108}
              priority
            />
          </div>
        </div>
      )}
      {hasSize && (
        <ProductSizeChart
          sizeChart={product.options.sizes}
          selectedSize={selectedOptions.size || ""}
          onSizeSelect={(size) => onOptionSelect("size", size)}
        />
      )}
    </div>
  );
}

// -- Type Definitions --

type ProductColorsType = {
  colors: Array<{
    name: string;
    image: string;
  }>;
  selectedColor: string;
  onColorSelect: (color: string) => void;
};

type SizeChartType = {
  inches: {
    columns: Array<{ label: string; order: number }>;
    rows: Array<{ [key: string]: string }>;
  };
  centimeters: {
    columns: Array<{ label: string; order: number }>;
    rows: Array<{ [key: string]: string }>;
  };
};

type ProductSizeChartProps = {
  sizeChart: SizeChartType;
  selectedSize: string;
  onSizeSelect: (size: string) => void;
};

type ProductOptionsProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    images: {
      main: string;
      gallery: string[];
    };
    options: {
      colors: Array<{
        name: string;
        image: string;
      }>;
      sizes: {
        inches: {
          columns: Array<{ label: string; order: number }>;
          rows: Array<{ [key: string]: string }>;
        };
        centimeters: {
          columns: Array<{ label: string; order: number }>;
          rows: Array<{ [key: string]: string }>;
        };
      };
    };
  };
  selectedOptions: {
    color?: string;
    size?: string;
  };
  onOptionSelect: (option: string, value: string) => void;
};
