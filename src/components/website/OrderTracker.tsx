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
