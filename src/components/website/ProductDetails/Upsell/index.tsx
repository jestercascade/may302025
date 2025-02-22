import Image from "next/image";
import styles from "./styles.module.css";

export default function Upsell() {
  return (
    <div className="bg-white mt-6 select-none">
      <div
        className={`${styles.custom_border} pt-4 pb-5 px-6 flex flex-col gap-6 w-max sm:w-full`}
      >
        <div className="mx-auto flex flex-col md:flex-col sm:flex-row gap-6 sm:gap-4">
          <div className="text-center flex flex-col gap-2 items-center justify-center">
            <div className="*:text-xl *:md:text-2xl *:text-red *:font-extrabold *:italic *:[text-shadow:#707070_0px_1px_0px] *:leading-[26px] *:[word-spacing:2px] *:[letter-spacing:-1px]">
              <p>UPGRADE MY ORDER</p>
              <p>WITH THIS BEST-SELLING</p>
              <p>COMBO SET</p>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold leading-6 text-lg text-gray">
                $89.99 value
              </span>
              <span className="font-semibold leading-6 text-nowrap text-lg text-green">
                today it's yours for $37.99
              </span>
            </div>
          </div>
          <div className="w-full max-w-[280px] md:max-w-[280px] sm:max-w-[222px] aspect-square mx-auto flex items-center justify-center overflow-hidden rounded-xl bg-white">
            <Image
              src="https://i.pinimg.com/564x/ab/d7/1b/abd71b557fc77916f1570da50c0325a8.jpg"
              alt="Upgrade my order"
              width={1000}
              height={1000}
              priority
            />
          </div>
        </div>
        <button
          type="button"
          className="w-full h-12 rounded-md shadow2 bg-red text-white text-xl font-extrabold [text-shadow:#707070_0px_1px_0px] leading-[26px] [word-spacing:2px] [letter-spacing:-1px]"
        >
          YES, LET'S UPGRADE
        </button>
      </div>
    </div>
  );
}
