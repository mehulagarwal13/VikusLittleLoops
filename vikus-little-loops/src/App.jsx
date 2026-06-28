import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollWidgets from "@/components/ui/ScrollWidgets";
import Button from "@/components/ui/Button";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import Product from "@/pages/Product";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import CustomOrder from "@/pages/CustomOrder";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Wishlist from "@/pages/Wishlist";
import Login from "@/pages/Login";
import Account from "@/pages/Account";
import NotFound from "@/pages/NotFound";
import AdminApp from "@/admin/AdminApp";
import CartDrawer from "@/components/cart/CartDrawer";

// Reset scroll on every route change.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

// Simple "coming soon" page for cart / wishlist placeholders.
function ComingSoon({ title, emoji }) {
  return (
    <main className="grid min-h-[70vh] place-items-center px-6 pt-24 text-center">
      <div>
        <p className="text-7xl">{emoji}</p>
        <h1 className="heading-display mt-5 text-4xl">{title}</h1>
        <p className="mt-3 font-serif text-xl text-ink-soft">Coming soon — stitched with love.</p>
        <div className="mt-7"><Button to="/shop">Continue Shopping</Button></div>
      </div>
    </main>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/custom-order" element={<CustomOrder />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const { pathname } = useLocation();

  // Admin runs as its own app — no storefront chrome.
  if (pathname.startsWith("/admin")) {
    return (
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <AnimatedRoutes />
      <Footer />
      <ScrollWidgets />
      <CartDrawer />
    </>
  );
}
