import { getCategories } from "@/actions/get/categories";
import { getCollections } from "@/actions/get/collections";
import { getPageHero } from "@/actions/get/pageHero";
import {
  CategoriesButton,
  CategoriesOverlay,
} from "@/components/admin/Storefront/CategoriesOverlay";
import CollectionTable from "@/components/admin/Storefront/CollectionTable";
import { NewCollectionOverlay } from "@/components/admin/Storefront/NewCollectionOverlay";
import {
  PageHeroButton,
  PageHeroOverlay,
} from "@/components/admin/Storefront/PageHeroOverlay";
import clsx from "clsx";

export default async function Storefront() {
  const [categoriesData, pageHero, collections] = await Promise.all([
    getCategories(),
    getPageHero(),
    getCollections({
      fields: ["title", "slug", "products", "campaignDuration"],
    }) as Promise<CollectionType[]>,
  ]);

  return (
    <>
      <div className="flex flex-col gap-10 w-full max-w-[1016px] mx-auto px-5 min-[1068px]:p-0">
        <div>
          <h2 className="font-semibold text-lg mb-5">Elements</h2>
          <div className="w-full flex flex-wrap gap-2">
            <PageHeroButton visibility={pageHero.visibility} />
            <CategoriesButton
              showOnPublicSite={categoriesData?.showOnPublicSite}
            />
            <button className="flex flex-col items-start w-full min-[560px]:w-[calc(100%/2-4px)] min-[824px]:w-64 rounded-xl p-5 relative cursor-pointer border transition bg-white active:border-[#b9bfc9] lg:hover:border-[#b9bfc9]">
              <div className="w-full mb-4 flex items-center justify-between relative">
                <h2 className="text-left font-semibold text-sm">Shop now</h2>
                <div
                  className={clsx(
                    "relative w-10 h-5 rounded-full ease-in-out duration-200",
                    {
                      "bg-white border": true,
                      "bg-blue border border-blue": false,
                    }
                  )}
                >
                  <div
                    className={clsx(
                      "w-[10px] h-[10px] rounded-full ease-in-out duration-300 absolute [top:50%] [transform:translateY(-50%)]",
                      {
                        "left-[5px] bg-black": true,
                        "left-[23px] bg-white": false,
                      }
                    )}
                  ></div>
                </div>
              </div>
              <p className="w-52 text-left text-gray text-xs leading-[18px]">
                This is a treasure hunt - a mix of products from all categories.
                Users scroll, and the surprises roll in.
              </p>
            </button>
          </div>
        </div>
        <CollectionTable collections={collections} />
      </div>
      <NewCollectionOverlay />
      <PageHeroOverlay pageHero={pageHero} />
      <CategoriesOverlay categoriesData={categoriesData} />
    </>
  );
}
