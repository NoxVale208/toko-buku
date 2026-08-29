import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import AdminNavbar from "../../../components/admin/AdminNavbar";
import DistributorModal from "../../../components/admin/DistributorModal";
import Icon from "../../../components/ui/Icon";
import Pagination from "../../../components/ui/Pagination";
import api from "../../../lib/api";
import { fetchAllPages } from "../../../lib/fetchAllPages";

function formatIDR(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value ?? 0
  );
}

export default function PurchaseList() {
  const navigate = useNavigate();

  // Browsable, paginated table (server-side)
  const [purchases, setPurchases] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [distributorId, setDistributorId] = useState("");

  // All-time KPI stats — needs the FULL dataset, fetched separately from the
  // paginated table so the numbers stay accurate regardless of which page is shown
  const [stats, setStats] = useState(null);
  const [distributors, setDistributors] = useState([]);

  const [showDistributorModal, setShowDistributorModal] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get("/purchases", {
        params: { page, search: search || undefined, distributor_id: distributorId || undefined },
      })
      .then((res) => {
        setPurchases(res.data.data ?? []);
        setMeta(res.data.meta ?? null);
      })
      .catch((err) => setError(err.response?.data?.message ?? "Gagal memuat data pembelian."))
      .finally(() => setLoading(false));
  }, [page, search, distributorId]);

  useEffect(load, [load]);

  const loadStats = useCallback(async () => {
    const all = await fetchAllPages("/purchases");
    const totalValue = all.reduce((sum, p) => sum + (p.total?.grand_total ?? 0), 0);
    const totalItems = all.reduce((sum, p) => sum + (p.items?.reduce((s, i) => s + i.qty, 0) ?? 0), 0);
    setStats({ count: all.length, totalValue, totalItems });

    const distMap = new Map();
    all.forEach((p) => p.distributor && distMap.set(p.distributor.id, p.distributor.nama));
    setDistributors([...distMap.entries()]);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const refreshAll = () => {
    load();
    loadStats();
  };

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen">
      <AdminSidebar />
      <AdminNavbar />
      <main className="ml-0 md:ml-[280px] pt-24 pb-12 px-margin-mobile md:px-margin-desktop">
        <div className="flex justify-between items-end mb-xl flex-wrap gap-md">
          <div>
            <nav className="flex items-center gap-2 text-label-md text-on-surface-variant mb-2">
              <span>Dashboard</span>
              <Icon name="chevron_right" size="text-[14px]" />
              <span className="text-primary font-bold">Procurement</span>
            </nav>
            <h2 className="font-display text-headline-lg text-on-surface">Procurement &amp; Purchase Orders</h2>
            <p className="text-body-lg text-on-surface-variant mt-1">Kelola pembelian stok dari distributor.</p>
          </div>
          <div className="flex gap-sm">
            <button
              className="flex items-center gap-2 px-lg py-3 rounded-xl border border-outline-variant hover:bg-surface-container-low transition-all font-title-md"
              onClick={() => setShowDistributorModal(true)}
            >
              <Icon name="local_shipping" />
              Distributor
            </button>
            <button
              className="flex items-center gap-2 bg-primary text-on-primary px-lg py-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all font-title-md active:scale-95"
              onClick={() => navigate("/admin/purchases/new")}
            >
              <Icon name="add_circle" />
              New Purchase Order
            </button>
          </div>
        </div>

        {/* Stats — all-time, computed from the complete dataset (not just the current page) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-xl">
          <div className="bg-surface-container-lowest p-lg rounded-2xl shadow-level1 border border-outline-variant">
            <div className="p-3 bg-primary/10 text-primary rounded-xl w-fit mb-md">
              <Icon name="receipt_long" />
            </div>
            <h3 className="text-on-surface-variant font-label-md uppercase tracking-wider">Total Purchase Orders</h3>
            <p className="text-headline-md text-on-surface">{stats ? `${stats.count} Orders` : "…"}</p>
          </div>
          <div className="bg-surface-container-lowest p-lg rounded-2xl shadow-level1 border border-outline-variant">
            <div className="p-3 bg-secondary/10 text-secondary rounded-xl w-fit mb-md">
              <Icon name="inventory_2" />
            </div>
            <h3 className="text-on-surface-variant font-label-md uppercase tracking-wider">Total Unit Dibeli</h3>
            <p className="text-headline-md text-on-surface">{stats ? `${stats.totalItems} Unit` : "…"}</p>
          </div>
          <div className="bg-surface-container-lowest p-lg rounded-2xl shadow-level1 border border-primary/20 bg-primary/5">
            <div className="p-3 bg-primary text-on-primary rounded-xl w-fit mb-md">
              <Icon name="payments" style={{ fontVariationSettings: "'FILL' 1" }} />
            </div>
            <h3 className="text-on-surface-variant font-label-md uppercase tracking-wider">Total Value</h3>
            <p className="text-headline-md text-on-surface">{stats ? formatIDR(stats.totalValue) : "…"}</p>
          </div>
        </div>

        {error && (
          <div className="mb-lg px-md py-3 rounded-auth bg-error-container text-on-error-container text-body-md flex items-center gap-sm">
            <Icon name="error" size="text-lg" />
            {error}
          </div>
        )}

        {/* Filters & Table — search/distributor filter now sent to the server */}
        <div className="bg-surface shadow-sm rounded-2xl border border-outline-variant overflow-hidden">
          <form className="p-md border-b border-outline-variant bg-surface-container-lowest flex flex-wrap gap-md items-center" onSubmit={handleFilterSubmit}>
            <div className="relative flex-1 min-w-[240px]">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size="text-lg" />
              <input
                className="w-full bg-white border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-body-md focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Cari kode pembelian atau distributor..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="relative min-w-[200px]">
              <Icon name="filter_alt" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size="text-lg" />
              <select
                className="w-full bg-white border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-body-md focus:ring-2 focus:ring-primary/20 outline-none"
                value={distributorId}
                onChange={(e) => {
                  setDistributorId(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Distributors</option>
                {distributors.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="px-lg py-2 bg-primary text-on-primary rounded-lg font-title-md">
              Cari
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">Order ID</th>
                  <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">Distributor</th>
                  <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">Tanggal</th>
                  <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">Items</th>
                  <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">Total</th>
                  <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-lg py-xl text-center text-on-surface-variant">
                      Memuat data pembelian...
                    </td>
                  </tr>
                ) : purchases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-lg py-xl text-center text-on-surface-variant">
                      <div className="flex flex-col items-center gap-sm py-md">
                        <Icon name="receipt_long" size="text-[48px]" className="text-outline" />
                        Tidak ada pembelian yang cocok.
                      </div>
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-surface-container-low transition-colors group cursor-pointer"
                      onClick={() => navigate(`/admin/purchases/${p.id}`)}
                    >
                      <td className="px-lg py-md">
                        <span className="font-title-md text-primary">{p.kode_pembelian}</span>
                      </td>
                      <td className="px-lg py-md">
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold text-xs">
                            {(p.distributor?.nama ?? "?")[0]?.toUpperCase()}
                          </div>
                          <span className="font-title-md">{p.distributor?.nama ?? "-"}</span>
                        </div>
                      </td>
                      <td className="px-lg py-md text-on-surface-variant">
                        {new Date(p.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-lg py-md text-on-surface-variant">
                        {p.items?.reduce((s, i) => s + i.qty, 0) ?? 0} unit
                      </td>
                      <td className="px-lg py-md font-title-md">{formatIDR(p.total?.grand_total)}</td>
                      <td className="px-lg py-md text-right">
                        <Link
                          to={`/admin/purchases/${p.id}`}
                          className="inline-flex p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
                          onClick={(e) => e.stopPropagation()}
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

      {showDistributorModal && (
        <DistributorModal onClose={() => setShowDistributorModal(false)} onChanged={refreshAll} />
      )}
    </div>
  );
}
