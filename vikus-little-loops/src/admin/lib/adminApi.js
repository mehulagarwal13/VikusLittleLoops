import { api } from "@/lib/api";

// ---- Dashboard ----
export const getStats = () => api.get("/admin/stats").then((r) => r.data);

// ---- Products ----
export const getAdminProducts = () => api.get("/admin/products").then((r) => r.data);
export const getProduct = (slug) => api.get(`/products/${slug}`).then((r) => r.data);
export const createProduct = (payload) => api.post("/products", payload).then((r) => r.data);
export const updateProduct = (id, payload) => api.patch(`/products/${id}`, payload).then((r) => r.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then((r) => r.data);

// ---- Catalog ----
export const getCategories = () => api.get("/categories?active_only=false").then((r) => r.data);
export const createCategory = (payload) => api.post("/categories", payload).then((r) => r.data);
export const updateCategory = (id, payload) => api.patch(`/categories/${id}`, payload).then((r) => r.data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`).then((r) => r.data);

export const getCollections = () => api.get("/collections").then((r) => r.data);
export const createCollection = (payload) => api.post("/collections", payload).then((r) => r.data);

// ---- Coupons ----
export const createCoupon = (payload) => api.post("/coupons", payload).then((r) => r.data);

// ---- Reviews ----
export const getReviews = () => api.get("/admin/reviews").then((r) => r.data);
export const approveReview = (id) => api.patch(`/admin/reviews/${id}/approve`).then((r) => r.data);
export const deleteReview = (id) => api.delete(`/admin/reviews/${id}`).then((r) => r.data);

// ---- Custom orders ----
export const getCustomOrders = () => api.get("/custom-orders").then((r) => r.data);
export const setCustomOrderStatus = (id, status) =>
  api.patch(`/admin/custom-orders/${id}/status`, { status }).then((r) => r.data);

// ---- Customers ----
export const getCustomers = () => api.get("/admin/customers").then((r) => r.data);

// ---- Orders ----
export const getOrders = () => api.get("/admin/orders").then((r) => r.data);
export const setOrderStatus = (id, status) =>
  api.patch(`/admin/orders/${id}/status`, { status }).then((r) => r.data);

// ---- Uploads (Cloudinary via backend) ----
export const uploadImage = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return api
    .post("/uploads/image", fd, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
};
