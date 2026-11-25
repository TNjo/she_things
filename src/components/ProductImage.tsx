import type { JewelArtSpec } from "@/lib/types";
import JewelArt from "./JewelArt";

/** Product photo when there is one; the drawn art only as a fallback. */
export default function ProductImage({ src, art, alt, sizes = "120px" }: { src?: string; art: JewelArtSpec; alt: string; sizes?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} sizes={sizes} loading="lazy" decoding="async" className="h-full w-full object-cover" />;
  }
  return <JewelArt art={art} title={alt} />;
}
