import { getProducts } from "@/actions/get/products";
import { ProductCard } from "./ProductCard";

export async function DiscoveryProducts({
  heading = "Explore Your Interests",
  page,
  excludeIds = [],
  cart,
}: {
  heading?: string;
  page?: "HOME" | "CART";
  excludeIds?: string[];
  cart: CartType | null;
}) {
  const productfields = [
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

  const products = (await getProducts({
    fields: productfields,
  })) as ProductWithUpsellType[];

  const filteredProducts = products.filter((product) => {
    if (page === "HOME" || page === "CART") {
      return !excludeIds.includes(product.id);
    }
    return true;
  });

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 h-8 md:w-[calc(100%-20px)] md:mx-auto">
        <h2 className="font-semibold line-clamp-3 md:text-xl">{heading}</h2>
      </div>
      <div className="select-none w-full flex flex-wrap gap-2 md:gap-0">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} cart={cart} />
        ))}
      </div>
    </div>
  );
}
