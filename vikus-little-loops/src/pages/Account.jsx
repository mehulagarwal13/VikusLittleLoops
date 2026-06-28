import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FiLogOut, FiPackage } from "react-icons/fi";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useToast } from "@/context/ToastContext";
import { customerApi } from "@/lib/api";
import { inr } from "@/lib/format";
import Button from "@/components/ui/Button";

const STATUS_LABEL = {
  pending: "Received", confirmed: "Confirmed", crafting: "Being crafted",
  shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled",
};

export default function Account() {
  const { customer, loading, logout, updateProfile } = useCustomerAuth();
  const { toast } = useToast();
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => customerApi.get("/customer/orders").then((r) => r.data),
    enabled: Boolean(customer),
  });

  if (loading)
    return (
      <main className="grid min-h-screen place-items-center">
        <span className="h-12 w-12 animate-spin rounded-full border-2 border-blush-300 border-t-blush-500" />
      </main>
    );
  if (!customer) return <Navigate to="/login" replace />;

  const startEdit = () => { setForm({ name: customer.name, phone: customer.phone || "" }); setEdit(true); };
  const save = async () => {
    await updateProfile(form);
    toast("Profile updated 🌸");
    setEdit(false);
  };

  const field = "w-full rounded-2xl border border-blush-300/50 bg-white/80 px-5 py-3 text-sm outline-none focus:border-blush-500";

  return (
    <main className="container-lux pb-28 pt-36">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {customer.avatar_url ? (
            <img src={customer.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-blush-300 to-peach font-display text-2xl">
              {customer.name?.[0]}
            </span>
          )}
          <div>
            <h1 className="heading-display text-3xl">Hi, {customer.name?.split(" ")[0]} 🌷</h1>
            <p className="text-ink-soft">{customer.email}</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 rounded-full border border-blush-300/60 bg-white/60 px-5 py-2.5 text-sm text-ink-soft hover:text-blush-600">
          <FiLogOut size={16} /> Logout
        </button>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        {/* Profile */}
        <div className="h-fit rounded-xl2 border border-blush-200/50 bg-ivory/80 p-7 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">Profile</h2>
            {!edit && <button onClick={startEdit} className="text-sm text-blush-600 hover:underline">Edit</button>}
          </div>
          {edit ? (
            <div className="mt-4 space-y-3">
              <input className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
              <input className={field} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" />
              <div className="flex gap-3">
                <Button size="sm" onClick={save}>Save</Button>
                <button onClick={() => setEdit(false)} className="text-sm text-ink-soft">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-2 font-serif text-lg text-ink-soft">
              <p>{customer.name}</p>
              <p>{customer.phone || "No phone added"}</p>
            </div>
          )}
        </div>

        {/* Orders */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl"><FiPackage /> Your Orders</h2>
          {isLoading ? (
            <p className="text-ink-soft">Loading orders…</p>
          ) : orders.length === 0 ? (
            <div className="rounded-xl2 border border-blush-200/50 bg-ivory/70 p-10 text-center shadow-soft">
              <p className="text-5xl">📦</p>
              <p className="mt-3 font-serif text-xl text-ink-soft">No orders yet.</p>
              <div className="mt-5"><Button to="/shop">Start Shopping</Button></div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl2 border border-blush-200/50 bg-ivory/70 p-6 shadow-soft"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-display text-lg">{o.order_number}</span>
                    <span className="rounded-full bg-blush-500/15 px-3 py-1 text-xs uppercase tracking-wide text-blush-700">
                      {STATUS_LABEL[o.status] || o.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">{new Date(o.created_at).toLocaleDateString()}</p>
                  <div className="mt-3 space-y-1 text-sm text-ink-soft">
                    {o.items.map((it, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{it.product_name} × {it.quantity}</span>
                        <span>{inr(it.unit_price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between border-t border-blush-200/50 pt-3 font-serif text-lg font-semibold">
                    <span>Total</span><span>{inr(o.total)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
