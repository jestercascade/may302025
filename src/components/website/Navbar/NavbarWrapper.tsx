import { cookies } from "next/headers";
import Navbar from ".";
import { getCart } from "@/actions/get/carts";
import { getCategories } from "@/actions/get/categories";
import { MobileNavbarOverlay } from "./MobileNavbarOverlay";

export async function NavbarWrapper() {
  const cookieStore = await cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value;

  const [cart, categoriesData] = await Promise.all([
    getCart(deviceIdentifier),
    getCategories({ visibility: "VISIBLE" }),
  ]);

  return (
    <>
      <Navbar
        itemsInCart={cart ? cart.items.length : 0}
        categoriesData={categoriesData}
      />
      <MobileNavbarOverlay categoriesData={categoriesData} />
    </>
  );
}
