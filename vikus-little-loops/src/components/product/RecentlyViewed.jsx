import { motion } from "framer-motion";
import ProductCard from "@/components/ui/ProductCard";
import { stagger, reveal } from "@/lib/motion";
import { getRecentlyViewed } from "@/lib/recentlyViewed";

export default function RecentlyViewed({ excludeId }) {
  const items = getRecentlyViewed().filter((p) => p.id !== excludeId);
  if (items.length === 0) return null;

  return (
    <section className="mt-24">
      <h2 className="heading-display mb-10 text-center text-[clamp(1.8rem,4vw,2.6rem)]">Recently Viewed</h2>
      <motion.div variants={stagger} {...reveal} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </motion.div>
    </section>
  );
}
