import { Banner } from "@/components/website/Banner";
import { Categories } from "@/components/website/Categories";
import { DiscoveryProducts } from "@/components/website/DiscoveryProducts";
import { FeaturedProducts } from "@/components/website/FeaturedProducts";
import { UpsellReviewOverlay } from "@/components/website/UpsellReviewOverlay";
import { getCollections } from "@/actions/get/collections";
import { getCategories } from "@/actions/get/categories";
import { getPageHero } from "@/actions/get/pageHero";
import { getProducts } from "@/actions/get/products";
import { getCart } from "@/actions/get/carts";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const [collections, categoriesData, pageHero] = await Promise.all([
    getCollections({
      fields: ["title", "slug", "products"],
      visibility: "PUBLISHED",
    }),
    getCategories({ visibility: "VISIBLE" }),
    getPageHero(),
  ]);

  const featuredCollections = await enrichFeaturedCollections(collections);

  const combinedCollections = [
    ...featuredCollections,
    ...(collections?.filter(
      (collection) => collection.collectionType !== "FEATURED"
    ) || []),
  ].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  const cookieStore = await cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value ?? "";
  const cart = await getCart(deviceIdentifier);

  const excludeIdsFromDiscoveryProducts = combinedCollections
    .filter((collection) => collection.collectionType === "FEATURED")
    .flatMap((collection) =>
      (collection.products || [])
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
        .slice(0, 3)
        .map((product) => product.id)
    );

  return (
    <>
      {renderHero(pageHero)}
      <div>
        {categoriesData?.showOnPublicSite &&
          categoriesData.categories.length > 0 && (
            <Categories categories={categoriesData.categories} />
          )}
        <div className="mt-8 max-w-5xl mx-auto flex flex-col gap-8">
          {combinedCollections
            .map((collection) => renderCollection(collection, cart))
            .filter(Boolean)
            .map((content, index) => (
              <div key={index}>{content}</div>
            ))}
          <div className="px-5">
            <DiscoveryProducts
              page="HOME"
              excludeIds={excludeIdsFromDiscoveryProducts}
              cart={cart}
            />
          </div>
        </div>
      </div>
      <UpsellReviewOverlay cart={cart} />
    </>
  );
}

// -- UI Components --

function renderHero(pageHero: any) {
  if (
    pageHero?.visibility !== "VISIBLE" ||
    !pageHero.images?.desktop ||
    !pageHero.images?.mobile
  ) {
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

async function enrichFeaturedCollections(
  collections: CollectionType[] | null
): Promise<EnrichedCollectionType[]> {
  const featuredCollections = (collections || []).filter(
    (collection) =>
      collection.collectionType === "FEATURED" &&
      collection.visibility === "PUBLISHED"
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
    fields: [
      "name",
      "slug",
      "description",
      "highlights",
      "pricing",
      "images",
      "options",
      "upsell",
    ],
    visibility: "PUBLISHED",
  });

  const productsWithIndexes = (productsFromDb || []).map((product) => ({
    ...product,
    index:
      productIdToIndexMap.find((item) => item.id === product.id)?.index ?? 0,
  }));

  // Enrich collections with product details
  return featuredCollections.map((collection) => {
    const enrichedProducts = (collection.products || [])
      .map((product: any) => {
        const productDetails = productsWithIndexes.find(
          (p) => p.id === product.id
        );
        return productDetails
          ? { ...productDetails, index: product.index }
          : undefined;
      })
      .filter(
        (product: any): product is NonNullable<typeof product> =>
          product !== undefined
      )
      .sort((a: any, b: any) => (a.index ?? 0) - (b.index ?? 0));

    return {
      ...collection,
      products: enrichedProducts,
    } as EnrichedCollectionType;
  });
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
