import { forwardRef } from "react";

const Overlay = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  ({ children }, ref) => (
    <div
      ref={ref}
      className="overlay fixed w-full h-dvh top-0 bottom-0 left-0 right-0 z-40 transition bg-glass-black backdrop-blur-sm md:overflow-x-hidden md:overflow-y-visible md:custom-scrollbar"
    >
      {children}
    </div>
  )
);

export default Overlay;
