import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import AdminNavbar from "../../../components/admin/AdminNavbar";
import Icon from "../../../components/ui/Icon";
import api from "../../../lib/api";

function formatIDR(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value ?? 0
  );
}

export default function PurchaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/purchases/${id}`)
      .then((res) => setPurchase(res.data.data ?? res.data))
      .catch((err) => setError(err.response?.data?.message ?? "Gagal memuat detail pembelian."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen">
      <AdminSidebar />
      <AdminNavbar />
      <main className="ml-0 md:ml-[280px] pt-24 pb-12 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center gap-2 text-on-surface-variant text-caption mb-md">
            <span className="hover:text-primary cursor-pointer" onClick={() => navigate("/admin/purchases")}>
              Procurement
            </span>
            <Icon name="chevron_right" size="text-[14px]" />
            <span className="text-primary font-medium">{purchase?.kode_pembelian ?? "Detail"}</span>
          </nav>

          {loading ? (
            <p className="text-on-surface-variant py-xl text-center">Memuat detail pembelian...</p>
          ) : error ? (
            <div className="px-md py-3 rounded-auth bg-error-container text-on-error-container text-body-md flex items-center gap-sm">
              <Icon name="error" size="text-lg" />
              {error}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-xl">
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">{purchase.kode_pembelian}</h2>
                  <p className="text-on-surface-variant mt-1">
                    {new Date(purchase.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <button
                  className="flex items-center gap-2 px-lg py-2 border border-outline-variant rounded-xl font-title-md hover:bg-surface-container-low transition-colors"
                  onClick={() => window.print()}
                >
                  <Icon name="print" />
                  Print
                </button>
              </div>

              <section className="bg-surface-container-lowest p-xl rounded-xl shadow-level1 border border-outline-variant mb-gutter">
                <h3 className="font-title-md text-title-md text-on-surface-variant uppercase tracking-wide mb-md">
                  Distributor
                </h3>
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold">
                    {(purchase.distributor?.nama ?? "?")[0]?.toUpperCase()}
                  </div>
                  <p className="font-title-lg text-title-lg text-on-surface">{purchase.distributor?.nama}</p>
                </div>
                {purchase.keterangan && (
                  <p className="text-on-surface-variant mt-md border-t border-outline-variant/20 pt-md">
                    {purchase.keterangan}
                  </p>
                )}
              </section>

              <section className="bg-surface-container-lowest rounded-xl shadow-level1 border border-outline-variant overflow-hidden mb-gutter">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low border-b border-outline-variant">
                    <tr>
                      <th className="px-lg py-md font-label-md text-on-surface-variant uppercase">Buku</th>
                      <th className="px-lg py-md font-label-md text-on-surface-variant uppercase text-center">Qty</th>
                      <th className="px-lg py-md font-label-md text-on-surface-variant uppercase text-right">Harga Beli</th>
                      <th className="px-lg py-md font-label-md text-on-surface-variant uppercase text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {purchase.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-lg py-md">{item.book?.judul}</td>
                        <td className="px-lg py-md text-center">{item.qty}</td>
                        <td className="px-lg py-md text-right">{formatIDR(item.harga_beli)}</td>
                        <td className="px-lg py-md text-right font-bold">{formatIDR(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="flex justify-end">
                <div className="w-full max-w-xs space-y-sm bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-level1">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Subtotal</span>
                    <span>{formatIDR(purchase.total?.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Diskon</span>
                    <span>{formatIDR(purchase.total?.diskon)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Pajak</span>
                    <span>{formatIDR(purchase.total?.pajak)}</span>
                  </div>
                  <div className="pt-sm border-t border-outline-variant/30 flex justify-between font-title-lg font-bold">
                    <span>Grand Total</span>
                    <span className="text-primary">{formatIDR(purchase.total?.grand_total)}</span>
                  </div>
                </div>
              </section>

              <p className="text-caption text-outline mt-md flex items-center gap-xs">
                <Icon name="info" size="text-sm" />
                Stok buku otomatis bertambah saat pembelian ini dibuat. Tidak ada status pengiriman/parsial —
                backend memperlakukan pembelian sebagai transaksi yang langsung selesai.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
