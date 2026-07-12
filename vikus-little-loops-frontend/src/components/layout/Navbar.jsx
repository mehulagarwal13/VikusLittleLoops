import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiShoppingBag, FiHeart, FiMenu, FiX, FiUser } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useHomepage } from "@/lib/hooks";

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
  const { data: hp } = useHomepage();
  const logoUrl = hp?.branding?.content?.logo_url;

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
          : "py-4 lg:py-6"
      }`}
      style={{ paddingTop: solid ? undefined : "max(env(safe-area-inset-top, 0px), 1rem)" }}
    >
      <div className="container-lux flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 lg:gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Viku's Little Loops"
              className="h-9 w-9 rounded-full object-cover shadow-soft lg:h-10 lg:w-10"
            />
          ) : (
            <span className="grid h-9 w-9 lg:h-10 lg:w-10 animate-spin-slow place-items-center rounded-full bg-[conic-gradient(from_210deg,#DC6B86,#F8CDD6,#FBE0CF,#94A06F,#DC6B86)] text-white shadow-soft">
              ✿
            </span>
          )}
          <span className="font-display text-base lg:text-xl font-semibold leading-tight">
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
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick links — visible on phones, hidden once the full menu appears */}
          <NavLink to="/shop" className="text-[0.78rem] uppercase tracking-[0.08em] text-ink-soft transition-colors hover:text-blush-700 lg:hidden">
            Shop
          </NavLink>
          <NavLink to="/about" className="text-[0.78rem] uppercase tracking-[0.08em] text-ink-soft transition-colors hover:text-blush-700 lg:hidden">
            Story
          </NavLink>
          <Link to={isAuthed ? "/account" : "/login"} aria-label="Account" className="flex h-11 w-11 items-center justify-center text-ink-soft transition-colors hover:text-blush-600">
            <FiUser size={20} />
          </Link>
          <Link to="/wishlist" aria-label="Wishlist" className="relative hidden h-11 w-11 items-center justify-center text-ink-soft transition-colors hover:text-blush-600 sm:flex">
            <FiHeart size={20} />
            {wishCount > 0 && (
              <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-blush-500 text-[0.6rem] text-white">
                {wishCount}
              </span>
            )}
          </Link>
          <button onClick={() => setCartOpen(true)} aria-label="Cart" className="relative flex h-11 w-11 items-center justify-center text-ink-soft transition-colors hover:text-blush-600">
            <FiShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-blush-500 text-[0.6rem] text-white">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setOpen(true)}
            aria-label="Menu"
            className="flex h-11 w-11 items-center justify-center text-ink lg:hidden"
          >
            <FiMenu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[59] bg-ink/20 backdrop-blur-sm lg:hidden"
            />
            {/* Drawer panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 right-0 z-[60] w-[min(320px,90vw)] bg-cream shadow-lift lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-blush-200/50 px-6 py-5">
                <span className="font-display text-xl font-semibold">Menu</span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-blush-50"
                >
                  <FiX size={22} />
                </button>
              </div>
              <nav className="flex flex-col px-6 py-8">
                {links.map((l, i) => (
                  <motion.div
                    key={l.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 border-b border-blush-100 py-4 font-display text-2xl transition-colors hover:text-blush-600"
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
                {/* Wishlist link in mobile menu */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * links.length, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to="/wishlist"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 border-b border-blush-100 py-4 font-display text-2xl transition-colors hover:text-blush-600"
                  >
                    Wishlist {wishCount > 0 && <span className="ml-1 rounded-full bg-blush-500 px-2 py-0.5 text-sm text-white">{wishCount}</span>}
                  </Link>
                </motion.div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
