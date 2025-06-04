"use client";

import { capitalizeFirstLetter, formatDate, isGifImage, isValidRemoteImage } from "@/lib/utils/common";
import { useState, useEffect, useRef } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { useNavbarMenuStore } from "@/zustand/admin/navbarMenuStore";
import { ArrowLeft, ChevronDown, X, Image as ImageIcon } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CreateCollectionAction } from "@/actions/collections";
import Overlay from "@/ui/Overlay";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { ShowAlertType } from "@/lib/sharedTypes";

export function NewCollectionMenuButton({ closeMenu }: NewCollectionMenuButtonType) {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const setNavbarMenu = useNavbarMenuStore((state) => state.setNavbarMenu);
  const pageName = useOverlayStore((state) => state.pages.storefront.name);
  const overlayName = useOverlayStore((state) => state.pages.storefront.overlays.newCollection.name);

  const openOverlay = () => {
    setNavbarMenu(false);
    showOverlay({ pageName, overlayName });
    closeMenu();
  };

  return (
    <>
      <button
        type="button"
        className="h-10 w-max text-lg font-medium rounded-full flex items-center md:h-9 md:w-[calc(100%-10px)] md:mx-auto md:px-3 md:text-sm md:font-semibold md:rounded-md md:cursor-pointer md:transition md:active:bg-lightgray md:hover:bg-lightgray"
        onClick={openOverlay}
      >
        New collection
      </button>
    </>
  );
}

export function NewCollectionEmptyTableButton() {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const setNavbarMenu = useNavbarMenuStore((state) => state.setNavbarMenu);
  const pageName = useOverlayStore((state) => state.pages.storefront.name);
  const overlayName = useOverlayStore((state) => state.pages.storefront.overlays.newCollection.name);

  const openOverlay = () => {
    setNavbarMenu(false);
    showOverlay({ pageName, overlayName });
  };

  return (
    <button
      type="button"
      className="h-9 w-max px-4 rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-blue active:bg-blue-dimmed lg:hover:bg-blue-dimmed"
      onClick={openOverlay}
    >
      New collection
    </button>
  );
}

