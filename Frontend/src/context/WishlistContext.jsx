import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext(null);
const KEY = "bookvault_wishlist";

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) ?? [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids]);

  const toggle = (bookId) => {
    setIds((prev) => (prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]));
  };

  const isWishlisted = (bookId) => ids.includes(bookId);

  return (
    <WishlistContext.Provider value={{ ids, toggle, isWishlisted }}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
