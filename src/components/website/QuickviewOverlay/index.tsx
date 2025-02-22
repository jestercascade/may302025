"use client";

import { useQuickviewStore } from "@/zustand/website/quickviewStore";
import { formatThousands } from "@/lib/utils/common";
import { useRouter } from "next/navigation";
import { SizeChartOverlay } from "../ProductDetails/SizeChartOverlay";
import { CartAndUpgradeButtons } from "../CartAndUpgradeButtons";
import { QuickviewOptions } from "../Options/QuickviewOptions";
import { ImageGallery } from "../ProductDetails/ImageGallery";
import { X, ChevronRight, Check } from "lucide-react";
import styles from "./styles.module.css";
import Image from "next/image";
import clsx from "clsx";
import { useEffect } from "react";

export function QuickviewButton({
  onClick,
  product,
  cart,
}: {
  onClick?: (event: React.MouseEvent) => void;
  product: ProductWithUpsellType;
  cart: CartType | null;
}) {
  const showOverlay = useQuickviewStore((state) => state.showOverlay);
  const setSelectedProduct = useQuickviewStore(
    (state) => state.setSelectedProduct
  );

  const handleClick = (event: React.MouseEvent) => {
    if (onClick) {
      event.stopPropagation();
      onClick(event);
    }

    setSelectedProduct(product, cart);
    showOverlay();
  };

  return (
    <button
      onClick={handleClick}
      className="outline-none border-none rounded-full w-[40px] h-[26px] flex items-center justify-center relative before:content-[''] before:absolute before:top-0 before:bottom-0 before:left-0 before:right-0 before:border before:border-black before:rounded-full before:transition before:duration-100 before:ease-in-out active:before:scale-105 md:hover:before:scale-105"
    >
      <Image
        src="/icons/cart_plus.svg"
        alt="Add to cart"
        width={16}
        height={16}
        priority={true}
      />
    </button>
  );
}

export function QuickviewOverlay() {
  const hideOverlay = useQuickviewStore((state) => state.hideOverlay);
  const isVisible = useQuickviewStore((state) => state.isVisible);
  const cart = useQuickviewStore((state) => state.cart);
  const selectedProduct = useQuickviewStore((state) => state.selectedProduct);

  useEffect(() => {
    hideOverlay();
  }, [hideOverlay]);

  useEffect(() => {
    document.body.style.overflow = isVisible ? "hidden" : "visible";
    return () => {
      document.body.style.overflow = "visible";
    };
  }, [isVisible]);

  if (!isVisible || !selectedProduct) {
    return null;
  }

  return (
    <>
      {isVisible && selectedProduct && (
        <div className="flex justify-center w-full h-dvh z-20 fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-40 backdrop-blur-sm">
          <MobileProductDetails
            selectedProduct={selectedProduct}
            cart={cart}
            hideOverlay={hideOverlay}
          />
          <DesktopProductDetails
            selectedProduct={selectedProduct}
            cart={cart}
            hideOverlay={hideOverlay}
          />
        </div>
      )}
      <SizeChartOverlay
        productInfo={{
          id: selectedProduct.id,
          name: selectedProduct.name,
          pricing: selectedProduct.pricing,
          images: selectedProduct.images,
          options: selectedProduct.options,
        }}
      />
    </>
  );
}

// -- UI Components --

