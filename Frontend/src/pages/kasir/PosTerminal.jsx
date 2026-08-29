import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import KasirSidebar from "../../components/kasir/KasirSidebar";
import Icon from "../../components/ui/Icon";
import api from "../../lib/api";

function formatIDR(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value ?? 0
  );
}

export default function PosTerminal() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState(null);
  const [cart, setCart] = useState([]); // [{book, qty}]
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showCashModal, setShowCashModal] = useState(false);
  const [cashInput, setCashInput] = useState("");

  useEffect(() => {
    api
      .get("/books")
      .then((res) => setBooks(res.data.data ?? res.data))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Map();
    books.forEach((b) => b.category && set.set(b.category.id, b.category.nama));
    return [...set.entries()];
  }, [books]);

  const filtered = useMemo(() => {
    let list = books;
    if (genre) list = list.filter((b) => b.category?.id === genre);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((b) => b.judul.toLowerCase().includes(q) || b.isbn?.includes(q));
    }
    return list;
  }, [books, search, genre]);

  const addToCart = (book) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.book.id === book.id);
      if (existing) {
        return prev.map((c) => (c.book.id === book.id ? { ...c, qty: Math.min(c.qty + 1, book.stok.tersedia) } : c));
      }
      return [...prev, { book, qty: 1 }];
    });
  };

  const updateQty = (bookId, qty) => {
    setCart((prev) =>
      qty <= 0 ? prev.filter((c) => c.book.id !== bookId) : prev.map((c) => (c.book.id === bookId ? { ...c, qty } : c))
    );
  };

  const removeFromCart = (bookId) => setCart((prev) => prev.filter((c) => c.book.id !== bookId));

  const subtotal = cart.reduce((sum, c) => sum + c.qty * c.book.harga.jual, 0);

  const cashNumeric = Number(cashInput) || 0;
  const kembalian = cashNumeric - subtotal;

  const openCashModal = () => {
    if (cart.length === 0) return;
    setCashInput("");
    setError("");
    setShowCashModal(true);
  };

  const handleConfirmCash = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await api.post("/pos/transaction", {
        customer_name: customerName || null,
        items: cart.map((c) => ({ book_id: c.book.id, qty: c.qty })),
        jumlah_bayar: cashNumeric,
      });
      setShowCashModal(false);
      navigate("/kasir/receipt", { state: { sale: res.data.data, kembalian: res.data.kembalian } });
    } catch (err) {
      setError(err.response?.data?.message ?? "Transaksi gagal, silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen">
      <KasirSidebar />
      <header className="sticky top-0 z-40 w-full bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm flex justify-between items-center h-16 pl-16 pr-margin-mobile md:px-margin-desktop ml-0 md:ml-[280px] max-w-full md:max-w-[calc(100%-280px)]">
        <div className="relative w-full max-w-md">
          <Icon name="search" className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            className="w-full bg-surface-container-low border-none rounded-full py-sm pl-11 pr-md focus:ring-2 focus:ring-primary/20 font-body-md outline-none"
            placeholder="Search by title or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <main className="ml-0 md:ml-[280px] min-h-screen md:h-[calc(100vh-64px)] flex flex-col lg:flex-row">
        <section className="flex-1 p-xl overflow-y-auto">
          <div className="flex items-center justify-between mb-xl">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">Book Discovery</h2>
              <p className="text-on-surface-variant">Pilih buku untuk ditambahkan ke transaksi</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-sm mb-xl">
            <button
              className={`px-md py-sm rounded-full font-label-md transition-all active:scale-95 ${
                !genre ? "bg-primary text-on-primary" : "bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:border-primary"
              }`}
              onClick={() => setGenre(null)}
            >
              All Genres
            </button>
            {categories.map(([id, name]) => (
              <button
                key={id}
                className={`px-md py-sm rounded-full font-label-md transition-all active:scale-95 ${
                  genre === id ? "bg-primary text-on-primary" : "bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:border-primary"
                }`}
                onClick={() => setGenre(id)}
              >
                {name}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-on-surface-variant">Memuat buku...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
              {filtered.map((book) => (
                <div
                  key={book.id}
                  className="group bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 hover:border-primary hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
                  onClick={() => addToCart(book)}
                >
                  <div className="aspect-[3/4] rounded-lg mb-md bg-surface-variant overflow-hidden">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={book.cover}
                      alt={book.judul}
                    />
                  </div>
                  <div className="flex justify-between items-start mb-base">
                    <h3 className="font-title-md text-on-surface leading-tight">{book.judul}</h3>
                    <span className="text-primary font-bold whitespace-nowrap ml-xs">{formatIDR(book.harga.jual)}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-md">{book.author?.nama}</p>
                  <button className="w-full bg-primary/10 group-hover:bg-primary text-primary group-hover:text-on-primary py-sm rounded-lg font-label-md transition-colors flex items-center justify-center gap-xs">
                    <Icon name="add" size="text-sm" />
                    Add to Cart
                  </button>
                  <div className="absolute top-md right-md bg-tertiary-container text-on-tertiary-container px-xs py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    Stock: {book.stok.tersedia}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Cart Panel */}
        <aside className="w-full lg:w-[400px] bg-surface-container-lowest/80 backdrop-blur-md flex flex-col h-auto lg:h-full border-t lg:border-t-0 lg:border-l border-outline-variant">
          <div className="p-xl border-b border-outline-variant/30">
            <div className="flex items-center justify-between mb-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">Current Cart</h2>
              <span className="bg-primary/10 text-primary px-sm py-1 rounded-full text-xs font-bold">
                {cart.length} Items
              </span>
            </div>
            <div className="flex items-center gap-sm bg-surface-container-low p-sm rounded-lg border border-outline-variant/20">
              <Icon name="person_add" className="text-on-surface-variant" size="text-lg" />
              <input
                className="bg-transparent outline-none text-sm text-on-surface flex-1 placeholder:text-on-surface-variant"
                placeholder="Add Customer (optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-xl flex flex-col gap-lg">
            {cart.length === 0 ? (
              <p className="text-center text-on-surface-variant text-sm mt-xl">Keranjang kosong. Klik buku untuk menambahkan.</p>
            ) : (
              cart.map(({ book, qty }) => (
                <div key={book.id} className="flex gap-md group">
                  <div className="w-16 h-20 bg-surface-variant rounded-md overflow-hidden flex-shrink-0">
                    <img className="w-full h-full object-cover" src={book.cover} alt={book.judul} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-xs">
                      <h4 className="font-title-md text-sm text-on-surface">{book.judul}</h4>
                      <button className="text-on-surface-variant hover:text-error transition-colors" onClick={() => removeFromCart(book.id)}>
                        <Icon name="close" size="text-lg" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-sm">
                      <div className="flex items-center gap-sm bg-surface-container-low rounded-lg px-xs">
                        <button className="p-1 hover:text-primary transition-colors" onClick={() => updateQty(book.id, qty - 1)}>
                          <Icon name="remove" size="text-sm" />
                        </button>
                        <span className="font-title-md text-sm w-4 text-center">{qty}</span>
                        <button className="p-1 hover:text-primary transition-colors" onClick={() => updateQty(book.id, Math.min(qty + 1, book.stok.tersedia))}>
                          <Icon name="add" size="text-sm" />
                        </button>
                      </div>
                      <span className="font-bold text-on-surface">{formatIDR(qty * book.harga.jual)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-xl bg-surface-container-lowest/50 border-t border-outline-variant/30 flex flex-col gap-md sticky bottom-0">
            {error && (
              <div className="px-md py-2 rounded-lg bg-error-container text-on-error-container text-caption flex items-center gap-xs">
                <Icon name="error" size="text-sm" />
                {error}
              </div>
            )}
            <div className="flex justify-between text-on-surface pt-sm">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-2xl text-primary">{formatIDR(subtotal)}</span>
            </div>
            <button
              className="w-full bg-primary text-on-primary py-xl rounded-2xl font-headline-md shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 flex items-center justify-center gap-md disabled:opacity-50"
              disabled={cart.length === 0}
              onClick={openCashModal}
            >
              <Icon name="shopping_bag" />
              Complete Checkout (Cash)
            </button>
          </div>
        </aside>
      </main>

      {showCashModal && (
        <div className="fixed inset-0 bg-on-background/50 backdrop-blur-sm flex items-center justify-center z-[100] p-md">
          <div className="bg-surface-container-lowest rounded-[18px] shadow-level3 w-full max-w-md p-lg">
            <div className="flex items-center justify-between mb-lg">
              <h2 className="font-title-lg text-title-lg text-on-surface">Pembayaran Tunai</h2>
              <button className="p-1 text-on-surface-variant hover:text-error transition-colors" onClick={() => setShowCashModal(false)}>
                <Icon name="close" />
              </button>
            </div>
            <div className="bg-surface-container-low rounded-lg p-md mb-md">
              <p className="text-caption text-outline">Total Tagihan</p>
              <p className="font-headline-md text-headline-md text-primary">{formatIDR(subtotal)}</p>
            </div>
            <label className="text-label-md text-on-surface-variant block mb-xs">Uang Diterima</label>
            <input
              type="number"
              min={0}
              autoFocus
              className="w-full border border-outline-variant rounded-xl px-md py-2 mb-sm outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Masukkan jumlah uang tunai..."
              value={cashInput}
              onChange={(e) => setCashInput(e.target.value)}
            />
            <p className={`text-body-md mb-lg ${kembalian < 0 ? "text-error" : "text-on-surface-variant"}`}>
              Kembalian: <span className="font-bold">{cashNumeric > 0 ? formatIDR(kembalian) : "—"}</span>
            </p>
            {error && (
              <div className="mb-md px-md py-2 rounded-lg bg-error-container text-on-error-container text-caption flex items-center gap-xs">
                <Icon name="error" size="text-sm" />
                {error}
              </div>
            )}
            <button
              className="w-full bg-primary text-on-primary py-md rounded-xl font-title-md disabled:opacity-50"
              disabled={cashNumeric < subtotal || submitting}
              onClick={handleConfirmCash}
            >
              {submitting ? "Memproses..." : "Konfirmasi Pembayaran"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
