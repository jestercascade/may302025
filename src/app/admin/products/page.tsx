import { getProducts } from "@/actions/get/products";
import { NewProductOverlay } from "@/components/admin/NewProductOverlay";
import ProductGrid from "@/components/admin/ProductGrid";

export default async function Products() {
  const products = (await getProducts({
    fields: ["id", "name", "slug", "pricing", "images", "visibility"],
  })) as ProductType[];

  return (
    <>
      <ProductGrid products={products || []} />
      <NewProductOverlay />
    </>
  );
}
