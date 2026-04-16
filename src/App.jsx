import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Menu from "./pages/Menu.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderConfirmation from "./pages/OrderConfirmation.jsx";
import Admin from "./pages/Admin.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
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

  // Apply brand color CSS variables to :root
  useEffect(() => {
    const palette = BRAND_COLORS.find((c) => c.id === brandColor) || BRAND_COLORS[0];
    const root = document.documentElement.style;
    root.setProperty("--primary", palette.primary);
    root.setProperty("--primary-foreground", palette.foreground);
    root.setProperty("--ring", palette.ring);
  }, [brandColor]);

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
        <Route path="/" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmed" element={<OrderConfirmation />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  );
}
