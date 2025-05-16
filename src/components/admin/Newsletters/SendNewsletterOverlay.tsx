"use client";

import { useState, useEffect } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { ArrowLeft, Send, Check, X } from "lucide-react";
import { useSelectedNewsletterStore } from "@/zustand/admin/selectedNewsletterStore";
import { getNewsletters } from "@/actions/get/newsletters";
import { getNewsletterSubscribers } from "@/actions/get/newsletter-subscribers";
import { SendNewsletterEmailAction } from "@/actions/newsletters";
import { EmailLogo } from "@/components/shared/emails/EmailLogo";
import { EmailFooter } from "@/components/shared/emails/EmailFooter";
import juice from "juice";
import clsx from "clsx";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { ShowAlertType } from "@/lib/sharedTypes";

export function SendNewsletterButton({ id }: { id: string }) {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.newsletter.name);
  const overlayName = useOverlayStore((state) => state.pages.newsletter.overlays.sendNewsletter.name);
  const setSelectedNewsletterId = useSelectedNewsletterStore((state) => state.setSelectedNewsletterId);

  const handleClick = () => {
    showOverlay({ pageName, overlayName });
    setSelectedNewsletterId(id);
  };

  return (
    <button onClick={handleClick} className="h-9 w-9 rounded-full flex items-center justify-center">
      <Send size={18} strokeWidth={1.75} className="mt-0.5" />
    </button>
  );
}

