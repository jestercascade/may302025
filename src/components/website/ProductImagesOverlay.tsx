import React, { useMemo } from "react";
import Image from "next/image";
import { CloseIconThin } from "@/icons";

export function ProductImagesOverlay({
  product,
  onClose,
}: ProductImagesOverlayType) {
  const allImages = useMemo(() => {
    const primaryImages: ProductImage[] = [
      { src: product.images.main, alt: product.name },
      ...product.images.gallery.map((src) => ({ src, alt: product.name })),
    ];

    const colorImages: ProductImage[] = product.options.colors
      .filter((color) => color.image !== product.images.main)
      .map((color) => ({
        src: color.image,
        alt: color.name,
      }));

    return [...primaryImages, ...colorImages];
  }, [
    product.name,
    product.images.main,
    product.images.gallery,
    product.options.colors,
  ]);

  return (
    <div className="flex justify-center w-full h-dvh min-[580px]:py-16 min-[580px]:px-5 z-40 fixed top-0 bottom-0 left-0 right-0 bg-black/15">
      <div className="absolute bottom-0 top-16 min-[580px]:relative min-[580px]:top-auto min-[580px]:bottom-auto min-[580px]:h-full max-h-[764px] w-full max-w-[580px] mx-auto bg-white rounded-t-[20px] min-[580px]:rounded-xl flex flex-col">
        <div className="h-full pt-4 min-[580px]:pb-5 flex flex-col relative">
          <div className="pb-3 px-5">
            <p className="font-semibold text-sm text-center">{product.name}</p>
          </div>
          <div className="px-5 min-[580px]:pr-2 pb-28 min-[580px]:pb-0 max-[580px]:invisible-scrollbar min-[580px]:custom-scrollbar overflow-x-hidden overflow-y-auto">
            <div className="flex gap-2 flex-col">
              {allImages.map((image) => (
                <div
                  key={image.src}
                  className="w-full max-w-[580px] aspect-square overflow-hidden flex items-center justify-center mx-auto"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={580}
                    height={580}
                    priority={true}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full absolute top-[6px] right-[6px] flex items-center justify-center transition active:bg-lightgray lg:hover:bg-lightgray"
          aria-label="Close carousel"
        >
          <CloseIconThin size={24} className="stroke-gray" />
        </button>
      </div>
    </div>
  );
}

// -- Type Definitions --

type ProductImage = {
  src: string;
  alt: string;
};

type ProductImagesOverlayType = {
  product: {
    name: string;
    images: {
      main: string;
      gallery: string[];
    };
    options: {
      colors: Array<{
        name: string;
        image: string;
      }>;
    };
  };
  onClose: () => void;
};
