import { getCart } from "@/actions/get/carts";
import { getProducts } from "@/actions/get/products";
import { CatalogEmptyState } from "@/components/website/CatalogEmptyState";
import { Pagination } from "@/components/website/Pagination";
import { ProductCard } from "@/components/website/ProductCard";
import { UpsellReviewOverlay } from "@/components/website/UpsellReviewOverlay";
import { cookies } from "next/headers";

export default async function NewArrivals({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page = "1" } = await searchParams;
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

  const [cart, allProducts] = await Promise.all([
    getCart(deviceIdentifier),
    getProducts({ fields: productFields }),
  ]);

  const productsArray = (allProducts as ProductWithUpsellType[]) || [];
  const itemsPerPage = 2;
  const totalPages = Math.ceil(productsArray.length / itemsPerPage);
  const currentPageAdjusted = Math.max(1, Math.min(currentPage, totalPages));
  const startIndex = (currentPageAdjusted - 1) * itemsPerPage;
  const products = productsArray.slice(startIndex, startIndex + itemsPerPage);

  if (!products.length) {
    return <CatalogEmptyState />;
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-5 pt-8">
        <div className="select-none w-full flex flex-wrap gap-2 md:gap-0">
          {products.map((product, index) => (
            <ProductCard
              key={product.id || index}
              product={product}
              cart={cart}
            />
          ))}
        </div>
        <Pagination currentPage={currentPageAdjusted} totalPages={totalPages} />
      </div>
      <UpsellReviewOverlay cart={cart} />
    </>
  );
}
