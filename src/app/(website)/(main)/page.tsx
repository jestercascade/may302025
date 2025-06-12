import { Banner } from "@/components/website/Banner";
import ShuffledDiscoveryProducts from "@/components/website/ShuffledDiscoveryProducts";
import { FeaturedProducts } from "@/components/website/FeaturedProducts";
import { getCollections } from "@/actions/get/collections";
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
import { Oswald } from "next/font/google";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const [collections, pageHero, discoveryProductsSettings] = await Promise.all([
    getCollections({
      fields: ["title", "slug", "products"],
      visibility: "PUBLISHED",
      publishedProductsOnly: true,
      allowedCampaignStatuses: ["Active"],
    }),
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
  const hasCollectionContent = combinedCollections.some((c) => {
    if (c.collectionType === "FEATURED") return c.products.length >= 3;
    if (c.collectionType === "BANNER") return c.products.length > 0;
    return false;
  });

  if (!isHeroRendered && !hasCollectionContent) {
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
      <HeroSection />

      {/* {heroContent} */}
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
    </>
  );
}

// -- UI Components --

const HeroSection = () => (
  <div className="relative bg-[#0070b0] mb-8">
    <div className="pt-6 pb-11 lg:h-[500px] lg:pt-0 lg:pb-20">
      <div className="h-full flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 px-5 sm:px-6 lg:px-0">
        <div className="text-center text-white lg:order-1 order-2">
          {/* Overline */}
          <div className="text-sm sm:text-base lg:text-lg italic font-medium tracking-widest mb-1.5 lg:mb-1.5">
            WHEN YOUR MOTHER-IN-LAW VISITS...
          </div>

          {/* Hook */}
          <h1
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 lg:mb-6 tracking-tight ${oswald.className} px-2 lg:px-0`}
          >
            PROVE YOURSELF
          </h1>

          {/* Sell */}
          <p className="text-lg sm:text-xl lg:text-xl leading-relaxed font-medium max-w-sm sm:max-w-md lg:max-w-lg mx-auto mb-6 lg:mb-8 px-4 sm:px-0 lg:px-0">
            She raised the man you love. Now show her he chose wisely. Turn her doubt into respect.
          </p>

          {/* CTA */}
          <button className="tracking-tight flex items-center justify-center w-56 sm:w-60 lg:w-64 rounded-full cursor-pointer border border-[#bf935f] text-black font-bold h-11 sm:h-12 lg:h-12 shadow-[inset_0px_1px_0px_0px_#f3db9f] [background:linear-gradient(to_bottom,_#ebcd83_5%,_#d7b565_100%)] bg-[#ebcd83] hover:bg-[#d7b565] hover:[background:linear-gradient(to_bottom,_#d7b565_5%,_#ebcd83_100%)] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.13)] active:scale-[0.98] transition-all duration-150 text-base sm:text-lg lg:text-lg mx-auto">
            GET YOURS
          </button>
        </div>
        <div className="lg:order-2 order-1">
          <div className="w-64 sm:w-72 lg:w-80 aspect-square bg-white rounded-2xl shadow-xl ring-1 ring-white/25 flex items-center justify-center overflow-hidden">
            <Image
              src="/testing/1.webp"
              alt="Get Yours"
              width={320}
              height={320}
              priority
              className="w-full h-full object-cover lg:w-auto lg:h-auto"
            />
          </div>
        </div>
      </div>
    </div>
    <div className="bg-white/10 backdrop-blur-sm border-t border-white/20 lg:absolute lg:bottom-0 lg:left-0 lg:right-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-6 py-3 lg:pt-3 lg:pb-4">
        <div className="hidden md:flex lg:flex items-center justify-center space-x-16">
          <div className="text-center">
            <div className="font-semibold text-xl text-white">128K+</div>
            <div className="text-xs text-white/80 uppercase tracking-wide">Happy Customers</div>
          </div>
          <div className="w-px h-6 bg-white/30"></div>
          <div className="text-center">
            <div className="font-semibold text-xl text-white">Free</div>
            <div className="text-xs text-white/80 uppercase tracking-wide">Worldwide Delivery</div>
          </div>
          <div className="w-px h-6 bg-white/30"></div>
          <div className="text-center">
            <div className="font-semibold text-xl text-white">30-Day</div>
            <div className="text-xs text-white/80 uppercase tracking-wide">No-Questions Returns</div>
          </div>
        </div>
        <div className="md:hidden lg:hidden grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-semibold text-base text-white">128K+</div>
            <div className="text-[10px] text-white/80 uppercase tracking-wide leading-tight">Customers</div>
          </div>
          <div>
            <div className="font-semibold text-base text-white">Free</div>
            <div className="text-[10px] text-white/80 uppercase tracking-wide leading-tight">Delivery</div>
          </div>
          <div>
            <div className="font-semibold text-base text-white">30-Day</div>
            <div className="text-[10px] text-white/80 uppercase tracking-wide leading-tight">Returns</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

function renderHero(pageHero: any) {
  if (pageHero?.visibility !== "VISIBLE" || !pageHero.images?.desktop || !pageHero.images?.mobile) {
    return null;
  }

  return (
    <div className="w-full">
      <Link href={pageHero.destinationUrl} className="block w-full">
        <div className="block md:hidden w-full">
          <Image
            src={pageHero.images.mobile}
            alt={pageHero.title}
            width={425}
            height={566}
            className="w-full h-auto"
            priority
          />
        </div>
        <div className="hidden md:block w-full">
          <Image
            src={pageHero.images.desktop}
            alt={pageHero.title}
            width={1024}
            height={256}
            className="w-full h-auto"
            priority
          />
        </div>
      </Link>
    </div>
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
