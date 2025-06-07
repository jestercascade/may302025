import {
  BasicDetailsOverlay,
  BasicDetailsButton,
  CopyToClipboardButton,
} from "@/components/admin/EditProduct/BasicDetailsOverlay";
import { capitalizeFirstLetter, formatThousands, isValidRemoteImage } from "@/lib/utils/common";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MainImageButton, MainImageOverlay } from "@/components/admin/EditProduct/MainImageOverlay";
import { ImageGalleryButton, ImageGalleryOverlay } from "@/components/admin/EditProduct/ImageGalleryOverlay";
import { VisibilityButton, VisibilityOverlay } from "@/components/admin/EditProduct/VisibilityOverlay";
import { OptionsButton, OptionsOverlay } from "@/components/admin/EditProduct/OptionsOverlay";
import { DescriptionButton, DescriptionOverlay } from "@/components/admin/EditProduct/DescriptionOverlay";
import Link from "next/link";
import { CheckmarkIcon } from "@/icons";
import { OnPageSeoButton, OnPageSeoOverlay } from "@/components/admin/EditProduct/OnPageSeoOverlay";
import { ProductSourceButton, ProductSourceOverlay } from "@/components/admin/EditProduct/ProductSourceOverlay";
import { HighlightsButton, HighlightsOverlay } from "@/components/admin/EditProduct/HighlightsOverlay";
import clsx from "clsx";
import { RemoveUpsellButton, UpsellButton, UpsellOverlay } from "@/components/admin/EditProduct/UpsellOverlay ";
import { getProducts } from "@/actions/get/products";
import { Copy } from "lucide-react";
import { appConfig } from "@/config";

