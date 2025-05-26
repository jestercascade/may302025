"use client";

import { useState, useEffect } from "react";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { ArrowLeft, X, Edit3, Save, Pencil } from "lucide-react";
import Overlay from "@/ui/Overlay";

export function OrderTrackingButton() {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.orderDetails.name);
  const overlayName = useOverlayStore((state) => state.pages.orderDetails.overlays.orderTracking.name);

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      type="button"
      className="w-9 h-9 absolute top-2 right-2 rounded-full flex items-center justify-center transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
    >
      <Pencil size={18} strokeWidth={1.75} />
    </button>
  );
}

export function OrderTrackingOverlay({ order }: { order: OrderType }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    status: order.tracking.currentStatus || "",
    trackingNumber: order.tracking.trackingNumber || "",
    deliveryStartDate: order.tracking.estimatedDeliveryRange?.start || "",
    deliveryEndDate: order.tracking.estimatedDeliveryRange?.end || "",
    statusMessage: "",
  });

  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.orderDetails.name);
  const overlayName = useOverlayStore((state) => state.pages.orderDetails.overlays.orderTracking.name);
  const isOverlayVisible = useOverlayStore((state) => state.pages.orderDetails.overlays.orderTracking.isVisible);

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
  ];

  useEffect(() => {
    if (isOverlayVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }
    return () => {
      document.body.style.overflow = "visible";
    };
  }, [isOverlayVisible]);

  const handleEditStart = () => {
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditForm({
      status: order.tracking.currentStatus || "",
      trackingNumber: order.tracking.trackingNumber || "",
      deliveryStartDate: order.tracking.estimatedDeliveryRange?.start || "",
      deliveryEndDate: order.tracking.estimatedDeliveryRange?.end || "",
      statusMessage: "",
    });
  };

  const handleEditSave = () => {
    // Simulate save logic (replace with actual API call in production)
    console.log("Saving tracking updates:", editForm);
    setIsEditing(false);
    hideOverlay({ pageName, overlayName });
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[20px] overflow-hidden bg-white md:w-[500px] md:rounded-2xl md:shadow md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">Order Tracking</h2>
                  <button
                    onClick={() => hideOverlay({ pageName, overlayName })}
                    type="button"
                    className="w-7 h-7 rounded-full flex items-center justify-center absolute right-4 transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed"
                  >
                    <X color="#6c6c6c" size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
              <div className="hidden md:flex md:items-center md:justify-between py-2 pr-4 pl-2">
                <button
                  onClick={() => hideOverlay({ pageName, overlayName })}
                  type="button"
                  className="h-9 px-3 rounded-full flex items-center gap-1 transition ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
                >
                  <ArrowLeft size={20} strokeWidth={2} className="-ml-1 stroke-blue" />
                  <span className="font-semibold text-sm text-blue">Order Tracking</span>
                </button>
                {!isEditing ? (
                  <button
                    onClick={handleEditStart}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Edit3 className="h-4 w-4 mr-1.5" />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleEditSave}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Save className="h-4 w-4 mr-1.5" />
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      <X className="h-4 w-4 mr-1.5" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <div className="w-full h-full mt-[52px] md:mt-0 p-5 flex flex-col gap-5 overflow-x-hidden overflow-y-visible invisible-scrollbar md:overflow-hidden">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
                      <input
                        type="text"
                        value={editForm.trackingNumber}
                        onChange={(e) => setEditForm({ ...editForm, trackingNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Start Date</label>
                        <input
                          type="date"
                          value={editForm.deliveryStartDate}
                          onChange={(e) => setEditForm({ ...editForm, deliveryStartDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery End Date</label>
                        <input
                          type="date"
                          value={editForm.deliveryEndDate}
                          onChange={(e) => setEditForm({ ...editForm, deliveryEndDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status Message</label>
                      <input
                        type="text"
                        value={editForm.statusMessage}
                        onChange={(e) => setEditForm({ ...editForm, statusMessage: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <p>Current Status: {order.tracking.currentStatus || "Not set"}</p>
                    <p>Tracking Number: {order.tracking.trackingNumber || "Not set"}</p>
                    <p>
                      Estimated Delivery:{" "}
                      {order.tracking.estimatedDeliveryRange
                        ? `${order.tracking.estimatedDeliveryRange.start} - ${order.tracking.estimatedDeliveryRange.end}`
                        : "Not set"}
                    </p>
                    <p>Last Updated: {formatOrderPlacedDate(order.tracking.lastUpdated)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
}

function formatOrderPlacedDate(timestamp: string, timeZone = "Europe/Athens"): string {
  const date = new Date(timestamp);
  return date
    .toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone,
    })
    .replace("24:", "00:");
}
