"use client";

import { memo, useEffect, useState, useMemo } from "react";
import { useProductColorImageStore } from "@/zustand/website/productColorImageStore";
import styles from "./styles.module.css";
import Image from "next/image";

export function ImageGallery({ images, productName }: ProductImagesType) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { selectedColorImage, resetSelectedColorImage } =
    useProductColorImageStore();

  const productImages = useMemo(
    () => [images.main, ...(images.gallery ?? [])],
    [images.main, images.gallery]
  );

  useEffect(() => {
    resetSelectedColorImage();
  }, [resetSelectedColorImage]);

  const handleImageSelect = (index: number) => {
    if (index === currentImageIndex) return;
    setCurrentImageIndex(index);
    if (selectedColorImage) {
      resetSelectedColorImage();
    }
  };

  const displayedImage = selectedColorImage || productImages[currentImageIndex];

  return (
    <div className="select-none flex w-full">
      <div
        className={`${styles.customScrollbar} apply-scrollbar min-w-[62px] max-w-[62px] max-h-[380px] overflow-x-hidden overflow-y-visible flex flex-col gap-2 mr-2`}
      >
        {productImages.map((image, index) => (
          <ThumbnailImage
            key={image}
            image={image}
            productName={productName}
            onSelect={() => handleImageSelect(index)}
          />
        ))}
      </div>
      <div className="w-full relative rounded-3xl overflow-hidden bg-neutral-100 [box-shadow:0px_1.6px_3.6px_rgb(0,_0,_0,_0.4),_0px_0px_2.9px_rgb(0,_0,_0,_0.1)]">
        <Image
          src={displayedImage}
          alt={productName}
          width={500}
          height={0}
          sizes="(max-width: 500px) 100vw, 500px"
          priority
          style={{ width: "100%", height: "auto" }}
          className="block transition-opacity duration-200"
        />
      </div>
    </div>
  );
}

const ThumbnailImage = memo(function ThumbnailImage({
  image,
  productName,
  onSelect,
}: {
  image: string;
  productName: string;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      onMouseEnter={onSelect}
      className="w-[56px] h-[56px] relative min-h-[56px] min-w-[56px] rounded-md flex items-center justify-center overflow-hidden"
    >
      <div className="relative w-full h-full">
        <Image
          src={image}
          alt={productName}
          fill
          sizes="56px"
          className="object-cover"
          priority={false}
        />
      </div>
      <div className="w-full h-full rounded-md absolute top-0 bottom-0 left-0 right-0 ease-in-out duration-200 transition hover:bg-amber/30" />
    </button>
  );
});

type ProductImagesType = {
  images: {
    main: string;
    gallery: string[];
  };
  productName: string;
};
