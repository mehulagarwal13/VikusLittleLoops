import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SectionHeading from "@/components/ui/SectionHeading";
import { fadeUp, stagger, reveal } from "@/lib/motion";
import { useCategories } from "@/lib/hooks";

const GRADIENTS = [
  "from-blush-200 to-peach",
  "from-mauve to-blush-200",
  "from-rose-soft to-rose-gold",
  "from-lavender to-mauve",
  "from-peach to-blush-300",
  "from-blush-100 to-lavender",
];

export default function FeaturedCategories() {
  const { data: categories, isLoading } = useCategories();

  return (
    <section id="categories" className="container-lux py-28">
      <SectionHeading
        kicker="Featured Categories"
        title="Find Your Little Loop"
        subtitle="Handcrafted worlds — each piece made to order with soft, natural yarn."
      />

      {isLoading ? (
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[280px] animate-pulse rounded-xl2 bg-blush-100/60" />
          ))}
        </div>
      ) : !categories?.length ? (
        <p className="text-center font-serif text-xl text-ink-soft">
          Categories are coming soon. 🌷
        </p>
      ) : (
        <motion.div
          variants={stagger}
          {...reveal}
          className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3"
        >
          {categories.map((c, i) => (
            <motion.div key={c.id} variants={fadeUp}>
              <Link
                to={`/shop?category=${c.id}`}
                className={`group relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-xl2 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} p-8 text-ink shadow-soft transition-shadow duration-500 ease-lux hover:shadow-lift`}
              >
                {c.image_url ? (
                  <img src={c.image_url} alt={c.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <span className="absolute right-7 top-7 text-6xl opacity-90 transition-transform duration-700 ease-lux group-hover:-rotate-12 group-hover:scale-110">
                    {c.emoji || "🧶"}
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/25 to-transparent" />
                <div className="relative">
                  <h3 className={`font-display text-2xl font-medium ${c.image_url ? "text-white" : ""}`}>{c.name}</h3>
                  <span className="mt-3 inline-flex items-center gap-2 text-[0.74rem] uppercase tracking-[0.16em] text-blush-700 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    Explore →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
