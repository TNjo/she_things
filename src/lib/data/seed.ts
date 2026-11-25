import type { Coupon, Product, Review } from "../types";

const now = new Date().toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

type Seed = Omit<Product, "id" | "createdAt" | "updatedAt" | "images" | "active" | "lowStockThreshold" | "sku"> &
  Partial<Pick<Product, "lowStockThreshold">>;

const seeds: Seed[] = [
  // ---------------- EARRINGS (the heart of the shop) ----------------
  { slug: "lola-chunky-hoops", name: "Lola Chunky Hoops", tagline: "The hoop your mum wants to borrow", description: "Puffy, hollow-cast hoops that look heavy but weigh barely anything. Hinge snap closure so they stay put from brunch to the last song.", category: "earrings", material: "gold-plated", vibes: ["bold", "y2k"], price: 3450, stock: 24, art: { kind: "hoop", metal: "gold", bg: "#F8E6EA" }, earSpots: ["lobe"], isBestseller: true, antiTarnish: true, hypoallergenic: true, rating: 4.8, reviewCount: 212 },
  { slug: "tiny-promise-huggies", name: "Tiny Promise Huggies", tagline: "Sleep in them. Shower in them.", description: "Small huggies in solid 18k-plated sterling silver that sit close to the lobe. Your forever pair.", category: "earrings", material: "sterling-silver", vibes: ["minimal"], price: 2650, stock: 40, art: { kind: "huggie", metal: "gold", bg: "#F3E6CC" }, earSpots: ["lobe", "upper-lobe", "helix"], isBestseller: true, hypoallergenic: true, antiTarnish: true, rating: 4.9, reviewCount: 341 },
  { slug: "pearl-gossip-drops", name: "Pearl Gossip Drops", tagline: "Freshwater pearl, zero rules", description: "Irregular freshwater pearls swing from a fine gold-plated hook. Each pearl is slightly different, which is the whole point.", category: "earrings", material: "pearl", vibes: ["romantic", "vintage"], price: 3950, stock: 15, art: { kind: "pearl-drop", metal: "gold", gem: "#F4EEE6", bg: "#DDE3D3" }, earSpots: ["lobe"], isNew: true, rating: 4.7, reviewCount: 88 },
  { slug: "cherry-pop-studs", name: "Ruby Rani Drops", tagline: "Wedding-season main character", description: "Ruby-red stones framed in tiny crystals, dropping from a crystal stud. Made for weddings, homecomings and every aunty's compliments.", category: "earrings", material: "silver", vibes: ["y2k", "bold"], price: 1850, stock: 6, art: { kind: "heart", metal: "silver", gem: "#BE185D", bg: "#F3D3DC" }, earSpots: ["lobe", "upper-lobe"], isNew: true, rating: 4.6, reviewCount: 54 },
  { slug: "moonlit-star-climbers", name: "Moonlit Star Climbers", tagline: "Climbs your ear like a little constellation", description: "A trail of micro stars set with clear zirconia that climbs up from the lobe. One size, no extra piercing.", category: "earrings", material: "gold-plated", vibes: ["romantic", "minimal"], price: 2950, stock: 18, art: { kind: "star", metal: "gold", gem: "#FFFFFF", bg: "#1C1917" }, earSpots: ["lobe", "upper-lobe"], rating: 4.8, reviewCount: 120 },
  { slug: "nadee-jhumka", name: "Nadee Mini Jhumka", tagline: "Grandmother's jhumka, made for everyday", description: "A miniature temple-bell jhumka with tiny bead fringe that rings softly when you laugh. Oxidised silver for that heirloom look.", category: "earrings", material: "silver", vibes: ["vintage", "boho"], price: 3250, stock: 12, art: { kind: "chandelier", metal: "silver", gem: "#BE185D", bg: "#F3E6CC" }, earSpots: ["lobe"], isBestseller: true, rating: 4.9, reviewCount: 177 },
  { slug: "solid-gold-dot-studs", name: "Real Gold Crush Studs", tagline: "22k solid gold. Hammered. Forever.", description: "Hand-hammered 22k solid gold studs on screw-backs. The quiet luxury of a stud you never have to take off.", category: "earrings", material: "gold", vibes: ["minimal"], price: 18500, stock: 5, lowStockThreshold: 2, art: { kind: "stud", metal: "gold", bg: "#F5EFE9" }, earSpots: ["lobe", "upper-lobe", "helix", "tragus"], hypoallergenic: true, rating: 5, reviewCount: 39 },
  { slug: "daisy-chain-drops", name: "Daisy Chain Drops", tagline: "A whole summer on your ears", description: "Little enamel daisies dangle from a delicate chain. Light enough to forget you're wearing them.", category: "earrings", material: "gold-plated", vibes: ["boho", "romantic"], price: 2450, stock: 21, art: { kind: "flower", metal: "gold", gem: "#FFFFFF", bg: "#DDE3D3" }, earSpots: ["lobe"], rating: 4.5, reviewCount: 63 },
  { slug: "rebel-ear-cuff", name: "Rebel Ear Cuff", tagline: "No piercing? No problem.", description: "Double-band cuff that slides onto the conch. Gives the stacked look without the commitment.", category: "earrings", material: "sterling-silver", vibes: ["bold", "minimal"], price: 1950, stock: 30, art: { kind: "cuff", metal: "silver", bg: "#F8E6EA" }, earSpots: ["conch", "helix"], isNew: true, rating: 4.6, reviewCount: 92 },
  { slug: "rose-teardrop-gems", name: "Pink Petal Studs", tagline: "For the 'is that real?' moment", description: "Enamel pink petals with crystal centres. Sweet, a little bit Y2K, and impossible not to compliment.", category: "earrings", material: "rose-gold", vibes: ["romantic"], price: 3650, compareAt: 4500, stock: 9, art: { kind: "drop", metal: "rose", gem: "#E8A0A8", bg: "#F5EFE9" }, earSpots: ["lobe"], rating: 4.7, reviewCount: 71 },
  { slug: "midnight-sapphire-drops", name: "Silver Bloom Drops", tagline: "A little bouquet for each ear", description: "Sterling silver flower drops set with sparkling stones. Vintage-feeling, light enough for all-day wear.", category: "earrings", material: "sterling-silver", vibes: ["vintage", "romantic"], price: 5450, stock: 7, art: { kind: "drop", metal: "silver", gem: "#1F3A8A", bg: "#F3E6CC" }, earSpots: ["lobe"], isNew: true, rating: 4.9, reviewCount: 28 },
  { slug: "tragus-spark-stud", name: "Rosé Dome Huggies", tagline: "Soft, shiny, goes with everything", description: "Puffy rose-gold domes that hug the lobe. The pair you reach for every single morning.", category: "earrings", material: "silver", vibes: ["minimal"], price: 1450, stock: 50, art: { kind: "stud", metal: "silver", gem: "#E9F1FF", bg: "#DDE3D3" }, earSpots: ["lobe", "upper-lobe"], hypoallergenic: true, rating: 4.6, reviewCount: 140 },
  { slug: "hello-sunshine-hoops", name: "Hello Sunshine Hoops", tagline: "Thin, light, endlessly stackable", description: "Feather-light 1.5mm hoops. Wear two sizes together and suddenly you have a look.", category: "earrings", material: "gold-plated", vibes: ["minimal", "boho"], price: 1750, stock: 0, art: { kind: "hoop", metal: "gold", bg: "#F3D3DC" }, earSpots: ["lobe", "upper-lobe", "helix"], antiTarnish: true, rating: 4.4, reviewCount: 66 },
  { slug: "butterfly-crush-studs", name: "Butterfly Crush", tagline: "Pure 2003 energy", description: "Pavé butterfly studs with wings that sit slightly raised so they look like they just landed.", category: "earrings", material: "silver", vibes: ["y2k", "romantic"], price: 2150, stock: 14, art: { kind: "flower", metal: "silver", gem: "#C9B6F2", bg: "#F8E6EA" }, earSpots: ["lobe", "upper-lobe"], rating: 4.5, reviewCount: 47 },
  // ---------------- NECKLACES ----------------
  { slug: "initial-love-pendant", name: "Initial Love Pendant", tagline: "Your letter, or theirs", description: "A dainty disc pendant on an adjustable 16–18 inch chain. Ask us on WhatsApp for your letter.", category: "necklaces", material: "gold-plated", vibes: ["minimal", "romantic"], price: 2850, stock: 33, art: { kind: "pendant", metal: "gold", bg: "#F3E6CC" }, antiTarnish: true, rating: 4.8, reviewCount: 156 },
  { slug: "pearl-girl-choker", name: "Pearl Girl Choker", tagline: "Freshwater pearls, hand-knotted", description: "A string of freshwater pearls hand-knotted in Colombo, finished with a gold toggle.", category: "necklaces", material: "pearl", vibes: ["vintage", "romantic"], price: 5950, stock: 8, art: { kind: "chain", metal: "gold", gem: "#F4EEE6", bg: "#F8E6EA" }, isBestseller: true, rating: 4.9, reviewCount: 98 },
  { slug: "solid-gold-snake-chain", name: "22k Snake Chain", tagline: "Real gold. An investment, honestly.", description: "Solid 22k gold snake chain, 18 inches. Lies flat and catches light like liquid.", category: "necklaces", material: "gold", vibes: ["minimal", "bold"], price: 64500, stock: 3, lowStockThreshold: 1, art: { kind: "chain", metal: "gold", bg: "#1C1917" }, rating: 5, reviewCount: 12 },
  // ---------------- RINGS ----------------
  { slug: "stackable-twist-ring", name: "Twist & Stack Ring", tagline: "Buy three. Trust us.", description: "A slim twisted band that's made to be stacked. Adjustable fit.", category: "rings", material: "sterling-silver", vibes: ["minimal"], price: 1650, stock: 45, art: { kind: "ring", metal: "silver", bg: "#F3D3DC" }, hypoallergenic: true, rating: 4.6, reviewCount: 203 },
  { slug: "cocktail-candy-ring", name: "Candy Cocktail Ring", tagline: "Main-character ring", description: "A chunky gold-plated band with an oversized cherry-red stone. Not for the shy.", category: "rings", material: "gold-plated", vibes: ["bold", "y2k"], price: 2750, stock: 11, art: { kind: "ring", metal: "gold", gem: "#BE185D", bg: "#DDE3D3" }, isNew: true, rating: 4.7, reviewCount: 34 },
  // ---------------- BRACELETS & ANKLETS ----------------
  { slug: "sunday-bangle", name: "Sunday Bangle", tagline: "Thin gold, all week long", description: "A slim open bangle with a soft hammered texture. Stack with your watch.", category: "bracelets", material: "gold-plated", vibes: ["minimal", "boho"], price: 2250, stock: 19, art: { kind: "bangle", metal: "gold", bg: "#F8E6EA" }, rating: 4.5, reviewCount: 58 },
  { slug: "beach-bell-anklet", name: "Beach Bell Anklet", tagline: "Hear her before you see her", description: "A delicate silver anklet with tiny bells. Hikkaduwa in a jewellery box.", category: "anklets", material: "silver", vibes: ["boho"], price: 1550, stock: 27, art: { kind: "anklet", metal: "silver", bg: "#F3E6CC" }, rating: 4.6, reviewCount: 81 },
  // ---------------- SETS ----------------
  { slug: "first-date-set", name: "The First Date Set", tagline: "Huggies + pendant + ring, gift-boxed", description: "Our three bestsellers in one gift box: Tiny Promise Huggies, Initial Love Pendant and Twist & Stack Ring.", category: "sets", material: "gold-plated", vibes: ["romantic", "minimal"], price: 6250, compareAt: 7150, stock: 10, art: { kind: "heart", metal: "gold", gem: "#BE185D", bg: "#F5EFE9" }, rating: 4.9, reviewCount: 44 },
];

