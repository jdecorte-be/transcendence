import type { ImgHTMLAttributes } from "react";
import { Logo } from "../Layout/Assets/Logo";

const spinnerSizes = {
  xs: "h-3.5 w-3.5 border-2",
  sm: "h-5 w-5 border-2",
  md: "h-7 w-7 border-[3px]",
  lg: "h-10 w-10 border-[3px]",
};

type SpinnerSize = keyof typeof spinnerSizes;

// Two-tone ring spinner in the brand color, replaces daisyUI's flat "loading-spinner".
export const Spinner = ({
  size = "md",
  className = "",
}: {
  size?: SpinnerSize;
  className?: string;
}) => (
  <span
    role="status"
    aria-label="Loading"
    className={`inline-block rounded-full border-primary/15 border-t-primary animate-spin ${spinnerSizes[size]} ${className}`}
  />
);

const dotSizes = { sm: "h-1.5 w-1.5", md: "h-2 w-2", lg: "h-2.5 w-2.5" };

// Three staggered bouncing dots, replaces daisyUI's "loading-dots".
export const Dots = ({
  size = "md",
  className = "",
}: {
  size?: keyof typeof dotSizes;
  className?: string;
}) => (
  <span
    role="status"
    aria-label="Loading"
    className={`inline-flex items-center gap-1.5 ${className}`}
  >
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className={`${dotSizes[size]} rounded-full bg-current animate-bounce`}
        style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
      />
    ))}
  </span>
);

// Shimmering placeholder background, shared by Skeleton and any <img> that loads over the network.
export const shimmerBg =
  "bg-base-300/70 bg-[linear-gradient(110deg,transparent,35%,rgba(255,255,255,0.12),50%,transparent,65%)] bg-[length:200%_100%] animate-shimmer";

// Shimmering placeholder block, replaces flat "animate-pulse" skeletons.
export const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`${shimmerBg} ${className}`} />
);

// Drop-in <img> that shows the shimmer through until the image paints, instead of a
// blank or broken box on slow/failed network avatar loads.
export const Img = ({
  alt,
  className = "",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) => (
  <img alt={alt} className={`${shimmerBg} ${className}`} {...props} />
);

// Full takeover loader for page-level waits: pulsing brand mark inside an orbiting ring.
export const PageLoading = () => (
  <div className="flex flex-col items-center gap-5">
    <div className="relative flex items-center justify-center pointer-events-none">
      <span className="absolute h-24 w-24 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      <Logo className="sm:w-14 w-14 animate-pulse-glow" />
    </div>
  </div>
);
