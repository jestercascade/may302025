import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { generateAccessToken } from "@/lib/utils/orders";
import { getCart } from "@/actions/get/carts";
import { getProducts } from "@/actions/get/products";
import { revalidatePath } from "next/cache";
import { appConfig } from "@/config";

// ===== Type Definitions =====
type ProductOption = {
  value: string;
  optionDisplayOrder: number;
  groupDisplayOrder: number;
};

type SelectedOptions = {
  [key: string]: ProductOption;
};

type SelectedOptionType = {
  value: string;
  optionDisplayOrder: number;
  groupDisplayOrder: number;
};

type ImagesType = {
  main: string;
  gallery?: string[];
};

interface BaseCartItem {
  variantId: string;
  index: number;
}

interface ProductItem extends BaseCartItem {
  type: "product";
  baseProductId: string;
  selectedOptions: SelectedOptions;
}

interface UpsellProduct {
  id: string;
  selectedOptions: SelectedOptions;
}

interface UpsellItem extends BaseCartItem {
  type: "upsell";
  baseUpsellId: string;
  products: UpsellProduct[];
}

type CartItem = ProductItem | UpsellItem;

type CartProductItemType = {
  baseProductId: string;
  variantId: string;
  name: string;
  type: "product";
  index: number;
  selectedOptions: Record<string, SelectedOptionType>;
};

type CartUpsellItemType = {
  baseUpsellId: string;
  variantId: string;
  type: "upsell";
  index: number;
  products: Array<{
    id: string;
    selectedOptions: Record<string, SelectedOptionType>;
  }>;
};

type ProductType = {
  id: string;
  name: string;
  slug: string;
  pricing: {
    basePrice: number;
    salePrice: number;
  };
  images: ImagesType;
  options?: any;
};

type UpsellType = {
  id: string;
  mainImage: string;
  pricing: {
    basePrice: number;
    salePrice: number;
  };
  products: Array<{
    id: string;
    name: string;
    slug: string;
    index: number;
    basePrice: number;
    images: ImagesType;
    options?: any;
  }>;
};

export async function POST(_request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const orderId = (await params).orderId;

  if (!orderId) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
  }

  try {
    const accessToken = await generateAccessToken();
    const searchUrl = `${appConfig.PAYPAL.API_BASE}/v2/checkout/orders/${orderId}/capture`;

    const response = await fetch(searchUrl, {
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

    const invoiceId = orderData.purchase_units[0].payments.captures[0].invoice_id;

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
        currency: orderData.purchase_units[0].payments.captures[0].amount.currency_code,
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
      invoiceId: invoiceId, // Store invoice_id
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
      tracking: {
        currentStatus: "PENDING",
        statusHistory: [
          {
            status: "PENDING",
            timestamp: orderData.purchase_units[0].payments.captures[0].create_time,
            message: "Order placed and payment confirmed",
          },
        ],
        trackingNumber: null,
        estimatedDeliveryDate: null,
        lastUpdated: orderData.purchase_units[0].payments.captures[0].create_time,
      },
    };

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
    return NextResponse.json({ error: "An error occurred while capturing and saving the order." }, { status: 500 });
  }
}

async function getCartItems() {
  const cookieStore = await cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value ?? "";

  const cart = await getCart(deviceIdentifier);
  const items: CartItem[] = cart?.items || [];

  const productItems = items.filter((item): item is ProductItem => item.type === "product");
  const upsellItems = items.filter((item): item is UpsellItem => item.type === "upsell");

  const productIds = productItems.map((product) => product.baseProductId).filter(Boolean);

  const [baseProducts, cartUpsells] = await Promise.all([getBaseProducts(productIds), getCartUpsells(upsellItems)]);

  const cartProducts = mapCartProductsToBaseProducts(productItems as unknown as CartProductItemType[], baseProducts);

  const sortedCartItems = [...cartProducts, ...cartUpsells].sort((a, b) => b.index - a.index);

  return sortedCartItems;
}

const getBaseProducts = async (productIds: string[]) => {
  const products = await getProducts({
    ids: productIds,
    fields: ["name", "slug", "pricing", "images", "options"],
    visibility: "PUBLISHED",
  });
  return (products as ProductType[]) || [];
};

const mapCartProductsToBaseProducts = (cartProducts: CartProductItemType[], baseProducts: ProductType[]) =>
  cartProducts
    .map((cartProduct) => {
      const baseProduct = baseProducts.find((product) => product.id === cartProduct.baseProductId);

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
    .filter((product): product is NonNullable<typeof product> => product !== null);

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
        const baseProduct = upsellData.products.find((product) => product.id === selectedProduct.id);

        if (!baseProduct) return null;

        return {
          index: baseProduct.index,
          id: baseProduct.id,
          slug: baseProduct.slug,
          name: baseProduct.name,
          mainImage: baseProduct.images.main,
          basePrice: baseProduct.basePrice,
          selectedOptions: selectedProduct.selectedOptions,
        };
      })
      .filter((product): product is NonNullable<typeof product> => product !== null);

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
  return results.filter((result): result is NonNullable<typeof result> => result !== null);
};

const getUpsell = async ({ id }: { id: string }): Promise<Partial<UpsellType> | null> => {
  const snapshot = await adminDb.collection("upsells").doc(id).get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data();
  if (!data) return null;

  const productIds = data.products ? data.products.map((p: { id: string }) => p.id) : [];

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

  const sortedProducts = updatedProducts.sort((a: any, b: any) => a.index - b.index);

  const upsell: Partial<UpsellType> = {
    id: snapshot.id,
    ...data,
    products: sortedProducts,
  };

  return upsell;
};
