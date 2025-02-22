"use server";

import { adminDb } from "@/lib/firebase/admin"; 

/**
 * Retrieve the page hero data for the homepage.
 * 
 * @example Get the homepage hero
 * const pageHero = await getPageHero();
 *
 * @returns {Promise<PageHeroType>} The page hero object containing images, title, destination URL, and visibility.
 */
export async function getPageHero(): Promise<PageHeroType> {
  const documentRef = adminDb.collection("pageHero").doc("homepageHero"); 
  const snapshot = await documentRef.get();

  const defaultPageHero: Omit<PageHeroType, "id"> = {
    images: {
      desktop: "",
      mobile: "",
    },
    title: "",
    destinationUrl: "",
    visibility: "HIDDEN",
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
    images: data.images || defaultPageHero.images,
    title: data.title || defaultPageHero.title,
    destinationUrl: data.destinationUrl || defaultPageHero.destinationUrl,
    visibility: data.visibility || defaultPageHero.visibility,
  };

  return pageHeroData;
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
