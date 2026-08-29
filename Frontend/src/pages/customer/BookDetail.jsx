import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import CustomerNavbar from "../../components/customer/CustomerNavbar";
import Icon from "../../components/ui/Icon";
import Button from "../../components/ui/Button";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";

const PLACEHOLDER_COVER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDjiAekae6nGOVVtPF9PW6L9tnasaa8cof65JydlQMHeGCwaLZ3iN80NRT52w2LKRhCjTFgC6Is4iSdr5VmQgvLt8-eNqsI2EacBwG7IYhyMrT9hqGgNezhQEcWB9ENqL-nfU5IPCc6qvxTFavsia30ri0KBkdATBbJwVgb3Wg0SzIGZBzWuOZoV0i7ciHoNNQR_D4Akpxj79vEgjnytxdlslRvzXnf68fLV6qETt5YWbYQ3RyfDrUI";

function formatIDR(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value ?? 0
  );
}

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const [book, setBook] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get(`/books/${id}`)
      .then((res) => setBook(res.data.data ?? res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <CustomerNavbar />
        <div className="pt-32 text-center text-on-surface-variant">Memuat detail buku...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="bg-background min-h-screen">
        <CustomerNavbar />
        <div className="pt-32 text-center text-on-surface-variant">Buku tidak ditemukan.</div>
      </div>
    );
  }

  const wishlisted = isWishlisted(book.id);
  const outOfStock = (book.stok?.tersedia ?? 0) <= 0;

  const handleAdd = async () => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    setAdding(true);
    setAddError("");
    try {
      await addToCart(book.id, qty);
      navigate("/cart");
    } catch (err) {
      setAddError(err.response?.data?.message ?? "Gagal menambahkan ke keranjang.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <CustomerNavbar />
      <main className="pt-32 pb-xl px-margin-mobile md:px-margin-desktop max-w-content mx-auto">
        <nav className="flex items-center gap-2 mb-xl text-caption text-outline">
          <Link className="hover:text-primary" to="/browse">Home</Link>
          <Icon name="chevron_right" size="text-sm" />
          <span className="text-on-surface">{book.judul}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
          <div className="lg:col-span-5 flex justify-center">
            <img
              className="w-full max-w-[480px] rounded-lg shadow-level3"
              src={book.cover || PLACEHOLDER_COVER}
              alt={book.judul}
            />
          </div>

          <div className="lg:col-span-7 flex flex-col gap-lg">
            <div>
              <span className="text-label-md text-primary uppercase tracking-widest mb-base block">
                {book.category?.nama ?? "Uncategorized"}
              </span>
              <h1 className="font-display text-display text-on-background leading-tight mb-sm">
                {book.judul}
              </h1>
              <p className="font-title-lg text-on-surface-variant">
                by <span className="text-primary font-bold">{book.author?.nama ?? "Unknown"}</span>
              </p>
            </div>

            <div className="flex items-baseline gap-md">
              <span className="text-headline-lg font-bold text-on-background">
                {formatIDR(book.harga?.jual)}
              </span>
            </div>

            <p className="text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
              {book.deskripsi || "Belum ada deskripsi untuk buku ini."}
            </p>

            <div className="flex flex-col gap-md p-lg bg-surface-container rounded-xl border border-outline-variant/30 max-w-md">
              <div className="flex items-center gap-md">
                <Icon name="local_shipping" className="text-primary" />
                <span className="text-body-md font-medium">Free delivery within 2-3 business days</span>
              </div>
              <div className="flex items-center gap-md">
                <Icon name={outOfStock ? "cancel" : "inventory_2"} className={outOfStock ? "text-error" : "text-primary"} />
                <span className="text-body-md font-medium">
                  {outOfStock ? "Out of stock" : `In Stock — ${book.stok?.tersedia} left`}
                </span>
              </div>
            </div>

            {addError && (
              <p className="text-body-md text-error flex items-center gap-xs">
                <Icon name="error" size="text-lg" />
                {addError}
              </p>
            )}
            <div className="flex items-center gap-md mt-sm">
              <div className="flex border border-outline-variant rounded-full overflow-hidden">
                <button
                  className="px-md py-sm hover:bg-surface-container transition-colors active:scale-90"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  -
                </button>
                <span className="px-lg py-sm font-bold flex items-center justify-center min-w-[50px]">{qty}</span>
                <button
                  className="px-md py-sm hover:bg-surface-container transition-colors active:scale-90"
                  onClick={() => setQty((q) => Math.min(book.stok?.tersedia ?? 99, q + 1))}
                >
                  +
                </button>
              </div>
              <Button
                className="flex-1"
                size="lg"
                disabled={outOfStock}
                loading={adding}
                onClick={handleAdd}
              >
                Add to Cart
              </Button>
              {user?.role === "customer" && (
                <button
                  className="p-4 border border-outline rounded-full text-on-surface hover:bg-surface-container transition-all active:scale-95"
                  onClick={() => toggle(book.id)}
                >
                  <Icon
                    name="favorite"
                    className={wishlisted ? "text-error" : ""}
                    style={wishlisted ? { fontVariationSettings: "'FILL' 1" } : {}}
                  />
                </button>
              )}
            </div>
          </div>
        </div>

        <section className="mb-24">
          <div className="flex border-b border-outline-variant/30 mb-lg">
            <span className="px-xl py-md font-title-md text-primary border-b-2 border-primary">
              Product Details
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-xl">
            <div className="p-lg bg-surface rounded-xl border border-outline-variant/20 shadow-sm">
              <span className="text-caption text-outline uppercase block mb-sm">Publisher</span>
              <span className="font-bold text-on-surface">{book.publisher?.nama ?? "—"}</span>
            </div>
            <div className="p-lg bg-surface rounded-xl border border-outline-variant/20 shadow-sm">
              <span className="text-caption text-outline uppercase block mb-sm">Publication Year</span>
              <span className="font-bold text-on-surface">{book.tahun_terbit ?? "—"}</span>
            </div>
            <div className="p-lg bg-surface rounded-xl border border-outline-variant/20 shadow-sm">
              <span className="text-caption text-outline uppercase block mb-sm">ISBN</span>
              <span className="font-bold text-on-surface">{book.isbn ?? "—"}</span>
            </div>
            <div className="p-lg bg-surface rounded-xl border border-outline-variant/20 shadow-sm">
              <span className="text-caption text-outline uppercase block mb-sm">Kode Buku</span>
              <span className="font-bold text-on-surface">{book.kode_buku ?? "—"}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
