import {
  BasicDetailsOverlay,
  BasicDetailsButton,
} from "@/components/admin/EditProduct/BasicDetailsOverlay";
import {
  capitalizeFirstLetter,
  formatThousands,
  isValidRemoteImage,
} from "@/lib/utils/common";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  MainImageButton,
  MainImageOverlay,
} from "@/components/admin/EditProduct/MainImageOverlay";
import {
  ImageGalleryButton,
  ImageGalleryOverlay,
} from "@/components/admin/EditProduct/ImageGalleryOverlay";
import {
  VisibilityButton,
  VisibilityOverlay,
} from "@/components/admin/EditProduct/VisibilityOverlay";
import {
  SizeChartButton,
  SizeChartOverlay,
} from "@/components/admin/EditProduct/SizeChartOverlay";
import {
  ColorsButton,
  ColorsOverlay,
} from "@/components/admin/EditProduct/ColorsOverlay";
import {
  DescriptionButton,
  DescriptionOverlay,
} from "@/components/admin/EditProduct/DescriptionOverlay";
import Link from "next/link";
import { CheckmarkIcon } from "@/icons";
import {
  OnPageSeoButton,
  OnPageSeoOverlay,
} from "@/components/admin/EditProduct/OnPageSeoOverlay";
import {
  ProductSourceButton,
  ProductSourceOverlay,
} from "@/components/admin/EditProduct/ProductSourceOverlay";
import {
  HighlightsButton,
  HighlightsOverlay,
} from "@/components/admin/EditProduct/HighlightsOverlay";
import clsx from "clsx";
import {
  UpsellButton,
  UpsellOverlay,
} from "@/components/admin/EditProduct/UpsellOverlay ";
import { getProducts } from "@/actions/get/products";