// DEMO product photos – free-licence Unsplash images (https://unsplash.com/license).
// Swap for photos of your actual pieces in Admin → Products before launch.
const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=entropy&w=900&h=1125&q=75`;
const PRODUCT_PHOTOS: Record<string, string[]> = {
  "lola-chunky-hoops": [u("1708220040824-b273dd0a17cc"), u("1684439673104-f5d22791c71a")],
  "tiny-promise-huggies": [u("1671644730555-916aa8d8157f"), u("1632525230528-ec17c49bc168")],
  "pearl-gossip-drops": [u("1590166223826-12dee1677420"), u("1682822749969-61a63203c501")],
  "cherry-pop-studs": [u("1671642883395-0ab89c3ac890")],
  "moonlit-star-climbers": [u("1721103418184-7fee9c713da3")],
  "nadee-jhumka": [u("1762686130435-897de4b26aac")],
  "solid-gold-dot-studs": [u("1708220040828-9ab1673681d3")],
  "daisy-chain-drops": [u("1761479272175-0f89e2913dd8")],
  "rebel-ear-cuff": [u("1786341430358-24fac3b2267d")],
  "rose-teardrop-gems": [u("1786052337938-623b6f7e721e")],
  "midnight-sapphire-drops": [u("1713004539634-a6694a83f3d9"), u("1535632787350-4e68ef0ac584")],
  "tragus-spark-stud": [u("1621939745912-aad97fd3a34d")],
  "hello-sunshine-hoops": [u("1729101913531-69d0954b191e"), u("1634390618228-2fe329fc7546")],
  "butterfly-crush-studs": [u("1782400027260-3694aae56d1c")],
  "initial-love-pendant": [u("1758995115543-983c55f98a33")],
  "pearl-girl-choker": [u("1704957205327-9fbd44d683b7")],
  "solid-gold-snake-chain": [u("1616837874254-8d5aaa63e273")],
  "stackable-twist-ring": [u("1617038260897-41a1f14a8ca0")],
  "cocktail-candy-ring": [u("1779867169776-4e47150a99a6")],
  "sunday-bangle": [u("1690175867343-2af70ea57537")],
  "beach-bell-anklet": [u("1744722091259-ed1cf11ac97f")],
  "first-date-set": [u("1561828995-aa79a2db86dd")],
};

export function buildSeedProducts(): Product[] {
  return seeds.map((s, i) => ({
    ...s,
    id: `p_${(i + 1).toString().padStart(3, "0")}`,
    sku: `ST-${s.category.slice(0, 3).toUpperCase()}-${(i + 1).toString().padStart(3, "0")}`,
    images: PRODUCT_PHOTOS[s.slug] ?? [],
    active: true,
    lowStockThreshold: s.lowStockThreshold ?? 5,
    createdAt: daysAgo(60 - i * 2),
    updatedAt: now,
  }));
}

export const seedReviews: Omit<Review, "id">[] = [
  { productId: "p_001", name: "Dinithi", rating: 5, body: "Wore them to a wedding and three aunties asked where I got them. Super light!", createdAt: daysAgo(4) },
  { productId: "p_001", name: "Sachini R.", rating: 5, body: "Packaging was so cute I almost didn't want to open it.", createdAt: daysAgo(12) },
  { productId: "p_002", name: "Amaya", rating: 5, body: "Haven't taken them off in 2 months. Zero tarnish, zero itch.", createdAt: daysAgo(9) },
  { productId: "p_002", name: "Tharushi", rating: 4, body: "Perfect size for second holes. Wish there was a smaller one too!", createdAt: daysAgo(20) },
  { productId: "p_006", name: "Nethmi", rating: 5, body: "These give such old Kandy vibes. Obsessed.", createdAt: daysAgo(3) },
  { productId: "p_003", name: "Ishara", rating: 5, body: "Every pearl is unique, mine have a little pink glow.", createdAt: daysAgo(6) },
];

export const seedCoupons: Coupon[] = [
  { code: "HELLOSHE", type: "percent", value: 10, minSubtotal: 0, active: true, description: "10% off your first order" },
  { code: "STACKIT", type: "fixed", value: 750, minSubtotal: 6000, active: true, description: "Rs 750 off orders over Rs 6,000" },
];

export const SRI_LANKA_DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", "Galle", "Matara", "Hambantota",
  "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Monaragala", "Ratnapura", "Kegalle",
] as const;
