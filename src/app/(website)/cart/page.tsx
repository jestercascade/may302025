import ShowAlert from "@/components/website/ShowAlert";
import { cookies } from "next/headers";
import { QuickviewOverlay } from "@/components/website/QuickviewOverlay";
import { UpsellReviewOverlay } from "@/components/website/UpsellReviewOverlay";
import { adminDb } from "@/lib/firebase/admin";
import { ResetUpsellReview } from "@/components/website/ResetUpsellReview";
import { CartItemList } from "@/components/website/CartItemList";
import { DiscoveryProducts } from "@/components/website/DiscoveryProducts";
import { getCart } from "@/actions/get/carts";
import { getProducts } from "@/actions/get/products";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

export default async function Cart() {
  const cookieStore = await cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value ?? "";
  const cart = await getCart(deviceIdentifier);

  const items = cart?.items || [];
  const productItems = items.filter(
    (item): item is CartProductItemType => item.type === "product"
  );
  const upsellItems = items.filter(
    (item): item is CartUpsellItemType => item.type === "upsell"
  );

  const [baseProducts, cartUpsells] = await Promise.all([
    getBaseProducts(productItems.map((p) => p.baseProductId).filter(Boolean)),
    getCartUpsells(upsellItems),
  ]);

  const cartProducts = mapCartProductsToBaseProducts(
    productItems,
    baseProducts
  );

  const sortedCartItems = [...cartProducts, ...cartUpsells].sort(
    (a, b) => b.index - a.index
  );

  const getExcludedProductIds = (cartItems: CartItemType[]): string[] => {
    const productIds = new Set<string>();

    cartItems.forEach((item: CartItemType) => {
      if (item.type === "product") {
        productIds.add(item.baseProductId);
      } else if (item.type === "upsell" && item.products) {
        item.products.forEach(
          (product: {
            index: number;
            id: string;
            slug: string;
            name: string;
            mainImage: string;
            basePrice: number;
            size: string;
            color: string;
          }) => {
            productIds.add(product.id);
          }
        );
      }
    });

    return Array.from(productIds);
  };

  const excludeIdsFromDiscoveryProducts =
    getExcludedProductIds(sortedCartItems);

  return (
    <>
      <div
        id="scrollable-parent"
        className="h-screen overflow-x-hidden overflow-y-auto max-[1024px]:invisible-scrollbar lg:custom-scrollbar"
      >
        <nav className="w-full border-b">
          <div className="w-full max-w-[1080px] mx-auto px-6 py-2">
            <Link
              href="/"
              className="h-10 min-w-[168px] w-[168px] pl-2 flex items-center"
            >
              <Image
                src="/images/logos/cherlygood-wordmark.svg"
                alt="Cherly Good"
                width={160}
                height={40}
                priority
              />
            </Link>
          </div>
        </nav>
        <div className="w-full max-w-[580px] md:max-w-5xl mx-auto flex flex-col gap-10">
          <div className="w-full px-5 mx-auto">
            <EmptyCartState sortedCartItems={sortedCartItems} />
            {sortedCartItems?.length > 0 && (
              <CartItemList cartItems={sortedCartItems} />
            )}
          </div>
          <div className="px-5">
            <DiscoveryProducts
              page="CART"
              heading="Add These to Your Cart"
              excludeIds={excludeIdsFromDiscoveryProducts}
              cart={cart}
            />
          </div>
        </div>
        <Footer />
      </div>
      <ShowAlert />
      <QuickviewOverlay />
      <UpsellReviewOverlay cart={cart} />
      <ResetUpsellReview />
    </>
  );
}

// -- Logic & Utilities --

const getBaseProducts = async (productIds: string[]) =>
  getProducts({
    ids: productIds,
    fields: ["id", "name", "slug", "pricing", "images", "options"],
    visibility: "PUBLISHED",
  }) as Promise<ProductType[]>;

