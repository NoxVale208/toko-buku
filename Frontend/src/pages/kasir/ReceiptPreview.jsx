import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import KasirSidebar from "../../components/kasir/KasirSidebar";
import Icon from "../../components/ui/Icon";
import api from "../../lib/api";

function formatIDR(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value ?? 0
  );
}

export default function ReceiptPreview() {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [fetched, setFetched] = useState(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      api
        .get(`/sales/${id}`)
        .then((res) => {
          const s = res.data.data ?? res.data;
          // normalize SaleResource shape (items/total) to raw shape used by this page
          setFetched({
            ...s,
            grand_total: s.total?.grand_total ?? s.grand_total,
            subtotal: s.total?.subtotal ?? s.subtotal,
            saleDetails: s.items ?? s.sale_details,
            payment: s.payment,
            created_at: s.tanggal ?? s.created_at,
          });
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const rawSale = state?.sale;
  const kembalian = state?.kembalian ?? null;
  const sale = rawSale
    ? { ...rawSale, saleDetails: rawSale.saleDetails ?? rawSale.sale_details }
    : fetched;

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <KasirSidebar />
        <div className="ml-0 md:ml-[280px] pt-32 text-center text-on-surface-variant">Memuat struk...</div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="bg-background min-h-screen">
        <KasirSidebar />
        <div className="ml-0 md:ml-[280px] pt-32 text-center text-on-surface-variant">
          Tidak ada data transaksi.{" "}
          <button className="text-primary hover:underline" onClick={() => navigate("/kasir/pos")}>
            Kembali ke POS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background font-body-md text-on-surface min-h-screen">
      <KasirSidebar />
      <main className="ml-0 md:ml-[280px] min-h-screen pt-20 md:pt-margin-desktop px-margin-mobile md:px-margin-desktop pb-margin-mobile md:pb-margin-desktop bg-surface-container-low/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-xl items-start">
          {/* Left: confirmation */}
          <div className="flex-1 space-y-lg">
            <div className="bg-primary-container/5 rounded-xl p-xl border border-primary/10">
              <div className="flex items-center gap-md mb-md">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
                  <Icon name="check" style={{ fontVariationSettings: "'wght' 700" }} />
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-primary">Transaction Successful</h3>
                  <p className="text-on-surface-variant">Transaction ID: {sale.kode_transaksi}</p>
                </div>
              </div>
              <p className="font-body-lg text-on-surface mb-xl">
                Pembayaran sebesar <span className="font-bold">{formatIDR(sale.grand_total)}</span> berhasil diproses
                dan tercatat di sistem.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <button
                  className="flex items-center justify-center gap-sm bg-primary text-white py-md px-lg rounded-xl font-title-md hover:shadow-lg active:scale-[0.98] transition-all"
                  onClick={() => navigate("/kasir/pos")}
                >
                  <Icon name="add" />
                  New Transaction
                </button>
                <button
                  className="flex items-center justify-center gap-sm bg-white border border-outline-variant text-primary py-md px-lg rounded-xl font-title-md hover:bg-surface-container-lowest active:scale-[0.98] transition-all"
                  onClick={() => navigate("/kasir/transactions")}
                >
                  <Icon name="history" />
                  View History
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-md">
              <button
                className="flex flex-col items-center justify-center gap-sm p-xl bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:bg-white transition-all group"
                onClick={() => window.print()}
              >
                <Icon name="print" className="text-primary group-hover:scale-110 transition-transform" size="text-3xl" />
                <span className="font-title-md">Print Receipt</span>
              </button>
            </div>
          </div>

          {/* Right: Digital receipt paper */}
          <div className="w-full md:w-[400px]">
            <div className="bg-white rounded-sm p-xl flex flex-col font-mono text-[13px] leading-relaxed text-on-background shadow-level2 border border-outline-variant/20">
              <div className="text-center space-y-xs mb-lg">
                <h5 className="font-bold text-lg tracking-wider uppercase">BookVault</h5>
                <p>Toko Buku Enterprise</p>
              </div>
              <div className="border-b border-dashed border-outline-variant pb-md mb-md flex justify-between">
                <div>
                  <p>DATE: {new Date(sale.created_at ?? Date.now()).toLocaleDateString("id-ID")}</p>
                  <p>TIME: {new Date(sale.created_at ?? Date.now()).toLocaleTimeString("id-ID")}</p>
                </div>
                <div className="text-right">
                  <p>TRANS #: {sale.kode_transaksi}</p>
                  {sale.customer_name && <p>CUST: {sale.customer_name}</p>}
                </div>
              </div>
              <div className="space-y-sm mb-lg">
                <div className="flex justify-between font-bold border-b border-outline-variant pb-xs">
                  <span>ITEM</span>
                  <span>TOTAL</span>
                </div>
                <div className="space-y-xs">
                  {sale.saleDetails?.map((item) => (
                    <div key={item.id} className="space-y-xs">
                      <div className="flex justify-between">
                        <span className="max-w-[200px]">{item.book?.judul}</span>
                        <span>{formatIDR(item.subtotal)}</span>
                      </div>
                      <div className="flex justify-between italic text-on-surface-variant ml-md">
                        <span>{item.qty} @ {formatIDR(item.harga)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-dashed border-outline-variant pt-md space-y-xs">
                <div className="flex justify-between">
                  <span>SUBTOTAL</span>
                  <span>{formatIDR(sale.subtotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-xs border-t border-outline-variant">
                  <span>TOTAL</span>
                  <span>{formatIDR(sale.grand_total)}</span>
                </div>
                {(kembalian !== null || sale.payment?.jumlah_bayar) && (
                  <>
                    <div className="flex justify-between pt-xs">
                      <span>TUNAI</span>
                      <span>{formatIDR(sale.payment?.jumlah_bayar ?? sale.grand_total + (kembalian ?? 0))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>KEMBALIAN</span>
                      <span>{formatIDR(kembalian ?? (sale.payment?.jumlah_bayar ?? 0) - sale.grand_total)}</span>
                    </div>
                  </>
                )}
              </div>
              <p className="text-center mt-lg text-xs text-on-surface-variant">Terima kasih atas kunjungan Anda!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
