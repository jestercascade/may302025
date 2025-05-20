import type { MetadataRoute } from "next";
import { getProducts } from "@/actions/get/products";
import { getCollections } from "@/actions/get/collections";

const BASE_URL = "https://cherlygood.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections] = await Promise.all([
    getProducts({
      fields: ["slug", "id", "updatedAt"],
      visibility: "PUBLISHED",
    }),
    getCollections({
      fields: ["slug", "id", "updatedAt"],
      visibility: "PUBLISHED",
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/new-arrivals`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about-us`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact-us`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/track`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/returns-and-refunds`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/terms-of-use`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Collection pages (e.g., /collections/black-friday-sale-52029)
  const collectionPages: MetadataRoute.Sitemap = collections
    ? collections.map((collection: CollectionType) => ({
        url: `${BASE_URL}/collections/${collection.slug}-${collection.id}`,
        lastModified: new Date(collection.updatedAt || new Date()).toISOString(),
        changeFrequency: "weekly",
        priority: 0.6,
      }))
    : [];

  // Product pages (e.g., /long-denim-skirt-70465)
  const productPages: MetadataRoute.Sitemap = products
    ? products.map((product: ProductType | ProductWithUpsellType) => ({
        url: `${BASE_URL}/${product.slug}-${product.id}`,
        lastModified: new Date(product.updatedAt || new Date()).toISOString(),
        changeFrequency: "weekly",
        priority: 0.5,
      }))
    : [];

  // Combine all routes into a single sitemap
  return [...staticPages, ...collectionPages, ...productPages];
}
