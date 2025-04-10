import { Hourglass, Clock, Ban } from "lucide-react";
import {
  capitalizeFirstLetter,
  formatThousands,
  isValidRemoteImage,
} from "@/lib/utils/common";
import { notFound } from "next/navigation";
import {
  VisibilityButton,
  VisibilityOverlay,
} from "@/components/admin/Storefront/EditCollection/VisibilityOverlay";
import clsx from "clsx";
import {
  CampaignDurationButton,
  CampaignDurationOverlay,
} from "@/components/admin/Storefront/EditCollection/CampaignDurationOverlay";
import {
  BasicDetailsButton,
  BasicDetailsOverlay,
} from "@/components/admin/Storefront/EditCollection/BasicDetailsOverlay";
import Link from "next/link";
import Image from "next/image";
import {
  ProductListButton,
  ProductListOverlay,
} from "@/components/admin/Storefront/EditCollection/ProductListOverlay";
import {
  BannerImagesButton,
  BannerImagesOverlay,
} from "@/components/admin/Storefront/EditCollection/BannerImagesOverlay";
import { getCollections } from "@/actions/get/collections";
import { getProducts } from "@/actions/get/products";

export default async function EditCollection({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const CAMPAIGN_STATUS_ENDED = "Ended";
  const CAMPAIGN_STATUS_UPCOMING = "Upcoming";
  const CAMPAIGN_STATUS_ACTIVE = "Active";

  const paramSlug = (await params).slug;
  const [collection] =
    (await getCollections({
      ids: [paramSlug.split("-").pop() as string],
      includeProductDetails: true,
    })) || [];

  if (!collection) {
    notFound();
  }

  const productIndexes = new Map(
    (collection.products || []).map((product) => [product.id, product.index])
  );

  let collectionProducts: any[] = [];
  if (productIndexes.size > 0) {
    collectionProducts =
      (await getProducts({
        ids: Array.from(productIndexes.keys()),
        fields: ["id", "slug", "images", "name", "pricing", "visibility"],
      })) || [];
  }

  const sortedProducts = (collectionProducts || [])
    .map((product) => ({
      ...product,
      index: productIndexes.get(product.id) ?? 0,
    }))
    .sort((a, b) => a.index - b.index);

  const updatedCollection = {
    ...collection,
    products: sortedProducts,
  };

  const {
    id,
    campaignDuration,
    collectionType,
    title,
    slug,
    bannerImages,
    visibility,
    products,
  } = updatedCollection as CollectionDataType;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const getCampaignStatus = (startDate: string, endDate: string): string => {
    const currentDate = new Date();
    const campaignStartDate = new Date(startDate);
    const campaignEndDate = new Date(endDate);

    campaignStartDate.setUTCHours(0, 0, 0, 0);
    campaignEndDate.setUTCHours(0, 0, 0, 0);

    if (currentDate.getTime() > campaignEndDate.getTime()) {
      return CAMPAIGN_STATUS_ENDED;
    } else if (currentDate.getTime() < campaignStartDate.getTime()) {
      return CAMPAIGN_STATUS_UPCOMING;
    } else {
      return CAMPAIGN_STATUS_ACTIVE;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case CAMPAIGN_STATUS_UPCOMING:
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            <Hourglass size={12} />
            <span className="text-xs font-medium">Upcoming</span>
          </div>
        );
      case CAMPAIGN_STATUS_ACTIVE:
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 text-green-700">
            <Clock size={12} />
            <span className="text-xs font-medium">Active</span>
          </div>
        );
      case CAMPAIGN_STATUS_ENDED:
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100 text-red-700">
            <Ban size={12} />
            <span className="text-xs font-medium">Ended</span>
          </div>
        );
    }
  };

  const hasBasicDetails = title && collectionType && slug && id;

  return (
    <>
      <div className="max-w-[768px] flex flex-col gap-10 px-5">
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Campaign duration</h2>
            <p className="text-sm md:max-w-[85%]">
              Keep track of your campaign. Upcoming, Active, or Ended. This
              helps you plan your marketing effectively and make adjustments as
              needed for maximum impact.
            </p>
          </div>
          <div className="w-full max-w-[400px] relative p-5 pr-2 flex items-center justify-between shadow rounded-xl bg-white">
            {Object.keys(campaignDuration || {}).length > 0 ? (
              <div className="space-y-2">
                {getStatusBadge(
                  getCampaignStatus(
                    campaignDuration.startDate,
                    campaignDuration.endDate
                  )
                )}
                <div className="flex items-center gap-1.5 text-xs text-gray">
                  <span>{formatDate(campaignDuration.startDate)}</span>
                  <span className="text-gray-400">→</span>
                  <span>{formatDate(campaignDuration.endDate)}</span>
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray">Nothing here</span>
            )}
            <CampaignDurationButton
              className={clsx({
                "absolute top-2 right-2":
                  Object.keys(campaignDuration || {}).length > 0,
              })}
            />
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Basic details</h2>
            <p className="text-sm md:max-w-[85%]">
              Create a title that sticks in people's minds. Make it enticing
              enough to make them stop and pay attention. Finally, reinforce it
              with a short, keyword-rich slug (3-5 words).
            </p>
          </div>
          <div
            className={clsx(
              "w-full relative flex items-center justify-between shadow rounded-xl bg-white",
              !hasBasicDetails && "p-5 pr-2"
            )}
          >
            {hasBasicDetails ? (
              <div className="w-[calc(100%-60px)]">
                <div className="p-5">
                  <h3 className="text-xs text-gray mb-2">Collection</h3>
                  <p className="font-medium text-sm">{collectionType}</p>
                </div>
                <div className="p-5">
                  <h3 className="text-xs text-gray mb-2">Title</h3>
                  <p className="font-medium max-w-[540px]">{title}</p>
                </div>
                <div className="p-5">
                  <h3 className="text-xs text-gray mb-2">Slug</h3>
                  <p className="font-medium">
                    {slug}-{id}
                  </p>
                </div>
              </div>
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
        {bannerImages &&
          bannerImages.desktopImage &&
          bannerImages.mobileImage && (
            <div>
              <div className="mb-6">
                <h2 className="font-semibold text-xl mb-3">Banner images</h2>
                <p className="text-sm md:max-w-[85%]">
                  Create a banner that demands attention. Bold imagery and a
                  strong call-to-action can turn passive viewers into active
                  customers.
                </p>
              </div>
              <div className="w-full relative p-5 pr-2 flex items-center justify-between shadow rounded-xl bg-white">
                <div className="w-[calc(100%-60px)] flex flex-col gap-8">
                  <div>
                    <h3 className="text-xs text-gray mb-4">
                      Desktop (1440x360 px)
                    </h3>
                    <div className="w-full rounded-xl flex items-center justify-center overflow-hidden">
                      {isValidRemoteImage(bannerImages?.desktopImage) && (
                        <Image
                          src={bannerImages?.desktopImage}
                          alt={title}
                          width={766}
                          height={308}
                          priority={true}
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs text-gray mb-4">
                      Mobile (1080x1080 px)
                    </h3>
                    <div className="w-full max-w-[416px] aspect-square rounded-xl flex items-center justify-center overflow-hidden">
                      {isValidRemoteImage(bannerImages?.mobileImage) && (
                        <Image
                          src={bannerImages?.mobileImage}
                          alt={title}
                          width={766}
                          height={308}
                          priority={true}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <BannerImagesButton
                  className={clsx({
                    "absolute top-2 right-2": true,
                  })}
                />
              </div>
            </div>
          )}
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">
              Products ({products?.length ?? 0})
            </h2>
            <p className="text-sm md:max-w-[85%]">
              Pick stuff that goes well together. Choose different looks,
              colors, and prices. Make sure there's something for everyone.
            </p>
          </div>
          <div
            className={clsx(
              "w-full relative p-5 pr-2 flex items-center justify-between shadow rounded-xl bg-white",
              products && products.length > 0 && "pb-3"
            )}
          >
            {products && products.length > 0 ? (
              <div className="w-[calc(100%-60px)] flex flex-wrap gap-5 justify-start">
                {products.slice(0, 3).map(({ id, slug, pricing, images }) => (
                  <Link
                    key={id}
                    href={`/admin/products/${slug}-${id}`}
                    className="group aspect-square w-[calc(33.33%-14px)] select-none"
                  >
                    <div className="relative">
                      <div className="w-full aspect-square overflow-hidden flex items-center justify-center shadow-[2px_2px_4px_#9E9E9E] bg-white">
                        <Image
                          src={images.main}
                          alt="Upsell"
                          width={250}
                          height={250}
                          priority
                        />
                      </div>
                      <div className="w-full h-full absolute top-0 bottom-0 left-0 right-0 ease-in-out duration-300 transition group-hover:bg-black/20" />
                    </div>
                    <div className="mt-2 w-max mx-auto flex items-center justify-center">
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
                  </Link>
                ))}
              </div>
            ) : (
              <span className="text-xs text-gray">Nothing here</span>
            )}
            <ProductListButton
              className={clsx({
                "absolute top-2 right-2": products && products.length > 0,
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
      <CampaignDurationOverlay data={{ id, campaignDuration }} />
      <BasicDetailsOverlay data={{ id, title, slug, collectionType }} />
      {bannerImages && <BannerImagesOverlay data={{ id, bannerImages }} />}
      <VisibilityOverlay data={{ id, visibility }} />
      <ProductListOverlay data={{ id, products }} />
    </>
  );
}

// -- Type Definitions --

type ProductWithIndex = ProductType & { index: number };

type CollectionDataType = {
  id: string;
  bannerImages?: {
    desktopImage: string;
    mobileImage: string;
  };
  title: string;
  slug: string;
  campaignDuration: {
    startDate: string;
    endDate: string;
  };
  visibility: string;
  collectionType: string;
  index: number;
  updatedAt: string;
  createdAt: string;
  products: ProductWithIndex[];
};
