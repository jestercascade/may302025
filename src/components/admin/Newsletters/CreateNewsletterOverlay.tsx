"use client";

import { CreateNewsletterAction } from "@/actions/newsletters";
import { useState, useEffect } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { useNavbarMenuStore } from "@/zustand/admin/navbarMenuStore";
import { ArrowLeft, X } from "lucide-react";
import TipTapEditor from "@/components/shared/TipTapEditor";
import { EmailFooter } from "@/components/shared/emails/EmailFooter";
import { EmailLogo } from "@/components/shared/emails/EmailLogo";
import Overlay from "@/ui/Overlay";
import clsx from "clsx";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { ShowAlertType } from "@/lib/sharedTypes";

export function CreateNewsletterMenuButton({
  closeMenu,
}: {
  closeMenu: () => void;
}) {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const setNavbarMenu = useNavbarMenuStore((state) => state.setNavbarMenu);
  const pageName = useOverlayStore((state) => state.pages.newsletter.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.newsletter.overlays.createNewsletter.name
  );

  const openOverlay = () => {
    setNavbarMenu(false);
    showOverlay({ pageName, overlayName });
    closeMenu();
  };

  return (
    <button
      type="button"
      className="h-10 w-max text-lg font-medium rounded-full flex items-center md:h-9 md:w-[calc(100%-10px)] md:mx-auto md:px-3 md:text-sm md:font-semibold md:rounded-md md:cursor-pointer md:transition md:active:bg-lightgray md:hover:bg-lightgray"
      onClick={openOverlay}
    >
      Create newsletter
    </button>
  );
}

export function CreateNewsletterOverlay() {
  const [loading, setLoading] = useState(false);
  const [newsletterData, setNewsletterData] = useState({
    emailSubject: "",
    content: "",
  });

  const showAlert = useAlertStore((state) => state.showAlert);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.newsletter.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.newsletter.overlays.createNewsletter.name
  );
  const isOverlayVisible = useOverlayStore(
    (state) => state.pages.newsletter.overlays.createNewsletter.isVisible
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewsletterData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditorChange = (html: string) => {
    setNewsletterData((prevData) => ({
      ...prevData,
      content: html,
    }));
  };

  const onHideOverlay = () => {
    setLoading(false);
    hideOverlay({ pageName, overlayName });
    setNewsletterData({
      emailSubject: "",
      content: "",
    });
    handleEditorChange("");
  };

  const handleSave = async () => {
    if (!newsletterData.emailSubject.trim() || !newsletterData.content.trim()) {
      return showAlert({
        message: "Subject and content are required",
        type: ShowAlertType.ERROR,
      });
    }

    setLoading(true);

    try {
      const result = await CreateNewsletterAction(newsletterData);

      showAlert({
        message: result.message,
        type: result.type,
      });

      if (result.type === ShowAlertType.SUCCESS) {
        onHideOverlay();
      }
    } catch (error) {
      console.error("Error creating newsletter:", error);
      showAlert({
        message: "Failed to create newsletter",
        type: ShowAlertType.ERROR,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[20px] bg-white md:w-[748px] md:rounded-2xl md:shadow-lg md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 rounded-2xl md:shadow-lg bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">Create newsletter</h2>
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
                    Create newsletter
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
              <div className="w-full h-full mt-[52px] md:mt-0 p-5 pt-0 flex flex-col gap-5 max-md:overflow-y-auto max-md:overflow-x-hidden max-md:invisible-scrollbar">
                <div className="w-full h-9 relative">
                  <input
                    type="text"
                    name="emailSubject"
                    value={newsletterData.emailSubject}
                    onChange={handleInputChange}
                    placeholder="Email subject"
                    className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border"
                    required
                  />
                </div>
                <div className="border rounded-md px-5 bg-neutral-50">
                  <EmailLogo contentType="react" />
                  <div className="mb-8 rounded-md shadow-sm border">
                    <TipTapEditor level="FULL" onUpdate={handleEditorChange} />
                  </div>
                  <EmailFooter
                    contentType="react"
                    includeUnsubscribeLink={true}
                    showFirstSeparator={false}
                  />
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
