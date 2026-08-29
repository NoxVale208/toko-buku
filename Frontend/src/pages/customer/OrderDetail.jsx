import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CustomerNavbar from "../../components/customer/CustomerNavbar";
import Icon from "../../components/ui/Icon";
import Badge from "../../components/ui/Badge";
import api from "../../lib/api";

function formatIDR(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value ?? 0
  );
}

const STATUS_MAP = {
  pending_payment: { label: "Menunggu Pembayaran", tone: "warning" },
  waiting_confirmation: { label: "Menunggu Konfirmasi", tone: "warning" },
  paid: { label: "Dibayar", tone: "info" },
  processing: { label: "Diproses", tone: "info" },
  completed: { label: "Selesai", tone: "success" },
  cancelled: { label: "Dibatalkan", tone: "error" },
};

const STEPS = ["pending_payment", "waiting_confirmation", "paid", "completed"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data.data ?? res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <CustomerNavbar />
        <div className="pt-32 text-center text-on-surface-variant">Memuat pesanan...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-background min-h-screen">
        <CustomerNavbar />
        <div className="pt-32 text-center text-on-surface-variant">Pesanan tidak ditemukan.</div>
      </div>
    );
  }

  const status = STATUS_MAP[order.status] ?? { label: order.status, tone: "neutral" };
  const isCancelled = order.status === "cancelled";
  const activeStepIndex = STEPS.indexOf(order.status);

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <CustomerNavbar />
      <main className="pt-32 pb-xl px-margin-mobile md:px-margin-desktop max-w-[1000px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-lg gap-md">
          <div className="flex items-center gap-sm text-on-surface-variant text-body-md">
            <Link className="hover:text-primary transition-colors" to="/orders">My Orders</Link>
            <Icon name="chevron_right" size="text-sm" />
            <span className="text-on-surface font-medium">{order.kode_order}</span>
          </div>
          <button
            className="flex items-center gap-sm px-lg py-sm border border-outline-variant text-on-surface font-title-md rounded-full hover:bg-surface-container-low transition-all active:scale-95"
            onClick={() => window.print()}
          >
            <Icon name="print" />
            Print Invoice
          </button>
        </div>

        {/* Status stepper (not for cancelled) */}
        {!isCancelled && (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[24px] p-xl mb-lg shadow-level1">
            <div className="flex items-center justify-between mb-md">
              <span className="font-title-lg text-title-lg text-on-surface">Order Status</span>
              <Badge tone={status.tone}>{status.label}</Badge>
            </div>
            <div className="relative pt-8 pb-2">
              <div className="absolute top-[22px] left-0 w-full h-[4px] bg-surface-container rounded-full" />
              <div
                className="absolute top-[22px] left-0 h-[4px] bg-primary rounded-full transition-all"
                style={{ width: `${(activeStepIndex / (STEPS.length - 1)) * 100}%` }}
              />
              <div className="relative flex justify-between">
                {STEPS.map((step, i) => (
                  <div key={step} className="flex flex-col items-center gap-sm">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-surface shadow-md z-10 ${
                        i <= activeStepIndex ? "bg-primary text-on-primary" : "bg-surface-container-high text-outline"
                      }`}
                    >
                      <Icon name={["shopping_cart", "receipt_long", "credit_score", "check_circle"][i]} size="text-[18px]" />
                    </div>
                    <p className="text-caption text-on-surface-variant text-center">
                      {STATUS_MAP[step].label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Invoice canvas */}
        <div className="rounded-[24px] p-xl md:p-12 shadow-level2 relative overflow-hidden bg-white border border-outline-variant/20">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary/50" />
          <div className="flex flex-col md:flex-row justify-between items-start gap-xl mb-12">
            <div>
              <div className="flex items-center gap-sm mb-base">
                <Icon name="lock" className="text-primary" style={{ fontVariationSettings: "'FILL' 1" }} size="text-2xl" />
                <span className="font-display text-headline-md font-bold text-primary">BookVault</span>
              </div>
              <p className="font-body-md text-on-surface-variant max-w-[240px]">
                Secure Digital Archive & Premium Literature Repository
              </p>
            </div>
            <div className="text-right">
              <h1 className="font-headline-md text-on-surface mb-base">INVOICE</h1>
              <p className="font-label-md text-on-surface-variant tracking-widest uppercase">{order.kode_order}</p>
              <p className="font-body-md text-on-surface-variant mt-sm">
                Tanggal: {new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-xl border-y border-outline-variant/30 py-xl mb-12">
            <div>
              <h3 className="font-label-md text-primary tracking-widest uppercase mb-md">Bill To</h3>
              <p className="font-title-md text-on-surface mb-xs">{order.customer?.name}</p>
              <p className="font-body-md text-on-surface-variant">{order.customer?.email}</p>
            </div>
            <div className="md:text-right">
              <h3 className="font-label-md text-primary tracking-widest uppercase mb-md">Payment</h3>
              <p className="font-body-md text-on-surface-variant">Metode: {order.payment?.metode ?? "Transfer"}</p>
              <p className="font-body-md text-on-surface-variant">Status: {order.payment?.status ?? "-"}</p>
            </div>
          </div>

          <table className="w-full mb-12">
            <thead>
              <tr className="border-b border-outline-variant/30 text-left">
                <th className="pb-md font-label-md text-outline uppercase">Item</th>
                <th className="pb-md font-label-md text-outline uppercase text-center">Qty</th>
                <th className="pb-md font-label-md text-outline uppercase text-right">Harga</th>
                <th className="pb-md font-label-md text-outline uppercase text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.id} className="border-b border-outline-variant/10">
                  <td className="py-md font-body-md text-on-surface">{item.book?.judul}</td>
                  <td className="py-md font-body-md text-center">{item.qty}</td>
                  <td className="py-md font-body-md text-right">{formatIDR(item.harga)}</td>
                  <td className="py-md font-body-md text-right font-bold">{formatIDR(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-sm">
              <div className="flex justify-between font-body-md text-on-surface-variant">
                <span>Subtotal</span>
                <span>{formatIDR(order.total?.subtotal)}</span>
              </div>
              <div className="flex justify-between font-body-md text-on-surface-variant">
                <span>Diskon</span>
                <span>{formatIDR(order.total?.diskon)}</span>
              </div>
              <div className="flex justify-between font-body-md text-on-surface-variant">
                <span>Pajak</span>
                <span>{formatIDR(order.total?.pajak)}</span>
              </div>
              <div className="pt-sm border-t border-outline-variant/30 flex justify-between font-title-lg font-bold text-on-surface">
                <span>Total</span>
                <span className="text-primary">{formatIDR(order.total?.grand_total)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
