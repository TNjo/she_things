const items = [
  { t: "Won't turn green", d: "Anti-tarnish coating. Shower-proof, sweat-proof, Colombo-humidity-proof.", bg: "bg-lime" },
  { t: "Sensitive-ear safe", d: "Nickel-free, hypoallergenic posts. Promise.", bg: "bg-butter" },
  { t: "Changed your mind?", d: "7-day exchanges on unworn pieces, seal on.", bg: "bg-blush" },
  { t: "Gift-wrapped by hand", d: "Add a note & we'll actually write it by hand.", bg: "bg-sage" },
];

export default function Promises() {
  return (
    <section className="mx-auto mt-24 max-w-[1400px] px-4 md:px-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((i, k) => (
          <div key={i.t} className={`rounded-[28px] p-6 md:p-7 ${i.bg} ${k % 2 ? "lg:rotate-1" : "lg:-rotate-1"}`}>
            <p className="font-display text-3xl uppercase leading-none">{i.t}</p>
            <p className="mt-3 text-[15px]">{i.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
