import { getUpsells } from "@/actions/get/upsells";
import { NewUpsellOverlay } from "@/components/admin/NewUpsellOverlay";
import UpsellGrid from "@/components/admin/UpsellGrid";

export default async function Upsells() {
  const upsells = await getUpsells();

  return (
    <>
      <UpsellGrid upsells={upsells} />
      <NewUpsellOverlay />
    </>
  );
}
