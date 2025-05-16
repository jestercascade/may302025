import { getUpsells } from "@/actions/get/upsells";
import { NewUpsellOverlay } from "@/components/admin/NewUpsellOverlay";
import UpsellGrid from "@/components/admin/UpsellGrid";

export default async function Upsells() {
  const upsells = await getUpsells();

  return (
    <>
      <UpsellGrid upsells={upsells} /* Type 'UpsellType[] | null' is not assignable to type 'UpsellType[] | null'. Two different types with this name exist, but they are unrelated.
  Type 'UpsellType[]' is not assignable to type 'UpsellType[]'. Two different types with this name exist, but they are unrelated.
    Type 'UpsellType' is not assignable to type 'UpsellType'. Two different types with this name exist, but they are unrelated.
      Types of property 'products' are incompatible.
        Type '{ index: number; id: string; slug: string; name: string; basePrice: number; images: { main: string; gallery: string[]; }; options: { colors: { name: string; image: string; }[]; sizes: { inches: { columns: { label: string; order: number; }[]; rows: { ...; }[]; }; centimeters: { ...; }; }; }; }[]' is not assignable to type '{ index: number; id: string; slug: string; name: string; basePrice: number; images: { main: string; gallery: string[]; }; options: ProductOptionsType; }[]'.
          Type '{ index: number; id: string; slug: string; name: string; basePrice: number; images: { main: string; gallery: string[]; }; options: { colors: { name: string; image: string; }[]; sizes: { inches: { columns: { label: string; order: number; }[]; rows: { ...; }[]; }; centimeters: { ...; }; }; }; }' is not assignable to type '{ index: number; id: string; slug: string; name: string; basePrice: number; images: { main: string; gallery: string[]; }; options: ProductOptionsType; }'.
            Types of property 'options' are incompatible.
              Type '{ colors: { name: string; image: string; }[]; sizes: { inches: { columns: { label: string; order: number; }[]; rows: { [key: string]: string; }[]; }; centimeters: { columns: { label: string; order: number; }[]; rows: { [key: string]: string; }[]; }; }; }' is missing the following properties from type 'ProductOptionsType': groups, configts(2719)
UpsellGrid.tsx(18, 51): The expected type comes from property 'upsells' which is declared here on type 'IntrinsicAttributes & { upsells: UpsellType[] | null; }'
(property) upsells: UpsellType[] | null */ />
      <NewUpsellOverlay />
    </>
  );
}
