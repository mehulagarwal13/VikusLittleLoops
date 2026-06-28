import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import { scaleIn, reveal } from "@/lib/motion";
import { api } from "@/lib/api";

const schema = z.object({ email: z.string().email("Please enter a valid email") });

export default function Newsletter() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await api.post("/newsletter", data);
    } catch {
      /* swallow — still show friendly confirmation */
    }
    reset();
  };

  return (
    <section className="container-lux py-28">
      <motion.div
        variants={scaleIn}
        {...reveal}
        className="relative overflow-hidden rounded-xl3 bg-gradient-to-br from-blush-100 to-lavender p-12 text-center shadow-soft md:p-20"
      >
        <span className="pointer-events-none absolute left-8 top-8 animate-float text-4xl opacity-60">🧶</span>
        <span className="pointer-events-none absolute bottom-8 right-9 animate-float text-4xl opacity-60" style={{ animationDelay: "-5s" }}>🌷</span>

        <h2 className="heading-display text-[clamp(1.9rem,4.4vw,2.8rem)]">
          Join the Little Loop
        </h2>
        <p className="mx-auto mt-3 max-w-md font-serif text-xl text-ink-soft">
          Early peeks at new drops, gentle restock alerts, and a sweet welcome treat.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto mt-8 flex max-w-md flex-wrap justify-center gap-3"
          noValidate
        >
          <input
            type="email"
            placeholder="your@email.com"
            aria-label="Email"
            {...register("email")}
            className="min-w-[230px] flex-1 rounded-full border border-blush-300/50 bg-white/80 px-6 py-4 font-sans text-sm text-ink outline-none transition-shadow focus:border-blush-500 focus:shadow-glow"
          />
          <Button type="submit">Subscribe</Button>
        </form>
        {errors.email && (
          <p className="mt-3 text-sm text-blush-700">{errors.email.message}</p>
        )}
        {isSubmitSuccessful && !errors.email && (
          <p className="mt-3 text-sm text-olive-deep">Welcome to the loop! 🌸</p>
        )}
      </motion.div>
    </section>
  );
}
