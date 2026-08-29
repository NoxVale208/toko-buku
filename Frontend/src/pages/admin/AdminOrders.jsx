import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "pending_payment", label: "Menunggu Pembayaran" },
  { value: "waiting_confirmation", label: "Menunggu Konfirmasi" },
  { value: "paid", label: "Dibayar" },
  { value: "processing", label: "Diproses" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

const STATUS_TONE = {
  pending_payment: "warning",
  waiting_confirmation: "warning",
  paid: "info",
  processing: "info",
  completed: "success",
  cancelled: "error",
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get("/orders-management", {
        params: { page, search: search || undefined, status: status || undefined },
      })
      .then((res) => {
        setOrders(res.data.data?.data ?? []);
        setMeta(res.data.data ?? null);
      })
      .catch((err) => setError(err.response?.data?.message ?? "Gagal memuat data order."))
      .finally(() => setLoading(false));
  }, [page, search, status]);

  useEffect(load, [load]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <div className="bg-background text-on-background min-h-screen">
      <AdminSidebar />
      <AdminNavbar />
      <main className="ml-0 md:ml-[280px] pt-24 pb-12 px-margin-mobile md:px-margin-desktop">
        <div className="mb-xl">
          <nav className="flex text-on-surface-variant font-label-md mb-1 gap-2">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-primary">Orders</span>
          </nav>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Order Management</h2>
          <p className="text-body-lg text-on-surface-variant mt-1">Pantau seluruh pesanan customer.</p>
        </div>

        <form
          className="bg-surface-container-lowest rounded-2xl p-md mb-lg flex flex-wrap gap-md items-center border border-outline-variant/30 shadow-level1"
          onSubmit={handleFilterSubmit}
        >
          <div className="relative flex-1 min-w-[220px]">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size="text-lg" />
            <input
              className="w-full pl-10 pr-md py-2 bg-surface-container-low border-none rounded-xl text-body-md outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Cari kode order atau nama customer..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <select
            className="bg-surface-container-low border-none rounded-xl text-body-md py-2 px-md focus:ring-2 focus:ring-primary/20"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
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

        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="p-md font-label-md text-on-surface-variant uppercase tracking-wider">Order ID</th>
                  <th className="p-md font-label-md text-on-surface-variant uppercase tracking-wider">Customer</th>
                  <th className="p-md font-label-md text-on-surface-variant uppercase tracking-wider">Tanggal</th>
                  <th className="p-md font-label-md text-on-surface-variant uppercase tracking-wider">Total</th>
                  <th className="p-md font-label-md text-on-surface-variant uppercase tracking-wider">Metode</th>
                  <th className="p-md font-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="p-md font-label-md text-on-surface-variant uppercase tracking-wider text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-xl text-center text-on-surface-variant">
                      Memuat data order...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-xl text-center text-on-surface-variant">
                      <div className="flex flex-col items-center gap-sm py-md">
                        <Icon name="receipt_long" size="text-[48px]" className="text-outline" />
                        Tidak ada order yang cocok.
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-surface-bright transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/orders/${order.id}`, { state: { order } })}
                    >
                      <td className="p-md font-title-md text-primary">{order.kode_order}</td>
                      <td className="p-md">{order.user?.name ?? "-"}</td>
                      <td className="p-md text-on-surface-variant">
                        {new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="p-md font-bold">{formatIDR(order.grand_total)}</td>
                      <td className="p-md capitalize">{order.payment?.metode_pembayaran ?? "-"}</td>
                      <td className="p-md">
                        <Badge tone={STATUS_TONE[order.status] ?? "neutral"}>{order.status}</Badge>
                      </td>
                      <td className="p-md text-right">
                        <Icon name="chevron_right" className="text-outline" />
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
