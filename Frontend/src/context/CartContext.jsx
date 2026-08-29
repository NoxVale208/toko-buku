import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user || user.role !== "customer") {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/cart");
      setCart(res.data.data ?? null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const items = cart?.cart_details ?? [];
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.qty * (i.harga ?? i.book?.harga?.jual ?? 0), 0);

  const addToCart = async (bookId, qty = 1) => {
    await api.post("/cart/add", { book_id: bookId, qty });
    await refresh();
  };

  const updateQty = async (detailId, qty) => {
    try {
      await api.put(`/cart/update/${detailId}`, { qty });
    } catch (err) {
      console.error("Gagal memperbarui jumlah item keranjang:", err);
    } finally {
      await refresh();
    }
  };

  const removeItem = async (detailId) => {
    try {
      await api.delete(`/cart/remove/${detailId}`);
    } catch (err) {
      console.error("Gagal menghapus item keranjang:", err);
    } finally {
      await refresh();
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, items, itemCount, subtotal, loading, refresh, addToCart, updateQty, removeItem }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
