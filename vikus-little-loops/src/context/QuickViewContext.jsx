import { createContext, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiX, FiShoppingBag, FiHeart } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { productView, inr } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";

const QuickViewContext = createContext(null);

export function QuickViewProvider({ children }) {
  const [slug, setSlug] = useState(null);
  const open = (s) => setSlug(s);
  const close = () => setSlug(null);

  return (
    <QuickViewContext.Provider value={{ open, close }}>
      {children}
      <QuickViewModal slug={slug} onClose={close} />
    </QuickViewContext.Provider>
  );
}

function QuickViewModal({ slug, onClose }) {
  const { add } = useCart();
  const { toast } = useToast();
  const { has, toggle } = useWishlist();
  const { data } = useQuery({
    queryKey: ["quickview", slug],
    queryFn: () => api.get(`/products/${slug}`).then((r) => r.data),
    enabled: Boolean(slug),
  });

  const p = data ? productView(data) : null;

  return (
    <AnimatePresence>
      {slug && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-ink/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 z-[115] w-[92%] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl3 bg-cream shadow-2xl"
          >
            <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/80 text-ink-soft hover:text-blush-600">
              <FiX size={18} />
            </button>
            {!p ? (
              <div className="grid h-80 place-items-center">
                <span className="h-10 w-10 animate-spin rounded-full border-2 border-blush-300 border-t-blush-500" />
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <div className={`grid aspect-square place-items-center bg-gradient-to-br ${p.gradient}`}>
                  {p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-cover" /> : <span className="text-[7rem]">{p.emoji}</span>}
                </div>
                <div className="p-7">
                  <p className="text-[0.7rem] uppercase tracking-[0.16em] text-olive-deep">{p.categoryName}</p>
                  <h3 className="mt-1 font-display text-2xl">{p.name}</h3>
                  <div className="mt-3 font-serif text-2xl font-semibold">
                    {inr(p.displayPrice)}
                    {p.oldPrice && <span className="ml-2 text-base font-normal text-warmgray line-through">{inr(p.oldPrice)}</span>}
                  </div>
                  {data.short_description && <p className="mt-4 font-serif text-base text-ink-soft">{data.short_description}</p>}
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      onClick={() => { add({ product_id: p.id, slug: p.slug, name: p.name, image: p.image, emoji: p.emoji, price: p.displayPrice, stock: p.stock }); toast(`${p.name} added to cart`); onClose(); }}
                      disabled={p.stock === 0}
                      className="flex items-center gap-2 rounded-full bg-gradient-to-br from-blush-400 to-blush-600 px-7 py-3.5 text-sm uppercase tracking-[0.12em] text-white transition hover:shadow-lift disabled:opacity-50"
                    >
                      <FiShoppingBag size={16} /> {p.stock === 0 ? "Sold out" : "Add to Cart"}
                    </button>
                    <button
                      onClick={() => { toggle({ product_id: p.id, slug: p.slug, name: p.name, image: p.image, emoji: p.emoji, price: p.displayPrice }); toast(has(p.id) ? "Removed from wishlist" : "Saved to wishlist", "wish"); }}
                      className="grid h-12 w-12 place-items-center rounded-full border border-blush-300/60 bg-white/60 text-ink-soft hover:text-blush-600"
                    >
                      <FiHeart className={has(p.id) ? "fill-blush-500 text-blush-500" : ""} size={18} />
                    </button>
                  </div>
                  <Link to={`/product/${p.slug}`} onClick={onClose} className="mt-4 inline-block text-sm text-ink-soft underline hover:text-blush-600">
                    View full details →
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export const useQuickView = () => useContext(QuickViewContext);
