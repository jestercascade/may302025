"use client";

import { capitalizeFirstLetter } from "@/lib/utils/common";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { ComponentPropsWithRef, useCallback, useEffect, useState } from "react";
import { EmblaCarouselType } from "embla-carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Categories({
  categories,
}: {
  categories: Array<{
    index: number;
    name: string;
    image: string;
    visibility: "VISIBLE" | "HIDDEN";
  }>;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
  });

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  return (
    <div className="relative pt-5 w-full max-w-max mx-auto">
      <div
        className="embla relative select-none overflow-hidden w-full py-1 px-3 md:px-1 mx-auto"
        ref={emblaRef}
      >
        <div className="embla__container max-w-[464px] md:max-w-[582px] lg:max-w-[760px] flex cursor-context-menu">
          {categories.map(({ index, name, image }) => (
            <Link
              href={`/category/${name.toLowerCase()}`}
              key={index}
              className="embla__slide cursor-pointer mr-2 last:mr-0 flex flex-col gap-2 items-center rounded-xl p-[10px] ease-in-out duration-300 transition hover:shadow-[0px_0px_4px_rgba(0,0,0,0.35)]"
            >
              <div className="lg:hidden w-[90px] h-[90px] rounded-full shadow-[rgba(0,0,0,0.2)_0px_1px_3px_0px,_rgba(27,31,35,0.15)_0px_0px_0px_1px]">
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center z-10">
                  <Image
                    src={`/images/categories/${image}`}
                    alt={name}
                    width={90}
                    height={90}
                    priority={true}
                  />
                </div>
              </div>
              <div className="hidden lg:block w-[100px] h-[100px] rounded-full shadow-[rgba(0,0,0,0.2)_0px_1px_3px_0px,_rgba(27,31,35,0.15)_0px_0px_0px_1px]">
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center z-10">
                  <Image
                    src={`/images/categories/${image}`}
                    alt={name}
                    width={100}
                    height={100}
                    priority={true}
                  />
                </div>
              </div>
              <div className="text-xs font-medium">
                {capitalizeFirstLetter(name)}
              </div>
            </Link>
          ))}
        </div>
        <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
        <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
      </div>
    </div>
  );
}

// -- Logic & Utilities --

export const usePrevNextButtons = (
  emblaApi: EmblaCarouselType | undefined
): UsePrevNextButtonsType => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect).on("select", onSelect);
  }, [emblaApi, onSelect]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  };
};

// -- UI Components --

export const PrevButton: React.FC<PropType> = (props) => {
  const { children, ...restProps } = props;

  return (
    <button
      className="embla__button embla__button--prev disabled:hidden cursor-pointer w-9 h-9 rounded-full absolute left-4 top-[44px] bg-neutral-800 bg-opacity-60 backdrop-blur-sm flex items-center justify-center transition active:bg-opacity-85 lg:hover:bg-opacity-85"
      type="button"
      {...restProps}
    >
      <ChevronLeft color="#ffffff" strokeWidth={1.5} className="mr-[2px]" />
      {children}
    </button>
  );
};

export const NextButton: React.FC<PropType> = (props) => {
  const { children, ...restProps } = props;

  return (
    <button
      className="embla__button embla__button--next disabled:hidden cursor-pointer w-9 h-9 rounded-full absolute right-4 top-[44px] bg-neutral-800 bg-opacity-60 backdrop-blur-sm flex items-center justify-center transition active:bg-opacity-85 lg:hover:bg-opacity-85"
      type="button"
      {...restProps}
    >
      <ChevronRight color="#ffffff" strokeWidth={1.5} className="ml-[2px]" />
      {children}
    </button>
  );
};

// -- Type Definitions --

type UsePrevNextButtonsType = {
  prevBtnDisabled: boolean;
  nextBtnDisabled: boolean;
  onPrevButtonClick: () => void;
  onNextButtonClick: () => void;
};

type PropType = ComponentPropsWithRef<"button">;
