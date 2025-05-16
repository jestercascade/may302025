import clsx from "clsx";
import Image from "next/image";
import { Check } from "lucide-react";
import { cookies } from "next/headers";
import styles from "./styles.module.css";
import { getCart } from "@/actions/get/carts";
import { formatThousands } from "@/lib/utils/common";
import { getProducts } from "@/actions/get/products";
import { BackButton } from "@/components/website/BackButton";
import { ImageGallery } from "@/components/website/ProductDetails/ImageGallery";
import { ProductDetailsWrapper } from "@/components/website/ProductDetailsWrapper";
import { CartAndUpgradeButtons } from "@/components/website/CartAndUpgradeButtons";
import { ImageGalleryWrapper } from "@/components/website/ProductDetails/ImageGalleryWrapper";
import { ProductInfoWrapper } from "@/components/website/ProductDetails/ProductInfoWrapper";
import { ProductDetailsOptions } from "@/components/website/Options/ProductDetailsOptions";
import { MobileImageCarousel } from "@/components/website/ProductDetails/MobileImageCarousel";
import { SizeChartOverlay, UpsellReviewOverlay } from "@/components/website/DynamicOverlays";
import { redirect } from "next/navigation";

const getProductIdFromSlug = (slug: string): string => {
  return slug.split("-").pop() as string;
};

