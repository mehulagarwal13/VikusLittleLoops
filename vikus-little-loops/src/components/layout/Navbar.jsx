import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiShoppingBag, FiHeart, FiMenu, FiX, FiUser } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

const links = [
  { to: "/shop", label: "Shop" },
  { to: "/shop?view=collections", label: "Collections" },
  { to: "/about", label: "Our Story" },
  { to: "/custom-order", label: "Custom" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const { count, setOpen: setCartOpen } = useCart();
  const { count: wishCount } = useWishlist();
  const { isAuthed } = useCustomerAuth();

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid
          ? "bg-cream/80 py-3 shadow-[0_1px_0_rgba(242,176,191,0.3)] backdrop-blur-xl"
          : "py-6"
      }`}
    >
      <div className="container-lux flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 animate-spin-slow place-items-center rounded-full bg-[conic-gradient(from_210deg,#DC6B86,#F8CDD6,#FBE0CF,#94A06F,#DC6B86)] text-white shadow-soft">
            ✿
          </span>
          <span className="font-display text-xl font-semibold">
            Viku's Little Loops
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-9 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className="group relative text-[0.82rem] uppercase tracking-[0.08em] text-ink-soft transition-colors hover:text-blush-700"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-blush-600 transition-all duration-500 ease-lux group-hover:w-full" />
            </NavLink>
          ))}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <Link to={isAuthed ? "/account" : "/login"} aria-label="Account" className="text-ink-soft transition-colors hover:text-blush-600">
            <FiUser size={20} />
          </Link>
          <Link to="/wishlist" aria-label="Wishlist" className="relative hidden text-ink-soft transition-colors hover:text-blush-600 sm:block">
            <FiHeart size={20} />
            {wishCount > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-blush-500 text-[0.6rem] text-white">
                {wishCount}
              </span>
            )}
          </Link>
          <button onClick={() => setCartOpen(true)} aria-label="Cart" className="relative text-ink-soft transition-colors hover:text-blush-600">
            <FiShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-blush-500 text-[0.6rem] text-white">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setOpen(true)}
            aria-label="Menu"
            className="text-ink lg:hidden"
          >
            <FiMenu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-cream lg:hidden"
          >
            <div className="container-lux flex items-center justify-between py-6">
              <span className="font-display text-xl font-semibold">Menu</span>
              <button onClick={() => setOpen(false)} aria-label="Close">
                <FiX size={24} />
              </button>
            </div>
            <div className="container-lux flex flex-col gap-6 pt-8">
              {links.map((l, i) => (
                <motion.div
                  key={l.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i }}
                >
                  <Link
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="font-display text-3xl"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