export default async function EditProduct({ params }: { params: Promise<{ slug: string }> }) {
  const paramSlug = (await params).slug;
  const productId = paramSlug.split("-").pop() as string;
  const [product] =
    (await getProducts({
      ids: [productId],
      fields: [
        "id",
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

  const { id, name, slug, pricing, images, options, description, highlights, sourceInfo, seo, visibility, upsell } =
    product as ProductWithUpsellType;

  function calculateUpsell(
    currentProduct: {
      salePrice?: number | string;
      basePrice?: number | string;
    },
    upsell:
      | {
          pricing?: {
            salePrice?: number | string;
            basePrice?: number | string;
          };
        }
      | null
      | undefined
  ) {
    if (!upsell || !upsell.pricing) return null;

    const originalPrice = Number(currentProduct.salePrice || currentProduct.basePrice || 0);
    const upsellPrice = Number(upsell.pricing.salePrice || upsell.pricing.basePrice || 0);

    if (originalPrice === 0) return null;

    const additionalSpend = upsellPrice - originalPrice;
    const percentageIncrease = (additionalSpend / originalPrice) * 100;

    return {
      additionalSpend: additionalSpend.toFixed(2), // Fixed: was Math.round(additionalSpend).toFixed(2)
      percentageIncrease: Math.round(percentageIncrease), // Changed: was percentageIncrease.toFixed(0)
      originalPrice: originalPrice.toFixed(2),
      upsellPrice: upsellPrice.toFixed(2),
    };
  }

  const upsellDetails = upsell ? calculateUpsell(product.pricing, upsell) : null;

  const hasBasicDetails = name && pricing.basePrice && slug && id;
  const hasOnPageSeo = seo.metaTitle && seo.metaDescription;
  const hasSourceInfo = [
    sourceInfo.platform,
    sourceInfo.platformUrl,
    sourceInfo.store,
    sourceInfo.storeId,
    sourceInfo.storeUrl,
    sourceInfo.productUrl,
  ].some((value) => value && value.trim() !== "");

  return (
    <>
      <div className="max-w-[768px] flex flex-col gap-10 px-5">
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Basic details</h2>
            <p className="text-sm md:max-w-[85%]">
              Important for SEO: a name that includes target keywords in the first four words, a short URL slug with
              three or four keywords, and prices that help your business grow while making customers feel they're
              getting a good deal.
            </p>
          </div>
          <div
            className={clsx("w-full relative flex items-center justify-between shadow rounded-xl bg-white", {
              "p-5 pr-2": !hasBasicDetails,
            })}
          >
            {hasBasicDetails ? (
              <>
                <div className="w-full">
                  <div className="p-5">
                    <h3 className="text-xs text-gray mb-4">Main</h3>
                    <div className="space-y-[6px]">
                      <div className="minw-full max-w-[280px] rounded-xl aspect-square flex items-center justify-center overflow-hidden bg-lightgray">
                        {images.main && isValidRemoteImage(images.main) && (
                          <Image src={images.main} alt={name} width={280} height={280} priority />
                        )}
                      </div>
                      <div className="max-w-[280px] flex justify-center">
                        <MainImageButton />
                      </div>
                    </div>
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
                  </div>
                  <div className="p-5">
                    <h3 className="text-xs text-gray mb-3">Slug</h3>
                    <div className="w-full max-w-96 h-11 flex items-center gap-2 bg-neutral-50/80 pl-3 pr-2 rounded-md border border-gray-200/40">
                      <div className="overflow-x-auto invisible-scrollbar flex-1">
                        <p className="font-medium whitespace-nowrap text-sm tracking-tight">
                          {slug}-{id}
                        </p>
                      </div>
                      <CopyToClipboardButton text={`${appConfig.BASE_URL}/${slug}-${id}`} />
                    </div>
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
              Images that show off your product, helping people see its features and quality. They grab attention and
              let customers imagine owning it.
            </p>
          </div>
          <div className="w-full relative shadow rounded-xl bg-white">
            <div>
              {images.gallery.length === 0 || images.gallery.every((image) => !isValidRemoteImage(image)) ? (
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
              {images.gallery.length > 0 && images.gallery.every((image) => isValidRemoteImage(image)) && (
                <div className="flex flex-wrap gap-2 p-5 pt-0">
                  {images.gallery.map(
                    (image, index) =>
                      isValidRemoteImage(image) && (
                        <div
                          key={index}
                          className="max-w-[148px] lg:max-w-[210px] w-[calc(50%-4px)] border rounded-xl aspect-square flex items-center justify-center overflow-hidden"
                        >
                          <Image src={image} alt={name} width={210} height={210} priority />
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
              Products that come in different sizes make it easy for people to find what they're looking for. And with
              lots of colors available, everyone can show off their style and personality.
            </p>
          </div>
          <div className="w-full relative shadow rounded-xl bg-white">
            {options.groups.length > 0 ? (
              <>
                <div className="w-[calc(100%-60px)] p-5">
                  {options.groups.map((group) => (
                    <div key={group.id} className="mb-6 last:mb-0">
                      <h3 className="text-xs text-gray-500 mb-2">{group.name}</h3>
                      <div className="flex gap-2 flex-wrap">
                        {group.values.map((value) => (
                          <button
                            key={value.id}
                            className={clsx(
                              "px-4 py-2 rounded-lg text-sm font-medium",
                              value.isActive
                                ? "bg-lightgray text-gray-800"
                                : "bg-white text-gray-400 border border-gray-300 border-dashed opacity-70"
                            )}
                          >
                            {value.value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <OptionsButton className="absolute top-2 right-2" />
              </>
            ) : (
              <div className="w-full flex items-center justify-between p-5 pr-2">
                <span className="text-xs text-gray-500">Nothing here</span>
                <OptionsButton className="absolute top-2 right-2" />
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Product description</h2>
            <p className="text-sm md:max-w-[85%]">
              Tell people why your product is great. What problem does it solve brilliantly? Explain how it makes life
              more enjoyable. Keep it simple and exciting.
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
              Craft an irresistible message. Hook them with pain. Show you understand their struggles. Alternatively,
              tap into their desires and create a sense of possibility. Use active voice, strong verbs. Paint a clear
              picture of the desired outcome. Make them feel the satisfaction, see the results, crave your solution.
            </p>
          </div>
          <div className="w-full relative shadow rounded-xl bg-white">
            {!highlights.headline && !highlights.keyPoints.length ? (
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
                        <li key={highlight.index} className="flex items-start gap-2 mb-2 last:mb-0">
                          <div className="w-5 min-w-5 h-5 -ml-[1px] flex items-center justify-center">
                            <CheckmarkIcon className="fill-green mt-[3px] -ml-[1px]" size={19} />
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
              Use keywords that fit your product. This helps search engines understand your page and show it to the
              right people.
            </p>
          </div>
          <div
            className={clsx("w-full relative flex items-center justify-between shadow rounded-xl bg-white", {
              "p-5 pr-2": !hasOnPageSeo,
            })}
          >
            {hasOnPageSeo ? (
              <div className="w-[calc(100%-60px)]">
                <div className="p-5">
                  <h3 className="text-xs text-gray mb-2">Meta title</h3>
                  <p className="font-medium">{seo.metaTitle}</p>
                </div>
                <div className="p-5">
                  <h3 className="text-xs text-gray mb-2">Meta description</h3>
                  <p className="font-medium max-w-[540px]">{seo.metaDescription}</p>
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
              Keep track of where you get your products. It helps you reorder fast and fix problems quickly.
            </p>
          </div>
          <div
            className={clsx("w-full relative flex items-center justify-between shadow rounded-xl bg-white", {
              "p-5 pr-2": !hasSourceInfo,
            })}
          >
            {hasSourceInfo ? (
              <div className="w-[calc(100%-60px)]">
                {sourceInfo.platform && sourceInfo.platformUrl && (
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
                )}
                {sourceInfo.store && (sourceInfo.storeUrl || sourceInfo.storeId) && (
                  <div className="p-5">
                    <h3 className="text-xs text-gray mb-2">Store</h3>
                    <Link
                      href={sourceInfo.storeUrl || "#"}
                      target="_blank"
                      className="font-medium text-blue active:underline hover:underline"
                    >
                      {sourceInfo.store} {sourceInfo.storeId && `(${sourceInfo.storeId})`}
                    </Link>
                  </div>
                )}
                {sourceInfo.productUrl && (
                  <div className="p-5">
                    <h3 className="text-xs text-gray mb-2">Product</h3>
                    <Link
                      href={sourceInfo.productUrl}
                      target="_blank"
                      className="font-medium text-blue active:underline hover:underline"
                    >
                      View on {sourceInfo.platform || "Source"}
                    </Link>
                  </div>
                )}
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
              Boost sales by showing customers items that go well with what they're buying.
            </p>
          </div>
          <div className="w-full max-w-[400px] relative p-4 pr-2 flex items-center justify-between shadow rounded-xl bg-white">
            {upsell ? (
              upsell.mainImage && upsell.pricing ? (
                <>
                  <div className="w-max max-w-full rounded-xl overflow-hidden bg-gradient-to-br from-orange-100/80 via-amber-50/60 to-yellow-50/40 shadow-lg shadow-orange-200/30 border border-orange-200/50 backdrop-blur-sm">
                    <div className="p-3">
                      <Link
                        href={`/admin/shop/upsells/${upsell.id}`}
                        target="_blank"
                        className="group relative block w-60 rounded-lg overflow-hidden select-none"
                      >
                        <div className="w-full aspect-square flex items-center justify-center bg-white">
                          {isValidRemoteImage(upsell.mainImage) && (
                            <Image src={upsell.mainImage} alt="Upsell" width={240} height={240} priority />
                          )}
                        </div>
                        <div className="absolute inset-0 group-hover:bg-slate-700/10 transition-all duration-300 ease-out"></div>
                      </Link>
                    </div>
                    {upsellDetails ? (
                      <div className="px-4 pb-4 pt-1">
                        <div className="flex items-baseline gap-3 mb-1">
                          <p className="text-2xl font-bold text-orange-900 tracking-tight">
                            ${upsellDetails.upsellPrice}
                          </p>
                          {upsellDetails.percentageIncrease <= 200 && (
                            <span className="text-xs font-semibold text-orange-700 bg-orange-100/60 px-2.5 py-1 rounded-full">
                              +{upsellDetails.percentageIncrease}%
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-orange-800/75 font-medium">
                          Customer spends{" "}
                          <span className="text-amber-800 font-bold">${upsellDetails.additionalSpend}</span> more
                        </p>
                      </div>
                    ) : null}
                  </div>
                  <UpsellButton className="absolute top-2 right-2" />
                </>
              ) : (
                <RemoveUpsellButton productId={id} />
              )
            ) : (
              <>
                <span className="text-xs text-gray">Nothing here</span>
                <UpsellButton className="absolute top-2 right-2" />
              </>
            )}
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Visibility</h2>
            <p className="text-sm md:max-w-[85%]">
              Published or hidden? Choose if your creation is visible on the public website.
            </p>
          </div>
          <div className="w-full max-w-[400px] relative shadow rounded-xl bg-white">
            <div className="relative border rounded-xl pl-5 pr-[10px] py-4">
              <div className="w-full flex items-center justify-between">
                <div
                  className={clsx(
                    "inline-flex px-3 py-1 rounded-full text-sm font-medium",
                    visibility.toUpperCase() === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray"
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
      <BasicDetailsOverlay data={{ id, name, slug, pricing }} />
      <OnPageSeoOverlay data={{ id, seo }} />
      <ProductSourceOverlay data={{ id, sourceInfo }} />
      <MainImageOverlay data={{ id, images }} />
      <ImageGalleryOverlay data={{ id, images }} />
      <OptionsOverlay data={{ id, options }} />
      <DescriptionOverlay data={{ id, description }} />
      <HighlightsOverlay data={{ id, highlights }} />
      <VisibilityOverlay data={{ id, visibility }} />
      <UpsellOverlay
        data={{
          id,
          upsell,
          upsellDetails,
        }}
      />
    </>
  );
}
