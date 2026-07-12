import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiCheck, FiTrash2, FiRotateCcw, FiPlus, FiUploadCloud, FiX } from "react-icons/fi";
import { getReviews, approveReview, deleteReview, createReview, getAdminProducts, uploadImage } from "@/admin/lib/adminApi";
import { PageTitle, Panel, Spinner, EmptyState, StatusPill } from "@/admin/components/AdminUI";

const inp = "w-full rounded-xl border border-white/10 bg-[#15101a] px-4 py-2.5 text-sm text-white outline-none focus:border-blush-500";
const lbl = "mb-1.5 block text-xs uppercase tracking-wide text-blush-200/50";

const EMPTY = { product_id: "", author_name: "", rating: 5, title: "", body: "", photo_url: "" };

export default function Reviews() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-reviews"], queryFn: getReviews });
  const { data: products } = useQuery({ queryKey: ["admin-products"], queryFn: getAdminProducts });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-reviews"] });
  const approve = useMutation({ mutationFn: approveReview, onSuccess: refresh });
  const del = useMutation({ mutationFn: deleteReview, onSuccess: refresh });

  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handlePhoto = async (files) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const res = await uploadImage(files[0]);
      setForm((f) => ({ ...f, photo_url: res.url }));
    } finally {
      setUploading(false);
    }
  };
  const create = useMutation({
    mutationFn: createReview,
    onSuccess: () => { setForm(EMPTY); setShowForm(false); refresh(); },
  });

  const canSubmit = form.author_name.trim() && form.body.trim();

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageTitle title="Reviews" subtitle="Add reviews that display on the website, approve or remove customer ones" />
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-blush-400 to-blush-600 px-4 py-2.5 text-sm font-medium text-white transition hover:shadow-lift"
        >
          <FiPlus size={15} /> Add Review
        </button>
      </div>

      {showForm && (
        <Panel className="mb-6">
          <h3 className="mb-4 font-display text-lg text-white">New Review</h3>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className={lbl}>Product (optional)</label>
              <select
                className={inp}
                value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
              >
                <option value="">General review (whole shop)</option>
                {(products?.items || products || []).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Customer name</label>
              <input className={inp} value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} placeholder="Aisha, Mumbai" />
            </div>
            <div>
              <label className={lbl}>Rating</label>
              <div className="flex gap-1 pt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setForm({ ...form, rating: n })} className={`text-2xl ${n <= form.rating ? "text-blush-400" : "text-white/20"}`}>★</button>
                ))}
              </div>
            </div>
            <div>
              <label className={lbl}>Title (optional)</label>
              <input className={inp} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="So adorable!" />
            </div>
            <div className="lg:col-span-2">
              <label className={lbl}>Review text</label>
              <textarea rows={3} className={inp} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="The tulips arrived beautifully packaged…" />
            </div>
            <div className="lg:col-span-2">
              <label className={lbl}>Customer photo (optional)</label>
              {form.photo_url ? (
                <div className="group relative inline-block">
                  <img src={form.photo_url} alt="" className="h-28 w-28 rounded-xl border border-white/10 object-cover" />
                  <button
                    onClick={() => setForm({ ...form, photo_url: "" })}
                    className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handlePhoto([...e.dataTransfer.files]); }}
                  className="grid place-items-center rounded-xl border-2 border-dashed border-white/10 bg-[#15101a] py-5 text-center"
                >
                  <FiUploadCloud className="text-blush-300" size={22} />
                  <label className="mt-2 cursor-pointer rounded-lg bg-blush-500/20 px-3 py-1.5 text-sm text-blush-200 hover:bg-blush-500/30">
                    {uploading ? "Uploading…" : "Browse photo"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhoto([...e.target.files])} />
                  </label>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              disabled={!canSubmit || create.isPending}
              onClick={() => create.mutate({ ...form, product_id: form.product_id ? Number(form.product_id) : null, title: form.title || null, photo_url: form.photo_url || null })}
              className="rounded-xl bg-gradient-to-br from-blush-400 to-blush-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {create.isPending ? "Adding…" : "Add & Publish"}
            </button>
            {create.isError && <span className="text-sm text-red-300">Could not add — check the fields.</span>}
          </div>
        </Panel>
      )}

      {isLoading ? <Spinner /> : !data?.length ? <EmptyState emoji="⭐" text="No reviews yet. Use Add Review to create the first ones." /> : (
        <div className="grid gap-4">
          {data.map((r) => (
            <Panel key={r.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <b className="font-display text-lg text-white">{r.author_name}</b>
                    <span className="text-blush-400">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                    <StatusPill status={r.is_approved ? "approved" : "reviewing"} />
                  </div>
                  {r.title && <p className="mt-2 font-medium text-blush-50">{r.title}</p>}
                  {r.body && <p className="mt-1 text-sm text-blush-100/70">{r.body}</p>}
                  {r.photo_url && <img src={r.photo_url} alt="" className="mt-2 h-20 w-20 rounded-lg border border-white/10 object-cover" />}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approve.mutate(r.id)}
                    className={`grid h-9 w-9 place-items-center rounded-lg ${r.is_approved ? "bg-white/5 text-blush-200" : "bg-emerald-500/15 text-emerald-300"} hover:opacity-80`}
                    title={r.is_approved ? "Unapprove" : "Approve"}
                  >
                    {r.is_approved ? <FiRotateCcw size={15} /> : <FiCheck size={15} />}
                  </button>
                  <button
                    onClick={() => { if (confirm("Delete this review?")) del.mutate(r.id); }}
                    className="grid h-9 w-9 place-items-center rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
