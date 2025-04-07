"use server";

import { adminDb } from "@/lib/firebase/admin";

/**
 * Retrieve the discovery products settings.
 *
 * @example Get the discovery products settings
 * const discoveryProductsSettings = await getDiscoveryProductsSettings();
 *
 * @returns {Promise<DiscoveryProductsSettingsType>} The settings object containing visibility flags for different pages.
 */
export async function getDiscoveryProductsSettings(): Promise<DiscoveryProductsSettingsType> {
  const documentRef = adminDb.collection("discoveryProducts").doc("default");

  const snapshot = await documentRef.get();

  const defaultSettings: Omit<DiscoveryProductsSettingsType, "id"> = {
    visibleOnPages: {
      cart: false,
      home: false,
    },
  };

  if (!snapshot.exists) {
    await documentRef.set(defaultSettings);
    return { id: documentRef.id, ...defaultSettings };
  }

  const data = snapshot.data();
  if (!data) {
    return { id: snapshot.id, ...defaultSettings };
  }

  const discoveryProductsSettings: DiscoveryProductsSettingsType = {
    id: snapshot.id,
    visibleOnPages: data.visibleOnPages || defaultSettings.visibleOnPages,
  };

  return discoveryProductsSettings;
}

// -- Type Definitions --
type DiscoveryProductsSettingsType = {
  id: string;
  visibleOnPages: {
    cart: boolean;
    home: boolean;
    [key: string]: boolean;
  };
};
