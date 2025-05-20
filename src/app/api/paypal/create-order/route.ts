import { v4 as uuidv4 } from "uuid";
import { appConfig } from "@/config";
import { generateAccessToken } from "@/lib/utils/orders";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { cart } = await request.json();

    if (!cart || !Array.isArray(cart)) {
      return NextResponse.json({ error: "Invalid cart data" }, { status: 400 });
    }

    const totalAmount = calculateTotalAmount(cart);
    const accessToken = await generateAccessToken();
    const searchUrl = `${appConfig.PAYPAL.API_BASE}/v2/checkout/orders`;

    const invoiceId = generateInvoiceId(); // Generate unique invoice_id

    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: totalAmount,
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: totalAmount,
              },
            },
          },
          items: cart,
          invoice_id: invoiceId, // Include invoice_id
        },
      ],
    };

    const response = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("PayPal API error:", errorData);
      throw new Error("Failed to create PayPal order");
    }

    const data = await response.json();
    return NextResponse.json({ ...data, invoiceId }); // Return invoiceId for reference
  } catch (error) {
    console.error("Failed to create PayPal order:", error);
    return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 });
  }
}

// -- Logic & Utilities --

function calculateTotalAmount(cart: CartItemType[]): string {
  const total = cart.reduce((sum, item) => {
    return sum + parseFloat(item.unit_amount.value) * item.quantity;
  }, 0);

  return total.toFixed(2);
}

function generateInvoiceId(): string {
  const code = uuidv4().slice(0, 8).toUpperCase();
  return `${code} — enter at cherlygood.com/track`;
}

// -- Type Definitions --

type CartItemType = {
  name: string;
  sku: string;
  unit_amount: {
    currency_code: string;
    value: string;
  };
  quantity: number;
};
