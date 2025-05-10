"use client";

import { ClearPurchasedItemsAction } from "@/actions/cart";
import { appConfig } from "@/config";
import { ShowAlertType } from "@/lib/sharedTypes";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const initialOptions = {
  clientId: appConfig.PAYPAL.CLIENT_ID || "",
  currency: "USD",
  intent: "capture",
};

export function PayPalButton({ cart, showLabel }: { cart: Cart; showLabel: boolean }) {
  const router = useRouter();
  const [key, setKey] = useState(() => cart.length);
  const { showAlert, hideAlert } = useAlertStore();

  useEffect(() => {
    setKey(cart.length);
  }, [cart]);

  const cartItems = generateCartItems(cart);

  const clearCartWithRetries = async (variantIds: string[]): Promise<boolean> => {
    // First attempt - no alert
    const initialResult = await ClearPurchasedItemsAction({ variantIds });
    if (initialResult.type !== ShowAlertType.ERROR) {
      return true; // Successfully cleared cart
    }

    // If first attempt failed, start retry process
    let attempt = 2; // Start counting from 2 since we already did attempt 1

    while (attempt <= MAX_RETRIES) {
      try {
        showAlert({
          message: `Updating cart - Retry ${attempt - 1}/${MAX_RETRIES - 1}`,
          type: ShowAlertType.NEUTRAL,
        });

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));

        const clearResult = await ClearPurchasedItemsAction({ variantIds });

        if (clearResult.type !== ShowAlertType.ERROR) {
          hideAlert();
          return true;
        }

        attempt++;
      } catch (error) {
        console.error(`Cart clear attempt ${attempt} failed:`, error);
        attempt++;
      }
    }

    hideAlert();
    return false;
  };

  const createOrder = useCallback(async () => {
    try {
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart: cartItems }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const orderData = await response.json();
      return orderData.id;
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  }, [cartItems]);

  const onApprove = async (data: { orderID: string }) => {
    try {
      const response = await fetch(`/api/paypal/capture-order/${data.orderID}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const orderData = await response.json();

      // Clear purchased items from cart with retries
      const variantIds = cart.map((item) => item.variantId);
      const clearSuccess = await clearCartWithRetries(variantIds);

      if (!clearSuccess) {
        console.error("Failed to clear cart after maximum retries");
      }

      await fetch("/api/paypal/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ success: true }),
      });

      // Redirect to success page
      const encodedEmail = encodeURIComponent(orderData.order.payer.email);
      router.push(`/payment-successful?email=${encodedEmail}`);

      return orderData;
    } catch (error) {
      showAlert({
        message: "Your payment couldn't be processed. Please try again or use a different payment method.",
        type: ShowAlertType.ERROR,
      });
      console.error("Failed to capture order:", error);
      throw error;
    }
  };

  if (!initialOptions.clientId) {
    console.error("PayPal Client ID is not set");
    return null;
  }

  return (
    <PayPalScriptProvider key={key} options={initialOptions}>
      <PayPalButtons
        style={{
          shape: "pill",
          layout: "horizontal",
          color: "gold",
          tagline: showLabel,
          label: showLabel ? "pay" : "paypal",
        }}
        createOrder={createOrder}
        onApprove={onApprove}
      />
    </PayPalScriptProvider>
  );
}

// -- Logic & Utilities --

function generateCartItems(cart: Cart): CartItem[] {
  const skuCounters: Record<string, number> = {};

  function generateSku(baseId: string): string {
    skuCounters[baseId] = (skuCounters[baseId] || 0) + 1;
    return `${baseId}-${String(skuCounters[baseId]).padStart(2, "0")}`;
  }

  function formatProductName(item: ProductCartItem): string {
    // Get base product ID
    const productId = item.baseProductId;

    // Extract all selected options into an array
    const optionValues: string[] = [];

    // Add base product ID as the first element
    optionValues.push(productId);

    // Add all option values in order of their groupDisplayOrder
    if (item.selectedOptions) {
      const sortedOptions = Object.values(item.selectedOptions)
        .sort((a, b) => a.groupDisplayOrder - b.groupDisplayOrder)
        .map((option) => option.value);

      optionValues.push(...sortedOptions);
    }

    // Format as [ID, option1, option2, ...]
    const formattedName = `[${optionValues.join(", ")}]`;

    // For PayPal, name must be 127 characters or less
    return formattedName.length > 127 ? `${formattedName.slice(0, 124)}...` : formattedName;
  }

  function formatUpsellName(item: UpsellCartItem): string {
    // For each product in the upsell, create a bracket with product ID and options
    const productDetails = item.products.map((product) => {
      const optionValues: string[] = [product.id];

      // Add option values if they exist
      if (product.selectedOptions) {
        const sortedOptions = Object.values(product.selectedOptions)
          .sort((a, b) => a.groupDisplayOrder - b.groupDisplayOrder)
          .map((option) => option.value);

        optionValues.push(...sortedOptions);
      }

      return `[${optionValues.join(", ")}]`;
    });

    // Join all product details with " + "
    const combinedName = productDetails.join(" + ");

    // For PayPal, name must be 127 characters or less
    return combinedName.length > 127 ? `${combinedName.slice(0, 124)}...` : combinedName;
  }

  function getPrice(pricing: { salePrice: number; basePrice: number }): number {
    const price = pricing.salePrice > 0 ? pricing.salePrice : pricing.basePrice;
    return Number(price);
  }

  return cart.map((item): CartItem => {
    if (item.type === "product") {
      return {
        name: formatProductName(item),
        sku: generateSku(item.baseProductId),
        unit_amount: {
          currency_code: "USD",
          value: getPrice(item.pricing).toFixed(2),
        },
        quantity: 1,
      };
    } else {
      return {
        name: formatUpsellName(item),
        sku: generateSku(item.baseUpsellId),
        unit_amount: {
          currency_code: "USD",
          value: getPrice(item.pricing).toFixed(2),
        },
        quantity: 1,
      };
    }
  });
}

// -- Type Definitions --

type CartItem = {
  name: string;
  sku: string;
  unit_amount: {
    currency_code: string;
    value: string;
  };
  quantity: number;
};

type SelectedOptionType = {
  value: string;
  optionDisplayOrder: number;
  groupDisplayOrder: number;
};

type ProductCartItem = {
  baseProductId: string;
  variantId: string;
  name: string;
  type: "product";
  pricing: {
    basePrice: number;
    salePrice: number;
  };
  selectedOptions: Record<string, SelectedOptionType>;
};

type UpsellCartItem = {
  baseUpsellId: string;
  variantId: string;
  type: "upsell";
  pricing: {
    salePrice: number;
    basePrice: number;
  };
  products: Array<{
    id: string;
    name: string;
    basePrice: number;
    selectedOptions: Record<string, SelectedOptionType>;
  }>;
};

type Cart = (ProductCartItem | UpsellCartItem)[];
