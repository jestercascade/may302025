"use client";

import AlertMessage from "@/components/shared/AlertMessage";
import { isGifImage, isValidRemoteImage } from "@/lib/utils/common";
import { useState, useEffect } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { ArrowLeft, X, Image as ImageIcon } from "lucide-react";
import Overlay from "@/ui/Overlay";
import { UpdatePageHeroAction } from "@/actions/page-hero";
import { AlertMessageType } from "@/lib/sharedTypes";
import Image from "next/image";
import clsx from "clsx";

export function PageHeroButton({ visibility }: { visibility: string }) {
  const HIDDEN = "HIDDEN";
  const VISIBLE = "VISIBLE";

  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.storefront.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.storefront.overlays.editPageHero.name
  );

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      className="flex flex-col items-start w-full min-[560px]:w-[calc(100%/2-4px)] min-[824px]:w-64 rounded-xl p-5 relative cursor-pointer border transition bg-white active:border-[#b9bfc9] lg:hover:border-[#b9bfc9]"
    >
      <div className="w-full mb-4 flex items-center justify-between relative">
        <h2 className="text-left font-semibold text-sm">Page hero</h2>
        <div
          className={clsx(
            "w-10 h-5 rounded-full relative cursor-pointer ease-in-out duration-200",
            {
              "bg-white border": visibility === HIDDEN,
              "bg-blue border border-blue": visibility === VISIBLE,
            }
          )}
        >
          <div
            className={clsx(
              "w-[10px] h-[10px] rounded-full ease-in-out duration-300 absolute [top:50%] [transform:translateY(-50%)]",
              {
                "left-[5px] bg-black": visibility === HIDDEN,
                "left-[23px] bg-white": visibility === VISIBLE,
              }
            )}
          ></div>
        </div>
      </div>
      <p className="w-52 text-left text-gray text-xs leading-[18px]">
        The first thing visitors notice. Use visuals that make a strong first
        impression.
      </p>
    </button>
  );
}

