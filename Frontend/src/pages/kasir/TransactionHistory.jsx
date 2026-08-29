import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import KasirSidebar from "../../components/kasir/KasirSidebar";
import Icon from "../../components/ui/Icon";
import Badge from "../../components/ui/Badge";
import api from "../../lib/api";

function formatIDR(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value ?? 0
  );
}

export default function TransactionHistory() {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSales = () => {
    setLoading(true);
    api
      .get("/sales", { params: { search: search || undefined, tanggal: tanggal || undefined } })
      .then((res) => setSales(res.data.data ?? res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-background font-body-md text-on-surface min-h-screen">
      <KasirSidebar />
      <main className="ml-0 md:ml-[280px] min-h-screen pt-20 md:pt-margin-desktop px-margin-mobile md:px-margin-desktop pb-margin-mobile md:pb-margin-desktop">
        <header className="mb-xl flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div>
            <h2 className="font-title-lg font-bold text-primary text-title-lg">Transactions</h2>
            <p className="text-on-surface-variant">Riwayat penjualan kasir</p>
          </div>
          <form
            className="flex gap-sm"
            onSubmit={(e) => {
              e.preventDefault();
              fetchSales();
            }}
          >
            <input
              className="bg-surface-container-low border-none rounded-full py-2 px-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Cari kode transaksi / customer"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <input
              type="date"
              className="bg-surface-container-low border-none rounded-full py-2 px-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
            />
            <button type="submit" className="bg-primary text-on-primary px-lg py-2 rounded-full font-title-md">
              Filter
            </button>
          </form>
        </header>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-level1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low text-label-md text-on-surface-variant border-b border-outline-variant">
              <tr>
                <th className="px-lg py-md font-semibold">TRANSACTION ID</th>
                <th className="px-lg py-md font-semibold">DATE</th>
                <th className="px-lg py-md font-semibold">CUSTOMER</th>
                <th className="px-lg py-md font-semibold">AMOUNT</th>
                <th className="px-lg py-md font-semibold text-center">STATUS</th>
                <th className="px-lg py-md font-semibold text-right">DETAIL</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-lg py-xl text-center text-on-surface-variant">
                    Memuat...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-lg py-xl text-center text-on-surface-variant">
                    Belum ada transaksi.
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
                    <td className="px-lg py-md font-bold">{formatIDR(sale.total?.grand_total ?? sale.grand_total)}</td>
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

        <p className="text-caption text-outline mt-md flex items-center gap-xs">
          <Icon name="info" size="text-sm" />
          Fitur refund belum tersedia di backend saat ini.
        </p>
      </main>
    </div>
  );
}
