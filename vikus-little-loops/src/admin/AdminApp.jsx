import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/admin/components/ProtectedRoute";
import AdminLayout from "@/admin/components/AdminLayout";
import Login from "@/admin/pages/Login";
import Dashboard from "@/admin/pages/Dashboard";
import Products from "@/admin/pages/Products";
import ProductForm from "@/admin/pages/ProductForm";
import Categories from "@/admin/pages/Categories";
import Collections from "@/admin/pages/Collections";
import Coupons from "@/admin/pages/Coupons";
import CustomOrders from "@/admin/pages/CustomOrders";
import Orders from "@/admin/pages/Orders";
import Customers from "@/admin/pages/Customers";
import Reviews from "@/admin/pages/Reviews";

function Shell({ children }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route index element={<Shell><Dashboard /></Shell>} />
      <Route path="products" element={<Shell><Products /></Shell>} />
      <Route path="products/new" element={<Shell><ProductForm /></Shell>} />
      <Route path="products/:slug/edit" element={<Shell><ProductForm /></Shell>} />
      <Route path="categories" element={<Shell><Categories /></Shell>} />
      <Route path="collections" element={<Shell><Collections /></Shell>} />
      <Route path="coupons" element={<Shell><Coupons /></Shell>} />
      <Route path="custom-orders" element={<Shell><CustomOrders /></Shell>} />
      <Route path="reviews" element={<Shell><Reviews /></Shell>} />
      <Route path="orders" element={<Shell><Orders /></Shell>} />
      <Route path="customers" element={<Shell><Customers /></Shell>} />
    </Routes>
  );
}
