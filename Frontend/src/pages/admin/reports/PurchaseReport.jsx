import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/ui/Icon";
import { fetchAllPages } from "../../../lib/fetchAllPages";

function formatIDR(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value ?? 0
  );
}

export default function PurchaseReport() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllPages("/purchases")
      .then(setPurchases)
      .catch((err) => setError(err.response?.data?.message ?? "Gagal memuat data pembelian."))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const totalValue = purchases.reduce((sum, p) => sum + (p.total?.grand_total ?? 0), 0);
    const totalItems = purchases.reduce((sum, p) => sum + (p.items?.reduce((s, i) => s + i.qty, 0) ?? 0), 0);
    const byDistributor = new Map();
    purchases.forEach((p) => {
      if (!p.distributor) return;
      const existing = byDistributor.get(p.distributor.id) ?? { nama: p.distributor.nama, count: 0, value: 0 };
      existing.count += 1;
      existing.value += p.total?.grand_total ?? 0;
      byDistributor.set(p.distributor.id, existing);
    });
    return {
      count: purchases.length,
      totalValue,
      totalItems,
      byDistributor: [...byDistributor.values()].sort((a, b) => b.value - a.value),
    };
  }, [purchases]);

  if (loading) return <p className="text-on-surface-variant py-xl text-center">Memuat data pembelian...</p>;

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-xl">
        <KpiCard icon="receipt_long" label="Total Purchase Orders" value={`${stats.count} Orders`} />
        <KpiCard icon="inventory_2" label="Total Unit Dibeli" value={`${stats.totalItems} Unit`} />
        <KpiCard icon="payments" label="Total Nilai Pembelian" value={formatIDR(stats.totalValue)} />
      </div>

      <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-level1 p-lg mb-lg">
        <h3 className="font-title-lg text-title-lg text-on-surface mb-md">Pembelian per Distributor</h3>
        {stats.byDistributor.length === 0 ? (
          <p className="text-on-surface-variant text-center py-md">Belum ada data pembelian.</p>
        ) : (
          <div className="space-y-sm">
            {stats.byDistributor.map((d) => (
              <div key={d.nama} className="flex items-center justify-between p-md border border-outline-variant/30 rounded-xl">
                <div>
                  <p className="font-title-md text-on-surface">{d.nama}</p>
                  <p className="text-caption text-outline">{d.count} pembelian</p>
                </div>
                <span className="font-bold text-primary">{formatIDR(d.value)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <Link
        to="/admin/purchases"
        className="flex items-center justify-center gap-2 w-full py-md border border-primary/30 text-primary rounded-xl font-title-md hover:bg-primary/5 transition-colors"
      >
        Lihat Daftar & Detail Pembelian Lengkap
        <Icon name="arrow_forward" size="text-lg" />
      </Link>
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