export function SendNewsletterOverlay() {
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingContent, setLoadingContent] = useState(true);
  const [newsletter, setNewsletter] = useState<NewsletterType | null>(null);
  const [subscribers, setSubscribers] = useState<SubscriberType[] | null>(null);
  const [selectedSubscribers, setSelectedSubscribers] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);

  const showAlert = useAlertStore((state) => state.showAlert);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.newsletter.name);
  const overlayName = useOverlayStore((state) => state.pages.newsletter.overlays.sendNewsletter.name);
  const isOverlayVisible = useOverlayStore((state) => state.pages.newsletter.overlays.sendNewsletter.isVisible);
  const selectedNewsletterId = useSelectedNewsletterStore((state) => state.selectedNewsletterId);
  const setSelectedNewsletterId = useSelectedNewsletterStore((state) => state.setSelectedNewsletterId);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedNewsletterId) {
        setLoadingContent(true);
        const [newsletters, fetchedSubscribers] = await Promise.all([
          getNewsletters({ ids: [selectedNewsletterId] }),
          getNewsletterSubscribers(),
        ]);

        if (newsletters && newsletters.length > 0) {
          setNewsletter(newsletters[0]);
        }

        setSubscribers(fetchedSubscribers);

        // Select all subscribers by default
        if (fetchedSubscribers) {
          setSelectedSubscribers(new Set(fetchedSubscribers.map((s) => s.email)));
        }

        setLoadingContent(false);
      }
    };

    fetchData();
  }, [selectedNewsletterId]);

  const toggleSubscriber = (email: string) => {
    setSelectedSubscribers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(email)) {
        newSet.delete(email);
      } else {
        newSet.add(email);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (!subscribers) return;

    if (selectedSubscribers.size === subscribers.length) {
      setSelectedSubscribers(new Set());
    } else {
      setSelectedSubscribers(new Set(subscribers.map((s) => s.email)));
    }
  };

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

  const isAllSelected = subscribers && subscribers.length > 0 && selectedSubscribers.size === subscribers.length;

  const onHideOverlay = () => {
    setLoadingSave(false);
    setLoadingContent(false);
    hideOverlay({ pageName, overlayName });
    setSelectedNewsletterId("");
    setNewsletter(null);
    setSubscribers(null);
    setSelectedSubscribers(new Set());
  };

  const handleSend = async () => {
    if (!newsletter) return;

    const css = `
      .newsletter {
        color: #383a42;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 16px;
        line-height: 1.6;
      }
  
      .newsletter h1 {
        font-size: 2rem;
        font-weight: 700;
        line-height: 1.3;
        margin: 2rem 0 1rem;
        color: #222;
      }
  
      .newsletter h2 {
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1.35;
        margin: 1.75rem 0 0.875rem;
        color: #222;
      }
  
      .newsletter h3 {
        font-size: 1.25rem;
        font-weight: 600;
        line-height: 1.4;
        margin: 1.5rem 0 0.75rem;
        color: #222;
      }
  
      .newsletter p {
        margin: 1.25rem 0;
      }
  
      .newsletter a {
        color: #4078f2;
        text-decoration: none;
      }
  
      .newsletter ul,
      .newsletter ol {
        padding-left: 2rem;
        margin: 0.75rem 0;
      }

      .newsletter ul {
        list-style-type: disc;
      }

      .newsletter ol {
        list-style-type: decimal;
      }

      .newsletter li p {
          margin: 0.75rem 0;
      }
  
      .newsletter img {
        max-width: 100%;
        height: auto;
      }
  
      .newsletter pre {
        background: #fafafa;
        border-radius: 4px;
        padding: 1rem;
        margin: 1rem 0;
        overflow-x: auto;
      }
  
      .newsletter code {
        font-family: "SF Mono", Monaco, Menlo, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 0.9em;
        background: rgba(135, 131, 120, 0.15);
        border-radius: 3px;
        padding: 0.2em 0.4em;
      }
  
      .newsletter blockquote {
        border-left: 4px solid #e1e4e8;
        margin: 1rem 0;
        padding-left: 1rem;
        color: #626772;
      }
  
      .newsletter > *:first-child {
        margin-top: 0;
      }
      
      .newsletter > *:last-child {
        margin-bottom: 0;
      }
    `;

    try {
      setLoadingSave(true);
      const subscribersList = Array.from(selectedSubscribers);

      // Send individual emails to each subscriber
      for (const subscriberEmail of subscribersList) {
        const wrappedContent = `
          <div style="max-width:640px;padding:0 20px;margin:0 auto;border:1px solid #e8eaed;border-radius:8px;background-color:#fafafa">
            <div class="newsletter">
              ${EmailLogo({ contentType: "html" })}
              <div>${newsletter.content}</div>
              ${EmailFooter({
                includeUnsubscribeLink: true,
                contentType: "html",
                recipientEmail: subscriberEmail,
              })}
            </div>
          </div>
        `;

        const emailReady = juice(`<style>${css}</style>${wrappedContent}`);

        // Send to individual recipient
        await SendNewsletterEmailAction(
          emailReady,
          [subscriberEmail], // Send to single recipient
          newsletter.emailSubject
        );
      }

      showAlert({
        message: "Newsletter sent successfully",
        type: ShowAlertType.SUCCESS,
      });
    } catch (error) {
      console.error("Error sending newsletter:", error);
      showAlert({
        message: "Failed to send newsletter",
        type: ShowAlertType.ERROR,
      });
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <>
      {isOverlayVisible && (
        <div className="flex justify-center w-full h-dvh z-20 fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-40 backdrop-blur-sm">
          {/* Mobile View */}
          <div className="md:hidden absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-[20px] overflow-hidden bg-white">
            <div className="md:hidden pt-4 pb-2 absolute top-0 left-0 right-0">
              <div className="relative flex justify-center items-center w-full h-7">
                <h2 className="font-semibold text-lg">Newsletter</h2>
                <button
                  onClick={onHideOverlay}
                  type="button"
                  className="w-7 h-7 rounded-full flex items-center justify-center absolute right-4 transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed"
                >
                  <X color="#6c6c6c" size={18} strokeWidth={2} />
                </button>
              </div>
            </div>
            <div className="w-full h-[calc(100%-52px)] mt-[52px] md:mt-0">
              {loadingContent ? (
                <div className="flex items-center justify-center w-full h-full overflow-hidden">
                  <Spinner color="gray" />
                </div>
              ) : (
                <div className="w-full h-full pt-2 flex flex-col items-center gap-5">
                  <div className="flex-1 w-[calc(100%-40px)] border rounded-md overflow-auto custom-scrollbar bg-neutral-50">
                    <div className="h-12 px-4 border-b flex items-center justify-center">
                      <span className="truncate font-medium">{newsletter?.emailSubject}</span>
                    </div>
                    <div className="w-full h-[calc(100%-48px)]">
                      <div className="w-full h-full px-5 overflow-y-auto overflow-x-hidden rounded-y-scrollbar">
                        <EmailLogo contentType="react" />
                        {newsletter ? (
                          <div
                            className="tiptap prose"
                            dangerouslySetInnerHTML={{
                              __html: newsletter.content,
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-gray-500">No content available</span>
                          </div>
                        )}
                        <EmailFooter includeUnsubscribeLink={true} contentType="react" />
                      </div>
                    </div>
                  </div>
                  <div className="min-h-20 md:hidden w-full pb-5 pt-2 px-5 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center bg-gray-100 rounded-full"
                      >
                        <span className="h-9 w-max pl-4 pr-3 flex items-center text-sm font-medium border-r">
                          {selectedSubscribers.size} subscribers
                        </span>
                        <span className="h-9 w-max pl-3 pr-4 flex items-center text-sm font-medium text-amber">
                          {isExpanded ? "Done" : "Select"}
                        </span>
                      </button>
                      <button
                        disabled={loadingSave || selectedSubscribers.size === 0}
                        onClick={handleSend}
                        className={clsx(
                          "relative h-9 w-max px-4 text-sm font-medium rounded-full overflow-hidden transition-colors text-white bg-neutral-700",
                          {
                            "bg-opacity-50": loadingSave || selectedSubscribers.size === 0,
                            "hover:bg-neutral-600 active:bg-neutral-800": !loadingSave && selectedSubscribers.size > 0,
                          }
                        )}
                      >
                        {loadingSave ? (
                          <div className="flex gap-1 items-center justify-center w-full h-full">
                            <Spinner color="white" />
                            <span className="text-white">Sending</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Send size={18} strokeWidth={1.75} className="mt-0.5 -ml-0.5" />
                            <span className="text-white">Send</span>
                          </div>
                        )}
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="max-h-[228px] min-h-28 overflow-auto custom-scrollbar">
                        <div className="flex flex-col gap-3">
                          {subscribers && subscribers?.length > 0 ? (
                            subscribers.map((subscriber, index) => (
                              <div
                                key={index}
                                onClick={() => toggleSubscriber(subscriber.email)}
                                className="flex items-center gap-2.5 w-max cursor-pointer"
                              >
                                <div
                                  className={clsx(
                                    "rounded-md min-w-[18px] h-[18px] flex items-center justify-center",
                                    selectedSubscribers.has(subscriber.email) ? "bg-amber" : "border border-neutral-300"
                                  )}
                                >
                                  {selectedSubscribers.has(subscriber.email) && (
                                    <Check size={16} className="text-white" />
                                  )}
                                </div>
                                <span className="text-sm font-medium truncate w-full">{subscriber.email}</span>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <span className="text-gray-500">No subscribers found</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Desktop View */}
          <div className="hidden md:block w-[calc(100%-40px)] max-w-[982px] max-h-[554px] absolute top-16 bottom-16 bg-white mx-auto shadow rounded-2xl">
            <div className="w-full h-full relative">
              {loadingContent ? (
                <div className="flex items-center justify-center w-full h-full">
                  <Spinner color="gray" />
                </div>
              ) : (
                <div className="w-full h-full">
                  <div className="flex items-center justify-between py-2 pr-4 pl-2">
                    <button
                      onClick={onHideOverlay}
                      type="button"
                      className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
                    >
                      <ArrowLeft size={20} strokeWidth={2} className="-ml-1 stroke-blue" />
                      <span className="font-semibold text-sm text-blue">Newsletter</span>
                    </button>
                    <button
                      disabled={loadingSave || selectedSubscribers.size === 0}
                      onClick={handleSend}
                      className={clsx(
                        "relative h-9 w-max px-4 rounded-full overflow-hidden transition-colors text-white bg-neutral-700",
                        {
                          "bg-opacity-50": loadingSave || selectedSubscribers.size === 0,
                          "hover:bg-neutral-600 active:bg-neutral-800": !loadingSave && selectedSubscribers.size > 0,
                        }
                      )}
                    >
                      {loadingSave ? (
                        <div className="flex gap-1 items-center justify-center w-full h-full">
                          <Spinner color="white" />
                          <span className="text-white">Sending</span>
                        </div>
                      ) : (
                        <span className="text-white">Send ({selectedSubscribers.size})</span>
                      )}
                    </button>
                  </div>
                  <div className="h-[calc(100%-52px)] px-5 pb-5">
                    <div className="h-full border rounded-md flex overflow-hidden">
                      <div className="min-w-72 max-w-72 border-r">
                        <div className="h-12 px-4 border-b flex items-center justify-between">
                          <h3 className="font-medium">Subscribers</h3>
                          <button
                            onClick={toggleSelectAll}
                            className={clsx(
                              "text-sm hover:underline",
                              isAllSelected ? "text-neutral-700" : "text-amber"
                            )}
                          >
                            {isAllSelected ? "Deselect All" : "Select All"}
                          </button>
                        </div>
                        <div className="w-full h-[calc(100%-48px)] custom-scrollbar overflow-y-auto">
                          <div className="flex flex-col gap-3 p-4">
                            {subscribers && subscribers?.length > 0 ? (
                              subscribers.map((subscriber, index) => (
                                <div
                                  key={index}
                                  onClick={() => toggleSubscriber(subscriber.email)}
                                  className="flex items-center gap-2.5 w-max cursor-pointer"
                                >
                                  <div
                                    className={clsx(
                                      "rounded-md min-w-[18px] h-[18px] flex items-center justify-center",
                                      selectedSubscribers.has(subscriber.email)
                                        ? "bg-amber"
                                        : "border border-neutral-300"
                                    )}
                                  >
                                    {selectedSubscribers.has(subscriber.email) && (
                                      <Check size={16} className="text-white" />
                                    )}
                                  </div>
                                  <span className="text-sm font-medium truncate w-full">{subscriber.email}</span>
                                </div>
                              ))
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <span className="text-gray-500">No subscribers found</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="bg-neutral-50">
                        <div className="h-12 px-4 border-b flex items-center justify-center">
                          <span className="truncate font-medium">{newsletter?.emailSubject}</span>
                        </div>
                        <div className="w-full h-[calc(100%-48px)] px-5 overflow-y-auto rounded-y-scrollbar">
                          <EmailLogo contentType="react" />
                          {newsletter ? (
                            <div
                              className="tiptap prose"
                              dangerouslySetInnerHTML={{
                                __html: newsletter.content,
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <span className="text-gray-500">No content available</span>
                            </div>
                          )}
                          <EmailFooter includeUnsubscribeLink={true} contentType="react" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
