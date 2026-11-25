export const metadata = { title: "Help" };

const sections = [
  { id: "delivery", title: "Delivery & exchanges", body: ["Island-wide delivery in 2–4 working days. Colombo orders placed before 12pm usually arrive next day.", "Delivery is Rs 350 in Colombo, Rs 400 in Gampaha and Rs 450 elsewhere – free over Rs 10,000.", "7-day exchanges on unworn pieces with the hygiene seal intact. For hygiene reasons earrings can't be refunded once worn.", "Received something damaged? WhatsApp us a photo within 48 hours and we'll replace it."] },
  { id: "payments", title: "Payments", body: ["Card payments are processed by PayHere – we never see or store your card number.", "Koko and Mintpay split your order into 3 interest-free payments.", "Bank transfer: use your order number as the reference and upload the slip on your order page within 48 hours.", "Cash on delivery is available for orders up to Rs 50,000.", "Card / Koko / Mintpay orders that aren't paid within 30 minutes are released automatically – nothing is charged."] },
  { id: "care", title: "Jewellery care", body: ["Last on, first off – put jewellery on after perfume and lotion.", "Wipe with a soft dry cloth and store each piece separately in its pouch.", "Our anti-tarnish coating handles daily wear, but avoid pools and the sea.", "Solid gold can be professionally cleaned and polished at any jeweller."] },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-10 md:px-8">
      <p className="font-hand text-[32px] text-cherry">good to know</p>
      <h1 className="text-6xl md:text-8xl">Help <i>desk</i></h1>
      <div className="mt-12 space-y-12">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-28">
            <h2 className="text-4xl italic">{s.title}</h2>
            <ul className="mt-4 space-y-3">
              {s.body.map((b) => <li key={b} className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cherry" />{b}</li>)}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
