import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import AdminNavbar from "../../../components/admin/AdminNavbar";
import Icon from "../../../components/ui/Icon";
import Button from "../../../components/ui/Button";
import api from "../../../lib/api";
import { fetchAllPages } from "../../../lib/fetchAllPages";

function formatIDR(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value ?? 0
  );
}

export default function CreatePurchase() {
  const navigate = useNavigate();
  const [distributors, setDistributors] = useState([]);
  const [books, setBooks] = useState([]);
  const [distributorId, setDistributorId] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [keterangan, setKeterangan] = useState("");
  const [items, setItems] = useState([]); // [{book_id, judul, qty, harga_beli}]
  const [bookPicker, setBookPicker] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAllDistributors = async () => {
      let page = 1;
      let all = [];
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const res = await api.get("/distributors", { params: { page } });
        all = all.concat(res.data.data.data);
        if (!res.data.data.next_page_url) break;
        page++;
      }
      setDistributors(all);
    };
    loadAllDistributors();
    fetchAllPages("/books-management").then(setBooks);
  }, []);

  const addItem = (bookId) => {
    const book = books.find((b) => b.id === Number(bookId));
    if (!book || items.some((i) => i.book_id === book.id)) return;
    setItems((prev) => [
      ...prev,
      { book_id: book.id, judul: book.judul, qty: 1, harga_beli: book.harga?.beli ?? 0 },
    ]);
    setBookPicker("");
  };

  const updateItem = (bookId, field, value) => {
    setItems((prev) => prev.map((i) => (i.book_id === bookId ? { ...i, [field]: value } : i)));
  };

  const removeItem = (bookId) => setItems((prev) => prev.filter((i) => i.book_id !== bookId));

  const total = items.reduce((sum, i) => sum + i.qty * i.harga_beli, 0);

  const handleSubmit = async () => {
    if (!distributorId || items.length === 0) return;
    setSaving(true);
    setError("");
    try {
      const res = await api.post("/purchases", {
        distributor_id: distributorId,
        tanggal,
        keterangan: keterangan || null,
        items: items.map((i) => ({ book_id: i.book_id, qty: Number(i.qty), harga_beli: Number(i.harga_beli) })),
      });
      navigate(`/admin/purchases/${res.data.data.id}`);
    } catch (err) {
      const messages = err.response?.data?.errors;
      setError(messages ? Object.values(messages).flat().join(" ") : err.response?.data?.message ?? "Gagal membuat pembelian.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen">
      <AdminSidebar />
      <AdminNavbar />
      <main className="ml-0 md:ml-[280px] pt-24 pb-40 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center gap-2 text-on-surface-variant text-caption mb-md">
            <span className="hover:text-primary cursor-pointer" onClick={() => navigate("/admin/purchases")}>
              Procurement
            </span>
            <Icon name="chevron_right" size="text-[14px]" />
            <span className="text-primary font-medium">New Purchase Order</span>
          </nav>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xl">New Purchase Order</h2>

          {error && (
            <div className="mb-lg px-md py-3 rounded-auth bg-error-container text-on-error-container text-body-md flex items-center gap-sm">
              <Icon name="error" size="text-lg" />
              {error}
            </div>
          )}

          <section className="bg-surface-container-lowest p-xl rounded-xl shadow-level1 border border-outline-variant mb-gutter">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-1 block">Distributor</label>
                <select
                  className="w-full border border-outline-variant rounded-[18px] px-md py-3 bg-surface outline-none focus:ring-2 focus:ring-primary/20"
                  value={distributorId}
                  onChange={(e) => setDistributorId(e.target.value)}
                >
                  <option value="">Pilih distributor</option>
                  {distributors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-1 block">Tanggal Pembelian</label>
                <input
                  type="date"
                  className="w-full border border-outline-variant rounded-[18px] px-md py-3 bg-surface outline-none focus:ring-2 focus:ring-primary/20"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                />
              </div>
              <div className="space-y-xs col-span-full">
                <label className="text-label-md text-on-surface-variant ml-1 block">Keterangan (opsional)</label>
                <textarea
                  rows={2}
                  className="w-full border border-outline-variant rounded-[18px] px-md py-3 bg-surface outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest p-xl rounded-xl shadow-level1 border border-outline-variant mb-gutter">
            <h3 className="font-title-lg text-title-lg mb-md">Items</h3>
            <select
              className="w-full border border-outline-variant rounded-[18px] px-md py-3 bg-surface outline-none focus:ring-2 focus:ring-primary/20 mb-lg"
              value={bookPicker}
              onChange={(e) => addItem(e.target.value)}
            >
              <option value="">+ Tambah buku ke pembelian...</option>
              {books
                .filter((b) => !items.some((i) => i.book_id === b.id))
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.judul} ({b.kode_buku})
                  </option>
                ))}
            </select>

            {items.length === 0 ? (
              <p className="text-on-surface-variant text-center py-lg">Belum ada item ditambahkan.</p>
            ) : (
              <div className="space-y-md">
                {items.map((item) => (
                  <div key={item.book_id} className="flex flex-col sm:flex-row sm:items-center gap-md p-md border border-outline-variant/30 rounded-xl">
                    <div className="flex-1">
                      <p className="font-title-md text-on-surface">{item.judul}</p>
                    </div>
                    <div className="flex items-center gap-sm">
                      <div className="space-y-xs">
                        <label className="text-caption text-outline">Qty</label>
                        <input
                          type="number"
                          min={1}
                          className="w-20 border border-outline-variant rounded-lg px-sm py-1 outline-none focus:ring-2 focus:ring-primary/20"
                          value={item.qty}
                          onChange={(e) => updateItem(item.book_id, "qty", e.target.value)}
                        />
                      </div>
                      <div className="space-y-xs">
                        <label className="text-caption text-outline">Harga Beli</label>
                        <input
                          type="number"
                          min={0}
                          className="w-32 border border-outline-variant rounded-lg px-sm py-1 outline-none focus:ring-2 focus:ring-primary/20"
                          value={item.harga_beli}
                          onChange={(e) => updateItem(item.book_id, "harga_beli", e.target.value)}
                        />
                      </div>
                      <div className="space-y-xs">
                        <label className="text-caption text-outline">Subtotal</label>
                        <p className="font-bold text-on-surface w-28">{formatIDR(item.qty * item.harga_beli)}</p>
                      </div>
                      <button className="p-2 text-error hover:bg-error-container/20 rounded-lg mt-4" onClick={() => removeItem(item.book_id)}>
                        <Icon name="delete" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-lg pt-lg border-t border-outline-variant/30">
              <div className="text-right">
                <p className="text-on-surface-variant text-body-md">Grand Total</p>
                <p className="font-headline-md text-headline-md text-primary">{formatIDR(total)}</p>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-sm">
            <button className="px-lg py-3 text-on-surface-variant font-title-md" onClick={() => navigate("/admin/purchases")}>
              Batal
            </button>
            <Button
              size="lg"
              icon="check_circle"
              disabled={!distributorId || items.length === 0}
              loading={saving}
              onClick={handleSubmit}
            >
              Buat Pembelian
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
