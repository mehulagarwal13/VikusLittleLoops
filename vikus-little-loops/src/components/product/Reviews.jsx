import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

function Stars({ value, onChange }) {
  return (
    <div className="flex gap-1 text-2xl">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className={`transition ${n <= value ? "text-blush-500" : "text-blush-200"} ${onChange ? "hover:scale-110" : "cursor-default"}`}
          aria-label={`${n} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function Reviews({ productId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => api.get(`/reviews?product_id=${productId}`).then((r) => r.data),
    enabled: Boolean(productId),
  });

  const [form, setForm] = useState({ author_name: "", rating: 5, title: "", body: "" });

  const submit = useMutation({
    mutationFn: (payload) => api.post("/reviews", payload).then((r) => r.data),
    onSuccess: () => {
      toast("Thank you! Your review is awaiting approval. 🌸");
      setForm({ author_name: "", rating: 5, title: "", body: "" });
      qc.invalidateQueries({ queryKey: ["reviews", productId] });
    },
    onError: () => toast("Couldn't submit review. Please try again.", "info"),
  });

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const field = "w-full rounded-2xl border border-blush-300/50 bg-white/80 px-5 py-3 text-sm outline-none transition-shadow focus:border-blush-500 focus:shadow-glow";

  return (
    <section className="mt-24">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="heading-display text-[clamp(1.8rem,4vw,2.4rem)]">Reviews</h2>
          {avg && (
            <p className="mt-1 text-ink-soft">
              <span className="text-blush-500">{"★".repeat(Math.round(avg))}</span> {avg} · {reviews.length} review{reviews.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        {/* List */}
        <div className="space-y-5">
          {isLoading ? (
            <p className="text-ink-soft">Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <p className="font-serif text-lg text-ink-soft">No reviews yet — be the first to share some love. 💗</p>
          ) : (
            reviews.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-xl2 border border-blush-200/50 bg-ivory/70 p-6 shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <b className="font-display text-lg font-medium">{r.author_name}</b>
                  <span className="text-blush-500">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                </div>
                {r.title && <p className="mt-2 font-medium">{r.title}</p>}
                {r.body && <p className="mt-1 font-serif text-base text-ink-soft">{r.body}</p>}
              </motion.div>
            ))
          )}
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => { e.preventDefault(); submit.mutate({ ...form, product_id: productId }); }}
          className="h-fit rounded-xl2 border border-blush-200/50 bg-ivory/80 p-7 shadow-soft"
        >
          <h3 className="font-display text-xl">Write a Review</h3>
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium">Your rating</label>
            <Stars value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
          </div>
          <div className="mt-4 space-y-3">
            <input className={field} placeholder="Your name" value={form.author_name}
              onChange={(e) => setForm({ ...form, author_name: e.target.value })} required />
            <input className={field} placeholder="Title (optional)" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea rows={4} className={field} placeholder="Share your thoughts…" value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </div>
          <button
            type="submit"
            disabled={submit.isPending}
            className="mt-4 w-full rounded-full bg-gradient-to-br from-blush-400 to-blush-600 py-3 text-sm uppercase tracking-[0.12em] text-white transition hover:shadow-lift disabled:opacity-60"
          >
            {submit.isPending ? "Submitting…" : "Submit Review"}
          </button>
        </form>
      </div>
    </section>
  );
}
