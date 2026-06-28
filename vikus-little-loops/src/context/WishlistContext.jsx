import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext(null);
const KEY = "vll_wishlist";

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const has = (id) => items.some((i) => i.product_id === id);

  const toggle = (product) => {
    setItems((prev) =>
      prev.some((i) => i.product_id === product.product_id)
        ? prev.filter((i) => i.product_id !== product.product_id)
        : [...prev, product]
    );
  };

  const remove = (id) => setItems((prev) => prev.filter((i) => i.product_id !== id));

  return (
    <WishlistContext.Provider value={{ items, has, toggle, remove, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
