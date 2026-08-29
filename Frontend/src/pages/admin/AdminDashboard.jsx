import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Icon from "../../components/ui/Icon";
import Badge from "../../components/ui/Badge";
import api from "../../lib/api";
import { fetchAllPages } from "../../lib/fetchAllPages";
import { useAuth } from "../../context/AuthContext";

function formatIDR(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value ?? 0
  );
}

const COLOR_CLASSES = {
  primary: "bg-primary/10 text-primary",
  tertiary: "bg-tertiary/10 text-tertiary",
  secondary: "bg-secondary/10 text-secondary",
  error: "bg-error/10 text-error",
};

const STATUS_TONE = {
  pending_payment: "warning",
  waiting_confirmation: "warning",
  paid: "info",
  processing: "info",
  completed: "success",
  cancelled: "error",
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [lowStockBooks, setLowStockBooks] = useState([]);
  const [awaitingOrders, setAwaitingOrders] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(true);

  const loadChart = async () => {
    setChartLoading(true);
    try {
      const allSales = await fetchAllPages("/sales");
      const byDate = new Map();
      allSales.forEach((sale) => {
        const dateKey = (sale.tanggal ?? "").slice(0, 10);
        if (!dateKey) return;
        const existing = byDate.get(dateKey) ?? { date: dateKey, revenue: 0, transaksi: 0 };
        existing.revenue += sale.total?.grand_total ?? 0;
        existing.transaksi += 1;
        byDate.set(dateKey, existing);
      });
      const sorted = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
      setChartData(sorted.slice(-14));
    } finally {
      setChartLoading(false);
    }
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [dashRes, lowStockRes, ordersRes, salesRes] = await Promise.all([
        api.get("/dashboard"),
        api.get("/books-management", { params: { stock_level: "low" } }),
        api.get("/orders-management"),
        api.get("/sales"),
      ]);

      setStats(dashRes.data.data);

      setLowStockBooks(lowStockRes.data.data ?? []);

      const orderList = ordersRes.data.data?.data ?? [];
      setAwaitingOrders(
        orderList.filter((o) => ["pending_payment", "waiting_confirmation"].includes(o.status)).slice(0, 5)
      );

      setRecentSales((salesRes.data.data ?? []).slice(0, 5));
    } catch (err) {
      setError(err.response?.data?.message ?? "Gagal memuat data dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadChart();
  }, []);

  const METRICS = stats
    ? [
        { label: "TOTAL OMZET", value: formatIDR(stats.total_omzet), icon: "payments", color: "primary" },
        { label: "TOTAL PENJUALAN", value: stats.total_penjualan, icon: "trending_up", color: "tertiary" },
        { label: "TOTAL ORDER", value: stats.total_order, icon: "shopping_cart", color: "secondary" },
        { label: "TOTAL BUKU", value: stats.total_buku, icon: "inventory_2", color: "primary" },
        { label: "TOTAL CUSTOMER", value: stats.total_customer, icon: "group", color: "secondary" },
        { label: "STOK MENIPIS", value: stats.stok_menipis, icon: "warning", color: "error" },
      ]
    : [];

  return (
    <div className="bg-background text-on-background min-h-screen">
      <AdminSidebar />
      <AdminNavbar />
      <main className="ml-0 md:ml-[280px] pt-24 pb-12 px-margin-mobile md:px-margin-desktop">
        <header className="mb-xl">
          <h2 className="font-headline-lg text-headline-lg text-on-background">Welcome back, {user?.name}</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Ringkasan operasional BookVault saat ini.
          </p>
        </header>

        {error && (
          <div className="mb-lg px-md py-3 rounded-auth bg-error-container text-on-error-container text-body-md flex items-center gap-sm">
            <Icon name="error" size="text-lg" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Icon name="progress_activity" className="animate-spin text-primary" size="text-4xl" />
          </div>
        ) : (
          <>
            {/* Metrics */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter mb-xl">
              {METRICS.map((m) => (
                <div
                  key={m.label}
                  className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-level1 hover:shadow-level2 transition-shadow"
                >
                  <div className={`w-fit p-2 rounded-lg mb-md ${COLOR_CLASSES[m.color]}`}>
                    <Icon name={m.icon} />
                  </div>
                  <h3 className="font-label-md text-label-md text-on-surface-variant mb-xs">{m.label}</h3>
                  <p className="font-headline-md text-headline-md text-on-background">{m.value}</p>
                </div>
              ))}
            </section>

            {/* Revenue trend — real data, aggregated client-side from the full /sales dataset */}
            <section className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-level1 mb-xl">
              <div className="flex items-center justify-between mb-md">
                <div>
                  <h3 className="font-title-lg text-title-lg text-on-background">Tren Penjualan</h3>
                  <p className="text-caption text-outline">Revenue per hari, transaksi kasir (14 hari transaksi terakhir)</p>
                </div>
              </div>
              {chartLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Icon name="progress_activity" className="animate-spin text-primary" size="text-2xl" />
                </div>
              ) : !chartData || chartData.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center gap-sm text-center">
                  <Icon name="bar_chart" size="text-[48px]" className="text-outline" />
                  <p className="text-on-surface-variant text-body-md">Belum ada data transaksi untuk ditampilkan.</p>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5eeff" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(d) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                      />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}rb`} />
                      <Tooltip
                        formatter={(value, name) => (name === "revenue" ? [formatIDR(value), "Revenue"] : [value, "Transaksi"])}
                        labelFormatter={(d) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      />
                      <Bar dataKey="revenue" fill="#4140d1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-xl">
              {/* Orders awaiting payment/confirmation (informational — processed via kasir Payment Verification) */}
              <div className="lg:col-span-2 bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-level1">
                <div className="flex justify-between items-center mb-lg">
                  <div>
                    <h3 className="font-title-lg text-title-lg text-on-background">Pesanan Menunggu Pembayaran</h3>
                    <p className="text-caption text-outline">Diproses kasir lewat menu Payment Verification</p>
                  </div>
                </div>
                {awaitingOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-xl text-center gap-sm">
                    <Icon name="task_alt" size="text-[48px]" className="text-outline" />
                    <p className="text-on-surface-variant text-body-md">Tidak ada pesanan yang menunggu pembayaran.</p>
                  </div>
                ) : (
                  <div className="space-y-md">
                    {awaitingOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-md rounded-lg border border-outline-variant/30">
                        <div>
                          <p className="font-title-md text-on-surface">{order.kode_order}</p>
                          <p className="text-caption text-outline">{order.user?.name}</p>
                        </div>
                        <div className="flex items-center gap-sm">
                          <span className="font-bold">{formatIDR(order.grand_total)}</span>
                          <Badge tone={STATUS_TONE[order.status] ?? "neutral"}>{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Low Stock */}
              <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-level1">
                <h3 className="font-title-lg text-title-lg text-on-background mb-lg">Stok Menipis</h3>
                {lowStockBooks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-xl text-center gap-sm">
                    <Icon name="inventory_2" size="text-[48px]" className="text-outline" />
                    <p className="text-on-surface-variant text-body-md">Semua stok buku aman.</p>
                  </div>
                ) : (
                  <div className="space-y-lg">
                    {lowStockBooks.slice(0, 5).map((book) => (
                      <div key={book.id} className="flex items-center gap-md">
                        <div className="w-12 h-16 rounded bg-surface-container overflow-hidden shrink-0">
                          {book.cover && <img className="w-full h-full object-cover" src={book.cover} alt={book.judul} />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-title-md text-title-md text-on-surface line-clamp-1">{book.judul}</h4>
                          <p className="text-caption text-error font-bold">
                            Sisa {book.stok.tersedia} (min. {book.stok.minimal})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Link
                  to="/admin/books"
                  className="block w-full mt-lg py-sm text-center text-primary font-title-md border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  Kelola Inventory
                </Link>
              </div>
            </section>

            {/* Recent Sales */}
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-level1 overflow-hidden">
              <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center">
                <h3 className="font-title-lg text-title-lg text-on-background">Transaksi Terbaru</h3>
                <Link to="/admin/sales" className="text-primary font-label-md flex items-center gap-xs hover:underline">
                  Lihat Semua <Icon name="open_in_new" size="text-[16px]" />
                </Link>
              </div>
              {recentSales.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-xl text-center gap-sm">
                  <Icon name="receipt_long" size="text-[48px]" className="text-outline" />
                  <p className="text-on-surface-variant text-body-md">Belum ada transaksi.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low text-label-md text-on-surface-variant uppercase tracking-wider">
                      <tr>
                        <th className="px-lg py-md">Customer</th>
                        <th className="px-lg py-md">Tanggal</th>
                        <th className="px-lg py-md">Jumlah</th>
                        <th className="px-lg py-md">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant font-body-md text-on-surface">
                      {recentSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="px-lg py-md flex items-center gap-sm">
                            <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant font-bold text-xs">
                              {(sale.customer_name ?? sale.customer?.name ?? "?")[0]?.toUpperCase()}
                            </div>
                            <span>{sale.customer_name ?? sale.customer?.name ?? "Guest"}</span>
                          </td>
                          <td className="px-lg py-md">{new Date(sale.tanggal).toLocaleDateString("id-ID")}</td>
                          <td className="px-lg py-md font-bold">{formatIDR(sale.total?.grand_total)}</td>
                          <td className="px-lg py-md">
                            <Badge tone={STATUS_TONE[sale.status] ?? "neutral"}>{sale.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
