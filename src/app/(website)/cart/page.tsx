import ShuffledDiscoveryProducts from "@/components/website/ShuffledDiscoveryProducts";
import { UpsellReviewOverlay } from "@/components/website/UpsellReviewOverlay";
import { ResetUpsellReview } from "@/components/website/ResetUpsellReview";
import { CartItemList } from "@/components/website/CartItemList";
import { ProductsProvider } from "@/contexts/ProductsContext";
import { getProducts } from "@/actions/get/products";
import { adminDb } from "@/lib/firebase/admin";
import { getCart } from "@/actions/get/carts";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDiscoveryProductsSettings } from "@/actions/get/discoveryProducts";

export const metadata: Metadata = {
  alternates: {
    canonical: "/cart",
  },
};

export default async function Cart() {
  const cookieStore = await cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value ?? "";
  const cart = await getCart(deviceIdentifier);

  const items = cart?.items || ([] as CartItemType[]);
  const productItems = items.filter((item): item is CartProductItemType => item.type === "product");
  const upsellItems = items.filter((item): item is CartUpsellItemType => item.type === "upsell");

  const [baseProducts, cartUpsells, discoveryProductsSettings] = await Promise.all([
    getBaseProducts(productItems.map((p) => p.baseProductId).filter(Boolean)),
    getCartUpsells(upsellItems),
    getDiscoveryProductsSettings(),
  ]);

  const cartProducts = mapCartProductsToBaseProducts(productItems, baseProducts);

  // Use a type assertion to tell TypeScript that cartUpsells is safe
  // This is because we've confirmed that getCartUpsells function always returns complete objects with name and slug
  const typedCartUpsells = cartUpsells as unknown as Array<{
    type: "upsell";
    baseUpsellId: string;
    variantId: string;
    index: number;
    mainImage: string;
    pricing: {
      basePrice: number;
      salePrice: number;
      discountPercentage: number;
    };
    products: Array<{
      id: string;
      name: string;
      slug: string;
      mainImage: string;
      basePrice: number;
      selectedOptions: Record<string, SelectedOptionType>;
    }>;
  }>;

  const sortedCartItems = [...cartProducts, ...typedCartUpsells].sort((a, b) => a.index - b.index);

  const showDiscoveryProducts = discoveryProductsSettings?.visibleOnPages?.cart === true;

  const getExcludedProductIds = (cartItems: CartItemType[]): string[] => {
    const productIds = new Set<string>();
    cartItems.forEach((item: CartItemType) => {
      if (item.type === "product") {
        productIds.add(item.baseProductId);
      } else if (item.type === "upsell" && item.products) {
        item.products.forEach((product) => productIds.add(product.id));
      }
    });
    return Array.from(productIds);
  };

  const excludeIdsFromDiscoveryProducts = getExcludedProductIds(sortedCartItems);

  let discoveryProductsContent = null;
  if (showDiscoveryProducts) {
    const publishedProducts = await getProducts({
      fields: ["id"],
      visibility: "PUBLISHED",
    });

    const excludedIds = new Set(excludeIdsFromDiscoveryProducts);
    const availableProducts = (publishedProducts ?? []).filter((p) => !excludedIds.has(p.id)).length;

    if (availableProducts >= 3) {
      discoveryProductsContent = (
        <div className="px-5">
          <ProductsProvider>
            <Suspense fallback={null}>
              <ShuffledDiscoveryProducts
                page="CART"
                heading="Add These to Your Cart"
                excludeIds={excludeIdsFromDiscoveryProducts}
                cart={cart}
              />
            </Suspense>
          </ProductsProvider>
        </div>
      );
    }
  }

  return (
    <>
      <div
        id="scrollable-parent"
        className="h-screen overflow-x-hidden overflow-y-auto max-[1024px]:invisible-scrollbar lg:custom-scrollbar"
      >
        <nav className="border-b">
          <div className="h-14 px-5 flex items-center max-w-[1080px] mx-auto">
            <Link href="/">
              <Image src="/cherlygood/logo.svg" alt="Cherlygood" width={220} height={27} priority className="mt-1" />
            </Link>
          </div>
        </nav>
        <div className="min-h-[calc(100vh-385px)] w-full max-w-[580px] md:max-w-5xl mx-auto flex flex-col gap-10">
          <div className="w-full px-5 mx-auto">
            {sortedCartItems.length === 0 && <EmptyCartState />}
            {sortedCartItems.length > 0 && <CartItemList cartItems={sortedCartItems} />}
          </div>
          {discoveryProductsContent}
        </div>
        <Footer />
      </div>
      <UpsellReviewOverlay cart={cart} />
      <ResetUpsellReview />
    </>
  );
}

