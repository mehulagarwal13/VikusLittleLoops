import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FiX, FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { inr } from "@/lib/format";

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, subtotal, count } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[90] bg-ink/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 right-0 z-[95] flex w-full max-w-md flex-col bg-cream shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-blush-200/50 px-6 py-5">
              <h3 className="font-display text-xl font-semibold">Your Cart ({count})</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-ink-soft hover:text-blush-600">
                <FiX size={22} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="grid flex-1 place-items-center px-6 text-center">
                <div>
                  <p className="text-6xl">🛍️</p>
                  <p className="mt-4 font-serif text-xl text-ink-soft">Your cart is feeling light.</p>
                  <Link
                    to="/shop"
                    onClick={() => setOpen(false)}
                    className="mt-6 inline-block rounded-full bg-gradient-to-br from-blush-400 to-blush-600 px-7 py-3 text-sm uppercase tracking-wide text-white"
                  >
                    Start Shopping
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                  {items.map((i) => (
                    <div key={i.product_id} className="flex gap-4">
                      <Link to={`/product/${i.slug}`} onClick={() => setOpen(false)} className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-blush-100">
                        {i.image ? <img src={i.image} alt={i.name} className="h-full w-full object-cover" /> : <span className="text-3xl">{i.emoji}</span>}
                      </Link>
                      <div className="flex-1">
                        <p className="font-display text-base">{i.name}</p>
                        <p className="text-sm text-ink-soft">{inr(i.price)}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex items-center rounded-full border border-blush-300/60">
                            <button onClick={() => setQty(i.product_id, i.quantity - 1)} className="px-2.5 py-1"><FiMinus size={13} /></button>
                            <span className="w-6 text-center text-sm">{i.quantity}</span>
                            <button onClick={() => setQty(i.product_id, i.quantity + 1)} className="px-2.5 py-1"><FiPlus size={13} /></button>
                          </div>
                          <button onClick={() => remove(i.product_id)} className="text-warmgray hover:text-blush-600"><FiTrash2 size={16} /></button>
                        </div>
                      </div>
                      <p className="font-serif text-base font-medium">{inr(i.price * i.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-blush-200/50 px-6 py-5">
                  <div className="flex items-center justify-between font-serif text-lg">
                    <span>Subtotal</span>
                    <span className="font-semibold">{inr(subtotal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-ink-soft">Free shipping & gift wrapping 🌸</p>
                  <Link
                    to="/checkout"
                    onClick={() => setOpen(false)}
                    className="mt-4 block rounded-full bg-gradient-to-br from-blush-400 to-blush-600 py-3.5 text-center text-sm uppercase tracking-[0.12em] text-white transition hover:shadow-lift"
                  >
                    Checkout
                  </Link>
                  <Link to="/cart" onClick={() => setOpen(false)} className="mt-2 block text-center text-sm text-ink-soft hover:text-blush-600">
                    View full cart
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
