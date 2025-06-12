"use client";

import { isGifImage, isValidRemoteImage } from "@/lib/utils/common";
import { useState, useEffect } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { ArrowLeft, X, Image as ImageIcon, Eye, EyeOff, Check } from "lucide-react";
import Overlay from "@/ui/Overlay";
import { UpdatePageHeroAction } from "@/actions/page-hero";
import Image from "next/image";
import clsx from "clsx";
import { ShowAlertType } from "@/lib/sharedTypes";
import { useBodyOverflowStore } from "@/zustand/shared/bodyOverflowStore";
import { useAlertStore } from "@/zustand/shared/alertStore";

// TypeScript interface for Hero section
interface HeroSection {
  id: string;

  // Content fields
  overline?: string; // "WHEN YOUR MOTHER-IN-LAW VISITS..."
  hook: string; // "PROVE YOURSELF" - main headline
  sell?: string; // "She raised the man you love. Now show her he chose wisely..."

  // Main visual content
  mainImage: {
    url: string;
    alt: string;
  };

  // Action configuration
  item_type: "PRODUCT" | "LINK";
  product_id?: string; // For PRODUCT type - product identifier
  link_url?: string; // For LINK type - absolute URL
  cta_text: "GET YOURS" | "SHOP NOW" | "CLAIM NOW";

  // Styling
  background_color?: string;
  text_color?: string;

  // Metadata
  visibility: "VISIBLE" | "HIDDEN";
  created_at: Date;
  updated_at: Date;
}

// Firestore document structure (JSON serializable)
interface HeroSectionDoc {
  id: string;
  overline?: string;
  hook: string;
  sell?: string;
  mainImage: {
    url: string;
    alt: string;
  };
  item_type: "PRODUCT" | "LINK";
  product_id?: string;
  link_url?: string;
  cta_text: "GET YOURS" | "SHOP NOW" | "CLAIM NOW";
  background_color?: string;
  text_color?: string;
  visibility: "VISIBLE" | "HIDDEN";
  created_at: string; // ISO string for Firestore
  updated_at: string; // ISO string for Firestore
}

type CtaText = "GET YOURS" | "SHOP NOW" | "CLAIM NOW";

export function PageHeroButton({ visibility }: { visibility: string }) {
  const HIDDEN = "HIDDEN";
  const VISIBLE = "VISIBLE";

  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.storefront.name);
  const overlayName = useOverlayStore((state) => state.pages.storefront.overlays.editPageHero.name);

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      className="flex flex-col items-start w-full min-[560px]:w-[calc(100%/2-4px)] min-[824px]:w-64 rounded-lg p-5 relative cursor-pointer border transition bg-white active:border-[#b9bfc9] lg:hover:border-[#b9bfc9]"
    >
      <div className="w-full mb-4 flex items-center justify-between relative">
        <h2 className="text-left font-semibold text-sm">Page hero</h2>
        <div
          className={clsx(
            "w-9 h-5 rounded-full relative transition-colors duration-200 ease-out",
            visibility === VISIBLE ? "bg-blue" : "bg-neutral-300"
          )}
        >
          <div
            className={clsx(
              "w-3 h-3 rounded-full bg-white absolute [top:50%] [transform:translateY(-50%)] transition-all duration-200 ease-out shadow-sm",
              {
                "left-[4px]": visibility === HIDDEN,
                "left-[20px]": visibility === VISIBLE,
              }
            )}
          ></div>
        </div>
      </div>
      <p className="w-52 text-left text-gray text-xs leading-[18px]">
        The first thing visitors notice. Use visuals that make a strong first impression.
      </p>
    </button>
  );
}

