import { getCart } from "@/actions/get/carts";
import { getProducts } from "@/actions/get/products";
import { CatalogEmptyState } from "@/components/website/CatalogEmptyState";
import { Pagination } from "@/components/website/Pagination";
import { ProductCard } from "@/components/website/ProductCard";
import { UpsellReviewOverlay } from "@/components/website/UpsellReviewOverlay";
import { capitalizeFirstLetter } from "@/lib/utils/common";
import { Metadata } from "next";
import { cookies } from "next/headers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const category = (await params).name.toLowerCase();
  const meta = categoryMetadata[category as keyof typeof categoryMetadata] || {
    title: "Cherlygood - Literally Stop, Stare, Then Buy It.",
    description:
      "Make your style the one everyone's screenshotting—clothes, aesthetic finds, and zero regrets. Shop now!",
  };

  return {
    title: meta.title,
    description: meta.description,
  };
}

export default async function Categories({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ name }, { page = "1" }] = await Promise.all([params, searchParams]);
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
    getProducts({
      category: name,
      fields: productFields,
      visibility: "PUBLISHED",
    }),
  ]);

  const productsArray = (allProducts as ProductWithUpsellType[]) || [];
  const itemsPerPage = 52;
  const totalPages = Math.ceil(productsArray.length / itemsPerPage);
  const currentPageAdjusted = Math.max(1, Math.min(currentPage, totalPages));
  const startIndex = (currentPageAdjusted - 1) * itemsPerPage;
  const products = productsArray.slice(startIndex, startIndex + itemsPerPage);

  const displayName = getDisplayName(name);

  if (!products.length) {
    return <CatalogEmptyState />;
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-5 pt-8">
        <div>
          <h2 className="md:w-[calc(100%-20px)] mx-auto mb-4 font-semibold line-clamp-3 md:text-xl">
            {displayName}
          </h2>
          <div className="select-none w-full flex flex-wrap gap-2 md:gap-0">
            {products.map((product, index) => (
              <ProductCard
                key={product.id || index}
                product={product}
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

const categoryMetadata = {
  dresses: {
    title: "Dresses That Make Leggings Jealous",
    description:
      "Slip-ons, smocked midis, ruched fits—leggings can’t compete with this much comfort or drama. Bonus: no waistband marks.",
  },
  tops: {
    title: "Tops That’ll Trend By Tomorrow",
    description:
      "Balletcore knits, cold-shoulder tees, tops designed to turn heads—no algorithm (or mirror) required.",
  },
  bottoms: {
    title: "Bottoms That Squeeze Right (No Drama)",
    description:
      "High-waisted denim, slouchy cargos, pleated trousers—for days when you want to eat and look expensive.",
  },
  outerwear: {
    title: "Coats That Look Hot When It's Not",
    description:
      "Puffer jackets, leather moto coats, teddy bear layers—stay warm without sacrificing your vibe. Winter who?",
  },
  shoes: {
    title: "Walk the Hype in Fresh Kicks",
    description:
      "Platform boots, strappy sandals, dad sneakers so crisp—your steps sound expensive. Walk the walk, then screenshot the scuffs.",
  },
  accessories: {
    title: "Trendy Accessories for Your IRL Glow-Up",
    description:
      "Chunky hoops, mini bags, hair clips so cute—even your messy bun becomes a main character.",
  },
  men: {
    title: "Men’s Drip That Holds Weight",
    description:
      "Sneakers that pop, multi-tools that fix anything. Your boys’ll hype it, no cap.",
  },
  "catch-all": {
    title: "The Stuff Your Feed’s Obsessed With",
    description:
      "Viral tumblers, sunset lamps, retro phone charms—this is where your screenshots come to life. Add to cart, already.",
  },
};

function getDisplayName(category: string): string {
  switch (category.toLowerCase()) {
    case "men":
      return "Shop Men";
    case "catch-all":
      return "Catch-All";
    default:
      return `Women's ${capitalizeFirstLetter(category)}`;
  }
}
