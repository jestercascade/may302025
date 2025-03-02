"use client";

import { formatDate } from "@/lib/utils/common";
import { useState, useEffect } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { Pencil, ArrowLeft, X } from "lucide-react";
import clsx from "clsx";
import Overlay from "@/ui/Overlay";
import { UpdateCollectionAction } from "@/actions/collections";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ShowAlertType } from "@/lib/sharedTypes";
import { useAlertStore } from "@/zustand/shared/alertStore";

export function CampaignDurationButton({ className }: { className: string }) {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.editCollection.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editCollection.overlays.campaignDuration.name
  );

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      type="button"
      className={`w-9 h-9 rounded-full flex items-center justify-center transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray ${className}`}
    >
      <Pencil size={18} strokeWidth={1.75} />
    </button>
  );
}

export function CampaignDurationOverlay({
  data,
}: {
  data: {
    id: string;
    campaignDuration: { startDate: string; endDate: string };
  };
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [launchDate, setLaunchDate] = useState<Date | null>(
    new Date(data.campaignDuration.startDate)
  );
  const [endDate, setEndDate] = useState<Date | null>(
    new Date(data.campaignDuration.endDate)
  );

  const showAlert = useAlertStore((state) => state.showAlert);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.editCollection.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editCollection.overlays.campaignDuration.name
  );
  const isOverlayVisible = useOverlayStore(
    (state) => state.pages.editCollection.overlays.campaignDuration.isVisible
  );

  useEffect(() => {
    if (isOverlayVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      if (!isOverlayVisible) {
        document.body.style.overflow = "visible";
      }
    };
  }, [isOverlayVisible]);

  const onHideOverlay = () => {
    setLoading(false);
    hideOverlay({ pageName, overlayName });
  };

  const isValidDateRange =
    launchDate &&
    endDate &&
    launchDate.toISOString().split("T")[0] <
      endDate.toISOString().split("T")[0];

  const handleSave = async () => {
    if (!isValidDateRange) {
      showAlert({
        message: "Start date must be before end date",
        type: ShowAlertType.ERROR,
      });
    } else {
      setLoading(true);

      const campaignDuration = {
        startDate: formatDate(launchDate),
        endDate: formatDate(endDate),
      };

      try {
        const result = await UpdateCollectionAction({
          id: data.id,
          campaignDuration: campaignDuration,
        });
        showAlert({
          message: result.message,
          type: result.type,
        });
      } catch (error) {
        console.error("Error updating collection:", error);
        showAlert({
          message: "Failed to update collection",
          type: ShowAlertType.ERROR,
        });
      } finally {
        onHideOverlay();
      }
    }
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[20px] bg-white md:w-[400px] md:rounded-2xl md:shadow-lg md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">Campaign duration</h2>
                  <button
                    onClick={onHideOverlay}
                    type="button"
                    className="w-7 h-7 rounded-full flex items-center justify-center absolute right-4 transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed"
                  >
                    <X color="#6c6c6c" size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
              <div className="hidden md:flex md:items-center md:justify-between py-2 pr-4 pl-2">
                <button
                  onClick={onHideOverlay}
                  type="button"
                  className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
                >
                  <ArrowLeft
                    size={20}
                    strokeWidth={2}
                    className="-ml-1 stroke-blue"
                  />
                  <span className="font-semibold text-sm text-blue">
                    Campaign duration
                  </span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={clsx(
                    "relative h-9 w-max px-4 rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-neutral-700",
                    {
                      "bg-opacity-50": loading,
                      "active:bg-neutral-700/85": !loading,
                    }
                  )}
                >
                  {loading ? (
                    <div className="flex gap-1 items-center justify-center w-full h-full">
                      <Spinner color="white" />
                      <span className="text-white">Saving</span>
                    </div>
                  ) : (
                    <span className="text-white">Save</span>
                  )}
                </button>
              </div>
              <div className="w-full h-full mt-[52px] md:mt-0 p-5 overflow-x-hidden overflow-y-visible invisible-scrollbar md:overflow-hidden">
                <div className="w-full flex flex-col gap-5">
                  <div>
                    <h2 className="text-xs text-gray mx-auto mb-2 w-max">
                      Launch
                    </h2>
                    <div className="mx-auto border rounded-md overflow-hidden w-max text-center">
                      <DatePicker
                        selected={launchDate}
                        onChange={(date) => setLaunchDate(date)}
                        className="text-center w-full h-9 outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xs text-gray mx-auto mb-2 w-max">
                      End date
                    </h2>
                    <div className="mx-auto border rounded-md overflow-hidden w-max text-center">
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        className="text-center w-full h-9 outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:hidden w-full pb-5 pt-2 px-5 absolute bottom-0 bg-white">
              <button
                onClick={handleSave}
                disabled={loading}
                className={clsx(
                  "relative h-12 w-full rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-neutral-700",
                  {
                    "bg-opacity-50": loading,
                    "active:bg-neutral-700/85": !loading,
                  }
                )}
              >
                {loading ? (
                  <div className="flex gap-1 items-center justify-center w-full h-full">
                    <Spinner color="white" />
                    <span className="text-white">Saving</span>
                  </div>
                ) : (
                  <span className="text-white">Save</span>
                )}
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
}
