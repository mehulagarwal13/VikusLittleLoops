import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiX, FiShoppingBag } from "react-icons/fi";
import Button from "@/components/ui/Button";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { inr } from "@/lib/format";

export default function Wishlist() {
  const { items, remove } = useWishlist();
  const { add } = useCart();
  const { toast } = useToast();

  if (items.length === 0)
    return (
      <main className="container-lux grid min-h-[60vh] place-items-center pt-36 text-center">
        <div>
          <p className="text-7xl">💝</p>
          <h1 className="heading-display mt-5 text-4xl">Your wishlist is empty</h1>
          <p className="mt-3 font-serif text-xl text-ink-soft">Tap the heart on anything you love to save it here.</p>
          <div className="mt-7"><Button to="/shop">Find Something Sweet</Button></div>
        </div>
      </main>
    );

  return (
    <main className="container-lux pb-28 pt-36">
      <h1 className="heading-display mb-10 text-[clamp(2.2rem,5vw,3.2rem)]">Your Wishlist</h1>
      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((i) => (
          <motion.div
            key={i.product_id}
            layout
            className="group relative overflow-hidden rounded-xl2 bg-ivory shadow-soft"
          >
            <button
              onClick={() => remove(i.product_id)}
              aria-label="Remove"
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink-soft shadow-soft hover:text-blush-600"
            >
              <FiX size={16} />
            </button>
            <Link to={`/product/${i.slug}`} className="block">
              <div className="grid h-56 place-items-center overflow-hidden bg-blush-100">
                {i.image ? <img src={i.image} alt={i.name} className="h-full w-full object-cover" /> : <span className="text-6xl">{i.emoji}</span>}
              </div>
            </Link>
            <div className="p-5">
              <h3 className="font-display text-lg"><Link to={`/product/${i.slug}`}>{i.name}</Link></h3>
              <p className="mt-1 font-serif text-xl font-semibold">{inr(i.price)}</p>
              <button
                onClick={() => { add({ ...i, stock: i.stock ?? 10 }); toast(`${i.name} added to cart`); }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-blush-400 to-blush-600 py-2.5 text-[0.74rem] uppercase tracking-[0.12em] text-white transition hover:shadow-lift"
              >
                <FiShoppingBag size={14} /> Add to Cart
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
