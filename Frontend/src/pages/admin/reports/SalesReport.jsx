import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/ui/Icon";
import Badge from "../../../components/ui/Badge";
import api from "../../../lib/api";

function formatIDR(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value ?? 0
  );
}

const STATUS_TONE = { paid: "success", pending: "warning", cancelled: "error" };

export default function SalesReport() {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [sales, setSales] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState("");

  const [topBooks, setTopBooks] = useState(null); // null = not yet loaded
  const [topBooksLoading, setTopBooksLoading] = useState(false);

  // Real backend-computed all-time aggregates (from /dashboard)
  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => setStats(res.data.data))
      .finally(() => setStatsLoading(false));
  }, []);

  // Paginated, searchable, date-filterable transaction table (server-side, real)
  const loadSales = () => {
    setTableLoading(true);
    setError("");
    api
      .get("/sales", { params: { page, search: search || undefined, tanggal: tanggal || undefined } })
      .then((res) => {
        setSales(res.data.data ?? []);
        setMeta(res.data.meta ?? null);
      })
      .catch((err) => setError(err.response?.data?.message ?? "Gagal memuat data penjualan."))
      .finally(() => setTableLoading(false));
  };

  useEffect(loadSales, [page]);

  const handleFilter = (e) => {
    e.preventDefault();
    setPage(1);
    loadSales();
  };

  const clearFilters = () => {
    setSearch("");
    setTanggal("");
    setPage(1);
    setTimeout(loadSales, 0);
  };

  // Aggregate top-selling books from the FULL sales dataset (real data, fetched once on demand)
  const loadTopBooks = async () => {
    setTopBooksLoading(true);
    try {
      let pageNum = 1;
      let all = [];
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const res = await api.get("/sales", { params: { page: pageNum } });
        all = all.concat(res.data.data ?? []);
        if (!res.data.links?.next) break;
        pageNum++;
      }
      const map = new Map();
      all.forEach((sale) => {
        sale.items?.forEach((item) => {
          const key = item.book.id;
          const existing = map.get(key) ?? { judul: item.book.judul, qty: 0, revenue: 0 };
          existing.qty += item.qty;
          existing.revenue += item.subtotal;
          map.set(key, existing);
        });
      });
      const sorted = [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 10);
      setTopBooks(sorted);
    } finally {
      setTopBooksLoading(false);
    }
  };

  const avgOrderValue = useMemo(() => {
    if (!stats || !stats.total_penjualan) return 0;
    return stats.total_omzet / stats.total_penjualan;
  }, [stats]);

  return (
    <div>
      {/* KPI — all real, from GET /dashboard (all-time, backend-computed) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-xl">
        <KpiCard icon="payments" label="Total Revenue (Paid)" value={statsLoading ? "…" : formatIDR(stats.total_omzet)} />
        <KpiCard icon="receipt_long" label="Total Transaksi" value={statsLoading ? "…" : stats.total_penjualan} />
        <KpiCard
          icon="shopping_bag"
          label="Rata-rata Nilai Transaksi"
          value={statsLoading ? "…" : formatIDR(avgOrderValue)}
        />
        <KpiCard icon="group" label="Total Customer" value={statsLoading ? "…" : stats.total_customer} />
      </div>
      <p className="text-caption text-outline mb-xl flex items-center gap-xs">
        <Icon name="info" size="text-sm" />
        Angka di atas adalah total keseluruhan (all-time) dari backend — tidak ada data periode/bulan sebelumnya untuk dibandingkan.
      </p>

      {/* Top Selling Books — computed from full real sales dataset, on demand */}
      <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-level1 p-lg mb-xl">
        <div className="flex items-center justify-between mb-md">
          <div>
            <h3 className="font-title-lg text-title-lg text-on-surface">Buku Terlaris</h3>
            <p className="text-caption text-outline">Dihitung dari seluruh transaksi penjualan (data nyata)</p>
          </div>
          {topBooks === null && (
            <button
              className="px-md py-2 bg-primary text-on-primary rounded-full font-label-md disabled:opacity-50"
              onClick={loadTopBooks}
              disabled={topBooksLoading}
            >
              {topBooksLoading ? "Menghitung..." : "Hitung Buku Terlaris"}
            </button>
          )}
        </div>
        {topBooks && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low text-label-md text-outline uppercase">
                <tr>
                  <th className="px-md py-sm">Buku</th>
                  <th className="px-md py-sm text-center">Qty Terjual</th>
                  <th className="px-md py-sm text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {topBooks.map((b, i) => (
                  <tr key={i}>
                    <td className="px-md py-sm">{b.judul}</td>
                    <td className="px-md py-sm text-center">{b.qty}</td>
                    <td className="px-md py-sm text-right font-bold">{formatIDR(b.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Transaction table — real server-side search + date filter + pagination */}
      <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-level1 overflow-hidden">
        <form className="p-md border-b border-outline-variant flex flex-wrap gap-sm items-center" onSubmit={handleFilter}>
          <input
            className="flex-1 min-w-[200px] bg-surface-container-low border-none rounded-full px-md py-2 text-body-md outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Cari kode transaksi / customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            type="date"
            className="bg-surface-container-low border-none rounded-full px-md py-2 text-body-md outline-none focus:ring-2 focus:ring-primary/20"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
          />
          <button type="submit" className="px-lg py-2 bg-primary text-on-primary rounded-full font-title-md">
            Filter
          </button>
          <button type="button" className="px-md py-2 text-on-surface-variant" onClick={clearFilters}>
            Reset
          </button>
        </form>

        {error && (
          <div className="m-md px-md py-3 rounded-auth bg-error-container text-on-error-container text-body-md flex items-center gap-sm">
            <Icon name="error" size="text-lg" />
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="px-lg py-md font-label-md text-on-surface-variant uppercase">Kode</th>
                <th className="px-lg py-md font-label-md text-on-surface-variant uppercase">Customer</th>
                <th className="px-lg py-md font-label-md text-on-surface-variant uppercase">Tanggal</th>
                <th className="px-lg py-md font-label-md text-on-surface-variant uppercase text-right">Total</th>
                <th className="px-lg py-md font-label-md text-on-surface-variant uppercase text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {tableLoading ? (
                <tr>
                  <td colSpan={5} className="px-lg py-xl text-center text-on-surface-variant">
                    Memuat...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-lg py-xl text-center text-on-surface-variant">
                    <div className="flex flex-col items-center gap-sm py-md">
                      <Icon name="receipt_long" size="text-[48px]" className="text-outline" />
                      Tidak ada transaksi ditemukan.
                    </div>
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-lg py-md font-bold text-primary">{sale.kode_transaksi}</td>
                    <td className="px-lg py-md">{sale.customer_name ?? sale.customer?.name ?? "-"}</td>
                    <td className="px-lg py-md text-on-surface-variant">
                      {new Date(sale.tanggal).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-lg py-md text-right font-bold">{formatIDR(sale.total?.grand_total)}</td>
                    <td className="px-lg py-md text-center">
                      <Badge tone={STATUS_TONE[sale.status] ?? "neutral"}>{sale.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between p-md border-t border-outline-variant">
            <span className="text-caption text-outline">
              Halaman {meta.current_page} dari {meta.last_page} ({meta.total} transaksi)
            </span>
            <div className="flex gap-xs">
              <button
                className="px-md py-1 border border-outline-variant rounded-lg disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <Icon name="chevron_left" size="text-lg" />
              </button>
              <button
                className="px-md py-1 border border-outline-variant rounded-lg disabled:opacity-40"
                disabled={page >= meta.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                <Icon name="chevron_right" size="text-lg" />
              </button>
            </div>
          </div>
        )}
      </section>
      <p className="text-caption text-outline mt-md">
        Butuh detail lebih lengkap per transaksi? Lihat{" "}
        <Link to="/kasir/transactions" className="text-primary hover:underline">
          Transaction History
        </Link>
        .
      </p>
    </div>
  );
}

function KpiCard({ icon, label, value }) {
  return (
    <div className="bg-white p-lg rounded-2xl shadow-sm border border-outline-variant">
      <div className="flex items-center justify-between mb-sm">
        <span className="text-label-md font-bold text-outline uppercase tracking-widest">{label}</span>
        <Icon name={icon} className="text-primary" />
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface">{value}</h3>
    </div>
  );
}