const mapCartProductsToBaseProducts = (
  cartProducts: Array<{
    index: number;
    type: "product";
    variantId: string;
    baseProductId: string;
    size: string;
    color: string;
  }>,
  baseProducts: ProductType[]
) =>
  cartProducts
    .map((cartProduct) => {
      const baseProduct = baseProducts.find(
        (product) => product.id === cartProduct.baseProductId
      );

      if (!baseProduct) return null;

      const colorImage = baseProduct.options?.colors.find(
        (colorOption) => colorOption.name === cartProduct.color
      )?.image;

      return {
        baseProductId: baseProduct.id,
        name: baseProduct.name,
        slug: baseProduct.slug,
        pricing: baseProduct.pricing,
        mainImage: colorImage || baseProduct.images.main,
        variantId: cartProduct.variantId,
        size: cartProduct.size,
        color: cartProduct.color,
        index: cartProduct.index || 0,
        type: cartProduct.type,
      };
    })
    .filter(
      (product): product is NonNullable<typeof product> => product !== null
    );

const getCartUpsells = async (
  upsellItems: Array<{
    type: "upsell";
    index: number;
    baseUpsellId: string;
    variantId: string;
    products: Array<{
      id: string;
      size: string;
      color: string;
    }>;
  }>
) => {
  const upsellPromises = upsellItems.map(async (upsell) => {
    const upsellData = (await getUpsell({
      id: upsell.baseUpsellId,
    })) as UpsellType;

    if (!upsellData || !upsellData.products) {
      return null;
    }

    const detailedProducts = upsell.products
      .map((selectedProduct) => {
        const baseProduct = upsellData.products.find(
          (product) => product.id === selectedProduct.id
        );

        if (!baseProduct) return null;

        const colorImage = baseProduct.options?.colors.find(
          (colorOption) => colorOption.name === selectedProduct.color
        )?.image;

        return {
          index: baseProduct.index,
          id: baseProduct.id,
          slug: baseProduct.slug,
          name: baseProduct.name,
          mainImage: colorImage || baseProduct.images.main,
          basePrice: baseProduct.basePrice,
          size: selectedProduct.size,
          color: selectedProduct.color,
        };
      })
      .filter(
        (product): product is NonNullable<typeof product> => product !== null
      );

    if (detailedProducts.length === 0) {
      return null;
    }

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
  return results.filter(
    (result): result is NonNullable<typeof result> => result !== null
  );
};

const getUpsell = async ({
  id,
}: {
  id: string;
}): Promise<Partial<UpsellType> | null> => {
  const documentRef = adminDb.collection("upsells").doc(id);
  const snapshot = await documentRef.get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data();
  if (!data) {
    return null;
  }

  const productIds = data.products
    ? data.products.map((p: { id: string }) => p.id)
    : [];

  const products =
    productIds.length > 0
      ? await getProducts({
          ids: productIds,
          fields: ["options", "images"],
          visibility: "PUBLISHED",
        })
      : null;

  if (!products || products.length === 0) {
    return null;
  }

  interface ProductData {
    id: string;
    index: number;
    options?: {
      colors?: Array<{ name: string }>;
    };
  }

  const updatedProducts = data.products
    .map((product: ProductData) => {
      const matchedProduct = products.find((p) => p.id === product.id);
      return matchedProduct
        ? {
            ...product,
            options: matchedProduct.options ?? [],
          }
        : null;
    })
    .filter(
      (product: any): product is NonNullable<typeof product> => product !== null
    );

  const sortedProducts = updatedProducts.sort(
    (a: any, b: any) => a.index - b.index
  );

  const upsell: Partial<UpsellType> = {
    id: snapshot.id,
    ...data,
    products: sortedProducts,
  };

  return upsell;
};

// -- UI Components --

function EmptyCartState({
  sortedCartItems,
}: {
  sortedCartItems: Array<CartItemType>;
}) {
  return (
    <div
      className={clsx(
        sortedCartItems?.length === 0 ? "flex justify-center py-16" : "hidden"
      )}
    >
      <Image
        src="/icons/cart-thin.svg"
        alt="Cart"
        width={80}
        height={80}
        priority={true}
      />
    </div>
  );
}

function Footer() {
  return (
    <footer className="w-full pt-6 pb-24 mt-14 bg-lightgray">
      <div className="md:hidden max-w-[486px] px-5 mx-auto">
        <div className="flex flex-col gap-8">
          <div>
            <h4 className="block text-sm mb-3">
              Subscribe to our newsletter <br /> for exclusive deals and updates
            </h4>
            <div className="relative h-11 w-[270px]">
              <button className="peer w-[104px] h-[40px] absolute left-[164px] top-1/2 -translate-y-1/2 rounded font-semibold text-white">
                Subscribe
              </button>
              <div className="peer-hover:bg-[#cc8100] peer-hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] peer-active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] w-full h-full p-[2px] rounded-lg shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000]">
                <input
                  className="w-40 h-[40px] px-3 rounded-md"
                  type="text"
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <Link
                href="#"
                className="block w-max text-sm text-gray mb-2 hover:underline"
              >
                About us
              </Link>
              <Link
                href="#"
                className="block w-max text-sm text-gray mb-2 hover:underline"
              >
                Privacy policy
              </Link>
              <Link
                href="#"
                className="block w-max text-sm text-gray mb-2 hover:underline"
              >
                Terms of service
              </Link>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Get Help</h3>
              <Link
                href="#"
                className="block w-max text-sm text-gray mb-2 hover:underline"
              >
                Contact us
              </Link>
              <Link
                href="#"
                className="block w-max text-sm text-gray mb-2 hover:underline"
              >
                Track order
              </Link>
              <Link
                href="#"
                className="block w-max text-sm text-gray mb-2 hover:underline"
              >
                Returns & refunds
              </Link>
              <Link
                href="#"
                className="block w-max text-sm text-gray mb-2 hover:underline"
              >
                FAQs
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden md:block w-full max-w-[1040px] px-9 mx-auto">
        <div className="flex gap-10">
          <div className="w-full">
            <h3 className="font-semibold mb-4">Company</h3>
            <Link
              href="#"
              className="block w-max text-sm text-gray mb-2 hover:underline"
            >
              About us
            </Link>
            <Link
              href="#"
              className="block w-max text-sm text-gray mb-2 hover:underline"
            >
              Privacy policy
            </Link>
            <Link
              href="#"
              className="block w-max text-sm text-gray mb-2 hover:underline"
            >
              Terms of service
            </Link>
          </div>
          <div className="w-full">
            <h3 className="font-semibold mb-4">Get Help</h3>
            <Link
              href="#"
              className="block w-max text-sm text-gray mb-2 hover:underline"
            >
              Contact us
            </Link>
            <Link
              href="#"
              className="block w-max text-sm text-gray mb-2 hover:underline"
            >
              Track order
            </Link>
            <Link
              href="#"
              className="block w-max text-sm text-gray mb-2 hover:underline"
            >
              Returns & refunds
            </Link>
            <Link
              href="#"
              className="block w-max text-sm text-gray mb-2 hover:underline"
            >
              FAQs
            </Link>
          </div>
          <div className="w-[270px]">
            <h4 className="block text-sm mb-3">
              Subscribe to our newsletter <br /> for exclusive deals and updates
            </h4>
            <div className="relative h-11 w-[270px]">
              <button className="peer w-[104px] h-[40px] absolute left-[164px] top-1/2 -translate-y-1/2 rounded font-semibold text-white">
                Subscribe
              </button>
              <div className="peer-hover:bg-[#cc8100] peer-hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] peer-active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] w-full h-full p-[2px] rounded-lg shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000]">
                <input
                  className="w-40 h-[40px] px-3 rounded-md"
                  type="text"
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// -- Type Definitions --

type ProductItemType = {
  type: "product";
  baseProductId: string;
  name: string;
  slug: string;
  pricing: any;
  mainImage: string;
  variantId: string;
  size: string;
  color: string;
  index: number;
};

type UpsellItemType = {
  type: "upsell";
  baseUpsellId: string;
  variantId: string;
  index: number;
  mainImage: string;
  pricing: any;
  products: Array<{
    index: number;
    id: string;
    slug: string;
    name: string;
    mainImage: string;
    basePrice: number;
    size: string;
    color: string;
  }>;
};

type CartItemType = ProductItemType | UpsellItemType;
