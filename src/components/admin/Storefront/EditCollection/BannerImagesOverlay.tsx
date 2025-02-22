"use client";

import AlertMessage from "@/components/shared/AlertMessage";
import { useState, useEffect } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { Pencil, ArrowLeft, X } from "lucide-react";
import clsx from "clsx";
import Overlay from "@/ui/Overlay";
import { UpdateCollectionAction } from "@/actions/collections";
import Image from "next/image";
import { CiImageOn } from "react-icons/ci";
import { isGifImage, isValidRemoteImage } from "@/lib/utils/common";
import { AlertMessageType } from "@/lib/sharedTypes";

export function BannerImagesButton({ className }: { className: string }) {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.editCollection.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editCollection.overlays.bannerImages.name
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

export function BannerImagesOverlay({
  data,
}: {
  data: {
    id: string;
    bannerImages: {
      desktopImage: string;
      mobileImage: string;
    };
  };
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessageType, setAlertMessageType] = useState<AlertMessageType>(
    AlertMessageType.NEUTRAL
  );
  const [bannerDesktopImage, setBannerDesktopImage] = useState<string>(
    data.bannerImages.desktopImage
  );
  const [bannerMobileImage, setBannerMobileImage] = useState<string>(
    data.bannerImages.mobileImage
  );

  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.editCollection.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editCollection.overlays.bannerImages.name
  );
  const isOverlayVisible = useOverlayStore(
    (state) => state.pages.editCollection.overlays.bannerImages.isVisible
  );

  useEffect(() => {
    if (isOverlayVisible || showAlert) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      if (!isOverlayVisible && !showAlert) {
        document.body.style.overflow = "visible";
      }
    };
  }, [isOverlayVisible, showAlert]);

  const hideAlertMessage = () => {
    setShowAlert(false);
    setAlertMessage("");
    setAlertMessageType(AlertMessageType.NEUTRAL);
  };

  const onHideOverlay = () => {
    setLoading(false);
    hideOverlay({ pageName, overlayName });
    setBannerDesktopImage(data.bannerImages.desktopImage);
    setBannerMobileImage(data.bannerImages.mobileImage);
  };

  const handleSave = async () => {
    if (!bannerDesktopImage || !bannerMobileImage) {
      setAlertMessageType(AlertMessageType.ERROR);
      setAlertMessage(
        `Please provide the ${!bannerDesktopImage ? "desktop" : "mobile"} image`
      );
      setShowAlert(true);
      return;
    }

    setLoading(true);
    try {
      const result = await UpdateCollectionAction({
        id: data.id,
        bannerImages: {
          desktopImage: bannerDesktopImage,
          mobileImage: bannerMobileImage,
        },
      });
      setAlertMessageType(result.type);
      setAlertMessage(result.message);
      setShowAlert(true);
    } catch (error) {
      console.error("Error updating collection:", error);
      setAlertMessageType(AlertMessageType.ERROR);
      setAlertMessage("Failed to update collection");
      setShowAlert(true);
    } finally {
      setLoading(false);
      onHideOverlay();
    }
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[20px] overflow-hidden bg-white md:w-[500px] md:rounded-2xl md:shadow-lg md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">Banner images</h2>
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
                    Banner images
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
              <div className="w-full h-full mt-[52px] md:mt-0 px-5 pt-5 pb-28 md:pb-10 flex flex-col gap-5 overflow-x-hidden overflow-y-visible invisible-scrollbar md:overflow-hidden">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xs text-gray">Images</h2>
                  <div className="p-5 rounded-md border flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <h2 className="text-xs text-gray">
                        Desktop (1440x360 px)
                      </h2>
                      <div className="w-full border rounded-md overflow-hidden">
                        <div className="w-full min-h-[104px] flex items-center justify-center overflow-hidden">
                          {bannerDesktopImage &&
                          isValidRemoteImage(bannerDesktopImage) ? (
                            isGifImage(bannerDesktopImage) ? (
                              <Image
                                src={bannerDesktopImage}
                                alt="Desktop size image"
                                width={725}
                                height={86}
                                priority={true}
                                unoptimized={true}
                              />
                            ) : (
                              <Image
                                src={bannerDesktopImage}
                                alt="Desktop size image"
                                width={725}
                                height={86}
                                priority={true}
                              />
                            )
                          ) : (
                            <CiImageOn className="fill-neutral-200" size={80} />
                          )}
                        </div>
                        <div className="w-full h-9 border-t overflow-hidden">
                          <input
                            type="text"
                            name="bannerDesktopImage"
                            placeholder="Paste image URL"
                            value={bannerDesktopImage}
                            onChange={(e) =>
                              setBannerDesktopImage(e.target.value)
                            }
                            className="h-full w-full px-3 text-sm text-gray"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h2 className="text-xs text-gray">
                        Mobile (1080x1080 px)
                      </h2>
                      <div className="w-full max-w-[416px] border rounded-md overflow-hidden">
                        <div className="w-full aspect-square flex items-center justify-center overflow-hidden">
                          {bannerMobileImage &&
                          isValidRemoteImage(bannerMobileImage) ? (
                            isGifImage(bannerMobileImage) ? (
                              <Image
                                src={bannerMobileImage}
                                alt="Mobile size image"
                                width={725}
                                height={86}
                                priority={true}
                                unoptimized={true}
                              />
                            ) : (
                              <Image
                                src={bannerMobileImage}
                                alt="Mobile size image"
                                width={725}
                                height={86}
                                priority={true}
                              />
                            )
                          ) : (
                            <CiImageOn className="fill-neutral-200" size={80} />
                          )}
                        </div>
                        <div className="w-full h-9 border-t overflow-hidden">
                          <input
                            type="text"
                            name="bannerMobileImage"
                            placeholder="Paste image URL"
                            value={bannerMobileImage}
                            onChange={(e) =>
                              setBannerMobileImage(e.target.value)
                            }
                            className="h-full w-full px-3 text-sm text-gray"
                          />
                        </div>
                      </div>
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
      {showAlert && (
        <AlertMessage
          message={alertMessage}
          hideAlertMessage={hideAlertMessage}
          type={alertMessageType}
        />
      )}
    </>
  );
}