export function PageHeroOverlay({
  pageHero,
}: {
  pageHero: Partial<PageHeroType>;
}) {
  const HIDDEN = "HIDDEN";
  const VISIBLE = "VISIBLE";

  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertMessageType, setAlertMessageType] = useState<AlertMessageType>(
    AlertMessageType.NEUTRAL
  );
  const [showAlert, setShowAlert] = useState(false);
  const [title, setTitle] = useState<string>(pageHero.title || "");
  const [desktopImage, setDesktopImage] = useState<string>(
    pageHero.images?.desktop || ""
  );
  const [mobileImage, setMobileImage] = useState<string>(
    pageHero.images?.mobile || ""
  );
  const [visibility, setVisibility] = useState<string>(
    pageHero.visibility?.toUpperCase() || HIDDEN
  );
  const [destinationUrl, setDestinationUrl] = useState<string>(
    pageHero.destinationUrl || ""
  );

  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.storefront.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.storefront.overlays.editPageHero.name
  );
  const isOverlayVisible = useOverlayStore(
    (state) => state.pages.storefront.overlays.editPageHero.isVisible
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

  const handleSave = async () => {
    setLoading(true);

    try {
      if (
        visibility === VISIBLE &&
        (!title || !desktopImage || !mobileImage || !destinationUrl)
      ) {
        let errorMessage = "";

        if (!title) {
          errorMessage = "Please enter a title";
        } else if (!desktopImage) {
          errorMessage = "Please provide the desktop image";
        } else if (!mobileImage) {
          errorMessage = "Please provide the mobile image";
        } else if (!destinationUrl) {
          errorMessage = "Please enter a destination URL";
        }

        setAlertMessageType(AlertMessageType.ERROR);
        setAlertMessage(errorMessage);
        setShowAlert(true);
      } else {
        const result = await UpdatePageHeroAction({
          title,
          images: {
            desktop: desktopImage,
            mobile: mobileImage,
          },
          destinationUrl,
          visibility: visibility as "VISIBLE" | "HIDDEN",
        });
        setAlertMessageType(result.type);
        setAlertMessage(result.message);
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error updating page hero:", error);
      setAlertMessageType(AlertMessageType.ERROR);
      setAlertMessage("Failed to update page hero");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const onHideOverlay = () => {
    setLoading(false);
    hideOverlay({ pageName, overlayName });
    setTitle(pageHero.title || "");
    setDestinationUrl(pageHero.destinationUrl || "");
    setDesktopImage(pageHero.images?.desktop || "");
    setMobileImage(pageHero.images?.mobile || "");
  };

  const hideAlertMessage = () => {
    setShowAlert(false);
    setAlertMessage("");
    setAlertMessageType(AlertMessageType.NEUTRAL);
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[20px] overflow-hidden bg-white md:w-[500px] md:rounded-2xl md:shadow-lg md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">Edit page hero</h2>
                  <button
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
                    Edit page hero
                  </span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={clsx(
                    "relative h-9 w-max px-4 rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-neutral-700",
                    {
                      "bg-opacity-50": loading,
                      "active:bg-neutral-700": !loading,
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
                  <h2 className="text-xs text-gray">Visibility</h2>
                  <div className="px-[10px] py-2 w-full min-[425px]:w-max rounded-md flex gap-4 min-[425px]:gap-4 items-start justify-between bg-lightgray">
                    <div className="text-sm">Show hero on storefront</div>
                    <div
                      onClick={() =>
                        setVisibility((prevVisibility) =>
                          prevVisibility === VISIBLE ? HIDDEN : VISIBLE
                        )
                      }
                      className={clsx(
                        "w-10 h-5 rounded-full relative cursor-pointer ease-in-out duration-200",
                        {
                          "bg-white border": visibility === HIDDEN,
                          "bg-blue border border-blue": visibility === VISIBLE,
                        }
                      )}
                    >
                      <div
                        className={clsx(
                          "w-[10px] h-[10px] rounded-full ease-in-out duration-300 absolute [top:50%] [transform:translateY(-50%)]",
                          {
                            "left-[5px] bg-black": visibility === HIDDEN,
                            "left-[23px] bg-white": visibility === VISIBLE,
                          }
                        )}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="title" className="text-xs text-gray">
                    Title
                  </label>
                  <div className="w-full h-9 relative">
                    <input
                      type="text"
                      name="title"
                      placeholder="Shop Denim Skirts"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full h-9 px-3 rounded-md border"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="destinationUrl" className="text-xs text-gray">
                    Destination URL
                  </label>
                  <div className="w-full h-9 relative">
                    <input
                      type="text"
                      name="destinationUrl"
                      placeholder="https://cherlygood.com/denim-skirts"
                      value={destinationUrl}
                      onChange={(e) => setDestinationUrl(e.target.value)}
                      className="w-full h-9 px-3 rounded-md border"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-xs text-gray">Images</h2>
                  <div className="p-5 rounded-md border flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <h2 className="text-xs text-gray">
                        Desktop (1440x360 px)
                      </h2>
                      <div className="w-full border rounded-md overflow-hidden">
                        <div className="w-full min-h-[59px] flex items-center justify-center overflow-hidden">
                          {desktopImage && isValidRemoteImage(desktopImage) ? (
                            isGifImage(desktopImage) ? (
                              <Image
                                src={desktopImage}
                                alt={title}
                                width={725}
                                height={86}
                                priority={true}
                                unoptimized={true}
                              />
                            ) : (
                              <Image
                                src={desktopImage}
                                alt={title}
                                width={725}
                                height={86}
                                priority={true}
                              />
                            )
                          ) : (
                            <ImageIcon
                              color="#e5e5e5"
                              size={52}
                              strokeWidth={0.75}
                            />
                          )}
                        </div>
                        <div className="w-full h-9 border-t overflow-hidden">
                          <input
                            type="text"
                            name="desktopImage"
                            placeholder="Paste image URL"
                            value={desktopImage}
                            onChange={(e) => setDesktopImage(e.target.value)}
                            className="h-full w-full px-3 text-sm text-gray"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h2 className="text-xs text-gray">
                        Mobile (960x1280 px)
                      </h2>
                      <div className="w-full max-w-[416px] border rounded-md overflow-hidden">
                        <div className="w-full min-h-[314px] flex items-center justify-center overflow-hidden">
                          {mobileImage && isValidRemoteImage(mobileImage) ? (
                            isGifImage(mobileImage) ? (
                              <Image
                                src={mobileImage}
                                alt={title}
                                width={725}
                                height={86}
                                priority={true}
                                unoptimized={true}
                              />
                            ) : (
                              <Image
                                src={mobileImage}
                                alt={title}
                                width={725}
                                height={86}
                                priority={true}
                              />
                            )
                          ) : (
                            <ImageIcon
                              color="#e5e5e5"
                              size={52}
                              strokeWidth={0.75}
                            />
                          )}
                        </div>
                        <div className="w-full h-9 border-t overflow-hidden">
                          <input
                            type="text"
                            name="mobileImage"
                            placeholder="Paste image URL"
                            value={mobileImage}
                            onChange={(e) => setMobileImage(e.target.value)}
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
                    "bg-neutral-700": !loading,
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

// -- Type Definitions --

type PageHeroType = {
  id: string;
  images: {
    desktop: string;
    mobile: string;
  };
  title: string;
  destinationUrl: string;
  visibility: "VISIBLE" | "HIDDEN";
};
