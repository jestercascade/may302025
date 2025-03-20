import { getCart } from "@/actions/get/carts";
import { getCollections } from "@/actions/get/collections";
import { CatalogEmptyState } from "@/components/website/CatalogEmptyState";
import { Pagination } from "@/components/website/Pagination";
import { ProductCard } from "@/components/website/ProductCard";
import { UpsellReviewOverlay } from "@/components/website/UpsellReviewOverlay";
import { cookies } from "next/headers";
import { Metadata } from "next";
import { cache } from "react";
import { redirect } from "next/navigation";

const cachedGetCollections = cache(getCollections);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collectionId = slug.split("-").pop();

  const collections = await cachedGetCollections({
    ids: [collectionId as string],
    includeProducts: false,
    fields: ["title"],
  });
  const [collection] = collections || [];

  return {
    title: collection.title,
    description:
      "Make your style the one everyone's screenshotting—clothes, aesthetic finds, and zero regrets. Shop now!",
    alternates: {
      canonical: `/collections/${slug}-${collectionId}`,
    },
  };
}

export default async function Collections({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ slug }, { page = "1" }] = await Promise.all([params, searchParams]);
  const currentPage = Number(page) || 1;

  const cookieStore = await cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value || "";

  const productFields: (keyof ProductType)[] = [
    "id",
    "name",
    "slug",
    "description",
    "pricing",
    "images",
    "options",
    "upsell",
    "highlights",
  ];

  const collectionId = slug.split("-").pop() as string;

  const [cart, collections] = await Promise.all([
    getCart(deviceIdentifier),
    cachedGetCollections({
      ids: [collectionId],
      includeProducts: true,
      fields: productFields,
    }),
  ]);

  const [collection] = collections || [];

  if (!collection || !collection.products || collection.products.length === 0) {
    redirect("/");
  }

  const productsArray = collection.products;
  const itemsPerPage = 52;
  const totalPages = Math.ceil(productsArray.length / itemsPerPage);
  const currentPageAdjusted = Math.max(1, Math.min(currentPage, totalPages));
  const startIndex = (currentPageAdjusted - 1) * itemsPerPage;
  const products = productsArray.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <div className="max-w-5xl mx-auto px-5 pt-8">
        <div>
          <h2 className="md:w-[calc(100%-20px)] mx-auto mb-4 font-semibold line-clamp-3 md:text-xl">
            {collection.title}
          </h2>
          <div className="select-none w-full flex flex-wrap gap-2 md:gap-0">
            {products.map((product, index) => (
              <ProductCard
                key={product.id || index}
                product={product as ProductWithUpsellType & { index: number }}
                cart={cart}
              />
            ))}
          </div>
        </div>
        <Pagination currentPage={currentPageAdjusted} totalPages={totalPages} />
      </div>
      <UpsellReviewOverlay cart={cart} />
    </>
  );
}
