// Free-licence editorial photography from Unsplash (https://unsplash.com/license).
// Used for MOOD only (hero, lookbook, categories, banners) — product cards use
// each product's own photos once uploaded in the admin, never these.
export interface StockPhoto {
  id: string; // images.unsplash.com/photo-{id}
  w: number;
  h: number;
  alt: string;
  by: string;
  /** imgix crop focus, default faces/entropy */
  crop?: string;
}

const P = (id: string, w: number, h: number, alt: string, by: string, crop?: string): StockPhoto => ({ id, w, h, alt, by, crop });

export const PHOTOS = {
  heroPearl: P("1763628212781-7d52844cf358", 4000, 6000, "Close-up of a sculpted gold and pearl earring on a woman's ear", "Giustina Barison"),
  heroHuggie: P("1671644730555-916aa8d8157f", 3840, 5760, "Woman wearing a small gold huggie earring", "Ruan Richard Rodrigues"),
  colourHoop: P("1652766540048-de0a878a3266", 4000, 6000, "Woman touching her ear, wearing a jewelled statement hoop", "Mina Rad", "bottom"),
  pearlDrop: P("1590166223826-12dee1677420", 2592, 3872, "Gold drop earring with a pearl, against auburn hair", "Kateryna Hliznitsova"),
  whiteShirt: P("1611653842967-39eb011b2ca3", 4016, 6016, "Woman in a white shirt wearing fine drop earrings", "Kateryna Hliznitsova"),
  marbleHoop: P("1735816415206-e971124e0336", 2133, 3200, "Close-up of a marbled resin hoop earring", "Helen Ngoc N."),
  twistedHoops: P("1617038220319-276d3cfab638", 4000, 6000, "Two gold twisted hoop earrings resting on white stones", "Nataliya Melnychuk"),
  flatlay: P("1606760227091-3dd870d97f1d", 3324, 4986, "Flat-lay of gold and silver hoops, chains and charms", "Martin de Arriba"),
  ringDish: P("1561828995-aa79a2db86dd", 3455, 3455, "Gold rings and studs on a small ceramic dish", "Tessa Edmiston"),
  pearls: P("1704957205327-9fbd44d683b7", 2208, 3300, "Pearl strand and pearl studs with white flowers", "Raindrops Photography"),
  snakeChain: P("1616837874254-8d5aaa63e273", 2960, 3089, "Woman in a black blazer wearing a flat gold snake chain", "Cat Han"),
  layered: P("1633934542430-0905ccb5f050", 2500, 2000, "Layered fine gold necklaces and rings", "Segal Jewelry"),
  ringsPink: P("1608508644127-ba99d7732fee", 2534, 3167, "Gold rings on pink and white striped fabric", "Daihana Monares"),
  bracelet: P("1602173574767-37ac01994b2a", 4000, 5340, "Gold chain bracelet resting on a magazine", "Nataliya Melnychuk"),
} as const;

export type PhotoKey = keyof typeof PHOTOS;

export function photoUrl(p: StockPhoto, width: number, aspect?: number) {
  const h = aspect ? `&h=${Math.round(width / aspect)}&fit=crop&crop=${p.crop ?? "faces,entropy"}` : "";
  return `https://images.unsplash.com/photo-${p.id}?auto=format&q=72&w=${width}${h}`;
}

export const PHOTO_CREDITS = [...new Set(Object.values(PHOTOS).map((p) => p.by))];
