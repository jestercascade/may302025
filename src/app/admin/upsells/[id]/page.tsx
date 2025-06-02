import { BasicDetailsButton, BasicDetailsOverlay } from "@/components/admin/EditUpsell/BasicDetailsOverlay";
import { capitalizeFirstLetter, formatThousands, isValidRemoteImage } from "@/lib/utils/common";
import Image from "next/image";
import { notFound } from "next/navigation";
import { VisibilityButton, VisibilityOverlay } from "@/components/admin/EditUpsell/VisibilityOverlay";
import IDCopyButton from "@/components/shared/IDCopyButton";
import clsx from "clsx";
import { getUpsells } from "@/actions/get/upsells";

export default async function EditUpsell({ params }: { params: Promise<{ id: string }> }) {
  const paramId = (await params).id;
  const [upsell] = (await getUpsells({ ids: [paramId] })) || [];

  if (!upsell) {
    notFound();
  }

  const { id, pricing, mainImage, visibility, products } = upsell;

  return (
    <>
      <div className="max-w-[768px] flex flex-col gap-10 px-5">
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Basic details</h2>
            <p className="text-sm md:max-w-[85%]">
              Show customers how stuff goes together, and they'll buy more. If they want a shirt, display the full
              outfit—pants, shoes, accessories. Before you know it, they'll be adding 2-4 items to their cart. It's
              upselling, but in a friendly way.
            </p>
          </div>
          <div
            className={clsx(
              "w-full max-w-[400px] relative flex items-center justify-between shadow rounded-xl bg-white",
              !(pricing.basePrice && mainImage) && "p-5 pr-2"
            )}
          >
            {pricing.basePrice && mainImage ? (
              <div className="w-full">
                <div className="w-[calc(100%-60px)]">
                  <div className="p-5">
                    <h3 className="text-xs text-gray mb-2">Price</h3>
                    <div className="w-max flex items-center justify-center">
                      {Number(pricing.salePrice) ? (
                        <div className="flex items-center gap-[6px]">
                          <div className="flex items-baseline">
                            <span className="text-[0.813rem] leading-3 font-semibold">$</span>
                            <span className="text-lg font-bold">{Math.floor(Number(pricing.salePrice))}</span>
                            <span className="text-[0.813rem] leading-3 font-semibold">
                              {(Number(pricing.salePrice) % 1).toFixed(2).substring(1)}
                            </span>
                          </div>
                          <span className="text-[0.813rem] leading-3 text-gray line-through">
                            ${formatThousands(Number(pricing.basePrice))}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-baseline">
                          <span className="text-[0.813rem] leading-3 font-semibold">$</span>
                          <span className="text-lg font-bold">{Math.floor(Number(pricing.basePrice))}</span>
                          <span className="text-[0.813rem] leading-3 font-semibold">
                            {(Number(pricing.basePrice) % 1).toFixed(2).substring(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xs text-gray mb-2">Main image</h3>
                    <div className="w-full max-w-[280px] rounded-xl aspect-square flex items-center justify-center overflow-hidden">
                      {isValidRemoteImage(mainImage) && (
                        <Image src={mainImage} alt="Upsell" width={280} height={280} priority />
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-full p-5 pt-2 pb-10 flex justify-center">
                  <IDCopyButton id={id} />
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray">Nothing here</span>
            )}
            <BasicDetailsButton
              className={clsx({
                "absolute top-2 right-2": pricing.basePrice && mainImage,
              })}
            />
          </div>
        </div>
        <div>
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3">Visibility</h2>
            <p className="text-sm md:max-w-[85%]">
              Published or hidden? Choose if your creation is visible on the public website.
            </p>
          </div>
          <div className="w-full max-w-[400px] relative shadow rounded-xl bg-white">
            <div className="relative border rounded-xl pl-5 pr-[10px] py-4">
              <div className="w-full flex items-center justify-between">
                <div
                  className={clsx(
                    "inline-flex px-3 py-1 rounded-full text-sm font-medium",
                    visibility.toUpperCase() === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-gray-100"
                  )}
                >
                  {capitalizeFirstLetter(visibility.toLowerCase())}
                </div>
                <VisibilityButton />
              </div>
            </div>
          </div>
        </div>
      </div>
      <BasicDetailsOverlay data={{ id, pricing, mainImage, products }} />
      <VisibilityOverlay data={{ id, visibility }} />
    </>
  );
}
