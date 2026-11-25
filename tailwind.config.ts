import type { Config } from "tailwindcss";

// Direction: UI/UX Pro Max "Gen Z Chaos / Maximalism" + "Y2K" (fashion, youth),
// tamed for e-commerce. Token names kept so every component picks it up.
// Contrast: ink on pink 6.4:1, ink on lime 15:1, ink on butter 16:1, white on cobalt 8.6:1, white on cherry 4.6:1.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F3EE", // off-white page
        cream: "#FFFFFF",
        ink: "#141414",
        cocoa: "#4A4A4A", // muted text 8.4:1
        cherry: "#E0115F", // primary hot pink-red, white text OK
        pink: "#FF5FA8", // bubblegum — ink text only
        blush: "#FFC7E1",
        petal: "#FFE6F1",
        lime: "#C8F23A", // acid lime — ink text only
        cobalt: "#2F3CFF", // white text
        butter: "#FFE45C",
        gold: "#9A6A00",
        sage: "#D9F2E3",
        line: "#14141420",
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        hand: ["var(--font-hand)", "cursive"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(20,20,20,.06), 0 10px 30px -12px rgba(20,20,20,.25)",
        lift: "0 2px 4px rgba(20,20,20,.06), 0 24px 50px -18px rgba(224,17,95,.45)",
        sticker: "2px 3px 0 rgba(20,20,20,.9)",
      },
      borderRadius: { blob: "62% 38% 46% 54% / 55% 44% 56% 45%" },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        spinslow: { to: { transform: "rotate(360deg)" } },
        sway: { "0%,100%": { transform: "rotate(-6deg)" }, "50%": { transform: "rotate(6deg)" } },
        wiggle: { "0%,100%": { transform: "rotate(-3deg)" }, "50%": { transform: "rotate(3deg)" } },
        shimmer: { from: { backgroundPosition: "200% 0" }, to: { backgroundPosition: "-200% 0" } },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        spinslow: "spinslow 14s linear infinite",
        sway: "sway 3.6s ease-in-out infinite",
        wiggle: "wiggle 2.4s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
