import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import { fadeUp, stagger, reveal } from "@/lib/motion";
import { api } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Valid email please"),
  color: z.string().min(1, "Pick a colour"),
  size: z.string().min(1, "Pick a size"),
  yarn: z.string().min(1, "Choose a yarn"),
  budget: z.string().optional(),
  date: z.string().optional(),
  details: z.string().min(10, "Describe your dream piece"),
});

const colors = ["Blush Pink", "Lavender", "Peach", "Olive", "Ivory", "Mix"];
const sizes = ["Small", "Medium", "Large", "Custom"];
const yarns = ["Soft Cotton", "Velvet", "Chunky Wool", "Metallic Accent"];

export default function CustomOrder() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitSuccessful } } =
    useForm({ resolver: zodResolver(schema) });

  return (
    <main className="container-lux pb-28 pt-36">
      <header className="mx-auto max-w-2xl text-center">
        <span className="text-[0.72rem] uppercase tracking-[0.2em] text-olive-deep">Made Just For You</span>
        <h1 className="heading-display mt-3 text-[clamp(2.4rem,5.5vw,4rem)]">Custom Order</h1>
        <p className="mx-auto mt-4 max-w-lg font-serif text-xl text-ink-soft">
          Dreaming of something one-of-a-kind? Tell us your vision and we'll
          handcraft it, loop by loop.
        </p>
      </header>

      <motion.form
        variants={stagger}
        {...reveal}
        onSubmit={handleSubmit(async (d) => {
          const { date, ...rest } = d;
          await api.post("/custom-orders", { ...rest, delivery_date: date || null });
          reset();
        })}
        noValidate
        className="mx-auto mt-14 max-w-3xl rounded-xl3 border border-blush-200/50 bg-ivory/80 p-8 shadow-soft md:p-12"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Your name" error={errors.name}><input {...register("name")} className={inp} /></Field>
          <Field label="Email" error={errors.email}><input type="email" {...register("email")} className={inp} /></Field>
          <Field label="Preferred colour" error={errors.color}>
            <select {...register("color")} className={inp}><option value="">Select…</option>{colors.map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label="Size" error={errors.size}>
            <select {...register("size")} className={inp}><option value="">Select…</option>{sizes.map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label="Yarn type" error={errors.yarn}>
            <select {...register("yarn")} className={inp}><option value="">Select…</option>{yarns.map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label="Budget (₹, optional)"><input {...register("budget")} className={inp} placeholder="e.g. 1500" /></Field>
          <Field label="Needed by (optional)"><input type="date" {...register("date")} className={inp} /></Field>
          <Field label="Inspiration image (optional)">
            <input type="file" accept="image/*" className="w-full rounded-2xl border border-dashed border-blush-300/70 bg-white/60 px-5 py-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-blush-500 file:px-4 file:py-2 file:text-white" />
          </Field>
        </div>

        <Field label="Describe your dream piece" error={errors.details} full>
          <textarea rows={5} {...register("details")} className={inp} placeholder="Colours, vibe, who it's for, any reference…" />
        </Field>

        <div className="mt-8 flex items-center gap-4">
          <Button type="submit" size="lg">Send Request</Button>
          <span className="font-serif text-base text-ink-soft">We reply within 24 hours 🌸</span>
        </div>
        {isSubmitSuccessful && <p className="mt-4 text-sm text-olive-deep">Your request is on its way! We'll be in touch soon.</p>}
      </motion.form>
    </main>
  );
}

const inp = "w-full rounded-2xl border border-blush-300/50 bg-white/80 px-5 py-3.5 text-sm outline-none transition-shadow focus:border-blush-500 focus:shadow-glow";

function Field({ label, error, children, full }) {
  return (
    <motion.div variants={fadeUp} className={full ? "mt-6" : ""}>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-blush-700">{error.message}</p>}
    </motion.div>
  );
}
