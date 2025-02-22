import Image from "next/image";

export function CatalogEmptyState() {
  return (
    <div className="flex flex-col gap-4 items-center pt-16">
      <div>
        <Image
          src="/icons/package.svg"
          alt="Package Icon"
          width={80}
          height={80}
          priority={true}
        />
      </div>
      <div className="text-center">
        <h3 className="font-semibold mb-1">We're restocking!</h3>
        <p className="text-sm text-gray">Check back soon for fresh finds</p>
      </div>
    </div>
  );
}
