import Photo from "../Photo";
import { PHOTOS } from "@/lib/photos";

export default function AuthShell({ title, sub, children }: { title: React.ReactNode; sub: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-2 md:items-center md:px-8">
      <div className="relative hidden md:block">
        <Photo photo={PHOTOS.whiteShirt} aspect={4 / 5} sizes="40vw" className="arch shadow-lift" />
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-5 py-2.5 font-display text-xl italic shadow-soft backdrop-blur">
          psst… members get early drops
        </p>
      </div>
      <div>
        <h1 className="text-5xl md:text-6xl">{title}</h1>
        <p className="mb-8 mt-2 text-cocoa">{sub}</p>
        {children}
      </div>
    </div>
  );
}