export default async function EditProduct({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const paramSlug = (await params).slug;
  const productId = paramSlug.split("-").pop() as string;
  const [product] =
    (await getProducts({
      ids: [productId],
      fields: [
        "id",
        "category",
        "name",
        "slug",
        "pricing",
        "images",
        "options",
        "description",
        "highlights",
        "sourceInfo",
        "seo",
        "visibility",
        "upsell",
      ],
    })) || [];

  if (!product) {
    notFound();
  }

  const {
    id,
    category,
    name,
    slug,
    pricing,
    images,
    options,
    description,
    highlights,
    sourceInfo,
    seo,
    visibility,
    upsell,
  } = product as ProductWithUpsellType;

  function calculateUpsell(
    currentProduct: {
      salePrice?: number | string;
      basePrice?: number | string;
    },
    upsell: {
      pricing: {
        salePrice?: number | string;
        basePrice?: number | string;
      };
    } | null
  ) {
    if (!upsell) return null;

    const originalPrice = Number(
      currentProduct.salePrice || currentProduct.basePrice || 0
    );

    const upsellPrice = Number(
      upsell.pricing.salePrice || upsell.pricing.basePrice || 0
    );

    const additionalSpend = upsellPrice - originalPrice;
    const percentageIncrease = (additionalSpend / originalPrice) * 100;

    return {
      additionalSpend: Math.round(additionalSpend).toFixed(2),
      percentageIncrease: percentageIncrease.toFixed(0),
    };
  }

  const upsellDetails = upsell
    ? calculateUpsell(product.pricing, upsell)
    : null;

  const hasBasicDetails = category && name && pricing.basePrice && slug && id;
  const hasOnPageSeo =
    seo.metaTitle && seo.metaDescription && seo.keywords.length;
  const hasSourceInfo =
    sourceInfo.platform &&
    sourceInfo.platformUrl &&
    sourceInfo.store &&
    sourceInfo.storeId &&
    sourceInfo.storeUrl &&
    sourceInfo.productUrl;

  return (
    <>
      <div className="max-w-[768px] flex flex-col gap-10 px-5">
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Basic details</h2>
            <p className="text-sm md:max-w-[85%]">
              Important for SEO: a name that includes target keywords in the
              first four words, a short URL slug with three or four keywords,
              and prices that help your business grow while making customers
              feel they're getting a good deal.
            </p>
          </div>
          <div
            className={clsx(
              "w-full relative flex items-center justify-between shadow rounded-xl bg-white",
              {
                "p-5 pr-2": !hasBasicDetails,
              }
            )}
          >
            {hasBasicDetails ? (
              <>
                <div className="w-[calc(100%-60px)]">
                  <div className="p-5">
                    <h3 className="text-xs text-gray mb-4">Main</h3>
                    <div className="flex items-center flex-col gap-[6px] w-max">
                      <div className="w-full max-w-[280px] rounded-xl aspect-square flex items-center justify-center overflow-hidden bg-lightgray">
                        {images.main && isValidRemoteImage(images.main) && (
                          <Image
                            src={images.main}
                            alt={name}
                            width={280}
                            height={280}
                            priority
                          />
                        )}
                      </div>
                      <MainImageButton />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xs text-gray mb-2">Category</h3>
                    <p className="font-medium">{category}</p>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xs text-gray mb-2">Name</h3>
                    <p className="font-medium max-w-[540px]">{name}</p>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xs text-gray mb-2">Price</h3>
                    <div className="w-max flex items-center justify-center">
                      {Number(pricing.salePrice) ? (
                        <div className="flex items-center gap-[6px]">
                          <div className="flex items-baseline">
                            <span className="text-[0.813rem] leading-3 font-semibold">
                              $
                            </span>
                            <span className="text-lg font-bold">
                              {Math.floor(Number(pricing.salePrice))}
                            </span>
                            <span className="text-[0.813rem] leading-3 font-semibold">
                              {(Number(pricing.salePrice) % 1)
                                .toFixed(2)
                                .substring(1)}
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
                            {(Number(pricing.basePrice) % 1)
                              .toFixed(2)
                              .substring(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xs text-gray mb-2">Slug</h3>
                    <p className="font-medium">
                      {slug}-{id}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <span className="text-xs text-gray">Nothing here</span>
            )}
            <BasicDetailsButton
              className={clsx({
                "absolute top-2 right-2": hasBasicDetails,
              })}
            />
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Images</h2>
            <p className="text-sm md:max-w-[85%]">
              Images that show off your product, helping people see its features
              and quality. They grab attention and let customers imagine owning
              it.
            </p>
          </div>
          <div className="w-full relative shadow rounded-xl bg-white">
            <div>
              {images.gallery.length === 0 ||
              images.gallery.every((image) => !isValidRemoteImage(image)) ? (
                <div className="w-full flex items-center justify-between p-5 pr-2">
                  <span className="text-xs text-gray">No gallery</span>
                  <ImageGalleryButton />
                </div>
              ) : (
                <div className="w-full flex items-center justify-between pl-5 pr-2 py-2">
                  <span className="text-xs text-gray">Gallery</span>
                  <ImageGalleryButton />
                </div>
              )}
            </div>
            <div>
              {images.gallery.length > 0 &&
                images.gallery.every((image) => isValidRemoteImage(image)) && (
                  <div className="flex flex-wrap gap-2 p-5 pt-0">
                    {images.gallery.map(
                      (image, index) =>
                        isValidRemoteImage(image) && (
                          <div
                            key={index}
                            className="max-w-[148px] lg:max-w-[210px] w-[calc(50%-4px)] border rounded-xl aspect-square flex items-center justify-center overflow-hidden"
                          >
                            <Image
                              src={image}
                              alt={name}
                              width={210}
                              height={210}
                              priority
                            />
                          </div>
                        )
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Options</h2>
            <p className="text-sm md:max-w-[85%]">
              Products that come in different sizes make it easy for people to
              find what they're looking for. And with lots of colors available,
              everyone can show off their style and personality.
            </p>
          </div>
          <div className="w-full relative shadow rounded-xl bg-white">
            <div className="flex flex-col gap-5 p-5">
              <div className="relative border rounded-xl">
                <div>
                  {Object.keys(options.sizes || {}).length === 0 ? (
                    <div className="w-full flex items-center justify-between p-5 pr-2">
                      <span className="text-xs text-gray">No sizes</span>
                      <SizeChartButton />
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between pl-5 pr-2 py-2">
                      <span className="text-xs text-gray">Sizes</span>
                      <SizeChartButton />
                    </div>
                  )}
                </div>
                <div>
                  {(() => {
                    if (Object.keys(options.sizes || {}).length === 0) {
                      return null;
                    }

                    const sizesInches = options.sizes.inches;
                    if (sizesInches?.columns && sizesInches?.rows) {
                      const firstColumnLabel = sizesInches.columns.find(
                        (column) => column.order === 1
                      )?.label;

                      return (
                        <div className="flex flex-wrap gap-2 p-5 pt-0">
                          {sizesInches.rows.map((row, index) => (
                            <div
                              key={index}
                              className="min-w-12 w-max h-7 px-4 text-sm font-medium select-none rounded-full bg-lightgray flex items-center justify-center"
                            >
                              {firstColumnLabel && row[firstColumnLabel]}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
              <div className="relative border rounded-xl">
                <div>
                  {options.colors.length === 0 ||
                  !options.colors.some((color) =>
                    isValidRemoteImage(color.image)
                  ) ? (
                    <div className="w-full flex items-center justify-between p-5 pr-2">
                      <span className="text-xs text-gray">No colors</span>
                      <ColorsButton />
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between pl-5 pr-2 py-2">
                      <span className="text-xs text-gray">Colors</span>
                      <ColorsButton />
                    </div>
                  )}
                </div>
                <div>
                  {options.colors.length > 0 &&
                    options.colors.some((color) =>
                      isValidRemoteImage(color.image)
                    ) && (
                      <div className="flex flex-wrap gap-2 p-5 pt-0">
                        {options.colors.map(
                          (color, index) =>
                            isValidRemoteImage(color.image) && (
                              <div
                                key={index}
                                className="max-w-[148px] lg:max-w-[210px] w-[calc(50%-4px)] rounded-xl border flex flex-col items-center justify-center overflow-hidden"
                              >
                                <div className="w-full aspect-square overflow-hidden flex items-center justify-center">
                                  <Image
                                    src={color.image}
                                    alt={color.name}
                                    width={210}
                                    height={210}
                                    priority
                                  />
                                </div>
                                <div className="w-full h-9 flex justify-center">
                                  <div className="w-max max-w-full px-3 font-medium flex items-center text-sm text-nowrap overflow-x-visible overflow-y-hidden invisible-scrollbar">
                                    {color.name}
                                  </div>
                                </div>
                              </div>
                            )
                        )}
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Product description</h2>
            <p className="text-sm md:max-w-[85%]">
              Tell people why your product is great. What problem does it solve
              brilliantly? Explain how it makes life more enjoyable. Keep it
              simple and exciting.
            </p>
          </div>
          <div className="w-full relative shadow rounded-xl bg-white">
            {!description ? (
              <div className="w-full flex items-center justify-between p-5 pr-2">
                <span className="text-xs text-gray">Nothing here</span>
                <DescriptionButton />
              </div>
            ) : (
              <div className="w-full relative border rounded-xl p-5 flex items-center justify-between">
                <div className="w-[calc(100%-60px)] mt-1 border rounded-2xl p-5">
                  <div
                    className="tiptap prose line-clamp-3"
                    dangerouslySetInnerHTML={{
                      __html: description,
                    }}
                  />
                </div>
                <DescriptionButton className="absolute top-2 right-2" />
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Highlights</h2>
            <p className="text-sm md:max-w-[85%]">
              Craft an irresistible message. Hook them with pain. Show you
              understand their struggles. Alternatively, tap into their desires
              and create a sense of possibility. Use active voice, strong verbs.
              Paint a clear picture of the desired outcome. Make them feel the
              satisfaction, see the results, crave your solution.
            </p>
          </div>
          <div className="w-full relative shadow rounded-xl bg-white">
            {!(highlights.headline && highlights.keyPoints.length > 0) ? (
              <div className="w-full flex items-center justify-between p-5 pr-2">
                <span className="text-xs text-gray">Nothing here</span>
                <HighlightsButton />
              </div>
            ) : (
              <>
                <div className="w-[calc(100%-60px)] p-5 pt-4">
                  <div>
                    <div
                      className="line-clamp-3 [&>:last-child]:mb-0"
                      dangerouslySetInnerHTML={{
                        __html: highlights.headline || "",
                      }}
                    />
                  </div>
                  <ul className="mt-5 pb-2 text-sms list-inside *:leading-[25px]">
                    {highlights.keyPoints
                      .slice()
                      .sort((a, b) => a.index - b.index)
                      .map((highlight) => (
                        <li
                          key={highlight.index}
                          className="flex items-start gap-2 mb-2 last:mb-0"
                        >
                          <div className="w-5 min-w-5 h-5 -ml-[1px] flex items-center justify-center">
                            <CheckmarkIcon
                              className="fill-green mt-[3px] -ml-[1px]"
                              size={19}
                            />
                          </div>
                          <span>{highlight.text}</span>
                        </li>
                      ))}
                  </ul>
                </div>
                <HighlightsButton className="absolute top-2 right-2" />
              </>
            )}
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">On-page SEO</h2>
            <p className="text-sm md:max-w-[85%]">
              Use keywords that fit your product. This helps search engines
              understand your page and show it to the right people.
            </p>
          </div>
          <div
            className={clsx(
              "w-full relative flex items-center justify-between shadow rounded-xl bg-white",
              {
                "p-5 pr-2": !hasOnPageSeo,
              }
            )}
          >
            {hasOnPageSeo ? (
              <div className="w-[calc(100%-60px)]">
                <div className="p-5">
                  <h3 className="text-xs text-gray mb-2">Meta title</h3>
                  <p className="font-medium">{seo.metaTitle}</p>
                </div>
                <div className="p-5">
                  <h3 className="text-xs text-gray mb-2">Meta description</h3>
                  <p className="font-medium max-w-[540px]">
                    {seo.metaDescription}
                  </p>
                </div>
                <div className="p-5">
                  <h3 className="text-xs text-gray mb-2">Keywords</h3>
                  <p className="font-medium">{seo.keywords.join(", ")}</p>
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray">Nothing here</span>
            )}
            <OnPageSeoButton
              className={clsx({
                "absolute top-2 right-2": hasOnPageSeo,
              })}
            />
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Product source</h2>
            <p className="text-sm md:max-w-[85%]">
              Keep track of where you get your products. It helps you reorder
              fast and fix problems quickly.
            </p>
          </div>
          <div
            className={clsx(
              "w-full relative flex items-center justify-between shadow rounded-xl bg-white",
              {
                "p-5 pr-2": !hasSourceInfo,
              }
            )}
          >
            {hasSourceInfo ? (
              <div className="w-[calc(100%-60px)]">
                <div className="p-5">
                  <h3 className="text-xs text-gray mb-2">Platform</h3>
                  <Link
                    href={sourceInfo.platformUrl}
                    target="_blank"
                    className="font-medium text-blue active:underline hover:underline"
                  >
                    {sourceInfo.platform}
                  </Link>
                </div>
                <div className="p-5">
                  <h3 className="text-xs text-gray mb-2">Store</h3>
                  <Link
                    href={sourceInfo.storeUrl}
                    target="_blank"
                    className="font-medium text-blue active:underline hover:underline"
                  >
                    {sourceInfo.store} ({sourceInfo.storeId})
                  </Link>
                </div>
                <div className="p-5">
                  <h3 className="text-xs text-gray mb-2">Product</h3>
                  <Link
                    href={sourceInfo.productUrl}
                    target="_blank"
                    className="font-medium text-blue active:underline hover:underline"
                  >
                    View on {sourceInfo.platform}
                  </Link>
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray">Nothing here</span>
            )}
            <ProductSourceButton
              className={clsx({
                "absolute top-2 right-2": hasSourceInfo,
              })}
            />
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Upsell</h2>
            <p className="text-sm md:max-w-[85%]">
              Boost sales by showing customers items that go well with what
              they're buying. This helps them get everything they need in one
              go. It saves time and makes shopping easier.
            </p>
          </div>
          <div className="w-full max-w-[400px] relative p-5 pr-2 flex items-center justify-between shadow rounded-xl bg-white">
            {upsell && upsellDetails ? (
              <div className="w-max max-w-full rounded-xl overflow-hidden border border-[#FFD69D] bg-[#FEF0B8]">
                <div className="rounded-xl p-2 pb-0">
                  <Link
                    href={`/admin/shop/upsells/${upsell.id}`}
                    target="_blank"
                    className="group relative block w-60 rounded-lg overflow-hidden select-none"
                  >
                    <div className="w-full aspect-square flex items-center justify-center bg-white">
                      <Image
                        src={upsell.mainImage}
                        alt="Upsell"
                        width={240}
                        height={240}
                        priority
                      />
                    </div>
                    <div className="absolute top-0 bottom-0 left-0 right-0 group-hover:bg-black/20 transition-colors duration-200"></div>
                  </Link>
                </div>
                <div className="p-5 pt-4 pr-12">
                  <p className="mb-1 font-bold text-[#C45500]">
                    ${upsell.pricing.salePrice || upsell.pricing.basePrice} (
                    {upsellDetails.percentageIncrease}%)
                  </p>
                  <p className="text-xs text-[#C45500]/85">
                    Customer spends ${upsellDetails.additionalSpend} more
                  </p>
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray">Nothing here</span>
            )}
            <UpsellButton
              className={clsx({
                "absolute top-2 right-2": upsell,
              })}
            />
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Visibility</h2>
            <p className="text-sm md:max-w-[85%]">
              Published or hidden? Choose if your creation is visible on the
              public website.
            </p>
          </div>
          <div className="w-full max-w-[400px] relative shadow rounded-xl bg-white">
            <div className="relative border rounded-xl pl-5 pr-[10px] py-4">
              <div className="w-full flex items-center justify-between">
                <div
                  className={clsx(
                    "inline-flex px-3 py-1 rounded-full text-sm font-medium",
                    visibility.toUpperCase() === "PUBLISHED"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray"
                  )}
                >
                  {capitalizeFirstLetter(visibility.toLowerCase())}
                </div>
                <VisibilityButton />
              </div>
            </div>
          </div>
        </div>
      </div>
      <BasicDetailsOverlay data={{ id, category, name, slug, pricing }} />
      <OnPageSeoOverlay data={{ id, seo }} />
      <ProductSourceOverlay data={{ id, sourceInfo }} />
      <MainImageOverlay data={{ id, images }} />
      <ImageGalleryOverlay data={{ id, images }} />
      <ColorsOverlay data={{ id, colors: options.colors }} />
      <SizeChartOverlay
        data={{
          id,
          sizes: options.sizes,
        }}
      />
      <DescriptionOverlay data={{ id, description }} />
      <HighlightsOverlay data={{ id, highlights }} />
      <VisibilityOverlay data={{ id, visibility }} />
      <UpsellOverlay data={{ id, upsell, upsellDetails }} />
    </>
  );
}
