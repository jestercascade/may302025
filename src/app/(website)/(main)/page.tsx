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
import {
  Users,
  Truck,
  RotateCcw,
  Shield,
  TrendingUp,
  Clock,
  Globe,
  Award,
  CheckCircle,
  Zap,
  Package,
  MapPin,
  Calendar,
} from "lucide-react";

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
      <Strip3 />

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

const Strip3 = () => (
  <div className="relative bg-blue-500">
    {/* Content area that ends where strip begins */}
    <div className="h-[400px] pb-20">
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-5xl font-light mb-4">Your Brand</h1>
          <p className="text-lg opacity-90">Experience the future of delivery with our premium service</p>
        </div>
      </div>
    </div>

    {/* Clean glassmorphism stats bar */}
    <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-sm border-t border-white/20">
      <div className="max-w-5xl mx-auto px-6 py-5">
        <div className="flex items-center justify-center space-x-14">
          <div className="text-center">
            <div className="font-semibold text-xl text-white">25K+</div>
            <div className="text-xs text-white/80 uppercase tracking-wide">Orders delivered</div>
          </div>

          <div className="w-px h-6 bg-white/30"></div>

          <div className="text-center">
            <div className="font-semibold text-xl text-white">50+</div>
            <div className="text-xs text-white/80 uppercase tracking-wide">Countries served</div>
          </div>

          <div className="w-px h-6 bg-white/30"></div>

          <div className="text-center">
            <div className="font-semibold text-xl text-white">Free</div>
            <div className="text-xs text-white/80 uppercase tracking-wide">Worldwide shipping</div>
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
