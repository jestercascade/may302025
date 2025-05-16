import { cookies } from "next/headers";
import Navbar from ".";
import { getCart } from "@/actions/get/carts";

export async function NavbarWrapper() {
  const cookieStore = await cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value;
  const cart = await getCart(deviceIdentifier);

  return <Navbar itemsInCart={cart ? cart.items.length : 0} />;
}
