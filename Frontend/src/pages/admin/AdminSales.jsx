import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Icon from "../../components/ui/Icon";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import api from "../../lib/api";

function formatIDR(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value ?? 0
  );
}

export default function AdminSales() {
  const [sales, setSales] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    api
      .get("/sales", { params: { page, search: search || undefined, tanggal: tanggal || undefined } })
      .then((res) => {
        setSales(res.data.data ?? []);
        setMeta(res.data.meta ?? null);
      })
      .catch((err) => setError(err.response?.data?.message ?? "Gagal memuat data penjualan."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <div className="bg-background font-body-md text-on-surface min-h-screen">
      <AdminSidebar />
      <AdminNavbar />
      <main className="ml-0 md:ml-[280px] pt-24 pb-12 px-margin-mobile md:px-margin-desktop">
        <header className="mb-lg">
          <nav className="flex text-on-surface-variant font-label-md mb-1 gap-2">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-primary">Sales</span>
          </nav>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Sales / Transaction History</h2>
          <p className="text-body-lg text-on-surface-variant mt-1">Seluruh transaksi penjualan (POS &amp; online).</p>
        </header>

        <form
          className="bg-surface-container-lowest rounded-2xl p-md mb-lg flex flex-wrap gap-md items-center border border-outline-variant/30 shadow-level1"
          onSubmit={handleFilterSubmit}
        >
          <input
            className="flex-1 min-w-[220px] bg-surface-container-low border-none rounded-xl px-md py-2 text-body-md outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Cari kode transaksi / customer..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <input
            type="date"
            className="bg-surface-container-low border-none rounded-xl px-md py-2 text-body-md outline-none focus:ring-2 focus:ring-primary/20"
            value={tanggal}
            onChange={(e) => {
              setTanggal(e.target.value);
              setPage(1);
            }}
          />
          <button type="submit" className="px-lg py-2 bg-primary text-on-primary rounded-xl font-title-md">
            Cari
          </button>
        </form>

        {error && (
          <div className="mb-lg px-md py-3 rounded-auth bg-error-container text-on-error-container text-body-md flex items-center gap-sm">
            <Icon name="error" size="text-lg" />
            {error}
          </div>
        )}

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-level1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low text-label-md text-on-surface-variant border-b border-outline-variant">
                <tr>
                  <th className="px-lg py-md font-semibold">TRANSACTION ID</th>
                  <th className="px-lg py-md font-semibold">DATE</th>
                  <th className="px-lg py-md font-semibold">CUSTOMER</th>
                  <th className="px-lg py-md font-semibold">METODE</th>
                  <th className="px-lg py-md font-semibold">AMOUNT</th>
                  <th className="px-lg py-md font-semibold text-center">STATUS</th>
                  <th className="px-lg py-md font-semibold text-right">DETAIL</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-lg py-xl text-center text-on-surface-variant">
                      Memuat...
                    </td>
                  </tr>
                ) : sales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-lg py-xl text-center text-on-surface-variant">
                      Tidak ada transaksi ditemukan.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-lg py-md font-bold text-primary">{sale.kode_transaksi}</td>
                      <td className="px-lg py-md text-on-surface-variant">
                        {new Date(sale.tanggal).toLocaleString("id-ID")}
                      </td>
                      <td className="px-lg py-md">{sale.customer_name ?? sale.customer?.name ?? "-"}</td>
                      <td className="px-lg py-md capitalize">{sale.payment?.metode ?? "-"}</td>
                      <td className="px-lg py-md font-bold">{formatIDR(sale.total?.grand_total)}</td>
                      <td className="px-lg py-md text-center">
                        <Badge tone={sale.status === "paid" ? "success" : "neutral"}>{sale.status}</Badge>
                      </td>
                      <td className="px-lg py-md text-right">
                        <Link
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors inline-flex"
                          to={`/kasir/receipt/${sale.id}`}
                          title="Lihat detail"
                        >
                          <Icon name="visibility" size="text-lg" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      </main>
    </div>
  );
}