export function NewCollectionOverlay() {
  const FEATURED = "FEATURED";
  const BANNER = "BANNER";

  const today = new Date();

  const [isCollectionDropdownOpen, setIsCollectionTypeDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedCollectionType, setSelectedCollectionType] = useState(FEATURED);
  const [title, setTitle] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [bannerDesktopImage, setBannerDesktopImage] = useState<string>("");
  const [bannerMobileImage, setBannerMobileImage] = useState<string>("");
  const [launchDate, setLaunchDate] = useState<Date | null>(today);
  const [endDate, setEndDate] = useState<Date | null>(
    new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from today
  );

  const collectionTypeRef = useRef(null);
  const showAlert = useAlertStore((state) => state.showAlert);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.storefront.name);
  const overlayName = useOverlayStore((state) => state.pages.storefront.overlays.newCollection.name);
  const isOverlayVisible = useOverlayStore((state) => state.pages.storefront.overlays.newCollection.isVisible);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!collectionTypeRef.current || !(event.target instanceof Node)) {
        return;
      }

      const targetNode = collectionTypeRef.current as Node;

      if (!targetNode.contains(event.target)) {
        setIsCollectionTypeDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCollectionTypeSelect = (type: string) => {
    setSelectedCollectionType(type);
    setIsCollectionTypeDropdownOpen(false);
  };

  const isValidDateRange =
    launchDate && endDate && launchDate.toISOString().split("T")[0] < endDate.toISOString().split("T")[0];

  const handleSave = async () => {
    if (!title.trim()) {
      return showAlert({
        message: "Enter a collection title",
        type: ShowAlertType.ERROR,
      });
    }

    if (!slug.trim()) {
      return showAlert({
        message: "Enter a collection slug",
        type: ShowAlertType.ERROR,
      });
    }

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
        const requestData: Omit<RequestDataType, "bannerImages"> & {
          bannerImages?: BannerImagesType;
        } = {
          title,
          slug,
          campaignDuration: campaignDuration,
          collectionType: selectedCollectionType,
        };

        if (selectedCollectionType === BANNER) {
          requestData.bannerImages = {
            desktopImage: bannerDesktopImage,
            mobileImage: bannerMobileImage,
          };
        }

        const result = await CreateCollectionAction(requestData as RequestDataType);

        showAlert({
          message: result.message,
          type: result.type,
        });
      } catch (error) {
        console.error("Error creating collection:", error);
        showAlert({
          message: "Failed to create collection",
          type: ShowAlertType.ERROR,
        });
      } finally {
        onHideOverlay();
      }
    }
  };

  const onHideOverlay = () => {
    setLoading(false);
    hideOverlay({ pageName, overlayName });
    setSelectedCollectionType(FEATURED);
    setTitle("");
    setSlug("");
    setBannerDesktopImage("");
    setBannerMobileImage("");
    setLaunchDate(today);
    setEndDate(
      new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from today
    );
  };

  const handleSlugPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const sanitizedValue = pastedText
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, "") // Remove all except letters, numbers, hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+/, "") // Remove leading hyphens
      .replace(/-+$/, ""); // Remove trailing hyphens
    setSlug(sanitizedValue);
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[20px] bg-white md:w-[500px] md:rounded-2xl md:shadow-lg md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">New collection</h2>
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
                  <ArrowLeft size={20} strokeWidth={2} className="-ml-1 stroke-blue" />
                  <span className="font-semibold text-sm text-blue">New collection</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={clsx(
                    "relative h-9 w-max px-4 rounded-full overflow-hidden transition-colors text-white bg-neutral-700",
                    {
                      "bg-opacity-50": loading,
                      "hover:bg-neutral-600 active:bg-neutral-800": !loading,
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
              <div className="w-full h-full mt-[52px] md:mt-0 p-5 flex flex-col gap-5 overflow-x-hidden overflow-y-visible invisible-scrollbar md:overflow-hidden">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xs text-gray">Type</h2>
                  <div ref={collectionTypeRef} className="w-full h-9 relative">
                    <button
                      onClick={() => setIsCollectionTypeDropdownOpen((prevState) => !prevState)}
                      type="button"
                      className="h-9 w-full px-3 rounded-md flex items-center justify-between transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed"
                    >
                      <span>{capitalizeFirstLetter(selectedCollectionType.toLowerCase())}</span>
                      <ChevronDown
                        size={16}
                        className={clsx("-mr-[4px] stroke-gray transition-transform duration-200", {
                          "rotate-180": isCollectionDropdownOpen,
                        })}
                      />
                    </button>
                    <div
                      className={clsx("w-full absolute top-10 z-10", {
                        hidden: !isCollectionDropdownOpen,
                        block: isCollectionDropdownOpen,
                      })}
                    >
                      <div className="overflow-hidden h-full w-full py-[6px] flex flex-col gap-0 rounded-md shadow-dropdown bg-white">
                        <div
                          className="w-full h-9 flex items-center px-[12px] cursor-context-menu transition duration-300 ease-in-out hover:bg-lightgray"
                          onClick={() => handleCollectionTypeSelect(FEATURED)}
                        >
                          Featured
                        </div>
                        <div
                          className="w-full h-9 flex items-center px-[12px] cursor-context-menu transition duration-300 ease-in-out hover:bg-lightgray"
                          onClick={() => handleCollectionTypeSelect(BANNER)}
                        >
                          Banner
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-xs text-gray">Campaign duration</h2>
                  <div className="flex flex-col min-[478px]:flex-row items-start gap-3 mt-4">
                    <div
                      className={clsx("w-[180px] flex gap-2 items-center border rounded-md overflow-hidden pl-3", {
                        "border-red": !isValidDateRange,
                      })}
                    >
                      <span className="w-max text-nowrap text-xs text-gray">Launch</span>
                      <DatePicker
                        selected={launchDate}
                        onChange={(date) => setLaunchDate(date)}
                        className="w-full h-9 outline-none"
                        required
                      />
                    </div>
                    <div
                      className={clsx("w-[180px] flex gap-2 items-center border rounded-md overflow-hidden pl-3", {
                        "border-red": !isValidDateRange,
                      })}
                    >
                      <span className="w-max text-nowrap text-xs text-gray">End date</span>
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        className="w-full h-9 outline-none"
                        required
                      />
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
                      placeholder={`Belle Jolie Lipstick - She "Marks" Her Man with Her Lips`}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-neutral-400"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="slug" className="text-xs text-gray">
                    Slug
                  </label>
                  <div className="w-full h-9 relative">
                    <input
                      type="text"
                      name="slug"
                      placeholder="mark-your-man"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      onPaste={handleSlugPaste}
                      className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-neutral-400"
                      required
                    />
                  </div>
                </div>
                {selectedCollectionType === BANNER && (
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xs text-gray">Images</h2>
                    <div className="p-5 rounded-md border flex flex-col gap-5">
                      <div className="flex flex-col gap-2">
                        <h2 className="text-xs text-gray">Desktop (1440x360 px)</h2>
                        <div className="w-full border rounded-md overflow-hidden">
                          <div className="w-full min-h-[104px] flex items-center justify-center overflow-hidden">
                            {bannerDesktopImage && isValidRemoteImage(bannerDesktopImage) ? (
                              isGifImage(bannerDesktopImage) ? (
                                <Image
                                  src={bannerDesktopImage}
                                  alt={title}
                                  width={725}
                                  height={86}
                                  priority={true}
                                  unoptimized={true}
                                />
                              ) : (
                                <Image src={bannerDesktopImage} alt={title} width={725} height={86} priority={true} />
                              )
                            ) : (
                              <ImageIcon color="#e5e5e5" size={52} strokeWidth={0.75} />
                            )}
                          </div>
                          <div className="w-full h-9 border-t overflow-hidden">
                            <input
                              type="text"
                              name="bannerDesktopImage"
                              placeholder="Paste image URL"
                              value={bannerDesktopImage}
                              onChange={(e) => setBannerDesktopImage(e.target.value)}
                              className="h-full w-full px-3 text-sm text-gray"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <h2 className="text-xs text-gray">Mobile (1080x1080 px)</h2>
                        <div className="w-full max-w-[416px] border rounded-md overflow-hidden">
                          <div className="w-full aspect-square flex items-center justify-center overflow-hidden">
                            {bannerMobileImage && isValidRemoteImage(bannerMobileImage) ? (
                              isGifImage(bannerMobileImage) ? (
                                <Image
                                  src={bannerMobileImage}
                                  alt={title}
                                  width={725}
                                  height={86}
                                  priority={true}
                                  unoptimized={true}
                                />
                              ) : (
                                <Image src={bannerMobileImage} alt={title} width={725} height={86} priority={true} />
                              )
                            ) : (
                              <ImageIcon color="#e5e5e5" size={52} strokeWidth={0.75} />
                            )}
                          </div>
                          <div className="w-full h-9 border-t overflow-hidden">
                            <input
                              type="text"
                              name="bannerMobileImage"
                              placeholder="Paste image URL"
                              value={bannerMobileImage}
                              onChange={(e) => setBannerMobileImage(e.target.value)}
                              className="h-full w-full px-3 text-sm text-gray"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="md:hidden w-full pb-5 pt-2 px-5 absolute bottom-0 bg-white">
              <button
                onClick={handleSave}
                disabled={loading}
                className={clsx(
                  "relative h-12 w-full rounded-full overflow-hidden transition-colors text-white bg-neutral-700",
                  {
                    "bg-opacity-50": loading,
                    "hover:bg-neutral-600 active:bg-neutral-800": !loading,
                  }
                )}
              >
                {loading ? (
                  <div className="flex gap-1 items-center justify-center w-full h-full">
                    <Spinner />
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

// -- Type Definitions --

type BannerImagesType = {
  desktopImage: string;
  mobileImage: string;
};

type RequestDataType = {
  title: string;
  slug: string;
  campaignDuration: {
    startDate: string;
    endDate: string;
  };
  collectionType: string;
  bannerImages?: BannerImagesType;
};

interface NewCollectionMenuButtonType {
  closeMenu: () => void;
}
