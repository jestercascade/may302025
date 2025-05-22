"use client";

import { getOrders } from "@/actions/get/orders";
import { ShowAlertType } from "@/lib/sharedTypes";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { Search } from "lucide-react";
import { useState } from "react";

export default function OrderTracker() {
  const [invoiceId, setInvoiceId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showAlert } = useAlertStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoiceId.trim()) {
      showAlert({
        message: "Please enter an invoice ID",
        type: ShowAlertType.ERROR,
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await getOrders({ invoiceIds: [invoiceId.trim()] });
      console.log("Order data:", result);
/*
      [
        {
          id: "5K294251J2280863J",
          timestamp: "2025-05-20T13:51:38Z",
          status: "COMPLETED",
          payer: {
            email: "khanofemperia@gmail.com",
            payerId: "E983X3LW4EEHL",
            name: {
              firstName: "Tshepo",
              lastName: "Tau",
            },
          },
          amount: {
            value: "0.03",
            currency: "USD",
          },
          shipping: {
            name: "Tshepo Tau",
            address: {
              line1: "40 Progress Rd",
              city: "Roodepoort",
              state: "GP",
              postalCode: "1724",
              country: "ZA",
            },
          },
          transactionId: "2JK31976WK584191G",
          items: [
            {
              baseProductId: "28355",
              name: "Quilted Waterproof Mattress Protective Cover - Super Soft And Comfortable Mattress Cover",
              slug: "quilted-waterproof-mattress-protective-cover-super-soft-and-comfortable-mattress-cover",
              pricing: {
                basePrice: 0.01,
                salePrice: 0,
                discountPercentage: 0,
              },
              mainImage:
                "https://img.kwcdn.com/product/fancy/03652b4d-c662-4753-ab4d-7f5693ed9de5.jpg?imageView2/2/w/800/q/70/format/webp",
              variantId: "47656",
              selectedOptions: {},
              index: 3,
              type: "product",
            },
            {
              baseProductId: "58329",
              name: "1pc, Ceiling Mop, Dust Removal Mop, Flexible Rotating Floor Mop, Wall Mop",
              slug: "1pc-ceiling-mop-dust-removal-mop-flexible-rotating-floor-mop-wall-mop",
              pricing: {
                basePrice: 0.01,
                salePrice: 0,
                discountPercentage: 0,
              },
              mainImage:
                "https://img.kwcdn.com/product/fancy/fafbe80b-46a3-4c2d-9c15-0ccbd90a45a2.jpg?imageView2/2/w/800/q/70/format/webp",
              variantId: "49746",
              selectedOptions: {},
              index: 2,
              type: "product",
            },
            {
              baseProductId: "21887",
              name: "Water Bottle Sport Frosted Tour Outdoor Leak Proof Seal Child School Water Bottles for Children Kids Girl Drinkware BPA Free",
              slug: "water-bottle-sport-frosted-tour-outdoor-leak-proof-seal-child-school-water-bottles-for-children-kids-girl-drinkware-bpa-free",
              pricing: {
                basePrice: 0.01,
                salePrice: 0,
                discountPercentage: 0,
              },
              mainImage: "https://ae01.alicdn.com/kf/H37d8d657dc984a74b585a53f8c813872d.jpg",
              variantId: "27054",
              selectedOptions: {
                capacity: {
                  value: "0.65L",
                  optionDisplayOrder: 2,
                  groupDisplayOrder: 0,
                },
                color: {
                  value: "Glow Pink",
                  optionDisplayOrder: 3,
                  groupDisplayOrder: 1,
                },
              },
              index: 1,
              type: "product",
            },
          ],
          invoiceId: "21769B81 — enter at cherlygood.com/track",
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
        },
      ];
*/
      if (!result) {
        showAlert({
          message: "We couldn't find any matching order",
          type: ShowAlertType.ERROR,
        });
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      showAlert({
        message: "An error occurred while fetching the order",
        type: ShowAlertType.ERROR,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
      <div className="p-8">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Enter invoice ID"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 bg-white border rounded-lg focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200"
              disabled={isLoading}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto px-6 py-2 rounded-lg font-medium text-white transition-all duration-200 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Tracking..." : "Track"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
