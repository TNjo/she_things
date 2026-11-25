import clsx from "clsx";
import { photoUrl, type StockPhoto } from "@/lib/photos";

interface Props {
  photo: StockPhoto;
  /** width / height of the rendered box, e.g. 4/5. Reserves space → no layout shift */
  aspect: number;
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}

const WIDTHS = [360, 540, 720, 960, 1280, 1600];

/** Responsive, auto-AVIF/WebP, lazy by default, CLS-safe photo */
export default function Photo({ photo, aspect, sizes, className, imgClassName, priority }: Props) {
  return (
    <div className={clsx("relative overflow-hidden bg-blush/40", className)} style={{ aspectRatio: aspect }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoUrl(photo, 960, aspect)}
        srcSet={WIDTHS.map((w) => `${photoUrl(photo, w, aspect)} ${w}w`).join(", ")}
        sizes={sizes}
        alt={photo.alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={clsx("absolute inset-0 h-full w-full object-cover", imgClassName)}
      />
    </div>
  );
}
