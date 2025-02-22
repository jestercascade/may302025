"use client";

import { AddToCartAction } from "@/actions/cart";
import { AlertMessageType } from "@/lib/sharedTypes";
import { formatThousands } from "@/lib/utils/common";
import { useAlertStore } from "@/zustand/website/alertStore";
import { useOptionsStore } from "@/zustand/website/optionsStore";
import { ReactElement, useEffect, useState, useTransition } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { UpsellReviewButton } from "../UpsellReviewOverlay";
import { useScrollStore } from "@/zustand/website/scrollStore";
import Image from "next/image";
import clsx from "clsx";
import { useNavigation } from "@/components/shared/NavigationLoadingIndicator";

export function StickyBar({
  productInfo,
  optionsComponent,
  hasColor,
  hasSize,
  cart,
}: {
  optionsComponent: ReactElement;
  hasColor: boolean;
  hasSize: boolean;
  cart: CartType | null;
  productInfo: ProductInfoType;
}) {
  const { push } = useNavigation();
  const [isPending, startTransition] = useTransition();
  const [isInCart, setIsInCart] = useState(false);
  const selectedColor = useOptionsStore((state) => state.selectedColor);
  const selectedSize = useOptionsStore((state) => state.selectedSize);
  const showAlert = useAlertStore((state) => state.showAlert);
  const shouldShowStickyBar = useScrollStore(
    (state) => state.shouldShowStickyBar
  );

  useEffect(() => {
    setIsInCart(
      cart?.items.some((item) => {
        if (item.type === "product") {
          return (
            item.baseProductId === productInfo.id &&
            item.color === selectedColor &&
            item.size === selectedSize
          );
        }
        return false;
      }) ?? false
    );
  }, [cart, productInfo.id, selectedColor, selectedSize]);

  const handleAddToCart = async () => {
    if (hasColor && !selectedColor) {
      return showAlert({
        message: "Select a color",
        type: AlertMessageType.NEUTRAL,
      });
    }
    if (hasSize && !selectedSize) {
      return showAlert({
        message: "Select a size",
        type: AlertMessageType.NEUTRAL,
      });
    }

    startTransition(async () => {
      const result = await AddToCartAction({
        type: "product",
        baseProductId: productInfo.id,
        color: selectedColor,
        size: selectedSize,
      });

      showAlert({
        message: result.message,
        type:
          result.type === AlertMessageType.ERROR
            ? AlertMessageType.ERROR
            : AlertMessageType.NEUTRAL,
      });

      if (result.type === AlertMessageType.SUCCESS) {
        setIsInCart(true);
      }
    });
  };

  const { pricing, upsell, images, name } = productInfo;

  const isSimpleProductInCart =
    !hasColor &&
    !hasSize &&
    cart?.items.some(
      (item) => item.type === "product" && item.baseProductId === productInfo.id
    );

  return (
    <div
      className={clsx(
        "hidden md:block w-full py-4 px-5 fixed top-0 border-b bg-white transition-transform duration-150 ease-in-out",
        {
          "-translate-y-full": !shouldShowStickyBar,
          "translate-y-0": shouldShowStickyBar,
        }
      )}
    >
      <div className="w-full max-w-[1066px] h-16 mx-auto flex gap-5 items-center justify-between">
        <div className="h-full flex gap-5">
          <div className="h-full aspect-square relative rounded-md flex items-center justify-center overflow-hidden">
            <Image
              src={images.main}
              alt={name}
              width={64}
              height={64}
              priority={true}
            />
          </div>
          <div className="h-full flex gap-5 items-center">
            <div className="w-max flex items-center justify-center">
              {Number(pricing.salePrice) ? (
                <div className="flex items-center gap-[6px]">
                  <div
                    className={clsx(
                      "flex items-baseline",
                      !upsell && "text-[rgb(168,100,0)]"
                    )}
                  >
                    <span className="text-[0.813rem] leading-3 font-semibold">
                      $
                    </span>
                    <span className="text-lg font-bold">
                      {Math.floor(Number(pricing.salePrice))}
                    </span>
                    <span className="text-[0.813rem] leading-3 font-semibold">
                      {(Number(pricing.salePrice) % 1).toFixed(2).substring(1)}
                    </span>
                  </div>
                  <span className="text-[0.813rem] leading-3 text-gray line-through">
                    ${formatThousands(Number(pricing.basePrice))}
                  </span>
                </div>
              ) : (
                <div className="flex items-baseline">
                  <span className="text-[0.813rem] leading-3 font-semibold">
                    $
                  </span>
                  <span className="text-lg font-bold">
                    {Math.floor(Number(pricing.basePrice))}
                  </span>
                  <span className="text-[0.813rem] leading-3 font-semibold">
                    {(Number(pricing.basePrice) % 1).toFixed(2).substring(1)}
                  </span>
                </div>
              )}
            </div>
            {optionsComponent}
          </div>
        </div>
        <div className="w-[348px] min-[840px]:w-[410px] flex gap-3 justify-end">
          {!isInCart && (
            <>
              {!upsell ? (
                <button
                  onClick={handleAddToCart}
                  disabled={isPending}
                  className={clsx(
                    "flex items-center justify-center w-full md:max-w-60 rounded-full cursor-pointer border border-[#b27100] text-white font-semibold text-sm min-[896px]:text-base h-11 min-[896px]:h-12 shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000]",
                    !isPending &&
                      "hover:bg-[#cc8100] hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]",
                    isPending && "!cursor-context-menu opacity-50"
                  )}
                >
                  {isPending ? (
                    <Spinner size={28} color="white" />
                  ) : (
                    "Add to Cart"
                  )}
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={isPending}
                  className={clsx(
                    "flex items-center justify-center w-full max-w-60 rounded-full cursor-pointer border border-[#c5c3c0] font-semibold text-sm min-[896px]:text-base h-11 min-[896px]:h-12 shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear-gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)]",
                    isPending && "cursor-context-menu opacity-50"
                  )}
                >
                  {isPending ? (
                    <Spinner size={28} color="gray" />
                  ) : (
                    "Add to Cart"
                  )}
                </button>
              )}
            </>
          )}
          {(isInCart || isSimpleProductInCart) && !hasColor && !hasSize && (
            <button
              onClick={() => push("/cart")}
              className="flex items-center justify-center w-max px-9 rounded-full cursor-pointer border border-[#c5c3c0] text-blue font-semibold h-[44px] shadow-[inset_0px_1px_0px_0px_#ffffff] [background:linear-gradient(to_bottom,_#faf9f8_5%,_#eae8e6_100%)] bg-[#faf9f8] hover:[background:linear-gradient(to_bottom,_#eae8e6_5%,_#faf9f8_100%)] hover:bg-[#eae8e6] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] min-[896px]:h-12"
            >
              In Cart - See Now
            </button>
          )}
          {productInfo.upsell && (
            <div className="w-full h-11 min-[840px]:h-12 relative rounded-full flex justify-end">
              <div className="peer w-full">
                <UpsellReviewButton
                  product={{
                    id: productInfo.id,
                    upsell: productInfo.upsell,
                  }}
                />
              </div>
              {shouldShowStickyBar && (
                <div
                  className={clsx(
                    "peer-hover:block hidden py-[18px] px-6 rounded-xl shadow-dropdown bg-white before:content-[''] before:w-[14px] before:h-[14px] before:bg-white before:rounded-tl-[2px] before:rotate-45 before:origin-top-left before:absolute before:-top-[10px] before:border-l before:border-t before:border-[#d9d9d9] before:right-20 min-[840px]:before:right-24 absolute top-[58px]",
                    !isInCart ? "-right-2" : "left-1/2 -translate-x-1/2"
                  )}
                >
                  {upsell && upsell.products.length > 0 && (
                    <div className="w-max rounded-md pb-[10px] bg-white">
                      <div className="w-full">
                        <div>
                          <h2 className="font-black text-center text-[21px] text-red leading-6 [letter-spacing:-1px] [word-spacing:2px] [text-shadow:_1px_1px_1px_rgba(0,0,0,0.15)] w-[248px] mx-auto">
                            UPGRADE MY ORDER
                          </h2>
                          <div className="mt-1 w-max mx-auto flex items-center justify-center">
                            {Number(upsell.pricing.salePrice) ? (
                              <div className="flex items-center gap-[6px]">
                                <div className="flex items-baseline text-[rgb(168,100,0)]">
                                  <span className="text-[0.813rem] leading-3 font-semibold">
                                    $
                                  </span>
                                  <span className="text-lg font-bold">
                                    {Math.floor(
                                      Number(upsell.pricing.salePrice)
                                    )}
                                  </span>
                                  <span className="text-[0.813rem] leading-3 font-semibold">
                                    {(Number(upsell.pricing.salePrice) % 1)
                                      .toFixed(2)
                                      .substring(1)}
                                  </span>
                                </div>
                                <span className="text-[0.813rem] leading-3 text-gray line-through">
                                  $
                                  {formatThousands(
                                    Number(upsell.pricing.basePrice)
                                  )}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-baseline text-[rgb(168,100,0)]">
                                <span className="text-[0.813rem] leading-3 font-semibold">
                                  $
                                </span>
                                <span className="text-lg font-bold">
                                  {Math.floor(Number(upsell.pricing.basePrice))}
                                </span>
                                <span className="text-[0.813rem] leading-3 font-semibold">
                                  {(Number(upsell.pricing.basePrice) % 1)
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
                            src={upsell.mainImage}
                            alt="Upgrade order"
                            width={240}
                            height={240}
                            priority
                          />
                        </div>
                        <div className="w-[184px] mx-auto mt-5 text-xs leading-6 [word-spacing:1px]">
                          <ul className="*:flex *:justify-between">
                            {upsell.products.map((product) => (
                              <li key={product.id}>
                                <p className="text-gray">{product.name}</p>
                                <p>
                                  <span
                                    className={`${
                                      upsell.pricing.salePrice > 0 &&
                                      upsell.pricing.salePrice <
                                        upsell.pricing.basePrice
                                        ? "line-through text-gray"
                                        : "text-gray"
                                    }`}
                                  >
                                    $
                                    {formatThousands(Number(product.basePrice))}
                                  </span>
                                </p>
                              </li>
                            ))}
                            {upsell.pricing.salePrice > 0 &&
                              upsell.pricing.salePrice <
                                upsell.pricing.basePrice && (
                                <li className="mt-2 flex items-center rounded font-semibold">
                                  <p className="mx-auto">
                                    You Save $
                                    {formatThousands(
                                      Number(upsell.pricing.basePrice) -
                                        Number(upsell.pricing.salePrice)
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -- Type Definitions --

type ProductInfoType = {
  id: string;
  name: string;
  pricing: {
    basePrice: number;
    salePrice: number;
    discountPercentage: number;
  };
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
        columns: { label: string; order: number }[];
        rows: { [key: string]: string }[];
      };
      centimeters: {
        columns: { label: string; order: number }[];
        rows: { [key: string]: string }[];
      };
    };
  };
  upsell: {
    id: string;
    mainImage: string;
    pricing: {
      basePrice: number;
      salePrice: number;
      discountPercentage: number;
    };
    visibility: "DRAFT" | "PUBLISHED" | "HIDDEN";
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
    }>;
  };
};
