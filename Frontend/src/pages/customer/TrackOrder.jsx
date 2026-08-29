import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  pending_payment: { label: "Menunggu Pembayaran", tone: "warning", icon: "hourglass_empty" },
  waiting_confirmation: { label: "Menunggu Konfirmasi", tone: "warning", icon: "hourglass_empty" },
  paid: { label: "Dibayar", tone: "info", icon: "credit_score" },
  processing: { label: "Diproses", tone: "info", icon: "sync" },
  completed: { label: "Selesai", tone: "success", icon: "check_circle" },
  cancelled: { label: "Dibatalkan", tone: "error", icon: "cancel" },
};

export default function TrackOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders")
      .then((res) => setOrders(res.data.data ?? res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <CustomerNavbar />
      <main className="pt-24 pb-xl px-margin-mobile md:px-margin-desktop max-w-content mx-auto">
        <header className="mb-xl">
          <nav className="flex items-center gap-xs text-caption text-outline mb-base">
            <span>Dashboard</span>
            <Icon name="chevron_right" size="text-[12px]" />
            <span className="text-on-surface font-medium">My Orders</span>
          </nav>
          <h1 className="font-headline-lg text-headline-lg text-on-background">My Orders</h1>
        </header>

        {loading ? (
          <p className="text-on-surface-variant">Memuat pesanan...</p>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-md text-center">
            <Icon name="receipt_long" size="text-[64px]" className="text-outline" />
            <p className="text-title-md text-on-surface-variant">Kamu belum punya pesanan.</p>
            <Link to="/browse" className="text-primary hover:underline">Mulai belanja</Link>
          </div>
        ) : (
          <div className="space-y-md">
            {orders.map((order) => {
              const status = STATUS_MAP[order.status] ?? { label: order.status, tone: "neutral", icon: "info" };
              return (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="block bg-surface-container-lowest border border-outline-variant/30 rounded-[18px] p-lg shadow-level1 hover:shadow-level2 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
                    <div>
                      <div className="flex items-center gap-sm mb-xs">
                        <span className="font-title-md text-primary font-bold">{order.kode_order}</span>
                        <Badge tone={status.tone}>
                          <Icon name={status.icon} size="text-[14px]" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-caption text-outline">
                        {order.items?.length ?? 0} item •{" "}
                        {new Date(order.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-md">
                      <span className="font-headline-md text-headline-md text-primary">
                        {formatIDR(order.total?.grand_total)}
                      </span>
                      <Icon name="chevron_right" className="text-outline" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
