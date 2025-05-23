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
          id: "8PX25026MG3933133",
          timestamp: "2025-05-22T21:41:53Z",
          status: "COMPLETED",
          payer: {
            email: "sb-tudir39355229@personal.example.com",
            payerId: "Z7MNQNDH73FH4",
            name: {
              firstName: "John",
              lastName: "Doe",
            },
          },
          amount: {
            value: "0.02",
            currency: "USD",
          },
          shipping: {
            name: "John Doe",
            address: {
              line1: "Free Trade Zone",
              city: "Johannesburg",
              state: "CA",
              postalCode: "2038",
              country: "ZA",
            },
          },
          transactionId: "4US57233HN367014F",
          items: [
            {
              baseProductId: "35546",
              name: "BioloMix 3HP Commercial Blender – 2200W Heavy-Duty Mixer, Timer-Controlled Juicer and Food Processor for Ice, Smoothies, Fruit, and More – BPA-Free 2L Jar",
              slug: "biolomix-3hp-commercial-blender-2200w-heavy-duty-mixer-timer-controlled-juicer-and-food-processor-for-ice-smoothies-fruit-and-more-bpa-free-2l-jar",
              pricing: {
                basePrice: 0.01,
                salePrice: 0,
                discountPercentage: 0,
              },
              mainImage: "https://res.cloudinary.com/dz4xa9ibb/image/upload/v1745319361/Square_dxsgfc.png",
              variantId: "44745",
              selectedOptions: {
                size: {
                  value: "S",
                  optionDisplayOrder: 1,
                  groupDisplayOrder: 0,
                },
                color: {
                  value: "Green",
                  optionDisplayOrder: 1,
                  groupDisplayOrder: 1,
                },
                fabric: {
                  value: "Cotton",
                  optionDisplayOrder: 0,
                  groupDisplayOrder: 2,
                },
                "plug type": {
                  value: "American Plug",
                  optionDisplayOrder: 1,
                  groupDisplayOrder: 3,
                },
                capacity: {
                  value: "50 oz",
                  optionDisplayOrder: 3,
                  groupDisplayOrder: 4,
                },
              },
              index: 2,
              type: "product",
            },
            {
              baseProductId: "87434",
              name: "2 Bowls Food Processors, Electric Food Chopper with Meat Grinder & Vegetable Chopper",
              slug: "2-bowls-food-processors-electric-food-chopper-with-meat-grinder-vegetable-chopper",
              pricing: {
                basePrice: 0.01,
                salePrice: 0,
                discountPercentage: 0,
              },
              mainImage:
                "https://img.kwcdn.com/product/fancy/fe77dcdc-4534-4a6c-8587-5445ff1e76c0.jpg?imageView2/2/w/800/q/70/format/webp",
              variantId: "67021",
              selectedOptions: {},
              index: 1,
              type: "product",
            },
          ],
          invoiceId: "373C572C — enter at cherlygood.com/track",
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
                timestamp: "2025-05-22T21:41:53Z",
                message: "Order placed and payment confirmed",
              },
            ],
            trackingNumber: null,
            estimatedDeliveryDate: null,
            lastUpdated: "2025-05-22T21:41:53Z",
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
