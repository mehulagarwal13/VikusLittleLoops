import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiGrid, FiBox, FiTag, FiLayers, FiGift, FiHeart, FiShoppingBag,
  FiUsers, FiStar, FiLogOut, FiMenu, FiX, FiExternalLink,
} from "react-icons/fi";
import { useAuth } from "@/admin/context/AuthContext";

const nav = [
  { to: "/admin", label: "Dashboard", icon: FiGrid, end: true },
  { to: "/admin/products", label: "Products", icon: FiBox },
  { to: "/admin/categories", label: "Categories", icon: FiTag },
  { to: "/admin/collections", label: "Collections", icon: FiLayers },
  { to: "/admin/orders", label: "Orders", icon: FiShoppingBag },
  { to: "/admin/custom-orders", label: "Custom Orders", icon: FiHeart },
  { to: "/admin/reviews", label: "Reviews", icon: FiStar },
  { to: "/admin/coupons", label: "Coupons", icon: FiGift },
  { to: "/admin/customers", label: "Customers", icon: FiUsers },
];

export default function AdminLayout({ children }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const SidebarBody = (
    <>
      <div className="flex items-center gap-3 px-6 py-6">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blush-400 to-blush-600 text-white">
          ✿
        </span>
        <div>
          <p className="font-display text-lg font-semibold text-white">Little Loops</p>
          <p className="text-[0.68rem] uppercase tracking-[0.2em] text-blush-300/70">Admin</p>
        </div>
      </div>
      <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                isActive
                  ? "bg-blush-500/20 text-blush-200 shadow-[inset_2px_0_0_#DC6B86]"
                  : "text-blush-100/60 hover:bg-white/5 hover:text-blush-100"
              }`
            }
          >
            <n.icon size={18} />
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pb-6">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-blush-100/60 hover:bg-white/5 hover:text-blush-100"
        >
          <FiExternalLink size={18} /> View Store
        </a>
        <button
          onClick={() => { logout(); navigate("/admin/login"); }}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-blush-100/60 hover:bg-white/5 hover:text-blush-100"
        >
          <FiLogOut size={18} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#15101a] text-blush-50">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-white/5 bg-[#1c1522] lg:flex">
        {SidebarBody}
      </aside>

      {/* Sidebar — mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-[#1c1522]">
            {SidebarBody}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-[#15101a]/80 px-6 py-4 backdrop-blur">
          <button className="text-blush-100 lg:hidden" onClick={() => setOpen(true)}>
            <FiMenu size={22} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{admin?.name || "Admin"}</p>
              <p className="text-xs text-blush-200/50">{admin?.email}</p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blush-400 to-blush-600 font-display text-white">
              {(admin?.name || "A")[0]}
            </span>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
