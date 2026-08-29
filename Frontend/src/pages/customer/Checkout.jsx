import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerNavbar from "../../components/customer/CustomerNavbar";
import Icon from "../../components/ui/Icon";
import Button from "../../components/ui/Button";
import api from "../../lib/api";
import { useCart } from "../../context/CartContext";

function formatIDR(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value ?? 0
  );
}

export default function Checkout() {
  const { items, subtotal, refresh } = useCart();
  const navigate = useNavigate();
  const [metodePembayaran, setMetodePembayaran] = useState("transfer");
  const [catatan, setCatatan] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/checkout", {
        metode_pembayaran: metodePembayaran,
        catatan,
      });
      await refresh();
      navigate("/order-confirmed", { state: { order: res.data.data, metode: metodePembayaran } });
    } catch (err) {
      setError(err.response?.data?.message ?? "Checkout gagal, silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <CustomerNavbar />
      <main className="pt-[100px] pb-xl px-margin-mobile md:px-margin-desktop max-w-content mx-auto min-h-screen">
        <header className="mb-xl">
          <h1 className="font-headline-lg text-headline-lg text-on-background mb-base">Checkout</h1>
          <p className="font-body-md text-on-surface-variant">
            Tinjau pesanan kamu, lalu pilih metode pembayaran.
          </p>
        </header>

        {error && (
          <div className="mb-lg px-md py-3 rounded-auth bg-error-container text-on-error-container text-body-md flex items-center gap-sm">
            <Icon name="error" size="text-lg" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Order review + payment method */}
          <div className="lg:col-span-8 space-y-lg">
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[18px] p-lg shadow-level1">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-lg">Order Items</h2>
              <div className="space-y-md">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-sm border-b border-outline-variant/20 last:border-0">
                    <div>
                      <p className="font-title-md text-on-surface">{item.book?.judul}</p>
                      <p className="text-caption text-outline">Qty: {item.qty}</p>
                    </div>
                    <span className="font-title-md text-primary">{formatIDR(item.qty * item.harga)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[18px] p-lg shadow-level1">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-md flex items-center gap-sm">
                <Icon name="payments" className="text-primary" style={{ fontVariationSettings: "'FILL' 1" }} />
                Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <button
                  type="button"
                  className={`flex items-center gap-md p-md border-2 rounded-xl text-left transition-all ${
                    metodePembayaran === "transfer"
                      ? "border-primary bg-primary-fixed/20"
                      : "border-outline-variant/40 hover:border-primary/40"
                  }`}
                  onClick={() => setMetodePembayaran("transfer")}
                >
                  <Icon name="account_balance" className="text-primary" size="text-2xl" />
                  <div>
                    <p className="font-title-md text-on-surface">Bank Transfer</p>
                    <p className="text-caption text-on-surface-variant">
                      Transfer manual, lalu unggah bukti pembayaran
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-md p-md border-2 rounded-xl text-left transition-all ${
                    metodePembayaran === "tunai"
                      ? "border-primary bg-primary-fixed/20"
                      : "border-outline-variant/40 hover:border-primary/40"
                  }`}
                  onClick={() => setMetodePembayaran("tunai")}
                >
                  <Icon name="payments" className="text-primary" size="text-2xl" />
                  <div>
                    <p className="font-title-md text-on-surface">Tunai</p>
                    <p className="text-caption text-on-surface-variant">
                      Bayar langsung ke kasir saat pengambilan
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[18px] p-lg shadow-level1">
              <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-sm">
                Catatan Pesanan (opsional)
              </label>
              <textarea
                className="w-full min-h-[100px] p-md bg-surface-container-lowest border border-outline-variant/60 rounded-auth focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md"
                placeholder="Contoh: tolong bungkus rapi, dsb."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[18px] p-lg sticky top-[100px] shadow-level1">
              <h2 className="font-title-lg text-title-lg text-on-background mb-lg">Order Summary</h2>
              <div className="space-y-md mb-lg">
                <div className="flex justify-between font-body-md text-on-surface-variant">
                  <span>Subtotal</span>
                  <span>{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between font-body-md text-on-surface-variant">
                  <span>Shipping</span>
                  <span className="text-primary font-medium">Free</span>
                </div>
                <div className="pt-sm border-t border-outline-variant/30 flex justify-between font-title-lg text-on-surface font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatIDR(subtotal)}</span>
                </div>
              </div>
              <Button
                fullWidth
                size="lg"
                icon="lock"
                disabled={items.length === 0}
                loading={loading}
                onClick={handleCheckout}
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
