"use client";

import useEmblaCarousel from "embla-carousel-react";
import { QuickviewButton } from "@/components/website/QuickviewOverlay";
import { formatThousands } from "@/lib/utils/common";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "./ProductCard";

export function FeaturedProducts({
  collection,
  cart,
}: {
  collection: EnrichedCollectionType;
  cart: CartType | null;
}) {
  const { id, slug, title } = collection;
  const products = collection.products as (ProductWithUpsellType & {
    index: number;
  })[];

  const [emblaRef] = useEmblaCarousel({
    align: "start",
  });

  return (
    <div className="min-[480px]:px-5">
      <div className="pl-5 min-[480px]:pl-0 mb-4 flex items-center gap-4 h-8 md:w-[calc(100%-20px)] md:mx-auto">
        <h2 className="font-semibold line-clamp-3 md:text-xl">{title}</h2>
        <Link
          href={`/collections/${slug}-${id}`}
          className="text-sm rounded-full px-3 h-full text-nowrap flex items-center justify-center transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed"
        >
          See more
        </Link>
      </div>
      <div
        className="embla min-[480px]:hidden relative select-none overflow-hidden w-full px-5 mx-auto"
        ref={emblaRef}
      >
        <div
          className="embla__container grid grid-flow-col auto-cols-max gap-2"
          style={{
            gridTemplateColumns:
              "calc(50% - 4px) calc(50% - 4px) calc(50% - 4px)",
          }}
        >
          {products.slice(0, 3).map((product) => (
            <CarouselProductCard
              key={product.id}
              product={product}
              cart={cart}
            />
          ))}
        </div>
      </div>
      <div className="relative hidden md:hidden min-[480px]:flex gap-2 overflow-hidden select-none">
        {products.slice(0, 3).map((product) => (
          <ProductCard key={product.id} product={product} cart={cart} />
        ))}
      </div>
      <div className="hidden md:flex gap-0 relative select-none">
        {products.slice(0, 3).map((product) => (
          <ProductCard key={product.id} product={product} cart={cart} />
        ))}
      </div>
    </div>
  );
}

// -- UI Components --

function CarouselProductCard({
  product,
  cart,
}: {
  product: ProductWithUpsellType;
  cart: CartType | null;
}) {
  return (
    <div className="md:p-[10px] md:cursor-pointer md:rounded-2xl md:ease-in-out md:duration-300 md:transition md:hover:shadow-[0px_0px_4px_rgba(0,0,0,0.35)]">
      <Link
        href={`/${product.slug}-${product.id}`}
        className="w-full aspect-square rounded-xl flex items-center justify-center overflow-hidden bg-white"
      >
        <Image
          src={product.images.main}
          alt={product.name}
          width={1000}
          height={1000}
          priority={true}
        />
      </Link>
      <div className="pt-2 flex flex-col gap-[6px]">
        <p className="text-xs line-clamp-1">{product.name}</p>
        <div className="flex items-center justify-between w-full">
          <div className="w-max flex items-center justify-center">
            {Number(product.pricing.salePrice) ? (
              <div className="flex items-center gap-[6px]">
                <div className="flex items-baseline text-[rgb(168,100,0)]">
                  <span className="text-[0.813rem] leading-3 font-semibold">
                    $
                  </span>
                  <span className="text-lg font-bold">
                    {Math.floor(Number(product.pricing.salePrice))}
                  </span>
                  <span className="text-[0.813rem] leading-3 font-semibold">
                    {(Number(product.pricing.salePrice) % 1)
                      .toFixed(2)
                      .substring(1)}
                  </span>
                </div>
                <span className="text-[0.813rem] leading-3 text-gray line-through">
                  ${formatThousands(Number(product.pricing.basePrice))}
                </span>
              </div>
            ) : (
              <div className="flex items-baseline">
                <span className="text-[0.813rem] leading-3 font-semibold">
                  $
                </span>
                <span className="text-lg font-bold">
                  {Math.floor(Number(product.pricing.basePrice))}
                </span>
                <span className="text-[0.813rem] leading-3 font-semibold">
                  {(Number(product.pricing.basePrice) % 1)
                    .toFixed(2)
                    .substring(1)}
                </span>
              </div>
            )}
          </div>
          <QuickviewButton
            onClick={(event) => event.stopPropagation()}
            product={product}
            cart={cart}
          />
        </div>
      </div>
    </div>
  );
}

// -- Type Definitions --

type EnrichedProductType = {
  index: number;
  id: string;
  name: string;
  slug: string;
  description: string;
  highlights: {
    headline: string;
    keyPoints: { index: number; text: string }[];
  };
  pricing: {
    salePrice: number;
    basePrice: number;
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
      salePrice: number;
      basePrice: number;
      discountPercentage: number;
    };
    visibility: "DRAFT" | "PUBLISHED" | "HIDDEN";
    createdAt: string;
    updatedAt: string;
    products: {
      id: string;
      name: string;
      slug: string;
      basePrice: number;
      images: {
        main: string;
        gallery: string[];
      };
    }[];
  };
};

type EnrichedCollectionType = {
  id: string;
  index: number;
  title: string;
  slug: string;
  campaignDuration: {
    startDate: string;
    endDate: string;
  };
  collectionType: string;
  bannerImages?: {
    desktopImage: string;
    mobileImage: string;
  };
  products: EnrichedProductType[];
  visibility: VisibilityType;
  createdAt: string;
  updatedAt: string;
};
