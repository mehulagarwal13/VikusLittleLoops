import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import ProductCard from "@/components/ui/ProductCard";
import Seo from "@/components/Seo";
import { stagger } from "@/lib/motion";
import { useProducts, useCategories } from "@/lib/hooks";

const SORTS = [
  ["featured", "Featured"],
  ["newest", "Newest"],
  ["best_selling", "Best Selling"],
  ["price_asc", "Price: Low → High"],
  ["price_desc", "Price: High → Low"],
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");

  const categoryId = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "featured";

  const { data: categories } = useCategories();
  const { data, isLoading, isError } = useProducts({
    page_size: 24,
    sort,
    ...(categoryId ? { category_id: Number(categoryId) } : {}),
    ...(search ? { search } : {}),
  });
  const products = data?.items || [];

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <main className="container-lux pb-16 pt-28 sm:pb-28 sm:pt-36">
      <Seo title="Shop" description="Browse all handmade crochet pieces — tulips, sakura charms, hairbands, bag charms, rings, and curated gift sets." />
      <header className="mb-8 text-center sm:mb-12">
        <span className="text-[0.72rem] uppercase tracking-[0.2em] text-olive-deep">The Boutique</span>
        <h1 className="heading-display mt-3 text-[clamp(2rem,5vw,3.4rem)]">Shop All Handmade</h1>
      </header>

      {/* Toolbar */}
      <div className="mb-8 flex flex-col gap-4 sm:mb-10">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
          <Chip label="All" active={!categoryId} onClick={() => setParam("category", "")} />
          {categories?.map((c) => (
            <Chip
              key={c.id}
              label={`${c.emoji || ""} ${c.name}`.trim()}
              active={categoryId === String(c.id)}
              onClick={() => setParam("category", String(c.id))}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <form
            onSubmit={(e) => { e.preventDefault(); }}
            className="flex flex-1 items-center gap-2 rounded-full border border-blush-300/50 bg-white/70 px-4 py-2.5"
          >
            <FiSearch className="shrink-0 text-warmgray" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-warmgray"
            />
          </form>
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="rounded-full border border-blush-300/50 bg-white/70 px-3 py-2.5 text-sm outline-none sm:px-4"
          >
            {SORTS.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {isError ? (
        <div className="py-24 text-center font-serif text-xl text-ink-soft">
          Couldn't load products. Is the backend running?
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[260px] animate-pulse rounded-xl2 bg-blush-100/60 sm:h-[420px]" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-2xl tracking-widest text-blush-400">. ݁₊ ⊹ . ݁ ⟡ ݁ . ⊹ ₊ ݁.</p>
          <p className="mt-4 font-serif text-2xl text-ink-soft">Still weaving the magic — check back soon 🧶</p>
        </div>
      ) : (
        <motion.div
          key={categoryId + sort + search}
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4"
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </motion.div>
      )}
    </main>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-[0.78rem] tracking-wide transition-all duration-300 ${
        active
          ? "bg-blush-500 text-white shadow-soft"
          : "border border-blush-300/50 bg-white/60 text-ink-soft hover:bg-white"
      }`}
    >
      {label}
    </button>
  );
}
