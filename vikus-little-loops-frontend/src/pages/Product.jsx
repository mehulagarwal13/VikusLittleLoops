import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiHeart } from "react-icons/fi";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";
import { fadeUp, stagger } from "@/lib/motion";
import { useProduct, useProducts } from "@/lib/hooks";
import { productView, inr } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { pushRecentlyViewed } from "@/lib/recentlyViewed";
import Reviews from "@/components/product/Reviews";
import RecentlyViewed from "@/components/product/RecentlyViewed";
import Seo from "@/components/Seo";

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useProduct(slug);
  const { data: more } = useProducts({ page_size: 4, sort: "featured" });
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { toast } = useToast();

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Track recently viewed once the product loads.
  useEffect(() => {
    if (data) pushRecentlyViewed(data);
  }, [data]);

  if (isLoading)
    return (
      <main className="container-lux grid min-h-[60vh] place-items-center pt-36">
        <span className="h-12 w-12 animate-spin rounded-full border-2 border-blush-300 border-t-blush-500" />
      </main>
    );

  if (isError || !data)
    return (
      <main className="container-lux grid min-h-[60vh] place-items-center pt-36 text-center">
        <div>
          <p className="text-6xl">🧶</p>
          <p className="mt-4 font-serif text-2xl text-ink-soft">We couldn't find that piece.</p>
          <div className="mt-6"><Button to="/shop">Back to Shop</Button></div>
        </div>
      </main>
    );

  const p = productView(data);
  const images = data.images?.length ? data.images : [];
  const out = p.stock === 0;
  const related = (more?.items || []).filter((x) => x.id !== data.id).slice(0, 4);

  const productVariants = (data.variants || []).filter((v) => v.variant_name);

  // Effective price: use variant's price_override if one is selected, else base price.
  const effectivePrice = selectedVariant?.price_override
    ? Number(selectedVariant.price_override)
    : p.displayPrice;

  // Active image: variant photo takes priority when a variant is selected
  const activeImageUrl = selectedVariant?.image_url
    ? selectedVariant.image_url
    : images.length
    ? images[activeImg]?.url
    : null;

  const mini = {
    product_id: p.id,
    slug: p.slug,
    name: p.name,
    image: p.image,
    emoji: p.emoji,
    price: effectivePrice,
    stock: p.stock,
  };

  const addToCart = () => {
    if (out) return;
    add(mini, qty);
    toast(`${p.name} added to cart`);
  };

  const toggleWish = () => {
    toggle(mini);
    toast(has(p.id) ? "Removed from wishlist" : "Saved to wishlist", "wish");
  };

  return (
    <main className="container-lux pb-16 pt-28 sm:pb-28 sm:pt-36">
      <Seo
        title={p.name}
        description={data.short_description || data.long_description || `${p.name} — handmade crochet by Viku's Little Loops.`}
        image={p.image}
        type="product"
      />
      <Link to="/shop" className="text-sm text-ink-soft hover:text-blush-600">← Back to shop</Link>

      <div className="mt-6 grid gap-12 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full overflow-hidden rounded-xl3 bg-gradient-to-br ${p.gradient} shadow-soft`}
            style={{ aspectRatio: "4/3" }}
          >
            {activeImageUrl ? (
              <img src={activeImageUrl} alt={p.name} className="h-full w-full object-cover" />
            ) : (
              <span className="absolute inset-0 grid place-items-center text-[9rem]">{p.emoji}</span>
            )}
          </motion.div>
          {/* Thumbnail strip — only show when no variant with image selected */}
          {!selectedVariant?.image_url && images.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {images.map((im, i) => (
                <button
                  key={im.id || i}
                  onClick={() => setActiveImg(i)}
                  className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition ${
                    activeImg === i ? "border-blush-500" : "border-transparent opacity-70"
                  }`}
                >
                  <img src={im.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.p variants={fadeUp} className="text-[0.72rem] uppercase tracking-[0.2em] text-olive-deep">
            {p.categoryName}
          </motion.p>
          <motion.h1 variants={fadeUp} className="heading-display mt-2 text-[clamp(2rem,4vw,3rem)]">
            {p.name}
          </motion.h1>

          <motion.div variants={fadeUp} className="mt-5 font-serif text-3xl font-semibold">
            {inr(effectivePrice)}
            {p.oldPrice && <span className="ml-3 text-xl font-normal text-warmgray line-through">{inr(p.oldPrice)}</span>}
            {selectedVariant?.price_override && (
              <span className="ml-3 text-sm font-normal text-olive-deep">(variant price)</span>
            )}
          </motion.div>

          <motion.p variants={fadeUp} className="mt-3 text-sm">
            {out ? (
              <span className="text-blush-700">Currently sold out</span>
            ) : p.stock <= 3 ? (
              <span className="text-blush-700">Only {p.stock} left — made to order</span>
            ) : (
              <span className="text-olive-deep">In stock</span>
            )}
          </motion.p>

          {data.short_description && (
            <motion.p variants={fadeUp} className="mt-5 max-w-md font-serif text-lg text-ink-soft">
              {data.short_description}
            </motion.p>
          )}
          {data.long_description && (
            <motion.p variants={fadeUp} className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
              {data.long_description}
            </motion.p>
          )}

          {/* Variants */}
          {productVariants.length > 0 && (
            <motion.div variants={fadeUp} className="mt-6">
              <p className="mb-3 text-[0.72rem] uppercase tracking-[0.18em] text-ink-soft">
                Available options
              </p>
              <div className="flex flex-wrap gap-2">
                {productVariants.map((v) => {
                  const active = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(active ? null : v)}
                      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-200 ${
                        active
                          ? "border-blush-500 bg-blush-500/10 text-blush-600 font-medium shadow-glow"
                          : "border-blush-200/60 bg-white/60 text-ink hover:border-blush-400 hover:bg-white"
                      }`}
                    >
                      {v.image_url && (
                        <img src={v.image_url} alt="" className="h-6 w-6 rounded-full object-cover border border-blush-200/60" />
                      )}
                      <span>{v.variant_name}</span>
                      {v.color_label && (
                        <span className="text-xs text-ink-soft opacity-70">· {v.color_label}</span>
                      )}
                      {active && <span className="ml-0.5 text-blush-500">✓</span>}
                    </button>
                  );
                })}
              </div>
              {selectedVariant?.price_override && (
                <p className="mt-2 text-xs text-olive-deep">Price updated for this variant</p>
              )}
            </motion.div>
          )}

          {/* Quantity */}
          <motion.div variants={fadeUp} className="mt-7 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-blush-300/60 bg-white/60">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-12 w-12 items-center justify-center text-lg">−</button>
              <span className="w-8 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="flex h-12 w-12 items-center justify-center text-lg">+</button>
            </div>
            <span className="font-serif text-lg text-ink-soft">{inr(effectivePrice * qty)}</span>
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeUp} className="mt-7 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={addToCart} className={`flex-1 justify-center sm:flex-none ${out ? "pointer-events-none opacity-50" : ""}`}>
              {out ? "Sold Out" : "Add to Cart"}
            </Button>
            <button
              onClick={() => { addToCart(); navigate("/cart"); }}
              disabled={out}
              className="flex-1 rounded-full border border-blush-300/60 bg-white/60 px-5 py-4 text-[0.84rem] uppercase tracking-[0.12em] text-ink transition hover:bg-white disabled:opacity-50 sm:flex-none sm:px-7"
            >
              Buy Now
            </button>
            <button onClick={toggleWish} aria-label="Save to wishlist" className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-blush-300/60 bg-white/60 text-ink-soft transition-colors hover:text-blush-600">
              <FiHeart className={has(p.id) ? "fill-blush-500 text-blush-500" : ""} size={20} />
            </button>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 space-y-2 border-t border-blush-200/50 pt-6 font-serif text-base text-ink-soft">
            {data.material && <p>🧶 Material: {data.material}</p>}
            <p>🚚 Ships in 2–3 weeks</p>
            {data.care_instructions && <p>💗 {data.care_instructions}</p>}
          </motion.div>
        </motion.div>
      </div>

      <Reviews productId={data.id} />

      {related.length > 0 && (
        <section className="mt-28">
          <h2 className="heading-display mb-10 text-center text-[clamp(1.8rem,4vw,2.6rem)]">You May Also Love</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-8 lg:grid-cols-4">
            {related.map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </section>
      )}

      <RecentlyViewed excludeId={data.id} />
    </main>
  );
}
