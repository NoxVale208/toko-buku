import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/ui/Icon";
import { fetchAllPages } from "../../../lib/fetchAllPages";

function formatIDR(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value ?? 0
  );
}

export default function InventorySummary() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllPages("/books-management")
      .then(setBooks)
      .catch((err) => setError(err.response?.data?.message ?? "Gagal memuat data buku."))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const byStatus = { published: 0, draft: 0, nonaktif: 0 };
    let lowStock = 0;
    let outOfStock = 0;
    let inventoryValue = 0;
    const byCategory = new Map();

    books.forEach((b) => {
      byStatus[b.status] = (byStatus[b.status] ?? 0) + 1;
      if (b.stok.tersedia <= 0) outOfStock += 1;
      else if (b.stok.tersedia <= b.stok.minimal) lowStock += 1;
      inventoryValue += (b.harga?.beli ?? 0) * b.stok.tersedia;

      if (b.category) {
        const existing = byCategory.get(b.category.id) ?? { nama: b.category.nama, count: 0 };
        existing.count += 1;
        byCategory.set(b.category.id, existing);
      }
    });

    return {
      total: books.length,
      byStatus,
      lowStock,
      outOfStock,
      inventoryValue,
      byCategory: [...byCategory.values()].sort((a, b) => b.count - a.count),
    };
  }, [books]);

  if (loading) return <p className="text-on-surface-variant py-xl text-center">Memuat data inventory...</p>;

  if (error) {
    return (
      <div className="px-md py-3 rounded-auth bg-error-container text-on-error-container text-body-md flex items-center gap-sm">
        <Icon name="error" size="text-lg" />
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-xl">
        <KpiCard icon="menu_book" label="Total Buku" value={stats.total} />
        <KpiCard icon="check_circle" label="Published" value={stats.byStatus.published ?? 0} />
        <KpiCard icon="warning" label="Stok Menipis" value={stats.lowStock} tone="warning" />
        <KpiCard icon="cancel" label="Stok Habis" value={stats.outOfStock} tone="error" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-lg">
        <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-level1 p-lg">
          <h3 className="font-title-lg text-title-lg text-on-surface mb-md">Status Buku</h3>
          <div className="space-y-sm">
            <StatusRow label="Published" value={stats.byStatus.published ?? 0} total={stats.total} color="bg-green-500" />
            <StatusRow label="Draft" value={stats.byStatus.draft ?? 0} total={stats.total} color="bg-amber-500" />
            <StatusRow label="Nonaktif" value={stats.byStatus.nonaktif ?? 0} total={stats.total} color="bg-outline" />
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-level1 p-lg">
          <h3 className="font-title-lg text-title-lg text-on-surface mb-md">Estimasi Nilai Inventori</h3>
          <p className="text-caption text-outline mb-md">Stok tersedia × harga beli, seluruh buku</p>
          <p className="font-headline-lg text-headline-lg text-primary">{formatIDR(stats.inventoryValue)}</p>
        </section>
      </div>

      <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-level1 p-lg mb-lg">
        <h3 className="font-title-lg text-title-lg text-on-surface mb-md">Buku per Kategori</h3>
        {stats.byCategory.length === 0 ? (
          <p className="text-on-surface-variant text-center py-md">Belum ada kategori.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            {stats.byCategory.map((c) => (
              <div key={c.nama} className="p-md border border-outline-variant/30 rounded-xl text-center">
                <p className="font-headline-md text-headline-md text-on-surface">{c.count}</p>
                <p className="text-caption text-outline">{c.nama}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <Link
        to="/admin/books"
        className="flex items-center justify-center gap-2 w-full py-md border border-primary/30 text-primary rounded-xl font-title-md hover:bg-primary/5 transition-colors"
      >
        Lihat & Kelola Semua Buku
        <Icon name="arrow_forward" size="text-lg" />
      </Link>
    </div>
  );
}

function KpiCard({ icon, label, value, tone }) {
  const toneClass = tone === "warning" ? "text-amber-600" : tone === "error" ? "text-error" : "text-primary";
  return (
    <div className="bg-white p-lg rounded-2xl shadow-sm border border-outline-variant">
      <div className="flex items-center justify-between mb-sm">
        <span className="text-label-md font-bold text-outline uppercase tracking-widest">{label}</span>
        <Icon name={icon} className={toneClass} />
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface">{value}</h3>
    </div>
  );
}

function StatusRow({ label, value, total, color }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-body-md mb-1">
        <span className="text-on-surface">{label}</span>
        <span className="font-bold">{value}</span>
      </div>
      <div className="h-2 bg-surface-container rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