export async function generateStaticParams() {
  try {
    const products = await getProducts({
      fields: ["slug"],
      visibility: "PUBLISHED",
    });
    if (!products || products.length === 0) {
      console.warn("No published products found for static generation.");
      return [];
    }
    return products.map((product) => ({ slug: product.slug }));
  } catch (error) {
    console.error("Error fetching products for static params:", error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const productId = getProductIdFromSlug(slug);

  const [fetchedProducts] = await Promise.all([
    getProducts({
      ids: [productId],
      fields: ["seo"],
      visibility: "PUBLISHED",
    }),
  ]);

  const product = fetchedProducts?.[0];

  return {
    title: product?.seo.metaTitle,
    description: product?.seo.metaDescription,
    alternates: {
      canonical: `/${slug}`,
    },
  };
}

export default async function ProductDetails({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const cookieStore = await cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value ?? "";

  const productId = getProductIdFromSlug(slug);

  const [cart, fetchedProducts] = await Promise.all([
    getCart(deviceIdentifier),
    getProducts({
      ids: [productId],
      fields: ["name", "pricing", "images", "options", "highlights", "upsell", "description"],
      visibility: "PUBLISHED",
    }),
  ]);

  const product = fetchedProducts?.[0] as ProductWithUpsellType;

  if (!product) {
    redirect("/");
  }

  return (
    <>
      <ProductDetailsWrapper
        cart={cart}
        productInfo={{
          id: product.id,
          name: product.name,
          pricing: product.pricing,
          images: product.images,
          options: product.options,
          upsell: product.upsell,
        }}
      >
        <main>
          <MobileProductDetails product={product} cart={cart} />
          <DesktopProductDetails product={product} cart={cart} />
        </main>
        <SizeChartOverlay
          productInfo={{
            id: product.id,
            options: product.options,
          }}
        />
      </ProductDetailsWrapper>
      <UpsellReviewOverlay cart={cart} />
    </>
  );
}

// -- UI Components --
function DesktopProductDetails({ product, cart }: ProductDetailsType) {
  const { name, pricing, images, highlights, upsell, description, options } = product;

  return (
    <div className="hidden md:block">
      <div className="px-9 pt-5 mx-auto max-w-[1040px]">
        <div className="flex gap-5 items-start relative">
          <ImageGalleryWrapper>
            <ImageGallery images={images} productName={name} />
          </ImageGalleryWrapper>
          <ProductInfoWrapper>
            <div>
              <div className="flex flex-col gap-5">
                <ProductName name={name} />
                <ProductHighlights highlights={highlights} />
                <div className="flex flex-col gap-5">
                  <PriceDisplay pricing={pricing} upsellAvailable={!!upsell} />
                  <ProductDetailsOptions options={options} isStickyBarInCartIndicator={false} />
                </div>
              </div>
              {upsell?.products?.length > 0 && <ProductUpsell upsell={upsell} />}
            </div>
            <div className="sticky left-0 right-0 bottom-0 z-10 mt-6 pt-1 pb-5 shadow-[0_-12px_16px_2px_white] bg-white">
              <div className="flex gap-2">
                <CartAndUpgradeButtons product={product} cart={cart} />
              </div>
            </div>
          </ProductInfoWrapper>
        </div>
        {description && (
          <div className="w-full mt-12 pr-[70px] mx-auto">
            <div className="w-[580px]">
              <ProductDescription description={description} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MobileProductDetails({ product, cart }: ProductDetailsType) {
  const { name, pricing, images, highlights, upsell, description, options } = product;

  return (
    <div className="md:hidden">
      <div>
        <div className="w-full relative select-none">
          <BackButton />
          <MobileImageCarousel images={images} productName={name} />
        </div>
        <div className="max-w-[486px] mx-auto">
          <div className="px-5 pt-3 flex flex-col gap-4">
            <ProductName name={name} />
            <ProductHighlights highlights={highlights} />
            <div className="flex flex-col gap-5">
              <PriceDisplay pricing={pricing} upsellAvailable={!!upsell} />
              <ProductDetailsOptions options={options} isStickyBarInCartIndicator={false} />
            </div>
          </div>
          <div className="px-5">
            {upsell?.products?.length > 0 && <ProductUpsell upsell={upsell} />}
            <div className="mt-14">
              <ProductDescription description={description} />
            </div>
          </div>
        </div>
      </div>
      <div className="h-[72px] pt-[6px] pb-5 px-5 border-t border-[#e6e8ec] bg-white fixed z-10 bottom-0 left-0 right-0">
        <div className="max-w-[486px] mx-auto flex gap-[6px] justify-center">
          <CartAndUpgradeButtons product={product} cart={cart} />
        </div>
      </div>
    </div>
  );
}

function ProductUpsell({ upsell }: { upsell: ProductWithUpsellType["upsell"] }) {
  return (
    <div className={`w-max ${styles.customBorder} mt-7 pt-5 pb-[26px] px-6 rounded-md select-none bg-white`}>
      <div className="w-full">
        <div>
          <h2 className="mb-1 font-black text-center text-[21px] text-red leading-6 [letter-spacing:-1px] [word-spacing:2px] [text-shadow:_1px_1px_1px_rgba(0,0,0,0.15)] w-[248px] mx-auto">
            UPGRADE MY ORDER
          </h2>
          <div className="w-max mx-auto flex items-center justify-center">
            {Number(upsell.pricing.salePrice) ? (
              <div className="flex items-center gap-[6px]">
                <div className="flex items-baseline text-[rgb(168,100,0)]">
                  <span className="text-[0.813rem] leading-3 font-semibold">$</span>
                  <span className="text-lg font-bold">{Math.floor(Number(upsell.pricing.salePrice))}</span>
                  <span className="text-[0.813rem] leading-3 font-semibold">
                    {(Number(upsell.pricing.salePrice) % 1).toFixed(2).substring(1)}
                  </span>
                </div>
                <span className="text-[0.813rem] leading-3 text-gray line-through">
                  ${formatThousands(Number(upsell.pricing.basePrice))}
                </span>
              </div>
            ) : (
              <div className="flex items-baseline text-[rgb(168,100,0)]">
                <span className="text-[0.813rem] leading-3 font-semibold">$</span>
                <span className="text-lg font-bold">{Math.floor(Number(upsell.pricing.basePrice))}</span>
                <span className="text-[0.813rem] leading-3 font-semibold">
                  {(Number(upsell.pricing.basePrice) % 1).toFixed(2).substring(1)}
                </span>
                <span className="ml-1 text-[0.813rem] leading-3 font-semibold">today</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 h-[210px] aspect-square mx-auto overflow-hidden">
          <Image src={upsell.mainImage} alt="Upgrade order" width={240} height={240} priority />
        </div>
        <div className="w-[184px] mx-auto mt-5 text-xs leading-6 [word-spacing:1px]">
          <ul className="*:flex *:justify-between">
            {upsell.products.map((product, index) => (
              <li key={index}>
                <p className="text-gray">{product.name}</p>
                <p>
                  <span
                    className={`${
                      upsell.pricing.salePrice > 0 && upsell.pricing.salePrice < upsell.pricing.basePrice
                        ? "line-through text-gray"
                        : "text-gray"
                    }`}
                  >
                    ${formatThousands(Number(product.basePrice))}
                  </span>
                </p>
              </li>
            ))}
            {upsell.pricing.salePrice > 0 && upsell.pricing.salePrice < upsell.pricing.basePrice && (
              <li className="mt-2 flex items-center rounded font-semibold">
                <p className="mx-auto">
                  You Save ${formatThousands(Number(upsell.pricing.basePrice) - Number(upsell.pricing.salePrice))}
                </p>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function PriceDisplay({
  pricing,
  upsellAvailable,
}: {
  pricing: ProductWithUpsellType["pricing"];
  upsellAvailable: boolean;
}) {
  return (
    <div className="w-max flex items-center justify-center">
      {Number(pricing.salePrice) ? (
        <div className="flex items-center gap-[6px]">
          <div className={clsx("flex items-baseline", !upsellAvailable && "text-[rgb(168,100,0)]")}>
            <span className="text-[0.813rem] leading-3 font-semibold">$</span>
            <span className="text-lg font-bold">{Math.floor(Number(pricing.salePrice))}</span>
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
          <span className="text-[0.813rem] leading-3 font-semibold">$</span>
          <span className="text-lg font-bold">{Math.floor(Number(pricing.basePrice))}</span>
          <span className="text-[0.813rem] leading-3 font-semibold">
            {(Number(pricing.basePrice) % 1).toFixed(2).substring(1)}
          </span>
        </div>
      )}
    </div>
  );
}

function ProductHighlights({ highlights }: { highlights: ProductWithUpsellType["highlights"] }) {
  return (
    <>
      {highlights.headline && (
        <div className="flex flex-col gap-4">
          <div
            className="tiptap prose !text-lg !leading-[26px]"
            dangerouslySetInnerHTML={{
              __html: highlights.headline || "",
            }}
          />
          <ul className="text-sm list-inside *:leading-5">
            {highlights.keyPoints
              .slice()
              .sort((a, b) => a.index - b.index)
              .map((point) => (
                <li key={point.index} className="flex items-start gap-1 mb-2 last:mb-0">
                  <div className="min-w-4 max-w-4 min-h-5 max-h-5 flex items-center justify-center">
                    <Check color="#0A8800" size={18} strokeWidth={2} className="-ml-1" />
                  </div>
                  <span>{point.text}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </>
  );
}

function ProductName({ name }: { name: string }) {
  return <p className="-mb-1 line-clamp-2 leading-[1.125rem] text-[0.75rem] text-gray">{name}</p>;
}

function ProductDescription({ description }: { description: ProductWithUpsellType["description"] }) {
  return <div className="tiptap prose" dangerouslySetInnerHTML={{ __html: description || "" }} />;
}

// -- Type Definitions --

type ProductDetailsType = {
  product: ProductWithUpsellType;
  cart: any;
};
