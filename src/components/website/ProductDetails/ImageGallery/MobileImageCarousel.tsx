"use client";

import Image from "next/image";
import { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export function MobileImageCarousel({
  images,
  productName,
}: ImageCarouselType) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    afterChange: (current: number) => setCurrentIndex(current),
    arrows: false,
  };

  const productImages = Array.from(
    new Set([images.main, ...(images.gallery ?? [])])
  );

  return (
    <div className="relative select-none">
      {productImages.length > 1 ? (
        <Slider {...settings}>
          {productImages.map((image, index) => (
            <div
              className="w-full aspect-square flex items-center justify-center overflow-hidden"
              key={index}
            >
              <Image
                src={image}
                alt={`${productName} - ${index + 1}`}
                width={768}
                height={768}
                priority={true}
              />
            </div>
          ))}
        </Slider>
      ) : (
        <div className="w-full aspect-square flex items-center justify-center overflow-hidden">
          <Image
            src={productImages[0]}
            alt={`${productName} - 1`}
            width={768}
            height={768}
            priority={true}
          />
        </div>
      )}
      {productImages.length > 1 && (
        <div className="flex items-center justify-center absolute bottom-5 right-[14px] bg-black/80 text-sm text-white px-3 h-6 rounded-full transition duration-300 ease-in-out">
          {currentIndex + 1}/{productImages.length}
        </div>
      )}
    </div>
  );
}

// -- Type Definitions --

type ImageCarouselType = {
  images: {
    main: string;
    gallery: string[];
  };
  productName: string;
};
