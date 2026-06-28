const KEY = "vll_recently_viewed";
const MAX = 8;

export function pushRecentlyViewed(product) {
  if (!product?.id) return;
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    list = [];
  }
  const entry = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    discount_percent: product.discount_percent,
    images: product.images?.slice(0, 1) || [],
    category: product.category || null,
    is_new_arrival: product.is_new_arrival,
    is_best_seller: product.is_best_seller,
    is_trending: product.is_trending,
    stock: product.stock,
  };
  list = [entry, ...list.filter((p) => p.id !== product.id)].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}
