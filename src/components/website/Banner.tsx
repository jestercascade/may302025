import Image from "next/image";
import Link from "next/link";

export function Banner({ collection }: { collection: CollectionType }) {
  return (
    <div>
      <Link href={`/collection/${collection.slug}-${collection.id}`}>
        <div className="w-full rounded-2xl p-[10px] ease-in-out duration-300 transition hover:shadow-[0px_0px_4px_rgba(0,0,0,0.35)]">
          <div className="w-full flex items-center justify-center rounded-xl overflow-hidden">
            <div className="block md:hidden w-full aspect-square">
              {collection.bannerImages?.mobileImage && (
                <Image
                  src={collection.bannerImages.mobileImage}
                  alt={collection.title}
                  width={1000}
                  height={1000}
                  priority
                />
              )}
            </div>
            <div className="hidden md:block w-full max-h-[340px]">
              {collection.bannerImages?.desktopImage && (
                <Image
                  src={collection.bannerImages.desktopImage}
                  alt={collection.title}
                  width={948}
                  height={250}
                  priority
                />
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
