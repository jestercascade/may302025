"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";

type ImageCarouselType = {
  images: {
    main: string;
    gallery: string[];
  };
  productName: string;
};

export function MobileImageCarousel({
  images,
  productName,
}: ImageCarouselType) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: false,
  });

  const productImages = Array.from(
    new Set([images.main, ...(images.gallery ?? [])])
  );

  const updateIndex = useCallback((emblaApi: EmblaCarouselType) => {
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", updateIndex);
    emblaApi.on("reInit", updateIndex);

    return () => {
      emblaApi.off("select", updateIndex);
      emblaApi.off("reInit", updateIndex);
    };
  }, [emblaApi, updateIndex]);

  // If there's only one image, render it without the carousel
  if (productImages.length === 1) {
    return (
      <div className="relative select-none">
        <div className="w-full aspect-square flex items-center justify-center overflow-hidden">
          <Image
            src={productImages[0]}
            alt={`${productName} - 1`}
            width={768}
            height={768}
            priority={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative select-none">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {productImages.map((image, index) => (
            <div className="flex-[0_0_100%] min-w-0" key={index}>
              <div className="w-full aspect-square flex items-center justify-center overflow-hidden">
                <Image
                  src={image}
                  alt={`${productName} - ${index + 1}`}
                  width={768}
                  height={768}
                  priority={index === 0}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {productImages.length > 1 && (
        <div className="flex items-center justify-center absolute bottom-5 right-[14px] bg-black/80 text-sm text-white px-3 h-6 rounded-full transition duration-300 ease-in-out">
          {currentIndex + 1}/{productImages.length}
        </div>
      )}
    </div>
  );
}
