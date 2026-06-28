import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { inr } from "@/lib/format";
import { customerApi } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Valid email please"),
  phone: z.string().min(7, "Please enter a phone number"),
  address: z.string().min(5, "Please enter your address"),
  city: z.string().min(2, "City required"),
  state: z.string().optional(),
  pincode: z.string().optional(),
  coupon_code: z.string().optional(),
  notes: z.string().optional(),
});

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { customer } = useCustomerAuth();
  const navigate = useNavigate();
  const [placed, setPlaced] = useState(null);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: customer?.name || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
    },
  });

  if (placed) {
    return (
      <main className="container-lux grid min-h-[70vh] place-items-center pt-36 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <FiCheckCircle className="mx-auto text-olive" size={64} />
          <h1 className="heading-display mt-5 text-4xl">Thank you! 🌷</h1>
          <p className="mt-3 font-serif text-xl text-ink-soft">
            Your order <b className="text-blush-700">{placed.order_number}</b> is placed.
          </p>
          <p className="mt-1 font-serif text-lg text-ink-soft">
            We'll begin stitching it with love and reach out shortly.
          </p>
          <div className="mt-7"><Button to="/shop">Continue Shopping</Button></div>
        </motion.div>
      </main>
    );
  }

  if (items.length === 0)
    return (
      <main className="container-lux grid min-h-[60vh] place-items-center pt-36 text-center">
        <div>
          <p className="text-7xl">🛍️</p>
          <h1 className="heading-display mt-5 text-3xl">Nothing to check out yet</h1>
          <div className="mt-6"><Button to="/shop">Browse the Boutique</Button></div>
        </div>
      </main>
    );

  const onSubmit = async (form) => {
    setError("");
    try {
      const payload = {
        ...form,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      };
      const { data } = await customerApi.post("/orders", payload);
      clear();
      setPlaced(data);
    } catch (e) {
      setError(e?.response?.data?.detail || "Could not place order. Please try again.");
    }
  };

  const field = "w-full rounded-2xl border border-blush-300/50 bg-white/80 px-5 py-3.5 text-sm outline-none transition-shadow focus:border-blush-500 focus:shadow-glow";

  return (
    <main className="container-lux pb-28 pt-36">
      <h1 className="heading-display mb-10 text-[clamp(2.2rem,5vw,3.2rem)]">Checkout</h1>
      <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <h3 className="font-display text-xl">Shipping details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={errors.name}><input className={field} {...register("name")} /></Field>
            <Field label="Email" error={errors.email}><input type="email" className={field} {...register("email")} /></Field>
            <Field label="Phone" error={errors.phone}><input className={field} {...register("phone")} /></Field>
            <Field label="Pincode"><input className={field} {...register("pincode")} /></Field>
          </div>
          <Field label="Address" error={errors.address}><textarea rows={2} className={field} {...register("address")} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City" error={errors.city}><input className={field} {...register("city")} /></Field>
            <Field label="State"><input className={field} {...register("state")} /></Field>
          </div>
          <Field label="Coupon code (optional)"><input className={`${field} uppercase`} {...register("coupon_code")} /></Field>
          <Field label="Order notes (optional)"><textarea rows={2} className={field} {...register("notes")} /></Field>

          {error && <p className="text-sm text-blush-700">{error}</p>}

          <Button type="submit" size="lg" className={isSubmitting ? "pointer-events-none opacity-60" : ""}>
            {isSubmitting ? "Placing order…" : "Place Order"}
          </Button>
          <p className="text-xs text-ink-soft">
            This is a cash/UPI-on-confirmation flow — we'll message you to arrange payment.
          </p>
        </form>

        {/* Summary */}
        <div className="h-fit rounded-xl2 border border-blush-200/50 bg-ivory/80 p-7 shadow-soft">
          <h3 className="font-display text-xl">Your Order</h3>
          <div className="mt-5 space-y-4">
            {items.map((i) => (
              <div key={i.product_id} className="flex items-center gap-3">
                <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-blush-100">
                  {i.image ? <img src={i.image} alt="" className="h-full w-full object-cover" /> : <span className="text-2xl">{i.emoji}</span>}
                </span>
                <div className="flex-1 text-sm">
                  <p className="font-medium">{i.name}</p>
                  <p className="text-ink-soft">Qty {i.quantity}</p>
                </div>
                <span className="font-serif font-medium">{inr(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2 border-t border-blush-200/50 pt-5 text-ink-soft">
            <div className="flex justify-between"><span>Subtotal</span><span className="text-ink">{inr(subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span className="text-olive-deep">Free</span></div>
          </div>
          <div className="mt-4 flex justify-between border-t border-blush-200/50 pt-4 font-serif text-2xl font-semibold">
            <span>Total</span><span>{inr(subtotal)}</span>
          </div>
          <Link to="/cart" className="mt-4 block text-center text-sm text-ink-soft hover:text-blush-600">Edit cart</Link>
        </div>
      </div>
    </main>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-blush-700">{error.message}</p>}
    </div>
  );
}
