import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../ui/Icon";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";

const PLACEHOLDER_COVER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA9GOxzi7Ik5ddrno1oFJx_p5lbe-7fpgdFRqJPehVowjdEBK5aoIc-EXQmcSMcnlj8ezZ6zJc9mRxFVA1aMZ1nsCGRZDGxGdbUA1mmDC9wgJlXCie50r-fRJLkAECHXj0WoqRwFe9Oz91xwkLLSx5CaeYrOkPE29wEI9Tg2Otv6AQSsM4ARZZtawikpGMyfFqDkXRgBCnXl0MekTCNgSl0J2k7jlPVYfUGq1VNFRkjJH5lmFO0Ei1w";

function formatIDR(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value ?? 0
  );
}

export default function BookCard({ book }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const wishlisted = isWishlisted(book.id);
  const outOfStock = (book.stok?.tersedia ?? 0) <= 0;
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    setAdding(true);
    setError("");
    try {
      await addToCart(book.id, 1);
    } catch (err) {
      setError(err.response?.data?.message ?? "Gagal menambahkan ke keranjang.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group flex flex-col bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 transition-all duration-300 hover:shadow-level2 hover:-translate-y-0.5">
      <Link to={`/books/${book.id}`} className="relative aspect-[3/4] rounded-lg overflow-hidden mb-md shadow-sm block bg-surface-container">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={book.cover || PLACEHOLDER_COVER}
          alt={book.judul}
        />
        {outOfStock && (
          <div className="absolute top-2 right-2 bg-error/90 backdrop-blur-sm text-on-error text-[10px] font-bold px-2 py-1 rounded-full">
            OUT OF STOCK
          </div>
        )}
      </Link>
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start mb-xs">
          <Link to={`/books/${book.id}`}>
            <h4 className="font-title-md text-title-md text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
              {book.judul}
            </h4>
          </Link>
          {user?.role === "customer" && (
            <button
              className={`transition-colors ${wishlisted ? "text-error" : "text-outline hover:text-error"}`}
              onClick={() => toggle(book.id)}
              aria-label="Toggle wishlist"
            >
              <Icon name="favorite" size="text-[20px]" style={wishlisted ? { fontVariationSettings: "'FILL' 1" } : {}} />
            </button>
          )}
        </div>
        <p className="font-caption text-caption text-outline mb-base">
          {book.author?.nama ?? "Unknown Author"}
        </p>
        <p className="font-caption text-caption text-outline mb-md">{book.category?.nama}</p>
        {error && <p className="text-caption text-error mb-xs">{error}</p>}
        <div className="mt-auto flex items-center justify-between">
          <span className="font-title-lg text-title-lg text-primary">{formatIDR(book.harga?.jual)}</span>
          <button
            className="bg-surface-container-low hover:bg-primary hover:text-on-primary text-primary px-4 py-2 rounded-[18px] font-label-md text-label-md transition-all flex items-center gap-xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAdd}
            disabled={outOfStock || adding}
          >
            <Icon name={adding ? "sync" : "add_shopping_cart"} size="text-[18px]" className={adding ? "animate-spin" : ""} />
            {adding ? "Menambah..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

