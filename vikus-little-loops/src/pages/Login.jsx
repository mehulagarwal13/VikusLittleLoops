import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useToast } from "@/context/ToastContext";
import GoogleButton from "@/components/auth/GoogleButton";

export default function Login() {
  const { login, register, googleLogin } = useCustomerAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/account";

  const [mode, setMode] = useState("login"); // login | register
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const done = (who) => {
    toast(`Welcome, ${who?.name?.split(" ")[0] || "friend"}! 🌷`);
    navigate(from, { replace: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const who =
        mode === "login"
          ? await login(form.email, form.password)
          : await register({ name: form.name, email: form.email, password: form.password, phone: form.phone || null });
      done(who);
    } catch (err) {
      setError(err?.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async (credential) => {
    setError("");
    try {
      const who = await googleLogin(credential);
      done(who);
    } catch (err) {
      setError(err?.response?.data?.detail || "Google sign-in failed.");
    }
  };

  const field = "w-full rounded-2xl border border-blush-300/50 bg-white/80 px-5 py-3.5 text-sm outline-none transition-shadow focus:border-blush-500 focus:shadow-glow";

  return (
    <main className="container-lux grid min-h-screen place-items-center px-6 pt-28 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md rounded-xl3 border border-blush-200/50 bg-ivory/80 p-9 shadow-soft"
      >
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-blush-400 to-blush-600 text-2xl text-white shadow-soft">✿</span>
          <h1 className="heading-display mt-4 text-3xl">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-1 font-serif text-lg text-ink-soft">
            {mode === "login" ? "Sign in to see your orders & wishlist" : "Join the little loop"}
          </p>
        </div>

        <div className="mt-7">
          <GoogleButton onCredential={onGoogle} />
        </div>

        <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-widest text-warmgray">
          <span className="h-px flex-1 bg-blush-200/60" /> or <span className="h-px flex-1 bg-blush-200/60" />
        </div>

        <form onSubmit={submit} className="space-y-3" noValidate>
          {mode === "register" && (
            <input className={field} placeholder="Full name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          )}
          <input type="email" className={field} placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input type="password" className={field} placeholder="Password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          {mode === "register" && (
            <input className={field} placeholder="Phone (optional)" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          )}

          {error && <p className="text-sm text-blush-700">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-gradient-to-br from-blush-400 to-blush-600 py-3.5 text-sm uppercase tracking-[0.12em] text-white transition hover:shadow-lift disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-soft">
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="font-medium text-blush-600 hover:underline"
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
        <p className="mt-3 text-center">
          <Link to="/shop" className="text-xs text-warmgray hover:text-blush-600">Continue shopping →</Link>
        </p>
      </motion.div>
    </main>
  );
}