export function PageHeroOverlay({ pageHero }: { pageHero: Partial<HeroSection> }) {
  const HIDDEN = "HIDDEN";
  const VISIBLE = "VISIBLE";

  const [loading, setLoading] = useState(false);
  const [overline, setOverline] = useState<string>(pageHero.overline || "");
  const [hook, setHook] = useState<string>(pageHero.hook || "");
  const [sell, setSell] = useState<string>(pageHero.sell || "");
  const [mainImageUrl, setMainImageUrl] = useState<string>(pageHero.mainImage?.url || "");
  const [mainImageAlt, setMainImageAlt] = useState<string>(pageHero.mainImage?.alt || "");
  const [itemType, setItemType] = useState<"PRODUCT" | "LINK">(pageHero.item_type || "PRODUCT");
  const [productId, setProductId] = useState<string>(pageHero.product_id || "");
  const [linkUrl, setLinkUrl] = useState<string>(pageHero.link_url || "");
  const [ctaText, setCtaText] = useState<"GET YOURS" | "SHOP NOW" | "CLAIM NOW">(pageHero.cta_text || "GET YOURS");
  const [backgroundColor, setBackgroundColor] = useState<string>(pageHero.background_color || "#1e88e5");
  const [textColor, setTextColor] = useState<string>(pageHero.text_color || "#ffffff");
  const [visibility, setVisibility] = useState<string>(pageHero.visibility?.toUpperCase() || HIDDEN);

  const showAlert = useAlertStore((state) => state.showAlert);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.storefront.name);
  const overlayName = useOverlayStore((state) => state.pages.storefront.overlays.editPageHero.name);
  const isOverlayVisible = useOverlayStore((state) => state.pages.storefront.overlays.editPageHero.isVisible);
  const setPreventBodyOverflowChange = useBodyOverflowStore((state) => state.setPreventBodyOverflowChange);

  const options: { value: CtaText; label: string; description: string }[] = [
    { value: "GET YOURS", label: "GET YOURS", description: "Direct and personal" },
    { value: "SHOP NOW", label: "SHOP NOW", description: "Classic e-commerce" },
    { value: "CLAIM NOW", label: "CLAIM NOW", description: "Urgency focused" },
  ];

  useEffect(() => {
    if (isOverlayVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
      setPreventBodyOverflowChange(false);
    }

    return () => {
      if (!isOverlayVisible) {
        document.body.style.overflow = "visible";
        setPreventBodyOverflowChange(false);
      }
    };
  }, [isOverlayVisible, setPreventBodyOverflowChange]);

  const handleSave = async () => {
    setLoading(true);

    try {
      if (visibility === VISIBLE) {
        let errorMessage = "";

        if (!hook) {
          errorMessage = "Please enter a hook (main headline)";
        } else if (!mainImageUrl) {
          errorMessage = "Please provide the main image URL";
        } else if (!mainImageAlt) {
          errorMessage = "Please provide alt text for the image";
        } else if (itemType === "PRODUCT" && !productId) {
          errorMessage = "Please enter a product ID for product type";
        } else if (itemType === "LINK" && !linkUrl) {
          errorMessage = "Please enter a link URL for link type";
        }

        if (errorMessage) {
          showAlert({
            message: errorMessage,
            type: ShowAlertType.ERROR,
          });
          setLoading(false);
          return;
        }
      }

      const heroData: Partial<HeroSection> = {
        overline: overline || undefined,
        hook,
        sell: sell || undefined,
        mainImage: {
          url: mainImageUrl,
          alt: mainImageAlt,
        },
        item_type: itemType,
        product_id: itemType === "PRODUCT" ? productId : undefined,
        link_url: itemType === "LINK" ? linkUrl : undefined,
        cta_text: ctaText,
        background_color: backgroundColor,
        text_color: textColor,
        visibility: visibility as "VISIBLE" | "HIDDEN",
      };

      // const result = await UpdatePageHeroAction(heroData);
      // showAlert({
      //   message: result.message,
      //   type: result.type,
      // });
    } catch {
      showAlert({
        message: "Failed to update page hero",
        type: ShowAlertType.ERROR,
      });
    } finally {
      setLoading(false);
      setPreventBodyOverflowChange(true);
    }
  };

  const onHideOverlay = () => {
    setLoading(false);
    hideOverlay({ pageName, overlayName });
    // Reset form to original values
    setOverline(pageHero.overline || "");
    setHook(pageHero.hook || "");
    setSell(pageHero.sell || "");
    setMainImageUrl(pageHero.mainImage?.url || "");
    setMainImageAlt(pageHero.mainImage?.alt || "");
    setItemType(pageHero.item_type || "PRODUCT");
    setProductId(pageHero.product_id || "");
    setLinkUrl(pageHero.link_url || "");
    setCtaText(pageHero.cta_text || "GET YOURS");
    setBackgroundColor(pageHero.background_color || "#1e88e5");
    setTextColor(pageHero.text_color || "#ffffff");
    setVisibility(pageHero.visibility?.toUpperCase() || HIDDEN);
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
                  <span className="font-semibold text-sm text-blue">Edit page hero</span>
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
              <div className="w-full h-full mt-0 p-5 flex flex-col gap-6 overflow-x-hidden overflow-y-auto">
                <div className="bg-neutral-50 border border-gray-200/65 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {visibility === VISIBLE ? (
                        <Eye size={16} className="text-blue" />
                      ) : (
                        <EyeOff size={16} className="text-gray-400" />
                      )}
                      <span
                        className={clsx("text-sm font-medium", visibility === VISIBLE ? "text-gray-900" : "text-gray")}
                      >
                        {visibility === VISIBLE ? "Hero section is visible" : "Hero section is hidden"}
                      </span>
                    </div>
                    <button
                      onClick={() => setVisibility((prev) => (prev === VISIBLE ? HIDDEN : VISIBLE))}
                      aria-label="Toggle hero section visibility"
                      className={clsx(
                        "w-9 h-5 rounded-full relative transition-colors duration-200 ease-out",
                        visibility === VISIBLE ? "bg-blue" : "bg-neutral-300"
                      )}
                    >
                      <div
                        className={clsx(
                          "w-3 h-3 rounded-full bg-white absolute [top:50%] [transform:translateY(-50%)] transition-all duration-200 ease-out shadow-sm",
                          {
                            "left-[4px]": visibility === HIDDEN,
                            "left-[20px]": visibility === VISIBLE,
                          }
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Content Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase text-gray">Content</h3>

                  {/* Overline */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray">Overline</label>
                    <input
                      type="text"
                      placeholder="WHEN YOUR MOTHER-IN-LAW VISITS..."
                      value={overline}
                      onChange={(e) => setOverline(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border bg-white text-sm focus:border-gray-400/60 transition-all duration-200"
                    />
                  </div>

                  {/* Hook */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray">Main Headline *</label>
                    <input
                      type="text"
                      placeholder="PROVE YOURSELF"
                      value={hook}
                      onChange={(e) => setHook(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border bg-white text-sm focus:border-gray-400/60 transition-all duration-200"
                      required
                    />
                  </div>

                  {/* Sell */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray">Supporting Text</label>
                    <textarea
                      placeholder="She raised the man you love. Now show her he chose wisely. Turn her doubt into respect."
                      value={sell}
                      onChange={(e) => setSell(e.target.value)}
                      className="w-full h-20 px-3 py-2 rounded-lg border bg-white text-sm focus:border-gray-400/60 transition-all duration-200 resize-none"
                    />
                  </div>
                </div>

                {/* Image Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase text-gray">Hero Image</h3>

                  <div className="bg-neutral-50 border border-gray-200/65 rounded-lg p-4 space-y-4">
                    <div className="w-full border border-gray-200/60 rounded-lg overflow-hidden bg-white">
                      <div className="w-full aspect-square flex items-center justify-center bg-white">
                        {mainImageUrl && isValidRemoteImage(mainImageUrl) ? (
                          isGifImage(mainImageUrl) ? (
                            <Image
                              src={mainImageUrl}
                              alt={mainImageAlt || hook}
                              width={400}
                              height={400}
                              priority={true}
                              unoptimized={true}
                            />
                          ) : (
                            <Image
                              src={mainImageUrl}
                              alt={mainImageAlt || hook}
                              width={400}
                              height={400}
                              priority={true}
                            />
                          )
                        ) : (
                          <ImageIcon size={32} className="text-gray-300" strokeWidth={1.5} />
                        )}
                      </div>
                      <div className="border-t border-gray-100">
                        <input
                          type="text"
                          placeholder="Paste image URL"
                          value={mainImageUrl}
                          onChange={(e) => setMainImageUrl(e.target.value)}
                          className="h-10 w-full px-3 text-sm text-gray-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-gray">Alt Text *</label>
                      <input
                        type="text"
                        placeholder="Professional stainless steel cooking pot with beef stew"
                        value={mainImageAlt}
                        onChange={(e) => setMainImageAlt(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-gray-200/60 bg-white text-sm focus:border-gray-400/60 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Action Configuration */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase text-gray">Call to Action</h3>
                  <div className="inline-flex bg-gray-100 p-1 rounded-lg">
                    <button
                      className={clsx(
                        "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                        itemType === "PRODUCT"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      )}
                      onClick={() => setItemType("PRODUCT")}
                    >
                      Product
                    </button>
                    <button
                      className={clsx(
                        "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                        itemType === "LINK" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                      )}
                      onClick={() => setItemType("LINK")}
                    >
                      Link
                    </button>
                  </div>
                  {itemType === "PRODUCT" ? (
                    <div className="space-y-2">
                      <label className="text-xs text-gray">Product ID *</label>
                      <input
                        type="text"
                        placeholder="premium-cooking-pot-001"
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:border-gray-400/60 transition-all duration-200"
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-xs text-gray">Link URL *</label>
                      <input
                        type="url"
                        placeholder="https://cherlygood.com/collections/summer-cooling-gadgets"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:border-gray-400/60 transition-all duration-200"
                        required
                      />
                    </div>
                  )}
                  {/* CTA Text */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-600">Button Text</label>
                    <div className="space-y-2">
                      {options.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setCtaText(option.value)}
                          className={`w-full p-3 rounded-lg border text-left transition-all duration-200 ${
                            ctaText === option.value
                              ? "border-blue-200/65 bg-blue-50 shadow-sm"
                              : "bg-white hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div
                                className={`text-sm font-medium ${
                                  ctaText === option.value ? "text-blue-dimmed" : "text-black"
                                }`}
                              >
                                {option.label}
                              </div>
                              <div
                                className={`text-xs ${ctaText === option.value ? "text-blue/85 italic" : "text-gray"}`}
                              >
                                {option.description}
                              </div>
                            </div>
                            {ctaText === option.value && <Check size={16} className="text-blue-500" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Styling */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase text-gray">Design</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-gray">Background</label>
                      <div className="relative">
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="absolute opacity-0 w-full h-full cursor-pointer"
                        />
                        <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
                          <div
                            className="w-6 h-6 rounded-full shadow-sm border border-gray-200"
                            style={{ backgroundColor }}
                          />
                          <span className="text-sm font-mono text-gray-700 flex-1">
                            {backgroundColor.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray">Text Color</label>
                      <div className="relative">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="absolute opacity-0 w-full h-full cursor-pointer"
                        />
                        <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
                          <div
                            className="w-6 h-6 rounded-full shadow-sm border border-gray-200"
                            style={{ backgroundColor: textColor }}
                          />
                          <span className="text-sm font-mono text-gray-700 flex-1">{textColor.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Save Button */}
            <div className="md:hidden w-full p-5 bg-white/80 backdrop-blur-sm border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={loading}
                className={clsx("relative h-12 w-full rounded-lg font-medium transition-all duration-200 shadow-lg", {
                  "bg-gray-300 text-gray-500": loading,
                  "bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.98] shadow-blue-500/25": !loading,
                })}
              >
                {loading ? (
                  <div className="flex gap-2 items-center justify-center">
                    <Spinner color="gray" />
                    <span>Saving</span>
                  </div>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
}