function MobileProductDetails({
  selectedProduct,
  cart,
  hideOverlay,
}: {
  selectedProduct: ProductWithUpsellType;
  cart: CartType | null;
  hideOverlay: () => void;
}) {
  const hasColor = selectedProduct.options.colors.length > 0;
  const hasSize = Object.keys(selectedProduct.options.sizes).length > 0;

  return (
    <div className="md:hidden absolute bottom-0 left-0 right-0 top-16 bg-white rounded-t-[20px] flex flex-col">
      <div className="flex items-center justify-end px-2 py-1">
        <button
          onClick={hideOverlay}
          className="h-7 w-7 rounded-full flex items-center justify-center transition duration-300 ease-in-out active:bg-lightgray"
          type="button"
        >
          <X color="#6c6c6c" strokeWidth={1.5} />
        </button>
      </div>
      <div className="w-full h-full invisible-scrollbar overflow-x-hidden overflow-y-visible">
        <div className="h-56 min-[486px]:h-72 flex gap-2 px-5 invisible-scrollbar overflow-y-hidden overflow-x-visible">
          {[selectedProduct.images.main, ...selectedProduct.images.gallery].map(
            (image, index) => (
              <div key={index} className="h-full aspect-square bg-lightgray">
                <Image
                  src={image}
                  alt={selectedProduct.name}
                  sizes="(max-width: 486px) 244px, 288px"
                  width={288}
                  height={288}
                  priority={true}
                />
              </div>
            )
          )}
        </div>
        <div className="px-5 pt-5 pb-28 max-w-[486px] mx-auto">
          <div className="flex flex-col gap-4">
            <p className="-mb-1 line-clamp-2 leading-[1.125rem] text-[0.75rem] text-gray">
              {selectedProduct.name}
            </p>
            {selectedProduct.highlights.headline && (
              <div className="flex flex-col gap-4">
                <div
                  className="text-lg leading-[26px] [&>:last-child]:mb-0"
                  dangerouslySetInnerHTML={{
                    __html: selectedProduct.highlights.headline || "",
                  }}
                />
                <ul className="text-sm list-inside *:leading-5">
                  {selectedProduct.highlights.keyPoints
                    .slice()
                    .sort((a, b) => a.index - b.index)
                    .map((point) => (
                      <li
                        key={point.index}
                        className="flex items-start gap-1 mb-2 last:mb-0"
                      >
                        <div className="min-w-4 max-w-4 min-h-5 max-h-5 flex items-center justify-center">
                          <Check
                            color="#0A8800"
                            size={20}
                            strokeWidth={2}
                            className="-ml-1"
                          />
                        </div>
                        <span>{point.text}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-5">
              <div className="w-max flex items-center justify-center">
                {Number(selectedProduct.pricing.salePrice) ? (
                  <div className="flex items-center gap-[6px]">
                    <div
                      className={clsx(
                        "flex items-baseline",
                        !selectedProduct.upsell && "text-[rgb(168,100,0)]"
                      )}
                    >
                      <span className="text-[0.813rem] leading-3 font-semibold">
                        $
                      </span>
                      <span className="text-lg font-bold">
                        {Math.floor(Number(selectedProduct.pricing.salePrice))}
                      </span>
                      <span className="text-[0.813rem] leading-3 font-semibold">
                        {(Number(selectedProduct.pricing.salePrice) % 1)
                          .toFixed(2)
                          .substring(1)}
                      </span>
                    </div>
                    <span className="text-[0.813rem] leading-3 text-gray line-through">
                      $
                      {formatThousands(
                        Number(selectedProduct.pricing.basePrice)
                      )}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-baseline">
                    <span className="text-[0.813rem] leading-3 font-semibold">
                      $
                    </span>
                    <span className="text-lg font-bold">
                      {Math.floor(Number(selectedProduct.pricing.basePrice))}
                    </span>
                    <span className="text-[0.813rem] leading-3 font-semibold">
                      {(Number(selectedProduct.pricing.basePrice) % 1)
                        .toFixed(2)
                        .substring(1)}
                    </span>
                  </div>
                )}
              </div>
              {(hasColor || hasSize) && (
                <QuickviewOptions
                  productInfo={{
                    id: selectedProduct.id,
                    name: selectedProduct.name,
                    pricing: selectedProduct.pricing,
                    images: selectedProduct.images,
                    options: selectedProduct.options,
                  }}
                  isStickyBarInCartIndicator={false}
                />
              )}
            </div>
          </div>
          <div>
            {selectedProduct.upsell &&
              selectedProduct.upsell.products &&
              selectedProduct.upsell.products.length > 0 && (
                <div
                  className={`${styles.customBorder} mt-7 pt-5 pb-[26px] w-full max-w-[280px] rounded-md select-none bg-white`}
                >
                  <div className="w-full">
                    <div>
                      <h2 className="mb-1 font-black text-center text-[21px] text-red leading-6 [letter-spacing:-1px] [word-spacing:2px] [text-shadow:_1px_1px_1px_rgba(0,0,0,0.15)] w-[248px] mx-auto">
                        UPGRADE MY ORDER
                      </h2>
                      <div className="w-max mx-auto flex items-center justify-center">
                        {Number(selectedProduct.upsell.pricing.salePrice) ? (
                          <div className="flex items-center gap-[6px]">
                            <div className="flex items-baseline text-[rgb(168,100,0)]">
                              <span className="text-[0.813rem] leading-3 font-semibold">
                                $
                              </span>
                              <span className="text-lg font-bold">
                                {Math.floor(
                                  Number(
                                    selectedProduct.upsell.pricing.salePrice
                                  )
                                )}
                              </span>
                              <span className="text-[0.813rem] leading-3 font-semibold">
                                {(
                                  Number(
                                    selectedProduct.upsell.pricing.salePrice
                                  ) % 1
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
                              {(
                                Number(
                                  selectedProduct.upsell.pricing.basePrice
                                ) % 1
                              )
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
                    <div className="mt-3 h-[210px] aspect-square mx-auto overflow-hidden">
                      <Image
                        src={selectedProduct.upsell.mainImage}
                        alt="Upgrade order"
                        width={240}
                        height={240}
                        priority
                      />
                    </div>
                    <div className="w-[184px] mx-auto mt-5 text-xs leading-6 [word-spacing:1px]">
                      <ul className="*:flex *:justify-between">
                        {selectedProduct.upsell.products.map(
                          (product, index) => (
                            <li key={index}>
                              <p className="text-gray">{product.name}</p>
                              <p>
                                <span
                                  className={`${
                                    selectedProduct.upsell.pricing.salePrice >
                                      0 &&
                                    selectedProduct.upsell.pricing.salePrice <
                                      selectedProduct.upsell.pricing.basePrice
                                      ? "line-through text-gray"
                                      : "text-gray"
                                  }`}
                                >
                                  ${formatThousands(Number(product.basePrice))}
                                </span>
                              </p>
                            </li>
                          )
                        )}
                        {selectedProduct.upsell.pricing.salePrice > 0 &&
                          selectedProduct.upsell.pricing.salePrice <
                            selectedProduct.upsell.pricing.basePrice && (
                            <li className="mt-2 flex items-center rounded font-semibold">
                              <p className="mx-auto">
                                You Save $
                                {formatThousands(
                                  Number(
                                    selectedProduct.upsell.pricing.basePrice
                                  ) -
                                    Number(
                                      selectedProduct.upsell.pricing.salePrice
                                    )
                                )}
                              </p>
                            </li>
                          )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            <div className="mt-14">
              <div
                className={`
                    [&>p>img]:max-w-[500px] [&>p>img]:rounded-xl [&>p>img]:my-7 
                    [&>:last-child]:mb-0 [&>:first-child]:mt-0 [&>:first-child>img]:mt-0 [&>:last-child>img]:mb-0
                  `}
                dangerouslySetInnerHTML={{
                  __html: selectedProduct.description || "",
                }}
              />
            </div>
          </div>
        </div>
        <div className="h-[72px] pt-[6px] pb-5 px-5 border-t border-[#e6e8ec] bg-white fixed z-10 bottom-0 left-0 right-0">
          <div className="max-w-[486px] mx-auto flex gap-[6px] justify-center">
            <CartAndUpgradeButtons
              product={selectedProduct}
              cart={cart}
              hasColor={hasColor}
              hasSize={hasSize}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopProductDetails({
  selectedProduct,
  cart,
  hideOverlay,
}: {
  selectedProduct: ProductWithUpsellType;
  cart: CartType | null;
  hideOverlay: () => void;
}) {
  const router = useRouter();
  const hasColor = selectedProduct.options.colors.length > 0;
  const hasSize = Object.keys(selectedProduct.options.sizes).length > 0;

  return (
    <div className="hidden md:block w-[calc(100%-40px)] max-w-max max-h-[584px] py-8 absolute top-12 bottom-12 bg-white mx-auto shadow rounded-2xl">
      <div className="relative pl-8 pr-7 flex flex-row gap-5 custom-scrollbar max-h-[584px] h-full overflow-x-hidden overflow-y-visible">
        <div className="sticky top-0 w-[584px] flex flex-col gap-16">
          <ImageGallery
            images={selectedProduct.images}
            productName={selectedProduct.name}
          />
        </div>
        <div className="min-w-[320px] max-w-[372px]">
          <div>
            <div className="flex flex-col gap-5 pt-4">
              <p className="-mb-1 line-clamp-2 leading-[1.125rem] text-[0.75rem] text-gray">
                {selectedProduct.name}
              </p>
              {selectedProduct.highlights.headline && (
                <div className="flex flex-col gap-4">
                  <div
                    className="text-lg leading-[26px] [&>:last-child]:mb-0"
                    dangerouslySetInnerHTML={{
                      __html: selectedProduct.highlights.headline || "",
                    }}
                  />
                  <ul className="text-sm list-inside *:leading-5">
                    {selectedProduct.highlights.keyPoints
                      .slice()
                      .sort((a, b) => a.index - b.index)
                      .map((point) => (
                        <li
                          key={point.index}
                          className="flex items-start gap-1 mb-2 last:mb-0"
                        >
                          <div className="min-w-4 max-w-4 min-h-5 max-h-5 flex items-center justify-center">
                            <Check
                              color="#0A8800"
                              size={20}
                              strokeWidth={2}
                              className="-ml-1"
                            />
                          </div>
                          <span>{point.text}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-col gap-5">
                <div className="w-max flex items-center justify-center">
                  {Number(selectedProduct.pricing.salePrice) ? (
                    <div className="flex items-center gap-[6px]">
                      <div
                        className={clsx(
                          "flex items-baseline",
                          !selectedProduct.upsell && "text-[rgb(168,100,0)]"
                        )}
                      >
                        <span className="text-[0.813rem] leading-3 font-semibold">
                          $
                        </span>
                        <span className="text-lg font-bold">
                          {Math.floor(
                            Number(selectedProduct.pricing.salePrice)
                          )}
                        </span>
                        <span className="text-[0.813rem] leading-3 font-semibold">
                          {(Number(selectedProduct.pricing.salePrice) % 1)
                            .toFixed(2)
                            .substring(1)}
                        </span>
                      </div>
                      <span className="text-[0.813rem] leading-3 text-gray line-through">
                        $
                        {formatThousands(
                          Number(selectedProduct.pricing.basePrice)
                        )}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-[0.813rem] leading-3 font-semibold">
                        $
                      </span>
                      <span className="text-lg font-bold">
                        {Math.floor(Number(selectedProduct.pricing.basePrice))}
                      </span>
                      <span className="text-[0.813rem] leading-3 font-semibold">
                        {(Number(selectedProduct.pricing.basePrice) % 1)
                          .toFixed(2)
                          .substring(1)}
                      </span>
                    </div>
                  )}
                </div>
                {(hasColor || hasSize) && (
                  <QuickviewOptions
                    productInfo={{
                      id: selectedProduct.id,
                      name: selectedProduct.name,
                      pricing: selectedProduct.pricing,
                      images: selectedProduct.images,
                      options: selectedProduct.options,
                    }}
                    isStickyBarInCartIndicator={false}
                  />
                )}
              </div>
            </div>
            {selectedProduct.upsell &&
              selectedProduct.upsell.products &&
              selectedProduct.upsell.products.length > 0 && (
                <div
                  className={`${styles.customBorder} mt-7 pt-5 pb-[26px] px-6 w-max rounded-md select-none bg-white`}
                >
                  <div className="w-full">
                    <div>
                      <h2 className="mb-1 font-black text-center text-[21px] text-red leading-6 [letter-spacing:-1px] [word-spacing:2px] [text-shadow:_1px_1px_1px_rgba(0,0,0,0.15)] w-[248px] mx-auto">
                        UPGRADE MY ORDER
                      </h2>
                      <div className="w-max mx-auto flex items-center justify-center">
                        {Number(selectedProduct.upsell.pricing.salePrice) ? (
                          <div className="flex items-center gap-[6px]">
                            <div className="flex items-baseline text-[rgb(168,100,0)]">
                              <span className="text-[0.813rem] leading-3 font-semibold">
                                $
                              </span>
                              <span className="text-lg font-bold">
                                {Math.floor(
                                  Number(
                                    selectedProduct.upsell.pricing.salePrice
                                  )
                                )}
                              </span>
                              <span className="text-[0.813rem] leading-3 font-semibold">
                                {(
                                  Number(
                                    selectedProduct.upsell.pricing.salePrice
                                  ) % 1
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
                              {(
                                Number(
                                  selectedProduct.upsell.pricing.basePrice
                                ) % 1
                              )
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
                    <div className="mt-3 h-[210px] aspect-square mx-auto overflow-hidden">
                      <Image
                        src={selectedProduct.upsell.mainImage}
                        alt="Upgrade order"
                        width={240}
                        height={240}
                        priority
                      />
                    </div>
                    <div className="w-[184px] mx-auto mt-5 text-xs leading-6 [word-spacing:1px]">
                      <ul className="*:flex *:justify-between">
                        {selectedProduct.upsell.products.map(
                          (product, index) => (
                            <li key={index}>
                              <p className="text-gray">{product.name}</p>
                              <p>
                                <span
                                  className={`${
                                    selectedProduct.upsell.pricing.salePrice >
                                      0 &&
                                    selectedProduct.upsell.pricing.salePrice <
                                      selectedProduct.upsell.pricing.basePrice
                                      ? "line-through text-gray"
                                      : "text-gray"
                                  }`}
                                >
                                  ${formatThousands(Number(product.basePrice))}
                                </span>
                              </p>
                            </li>
                          )
                        )}
                        {selectedProduct.upsell.pricing.salePrice > 0 &&
                          selectedProduct.upsell.pricing.salePrice <
                            selectedProduct.upsell.pricing.basePrice && (
                            <li className="mt-2 flex items-center rounded font-semibold">
                              <p className="mx-auto">
                                You Save $
                                {formatThousands(
                                  Number(
                                    selectedProduct.upsell.pricing.basePrice
                                  ) -
                                    Number(
                                      selectedProduct.upsell.pricing.salePrice
                                    )
                                )}
                              </p>
                            </li>
                          )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
          </div>
          <div className="sticky left-0 right-0 bottom-0 z-10 mt-6 pt-1 pb-0 shadow-[0_-12px_16px_2px_white] bg-white">
            <div className="flex gap-2">
              <CartAndUpgradeButtons
                product={selectedProduct}
                cart={cart}
                hasColor={hasColor}
                hasSize={hasSize}
              />
            </div>
            <div className="mt-5">
              <button
                className="flex items-center text-sm hover:underline"
                onClick={() =>
                  router.push(`/${selectedProduct.slug}-${selectedProduct.id}`)
                }
              >
                <span>All details</span>
                <ChevronRight size={18} strokeWidth={2} className="-mr-[8px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={hideOverlay}
        className="h-9 w-9 rounded-full absolute top-[6px] right-[6px] flex items-center justify-center transition duration-300 ease-in-out hover:bg-lightgray"
        type="button"
      >
        <X color="#6c6c6c" strokeWidth={1.5} />
      </button>
    </div>
  );
}
