import Link from "next/link";
import JewelArt from "@/components/JewelArt";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper px-4 text-center">
      <div>
        <div className="mx-auto h-40 w-40 rotate-12"><JewelArt art={{ kind: "drop", metal: "gold", gem: "#BE185D" }} bare sway /></div>
        <p className="mt-4 font-hand text-[40px] text-cherry">404</p>
        <h1 className="text-5xl md:text-7xl">Lost an <i>earring?</i></h1>
        <p className="mx-auto mt-3 max-w-md text-cocoa">This page rolled under the sofa. Let&apos;s get you somewhere shinier.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn-ink">Home</Link>
          <Link href="/shop" className="btn-ghost">Shop</Link>
        </div>
      </div>
    </div>
  );
}