// -- Data Fetching and Mapping --

const getBaseProducts = async (productIds: string[]) =>
  getProducts({
    ids: productIds,
    fields: ["id", "name", "slug", "pricing", "images", "options"],
    visibility: "PUBLISHED",
  }) as Promise<ProductType[]>;

const mapCartProductsToBaseProducts = (
  cartProducts: Array<{
    type: "product";
    baseProductId: string;
    selectedOptions: Record<string, SelectedOptionType>;
    variantId: string;
    index: number;
  }>,
  baseProducts: ProductType[]
) =>
  cartProducts
    .map((cartProduct) => {
      const baseProduct = baseProducts.find((p) => p.id === cartProduct.baseProductId);
      if (!baseProduct) return null;

      return {
        baseProductId: baseProduct.id,
        name: baseProduct.name,
        slug: baseProduct.slug,
        pricing: baseProduct.pricing,
        mainImage: baseProduct.images.main,
        variantId: cartProduct.variantId,
        selectedOptions: cartProduct.selectedOptions,
        index: cartProduct.index || 0,
        type: cartProduct.type,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

const getCartUpsells = async (
  upsellItems: Array<{
    type: "upsell";
    index: number;
    baseUpsellId: string;
    variantId: string;
    products: Array<{
      id: string;
      selectedOptions: Record<string, SelectedOptionType>;
    }>;
  }>
) => {
  if (!upsellItems || upsellItems.length === 0) return [];

  const upsellPromises = upsellItems.map(async (upsell) => {
    const upsellData = await getUpsell(upsell.baseUpsellId);
    if (!upsellData?.products) return null;

    const detailedProducts = upsell.products
      .map((selectedProduct) => {
        const baseProduct = upsellData.products.find((p) => p.id === selectedProduct.id);
        if (!baseProduct) return null;

        if (!baseProduct.images) return null;

        return {
          id: baseProduct.id,
          name: baseProduct.name,
          slug: baseProduct.slug,
          mainImage: baseProduct.images.main,
          basePrice: baseProduct.basePrice,
          selectedOptions: selectedProduct.selectedOptions,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);

    if (detailedProducts.length === 0) return null;

    return {
      baseUpsellId: upsell.baseUpsellId,
      variantId: upsell.variantId,
      index: upsell.index,
      type: upsell.type,
      mainImage: upsellData.mainImage,
      pricing: upsellData.pricing,
      products: detailedProducts,
    };
  });

  const results = await Promise.all(upsellPromises);
  return results.filter((result): result is NonNullable<typeof result> => result !== null);
};

const getUpsell = async (id: string): Promise<UpsellType | null> => {
  const snapshot = await adminDb.collection("upsells").doc(id).get();
  if (!snapshot.exists) return null;

  const data = snapshot.data() as UpsellType;
  const productIds = data.products.map((p) => p.id);

  const products = await getProducts({
    ids: productIds,
    fields: ["id", "name", "slug", "options", "images"],
    visibility: "PUBLISHED",
  });

  if (!products || products.length === 0) return null;

  // Type assertion to match the UpsellType.products structure
  const updatedProducts = data.products
    .map((product) => {
      const matchedProduct = products.find((p) => p.id === product.id);
      if (!matchedProduct) return null;

      return {
        id: product.id,
        basePrice: product.basePrice,
        name: matchedProduct.name,
        slug: matchedProduct.slug,
        options: matchedProduct.options as unknown as ProductOptionsType | undefined,
        images: matchedProduct.images,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  return {
    ...data,
    products: updatedProducts as UpsellType["products"],
  };
};

// -- UI Components --

function EmptyCartState() {
  return (
    <div className="flex justify-center py-16">
      <Image src="/icons/cart-thin.svg" alt="Cart" width={80} height={80} priority />
    </div>
  );
}

function Footer() {
  return (
    <footer className="w-full pt-6 pb-24 mt-14 bg-lightgray">
      <div className="md:hidden max-w-[486px] px-5 mx-auto">
        <div className="grid grid-cols-2">
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <Link href="/about-us" className="block w-max text-sm text-gray mb-2 hover:underline">
              About us
            </Link>
            <Link href="/privacy-policy" className="block w-max text-sm text-gray mb-2 hover:underline">
              Privacy policy
            </Link>
            <Link href="/terms-of-use" className="block w-max text-sm text-gray mb-2 hover:underline">
              Terms of use
            </Link>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Get Help</h3>
            <Link href="/contact-us" className="block w-max text-sm text-gray mb-2 hover:underline">
              Contact us
            </Link>
            <Link href="#" className="block w-max text-sm text-gray mb-2 hover:underline">
              Track order
            </Link>
            <Link href="/returns-and-refunds" className="block w-max text-sm text-gray mb-2 hover:underline">
              Returns & refunds
            </Link>
            <Link href="/faq" className="block w-max text-sm text-gray mb-2 hover:underline">
              FAQs
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden md:block w-full max-w-[1040px] px-9 mx-auto">
        <div className="flex gap-10">
          <div className="w-full">
            <h3 className="font-semibold mb-4">Company</h3>
            <Link href="/about-us" className="block w-max text-sm text-gray mb-2 hover:underline">
              About us
            </Link>
            <Link href="/privacy-policy" className="block w-max text-sm text-gray mb-2 hover:underline">
              Privacy policy
            </Link>
            <Link href="/terms-of-use" className="block w-max text-sm text-gray mb-2 hover:underline">
              Terms of use
            </Link>
          </div>
          <div className="w-full">
            <h3 className="font-semibold mb-4">Get Help</h3>
            <Link href="/contact-us" className="block w-max text-sm text-gray mb-2 hover:underline">
              Contact us
            </Link>
            <Link href="#" className="block w-max text-sm text-gray mb-2 hover:underline">
              Track order
            </Link>
            <Link href="/returns-and-refunds" className="block w-max text-sm text-gray mb-2 hover:underline">
              Returns & refunds
            </Link>
            <Link href="/faq" className="block w-max text-sm text-gray mb-2 hover:underline">
              FAQs
            </Link>
          </div>
          <div className="min-w-[270px]"></div>
        </div>
      </div>
    </footer>
  );
}

// -- Type Definitions --

type SelectedOptionType = {
  value: string;
  optionDisplayOrder: number;
  groupDisplayOrder: number;
};

type CartProductItemType = {
  type: "product";
  baseProductId: string;
  selectedOptions: Record<string, SelectedOptionType>;
  variantId: string;
  index: number;
};

type CartUpsellItemType = {
  type: "upsell";
  baseUpsellId: string;
  variantId: string;
  index: number;
  products: Array<{
    id: string;
    selectedOptions: Record<string, SelectedOptionType>;
  }>;
};

type CartItemType = CartProductItemType | CartUpsellItemType;

type ProductType = {
  id: string;
  name: string;
  slug: string;
  pricing: {
    basePrice: number;
    salePrice: number;
    discountPercentage: number;
  };
  images: {
    main: string;
    gallery: string[];
  };
  options: ProductOptionsType;
};

type UpsellType = {
  id: string;
  mainImage: string;
  pricing: {
    basePrice: number;
    salePrice: number;
    discountPercentage: number;
  };
  products: Array<{
    id: string;
    name?: string;
    slug?: string;
    basePrice: number;
    images?: {
      main: string;
      gallery: string[];
    };
    options?: ProductOptionsType;
  }>;
};

type SizeChartType = {
  inches?: {
    columns: Array<{
      label: string;
      order: number;
    }>;
    rows: Array<Record<string, string>>;
  };
  centimeters?: {
    columns: Array<{
      label: string;
      order: number;
    }>;
    rows: Array<Record<string, string>>;
  };
};

type OptionGroupType = {
  id: number;
  name: string;
  displayOrder: number;
  values: Array<{
    id: number;
    value: string;
    isActive: boolean;
  }>;
  sizeChart?: SizeChartType;
};

type ProductOptionsType = {
  groups: Array<OptionGroupType>;
  config: {
    chaining: {
      enabled: boolean;
      relationships: Array<{
        parentGroupId: number;
        childGroupId: number;
        constraints: {
          [parentOptionId: string]: number[];
        };
      }>;
    };
  };
};
