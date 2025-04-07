import { getCategories } from "@/actions/get/categories";
import { getCollections } from "@/actions/get/collections";
import { getDiscoveryProductsSettings } from "@/actions/get/discoveryProducts";
import { getPageHero } from "@/actions/get/pageHero";
import {
  CategoriesButton,
  CategoriesOverlay,
} from "@/components/admin/Storefront/CategoriesOverlay";
import CollectionTable from "@/components/admin/Storefront/CollectionTable";
import {
  DiscoveryProductsButton,
  DiscoveryProductsOverlay,
} from "@/components/admin/Storefront/DiscoveryProductsOverlay";
import { NewCollectionOverlay } from "@/components/admin/Storefront/NewCollectionOverlay";
import { PageHeroButton, PageHeroOverlay } from "@/components/admin/Storefront/PageHeroOverlay";

export default async function Storefront() {
  const [categoriesData, pageHero, discoveryProductsSettings, collections] = await Promise.all([
    getCategories(),
    getPageHero(),
    getDiscoveryProductsSettings(),
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
            <CategoriesButton showOnPublicSite={categoriesData?.showOnPublicSite} />
            <DiscoveryProductsButton />
          </div>
        </div>
        <CollectionTable collections={collections} />
      </div>
      <NewCollectionOverlay />
      <PageHeroOverlay pageHero={pageHero} />
      <CategoriesOverlay categoriesData={categoriesData} />
      <DiscoveryProductsOverlay discoveryProductsSettings={discoveryProductsSettings} />
    </>
  );
}
