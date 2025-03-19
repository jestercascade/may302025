import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { generateAccessToken } from "@/lib/utils/orders";
import { getCart } from "@/actions/get/carts";
import { getProducts } from "@/actions/get/products";
import { revalidatePath } from "next/cache";
import { appConfig } from "@/config";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const orderId = (await params).orderId;

  if (!orderId) {
    return NextResponse.json(
      { error: "Order ID is required" },
      { status: 400 }
    );
  }

  try {
    const accessToken = await generateAccessToken();
    const url = `${appConfig.PAYPAL.API_BASE}/v2/checkout/orders/${orderId}/capture`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to capture order: ${errorData.message}`);
    }

    const orderData = await response.json();
    const cartItems = await getCartItems();

    const newOrder = {
      status: orderData.status,
      payer: {
        email: orderData.payer.email_address,
        payerId: orderData.payer.payer_id,
        name: {
          firstName: orderData.payer.name.given_name,
          lastName: orderData.payer.name.surname,
        },
      },
      amount: {
        value: orderData.purchase_units[0].payments.captures[0].amount.value,
        currency:
          orderData.purchase_units[0].payments.captures[0].amount.currency_code,
      },
      shipping: {
        name: orderData.purchase_units[0].shipping.name.full_name,
        address: {
          line1: orderData.purchase_units[0].shipping.address.address_line_1,
          city: orderData.purchase_units[0].shipping.address.admin_area_2,
          state: orderData.purchase_units[0].shipping.address.admin_area_1,
          postalCode: orderData.purchase_units[0].shipping.address.postal_code,
          country: orderData.purchase_units[0].shipping.address.country_code,
        },
      },
      transactionId: orderData.purchase_units[0].payments.captures[0].id,
      timestamp: orderData.purchase_units[0].payments.captures[0].create_time,
      items: cartItems,
      emails: {
        confirmed: {
          sentCount: 0,
          maxAllowed: 2,
          lastSent: null,
        },
        shipped: {
          sentCount: 0,
          maxAllowed: 2,
          lastSent: null,
        },
        delivered: {
          sentCount: 0,
          maxAllowed: 2,
          lastSent: null,
        },
      },
    };

    // Updated to use adminDb
    const ordersRef = adminDb.collection("orders");
    await ordersRef.doc(orderData.id).set(newOrder);

    revalidatePath("/admin");
    revalidatePath("/admin/orders");

    return NextResponse.json({
      message: "Order captured and saved successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error capturing and saving order:", error);
    return NextResponse.json(
      { error: "An error occurred while capturing and saving the order." },
      { status: 500 }
    );
  }
}

// -- Logic & Utilities --

async function getCartItems() {
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

  const productIds = productItems
    .map((product) => product.baseProductId)
    .filter(Boolean);

  const [baseProducts, cartUpsells] = await Promise.all([
    getBaseProducts(productIds),
    getCartUpsells(upsellItems),
  ]);

  const cartProducts = mapCartProductsToBaseProducts(
    productItems,
    baseProducts
  );

  const sortedCartItems = [...cartProducts, ...cartUpsells].sort(
    (a, b) => b.index - a.index
  );

  return sortedCartItems;
}

// Properly typed helper functions
const getBaseProducts = async (productIds: string[]) =>
  getProducts({
    ids: productIds,
    fields: ["name", "slug", "pricing", "images", "options"],
    visibility: "PUBLISHED",
  }) as Promise<ProductType[]>;

const mapCartProductsToBaseProducts = (
  cartProducts: CartProductItemType[],
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

const getCartUpsells = async (upsellItems: CartUpsellItemType[]) => {
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
  // Updated to use adminDb
  const snapshot = await adminDb.collection("upsells").doc(id).get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data();
  if (!data) return null;

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

  const updatedProducts = data.products
    .map((product: any) => {
      const matchedProduct = products.find((p) => p.id === product.id);
      return matchedProduct
        ? {
            ...product,
            options: matchedProduct.options ?? [],
          }
        : null;
    })
    .filter((product: any) => product !== null);

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
