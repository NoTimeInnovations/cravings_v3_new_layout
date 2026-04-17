import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Menu from "./pages/Menu.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderConfirmation from "./pages/OrderConfirmation.jsx";
import Admin from "./pages/Admin.jsx";
import Storefront from "./pages/Storefront.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import PageTransition from "./components/PageTransition.jsx";
import { useMenuStore, BRAND_COLORS } from "./store/menuStore.js";
import { useCartStore } from "./store/cartStore.js";
import { useOrdersStore } from "./store/ordersStore.js";

const STORE_KEYS = {
  "lgc-menu": useMenuStore,
  "lgc-cart": useCartStore,
  "lgc-orders": useOrdersStore,
};

export default function App() {
  const brandColor = useMenuStore((s) => s.brandColor);
  const loadFromDb = useMenuStore((s) => s.loadFromDb);

  // Apply brand color CSS variables to :root
  useEffect(() => {
    const palette = BRAND_COLORS.find((c) => c.id === brandColor) || BRAND_COLORS[0];
    const root = document.documentElement.style;
    root.setProperty("--primary", palette.primary);
    root.setProperty("--primary-foreground", palette.foreground);
    root.setProperty("--ring", palette.ring);
  }, [brandColor]);

  // Fetch live restaurant data from Hasura on every mount.
  // Latency is logged to console for optimization tuning.
  useEffect(() => {
    loadFromDb().catch((e) => console.warn("[hasura] load failed:", e.message));
  }, [loadFromDb]);

  // Cross-tab sync: when another tab writes to localStorage, rehydrate.
  useEffect(() => {
    const handler = (e) => {
      const store = STORE_KEYS[e.key];
      if (store && store.persist?.rehydrate) store.persist.rehydrate();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<PageTransition><Menu /></PageTransition>} />
        <Route path="/storefront" element={<PageTransition><Storefront /></PageTransition>} />
        <Route path="/cart" element={<PageTransition variant="right"><Cart /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition variant="right"><Checkout /></PageTransition>} />
        <Route path="/order-confirmed" element={<PageTransition variant="celebrate"><OrderConfirmation /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
      </Routes>
    </>
  );
}
