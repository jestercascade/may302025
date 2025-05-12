import { Banner } from "@/components/website/Banner";
import { Categories } from "@/components/website/Categories";
import ShuffledDiscoveryProducts from "@/components/website/ShuffledDiscoveryProducts";
import { FeaturedProducts } from "@/components/website/FeaturedProducts";
import { getCollections } from "@/actions/get/collections";
import { getCategories } from "@/actions/get/categories";
import { getPageHero } from "@/actions/get/pageHero";
import { getProducts } from "@/actions/get/products";
import { getCart } from "@/actions/get/carts";
import { getDiscoveryProductsSettings } from "@/actions/get/discoveryProducts";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ProductsProvider } from "@/contexts/ProductsContext";
import { Metadata } from "next";
import { CatalogEmptyState } from "@/components/website/CatalogEmptyState";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const [collections, categoriesData, pageHero, discoveryProductsSettings] = await Promise.all([
    getCollections({
      fields: ["title", "slug", "products"],
      visibility: "PUBLISHED",
      publishedProductsOnly: true,
      allowedCampaignStatuses: ["Active"],
    }),
    getCategories({ visibility: "VISIBLE" }),
    getPageHero(),
    getDiscoveryProductsSettings(),
  ]);

  const featured = await enrichFeaturedCollections(collections || []);
  const combinedCollections = [
    ...featured,
    ...(collections?.filter((c) => c.collectionType !== "FEATURED") || []),
  ].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  const excludedIds = new Set(
    combinedCollections
      .filter((c) => c.collectionType === "FEATURED")
      .flatMap((c) =>
        (c.products || [])
          .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
          .slice(0, 3)
          .map((p) => p.id)
      )
  );

  const heroContent = renderHero(pageHero);
  const isHeroRendered = heroContent !== null;
  const isCategoriesRendered = !!categoriesData?.showOnPublicSite && categoriesData.categories?.length > 0;
  const hasCollectionContent = combinedCollections.some((c) => {
    if (c.collectionType === "FEATURED") return c.products.length >= 3;
    if (c.collectionType === "BANNER") return c.products.length > 0;
    return false;
  });

  if (!isHeroRendered && !isCategoriesRendered && !hasCollectionContent) {
    if (discoveryProductsSettings?.visibleOnPages?.home !== true) {
      return <CatalogEmptyState />;
    }

    const publishedProducts = await getProducts({
      fields: ["id"],
      visibility: "PUBLISHED",
    });

    const availableProducts = (publishedProducts ?? []).filter((p) => !excludedIds.has(p.id)).length;

    if (availableProducts < 3) {
      return <CatalogEmptyState />;
    }
  }

  const cookieStore = await cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value ?? "";
  const cart = await getCart(deviceIdentifier);

  return (
    <>
      {heroContent}
      <div>
        {isCategoriesRendered && <Categories categories={categoriesData.categories} />}
        <div className="mt-8 max-w-5xl mx-auto flex flex-col gap-8">
          {combinedCollections
            .map((collection) => renderCollection(collection, cart))
            .filter(Boolean)
            .map((content, index) => (
              <div key={index}>{content}</div>
            ))}
          {discoveryProductsSettings?.visibleOnPages?.home === true && (
            <div className="px-5">
              <ProductsProvider>
                <Suspense fallback={null}>
                  <ShuffledDiscoveryProducts page="HOME" excludeIds={Array.from(excludedIds)} cart={cart} />
                </Suspense>
              </ProductsProvider>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// -- UI Components --

function renderHero(pageHero: any) {
  if (pageHero?.visibility !== "VISIBLE" || !pageHero.images?.desktop || !pageHero.images?.mobile) {
    return null;
  }

  return (
    <Link href={pageHero.destinationUrl} target="_blank" className="w-full">
      <div className="block md:hidden">
        <Image
          src={pageHero.images.mobile}
          alt={pageHero.title}
          sizes="100vw"
          style={{ width: "100%", height: "auto" }}
          width={2000}
          height={2000}
          priority
        />
      </div>
      <div className="hidden md:block">
        <Image
          src={pageHero.images.desktop}
          alt={pageHero.title}
          sizes="100vw"
          style={{ width: "100%", height: "auto" }}
          width={1440}
          height={360}
          priority
        />
      </div>
    </Link>
  );
}

function renderCollection(collection: any, cart: any) {
  switch (collection.collectionType) {
    case "FEATURED":
      if (collection.products && collection.products.length >= 3) {
        return <FeaturedProducts collection={collection} cart={cart} />;
      }
      return null;
    case "BANNER":
      if (collection.products && collection.products.length > 0) {
        return <Banner collection={collection} />;
      }
      return null;
    default:
      return null;
  }
}

// -- Logic & Utilities --

async function enrichFeaturedCollections(collections: CollectionType[] | null): Promise<EnrichedCollectionType[]> {
  const featuredCollections = (collections || []).filter(
    (collection) => collection.collectionType === "FEATURED" && collection.visibility === "PUBLISHED"
  );

  // Create a map of product IDs and their indexes
  const productIdToIndexMap = featuredCollections.flatMap(
    (collection) =>
      collection.products?.map((product: any) => ({
        id: product.id,
        index: product.index,
      })) || []
  );

  const productIds = productIdToIndexMap.map((item) => item.id);

  // Fetch and enrich products
  const productsFromDb = await getProducts({
    ids: productIds,
    fields: ["name", "slug", "description", "highlights", "pricing", "images", "options", "upsell"],
    visibility: "PUBLISHED",
  });

  const productsWithIndexes = (productsFromDb || []).map((product) => ({
    ...product,
    index: productIdToIndexMap.find((item) => item.id === product.id)?.index ?? 0,
  }));

  // Enrich collections with product details
  return featuredCollections.map((collection) => {
    const enrichedProducts = (collection.products || [])
      .map((product: any) => {
        const productDetails = productsWithIndexes.find((p) => p.id === product.id);
        return productDetails ? { ...productDetails, index: product.index } : undefined;
      })
      .filter((product: any): product is NonNullable<typeof product> => product !== undefined)
      .sort((a: any, b: any) => (a.index ?? 0) - (b.index ?? 0));

    return {
      ...collection,
      products: enrichedProducts,
    } as EnrichedCollectionType;
  });
}

// -- Type Definitions --

type EnrichedProductType = ProductWithUpsellType & { index: number };

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
