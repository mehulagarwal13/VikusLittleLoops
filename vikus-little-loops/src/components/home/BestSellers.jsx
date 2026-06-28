import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import { stagger, reveal } from "@/lib/motion";
import { useProducts } from "@/lib/hooks";

export default function BestSellers() {
  // Prefer best sellers; fall back to featured/newest if none flagged.
  const { data, isLoading } = useProducts({ page_size: 4, sort: "best_selling" });
  const products = data?.items || [];

  return (
    <section className="container-lux py-28">
      <SectionHeading
        kicker="Best Sellers"
        title="Loved a Little Extra"
        subtitle="The pieces our little community keeps coming back for."
      />

      {isLoading ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[420px] animate-pulse rounded-xl2 bg-blush-100/60" />
          ))}
        </div>
      ) : !products.length ? (
        <p className="text-center font-serif text-xl text-ink-soft">
          New pieces are on their way. 🧶
        </p>
      ) : (
        <motion.div variants={stagger} {...reveal} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </motion.div>
      )}

      <div className="mt-14 text-center">
        <Button to="/shop" variant="ghost">View All Products</Button>
      </div>
    </section>
  );
}
