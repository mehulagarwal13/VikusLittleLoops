import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { FiUploadCloud, FiX, FiStar } from "react-icons/fi";
import {
  createProduct, updateProduct, getProduct,
  getCategories, getCollections, uploadImage,
} from "@/admin/lib/adminApi";
import { PageTitle, Panel, Spinner } from "@/admin/components/AdminUI";

const inp =
  "w-full rounded-xl border border-white/10 bg-[#15101a] px-4 py-2.5 text-sm text-white outline-none transition focus:border-blush-500 placeholder:text-blush-200/30";
const lbl = "mb-1.5 block text-xs uppercase tracking-wide text-blush-200/50";

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function ProductForm() {
  const { slug } = useParams();
  const editing = Boolean(slug);
  const navigate = useNavigate();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { is_published: true, discount_percent: 0, stock: 0, tags: "" },
  });

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  const { data: categories } = useQuery({ queryKey: ["cats-all"], queryFn: getCategories });
  const { data: collections } = useQuery({ queryKey: ["cols-all"], queryFn: getCollections });
  const { data: existing, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProduct(slug),
    enabled: editing,
  });

  useEffect(() => {
    if (existing) {
      setEditId(existing.id);
      reset({
        ...existing,
        tags: (existing.tags || []).join(", "),
        category_id: existing.category_id || "",
        collection_id: existing.collection_id || "",
      });
      setImages(existing.images || []);
    }
  }, [existing, reset]);

  // auto-slug from name (create only)
  const nameVal = watch("name");
  useEffect(() => {
    if (!editing && nameVal) setValue("slug", slugify(nameVal));
  }, [nameVal, editing, setValue]);

  const handleFiles = async (files) => {
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        const res = await uploadImage(file);
        setImages((prev) => [
          ...prev,
          { url: res.url, public_id: res.public_id, is_primary: prev.length === 0, sort_order: prev.length, alt_text: "" },
        ]);
      }
    } catch (e) {
      setError(e?.response?.data?.detail || "Image upload failed (check Cloudinary config).");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (form) => {
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      price: Number(form.price),
      discount_percent: Number(form.discount_percent) || 0,
      stock: Number(form.stock) || 0,
      category_id: form.category_id ? Number(form.category_id) : null,
      collection_id: form.collection_id ? Number(form.collection_id) : null,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };
    // Normalize images to the API shape (strip server-only fields like id).
    const cleanImages = images.map((im, i) => ({
      url: im.url,
      public_id: im.public_id || null,
      alt_text: im.alt_text || null,
      is_primary: !!im.is_primary,
      sort_order: i,
    }));
    try {
      if (editing) {
        delete payload.variants;
        payload.images = cleanImages; // replaces the full image set
        await updateProduct(editId, payload);
      } else {
        payload.images = cleanImages;
        await createProduct(payload);
      }
      navigate("/admin/products");
    } catch (e) {
      setError(e?.response?.data?.detail || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (editing && isLoading) return <Spinner />;

  return (
    <>
      <PageTitle title={editing ? "Edit Product" : "New Product"} subtitle="Crafted details for your boutique" />
      {error && <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* LEFT */}
        <div className="space-y-6">
          <Panel className="space-y-4">
            <div>
              <label className={lbl}>Product name</label>
              <input className={inp} {...register("name", { required: true })} />
              {errors.name && <p className="mt-1 text-xs text-red-400">Required</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={lbl}>Slug</label>
                <input className={inp} {...register("slug", { required: true })} />
              </div>
              <div>
                <label className={lbl}>SKU</label>
                <input className={inp} {...register("sku")} />
              </div>
            </div>
            <div>
              <label className={lbl}>Short description</label>
              <input className={inp} {...register("short_description")} />
            </div>
            <div>
              <label className={lbl}>Long description</label>
              <textarea rows={5} className={inp} {...register("long_description")} />
            </div>
          </Panel>

          {/* Images */}
          <Panel>
            <label className={lbl}>Images</label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFiles([...e.dataTransfer.files]); }}
              className="grid place-items-center rounded-xl border-2 border-dashed border-white/10 bg-[#15101a] py-8 text-center"
            >
              <FiUploadCloud className="text-blush-300" size={26} />
              <p className="mt-2 text-sm text-blush-200/60">Drag & drop, or</p>
              <label className="mt-2 cursor-pointer rounded-lg bg-blush-500/20 px-3 py-1.5 text-sm text-blush-200 hover:bg-blush-500/30">
                Browse files
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles([...e.target.files])}
                />
              </label>
              {uploading && <p className="mt-2 text-xs text-blush-300">Uploading to Cloudinary…</p>}
            </div>

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {images.map((im, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-white/10">
                    <img src={im.url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))}
                      className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                    >
                      <FiX size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setImages((p) => p.map((x, idx) => ({ ...x, is_primary: idx === i })))}
                      className={`absolute left-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full ${im.is_primary ? "bg-blush-500 text-white" : "bg-black/60 text-white/70 opacity-0 group-hover:opacity-100"}`}
                      title="Set primary"
                    >
                      <FiStar size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* SEO */}
          <Panel className="space-y-4">
            <h3 className="font-display text-white">SEO</h3>
            <div>
              <label className={lbl}>Meta title</label>
              <input className={inp} {...register("meta_title")} />
            </div>
            <div>
              <label className={lbl}>Meta description</label>
              <textarea rows={2} className={inp} {...register("meta_description")} />
            </div>
            <div>
              <label className={lbl}>Image alt text</label>
              <input className={inp} {...register("alt_text")} />
            </div>
          </Panel>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <Panel className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Price (₹)</label>
                <input type="number" step="0.01" className={inp} {...register("price", { required: true })} />
              </div>
              <div>
                <label className={lbl}>Discount %</label>
                <input type="number" className={inp} {...register("discount_percent")} />
              </div>
            </div>
            <div>
              <label className={lbl}>Stock</label>
              <input type="number" className={inp} {...register("stock")} />
            </div>
            <div>
              <label className={lbl}>Category</label>
              <select className={inp} {...register("category_id")}>
                <option value="">— none —</option>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Collection</label>
              <select className={inp} {...register("collection_id")}>
                <option value="">— none —</option>
                {collections?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Tags (comma-separated)</label>
              <input className={inp} {...register("tags")} placeholder="handmade, crochet" />
            </div>
          </Panel>

          <Panel className="space-y-4">
            <h3 className="font-display text-white">Details</h3>
            <div><label className={lbl}>Material</label><input className={inp} {...register("material")} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Weight</label><input className={inp} {...register("weight")} /></div>
              <div><label className={lbl}>Dimensions</label><input className={inp} {...register("dimensions")} /></div>
            </div>
            <div><label className={lbl}>Care instructions</label><textarea rows={2} className={inp} {...register("care_instructions")} /></div>
          </Panel>

          <Panel className="space-y-3">
            <h3 className="font-display text-white">Visibility</h3>
            {[
              ["is_featured", "Featured"],
              ["is_trending", "Trending"],
              ["is_best_seller", "Best Seller"],
              ["is_new_arrival", "New Arrival"],
              ["is_published", "Published"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 text-sm text-blush-100">
                <input type="checkbox" {...register(key)} className="h-4 w-4 accent-blush-500" />
                {label}
              </label>
            ))}
          </Panel>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-gradient-to-br from-blush-400 to-blush-600 py-3 text-sm font-medium uppercase tracking-wide text-white transition hover:shadow-lift disabled:opacity-60"
          >
            {saving ? "Saving…" : editing ? "Update Product" : "Publish Product"}
          </button>
        </div>
      </form>
    </>
  );
}
