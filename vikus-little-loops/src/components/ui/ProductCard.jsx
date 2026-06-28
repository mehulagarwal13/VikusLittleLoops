import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiHeart, FiShoppingBag, FiEye } from "react-icons/fi";
import { fadeUp } from "@/lib/motion";
import { productView, inr } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { useQuickView } from "@/context/QuickViewContext";

export default function ProductCard({ product }) {
  const p = productView(product);
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { toast } = useToast();
  const { open: openQuickView } = useQuickView();
  const wished = has(p.id);
  const out = p.stock === 0;

  const mini = {
    product_id: p.id,
    slug: p.slug,
    name: p.name,
    image: p.image,
    emoji: p.emoji,
    price: p.displayPrice,
    stock: p.stock,
  };

  const addToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (out) return;
    add(mini);
    toast(`${p.name} added to cart`);
  };

  const toggleWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(mini);
    toast(wished ? "Removed from wishlist" : "Saved to wishlist", "wish");
  };

  const quickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(p.slug);
  };

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -12 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-xl2 bg-ivory shadow-soft"
    >
      <Link to={`/product/${p.slug}`} className="block">
        <div className={`relative h-[300px] overflow-hidden bg-gradient-to-br ${p.gradient}`}>
          {p.image ? (
            <img
              src={p.image}
              alt={p.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1100ms] ease-lux group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-[4.4rem] transition-transform duration-[1100ms] ease-lux group-hover:scale-110 group-hover:rotate-3">
              {p.emoji}
            </div>
          )}

          {p.badge && (
            <span
              className={`absolute left-4 top-4 z-10 rounded-full px-3.5 py-1.5 text-[0.64rem] font-medium uppercase tracking-[0.12em] shadow-soft backdrop-blur ${
                p.badge.includes("%") ? "bg-olive text-white" : "bg-white/90 text-blush-700"
              }`}
            >
              {p.badge}
            </span>
          )}

          {out && (
            <span className="absolute right-4 top-4 z-10 rounded-full bg-ink/80 px-3 py-1.5 text-[0.62rem] uppercase tracking-widest text-white">
              Sold out
            </span>
          )}

          <button
            onClick={addToCart}
            disabled={out}
            className="absolute inset-x-4 bottom-4 z-10 flex translate-y-5 items-center justify-center gap-2 rounded-2xl bg-ink/90 py-3.5 text-center text-[0.74rem] uppercase tracking-[0.12em] text-white opacity-0 backdrop-blur transition-all duration-500 ease-lux hover:bg-blush-600 group-hover:translate-y-0 group-hover:opacity-100 disabled:opacity-40"
          >
            <FiShoppingBag size={15} /> {out ? "Sold out" : "Add to Cart"}
          </button>
        </div>
      </Link>

      <div className="absolute right-3.5 top-3.5 z-20 flex flex-col gap-2">
        <button
          onClick={toggleWish}
          aria-label="Add to wishlist"
          className="grid h-10 w-10 -translate-y-2 place-items-center rounded-full bg-white/90 text-warmgray opacity-0 shadow-soft backdrop-blur transition-all duration-500 ease-lux hover:scale-110 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <FiHeart className={wished ? "fill-blush-500 text-blush-500" : ""} size={18} />
        </button>
        <button
          onClick={quickView}
          aria-label="Quick view"
          className="grid h-10 w-10 -translate-y-2 place-items-center rounded-full bg-white/90 text-warmgray opacity-0 shadow-soft backdrop-blur transition-all delay-75 duration-500 ease-lux hover:scale-110 hover:text-blush-600 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <FiEye size={18} />
        </button>
      </div>

      <div className="p-6">
        <p className="text-[0.68rem] uppercase tracking-[0.16em] text-olive-deep">{p.categoryName}</p>
        <h3 className="mt-1.5 font-display text-xl font-medium">
          <Link to={`/product/${p.slug}`}>{p.name}</Link>
        </h3>
        <div className="mt-2 font-serif text-2xl font-semibold">
          {inr(p.displayPrice)}
          {p.oldPrice && (
            <span className="ml-2 text-base font-normal text-warmgray line-through">{inr(p.oldPrice)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
