"use server";
import { adminDb } from "@/lib/firebase/admin";

/**
 * Retrieve the page hero data for the homepage.
 *
 * @example Get the homepage hero
 * const pageHero = await getPageHero();
 *
 * @returns {Promise<PageHeroType>} The page hero object containing all hero data and settings.
 */
export async function getPageHero(): Promise<PageHeroType> {
  const documentRef = adminDb.collection("pageHero").doc("homepageHero");
  const snapshot = await documentRef.get();

  const defaultPageHero: Omit<PageHeroType, "id"> = {
    overline: "",
    hook: "",
    sell: "",
    mainImage: {
      url: "",
      alt: "",
    },
    item_type: "PRODUCT",
    product_id: "",
    link_url: "",
    cta_text: "GET YOURS",
    background_color: "",
    text_color: "",
    visibility: "HIDDEN",
    updated_at: new Date().toISOString(),
  };

  if (!snapshot.exists) {
    await documentRef.set(defaultPageHero);
    return { id: documentRef.id, ...defaultPageHero };
  }

  const data = snapshot.data();
  if (!data) {
    return { id: snapshot.id, ...defaultPageHero };
  }

  const pageHeroData: PageHeroType = {
    id: snapshot.id,
    overline: data.overline || defaultPageHero.overline,
    hook: data.hook || defaultPageHero.hook,
    sell: data.sell || defaultPageHero.sell,
    mainImage: data.mainImage || defaultPageHero.mainImage,
    item_type: data.item_type || defaultPageHero.item_type,
    product_id: data.product_id || defaultPageHero.product_id,
    link_url: data.link_url || defaultPageHero.link_url,
    cta_text: data.cta_text || defaultPageHero.cta_text,
    background_color: data.background_color || defaultPageHero.background_color,
    text_color: data.text_color || defaultPageHero.text_color,
    visibility: data.visibility || defaultPageHero.visibility,
    updated_at: data.updated_at || defaultPageHero.updated_at,
  };

  return pageHeroData;
}

// -- Type Definitions --
type PageHeroType = {
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
  updated_at?: string;
};
