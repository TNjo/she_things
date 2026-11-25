import Photo from "../Photo";
import { PHOTOS, photoUrl } from "@/lib/photos";

// Sample messages – replace with real customer DMs/reviews (with permission) before launch.
const dms = [
  { name: "dinithi.k", photo: PHOTOS.pearlDrop, text: "wore the lola hoops to my cousin's wedding and 3 aunties asked where i got them 😭😭", reply: "aiyo stop, the aunty seal of approval 🫶" },
  { name: "amaya__", photo: PHOTOS.whiteShirt, text: "2 months, haven't taken the huggies off once. no green ears no itch. witchcraft??", reply: "anti-tarnish magic ✨ glad u love them!!" },
  { name: "nethmiii", photo: PHOTOS.marbleHoop, text: "the packaging + the handwritten note… i'm ordering again just for another box ngl", reply: "hehe we'll write you a longer one next time 💌" },
];

const styled = [PHOTOS.heroHuggie, PHOTOS.pearlDrop, PHOTOS.colourHoop, PHOTOS.whiteShirt, PHOTOS.marbleHoop, PHOTOS.heroPearl];

export default function FridgeNotes() {
  return (
    <section className="mt-24 md:mt-32">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-6xl md:text-8xl">Our DMs <i>rn</i></h2>
          <p className="font-hand text-[32px] text-cherry">the kind of DMs we live for</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {dms.map((d, i) => (
            <div key={d.name} className={`rounded-[32px] border-2 border-ink/10 bg-white p-5 ${i === 1 ? "md:mt-10 md:rotate-1" : "md:-rotate-1"}`}>
              <div className="flex items-center gap-3 border-b border-ink/10 pb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl(d.photo, 96, 1)} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-pink ring-offset-2" />
                <div className="leading-tight">
                  <p className="text-sm font-bold">{d.name}</p>
                  <p className="text-xs text-cocoa">Active now</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-[15px]">
                <p className="max-w-[85%] rounded-[22px] rounded-bl-md bg-paper px-4 py-2.5">{d.text}</p>
                <p className="ml-auto max-w-[80%] rounded-[22px] rounded-br-md bg-cobalt px-4 py-2.5 text-white">{d.reply}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* styled-by-you strip */}
      <div className="mt-24 bg-pink py-10">
        <p className="text-center font-display text-5xl uppercase md:text-7xl">#SheThingsGirl</p>
        <p className="mt-1 text-center font-hand text-[30px]">tag us &amp; get featured here bestie</p>
        <div className="mt-8 overflow-hidden">
          <div className="flex w-max animate-marquee gap-4 hover:[animation-play-state:paused]">
            {[...styled, ...styled].map((p, i) => (
              <div key={i} className={`w-44 shrink-0 bg-white p-2 md:w-56 ${i % 2 ? "rotate-2" : "-rotate-2"}`}>
                <Photo photo={p} aspect={1} sizes="224px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
