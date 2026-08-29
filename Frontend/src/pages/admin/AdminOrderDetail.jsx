import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Icon from "../../components/ui/Icon";
import Badge from "../../components/ui/Badge";
import api from "../../lib/api";

function formatIDR(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value ?? 0
  );
}

const STATUS_TONE = {
  pending_payment: "warning",
  waiting_confirmation: "warning",
  paid: "info",
  processing: "info",
  completed: "success",
  cancelled: "error",
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(state?.order ?? null);
  const [loading, setLoading] = useState(!state?.order);
  const [error, setError] = useState("");

  useEffect(() => {
    if (state?.order) return;
    api
      .get(`/orders-management/${id}`)
      .then((res) => setOrder(res.data.data))
      .catch((err) => setError(err.response?.data?.message ?? "Gagal memuat detail order."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Raw Eloquent model relation "orderDetails" auto-serializes as order_details
  const items = order?.orderDetails ?? order?.order_details ?? [];

  return (
    <div className="bg-background text-on-background min-h-screen">
      <AdminSidebar />
      <AdminNavbar />
      <main className="ml-0 md:ml-[280px] pt-24 pb-12 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-4xl">
          <nav className="flex items-center gap-2 text-on-surface-variant text-caption mb-md">
            <span className="hover:text-primary cursor-pointer" onClick={() => navigate("/admin/orders")}>
              Orders
            </span>
            <Icon name="chevron_right" size="text-[14px]" />
            <span className="text-primary font-medium">{order?.kode_order ?? "Detail"}</span>
          </nav>

          {loading ? (
            <p className="text-on-surface-variant py-xl text-center">Memuat detail order...</p>
          ) : error ? (
            <div className="px-md py-3 rounded-auth bg-error-container text-on-error-container text-body-md flex items-center gap-sm">
              <Icon name="error" size="text-lg" />
              {error}
            </div>
          ) : !order ? (
            <p className="text-on-surface-variant py-xl text-center">Order tidak ditemukan.</p>
          ) : (
            <>
              <div className="flex flex-wrap justify-between items-start gap-md mb-xl">
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">{order.kode_order}</h2>
                  <p className="text-on-surface-variant mt-1">
                    {new Date(order.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Badge tone={STATUS_TONE[order.status] ?? "neutral"}>{order.status}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-gutter">
                <section className="bg-surface-container-lowest p-lg rounded-xl shadow-level1 border border-outline-variant">
                  <h3 className="text-label-md text-on-surface-variant uppercase tracking-wide mb-md">Customer</h3>
                  <p className="font-title-lg text-on-surface">{order.user?.name}</p>
                  <p className="text-on-surface-variant">{order.user?.email}</p>
                  {order.catatan && (
                    <p className="text-on-surface-variant mt-md pt-md border-t border-outline-variant/20">
                      "{order.catatan}"
                    </p>
                  )}
                </section>

                <section className="bg-surface-container-lowest p-lg rounded-xl shadow-level1 border border-outline-variant">
                  <h3 className="text-label-md text-on-surface-variant uppercase tracking-wide mb-md">Pembayaran</h3>
                  {order.payment ? (
                    <>
                      <p className="font-title-lg text-on-surface capitalize">{order.payment.metode_pembayaran}</p>
                      <p className="text-on-surface-variant">
                        Status: <span className="capitalize">{order.payment.status}</span>
                      </p>
                      {Number(order.payment.jumlah_bayar) > 0 && (
                        <p className="text-on-surface-variant">Dibayar: {formatIDR(order.payment.jumlah_bayar)}</p>
                      )}
                      {order.payment.bukti_pembayaran && (
                        <img
                          src={order.payment.bukti_pembayaran}
                          alt="Bukti pembayaran"
                          className="mt-md rounded-lg max-h-40 border border-outline-variant/30"
                        />
                      )}
                    </>
                  ) : (
                    <p className="text-on-surface-variant">Belum ada data pembayaran.</p>
                  )}
                </section>
              </div>

              <section className="bg-surface-container-lowest rounded-xl shadow-level1 border border-outline-variant overflow-hidden mb-gutter">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low border-b border-outline-variant">
                    <tr>
                      <th className="px-lg py-md font-label-md text-on-surface-variant uppercase">Buku</th>
                      <th className="px-lg py-md font-label-md text-on-surface-variant uppercase text-center">Qty</th>
                      <th className="px-lg py-md font-label-md text-on-surface-variant uppercase text-right">Harga</th>
                      <th className="px-lg py-md font-label-md text-on-surface-variant uppercase text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-lg py-md">{item.book?.judul}</td>
                        <td className="px-lg py-md text-center">{item.qty}</td>
                        <td className="px-lg py-md text-right">{formatIDR(item.harga)}</td>
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
                    <span>{formatIDR(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Diskon</span>
                    <span>{formatIDR(order.diskon)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Pajak</span>
                    <span>{formatIDR(order.pajak)}</span>
                  </div>
                  <div className="pt-sm border-t border-outline-variant/30 flex justify-between font-title-lg font-bold">
                    <span>Grand Total</span>
                    <span className="text-primary">{formatIDR(order.grand_total)}</span>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
