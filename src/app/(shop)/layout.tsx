import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import MobileTabBar from "@/components/layout/MobileTabBar";
import Cursor from "@/components/layout/Cursor";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-cream">Skip to content</a>
      <Header />
      <main id="main" className="min-h-[60vh]">{children}</main>
      <Footer />
      <CartDrawer />
      <MobileTabBar />
      <WhatsAppButton />
      <Cursor />
    </>
  );
}
