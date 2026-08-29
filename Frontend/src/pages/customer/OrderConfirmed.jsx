import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CustomerNavbar from "../../components/customer/CustomerNavbar";
import Icon from "../../components/ui/Icon";
import Button from "../../components/ui/Button";
import api from "../../lib/api";

function formatIDR(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value ?? 0
  );
}

export default function OrderConfirmed() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order;
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");

  if (!order) {
    return (
      <div className="bg-background min-h-screen">
        <CustomerNavbar />
        <div className="pt-32 text-center text-on-surface-variant">
          Tidak ada data pesanan.{" "}
          <Link className="text-primary hover:underline" to="/orders">
            Lihat riwayat pesanan
          </Link>
        </div>
      </div>
    );
  }

  const paymentId = order.payment?.id;
  const metode = order.payment?.metode_pembayaran ?? state?.metode ?? "transfer";
  const isTunai = metode === "tunai";

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleUpload = async () => {
    if (!file || !paymentId) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("bukti_pembayaran", file);
    try {
      await api.post(`/payment/${paymentId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploaded(true);
    } catch (err) {
      setError(err.response?.data?.message ?? "Gagal mengunggah bukti pembayaran.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen" style={{ background: "radial-gradient(circle at top right, #e1dfff 0%, #f8f9ff 50%)" }}>
      <CustomerNavbar />
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-margin-mobile md:px-margin-desktop py-24">
        <div className="w-full max-w-[640px] bg-surface-container-lowest/90 backdrop-blur-md rounded-[32px] p-lg md:p-xl shadow-level3 flex flex-col items-center text-center">
          <div className="relative mb-lg">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(65,64,209,0.3)]">
              <Icon name={uploaded ? "check" : isTunai ? "storefront" : "receipt_long"} size="text-[48px]" className="text-white" />
            </div>
          </div>

          <div className="space-y-sm mb-xl">
            <h1 className="font-display text-headline-lg text-on-background">
              {uploaded ? "Bukti Pembayaran Terkirim!" : "Pesanan Dibuat!"}
            </h1>
            <p className="font-body-lg text-on-surface-variant max-w-md mx-auto">
              {uploaded
                ? "Tim kami akan memverifikasi pembayaranmu. Kamu akan bisa memantau statusnya di halaman pesanan."
                : isTunai
                ? "Tunjukkan kode order ini ke kasir saat kamu membayar tunai. Kasir akan mengonfirmasi pembayaranmu di kasir."
                : "Selesaikan pembayaran via transfer bank, lalu unggah bukti pembayaran di bawah ini."}
            </p>
          </div>

          <div className="w-full bg-surface border border-outline-variant/30 rounded-2xl p-md mb-lg text-left">
            <div className="flex justify-between items-center pb-md border-b border-outline-variant/20 mb-md">
              <span className="font-label-md text-on-surface-variant uppercase tracking-wider">Order ID</span>
              <span className="font-title-md text-primary font-bold">{order.kode_order}</span>
            </div>
            <div className="space-y-md">
              {order.order_details?.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="font-body-md text-on-surface">
                    {item.book?.judul} × {item.qty}
                  </span>
                  <span className="font-title-md text-on-background">{formatIDR(item.subtotal)}</span>
                </div>
              ))}
              <div className="pt-md mt-md border-t border-dashed border-outline-variant/50 flex justify-between items-center">
                <span className="font-title-md font-bold text-on-background">Total</span>
                <span className="font-headline-md text-primary">{formatIDR(order.grand_total)}</span>
              </div>
            </div>
          </div>

          {!uploaded && !isTunai && (
            <div className="w-full bg-primary-fixed/20 border border-primary/20 rounded-xl p-md mb-lg text-left">
              <p className="font-title-md text-on-surface mb-xs flex items-center gap-sm">
                <Icon name="account_balance" className="text-primary" />
                Transfer ke Bank BookVault
              </p>
              <p className="font-body-md text-on-surface-variant">No. Rekening: 1234-5678-9000</p>
              <p className="font-body-md text-on-surface-variant">a.n. PT BookVault Enterprise</p>
            </div>
          )}

          {!isTunai && !uploaded && (
            <div className="w-full mb-lg">
              {error && (
                <div className="mb-md px-md py-3 rounded-auth bg-error-container text-on-error-container text-body-md flex items-center gap-sm">
                  <Icon name="error" size="text-lg" />
                  {error}
                </div>
              )}
              <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-sm text-left">
                Bukti Transfer
              </label>
              <div
                className="border-2 border-dashed border-outline-variant rounded-xl p-lg flex flex-col items-center gap-sm cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt="Preview bukti pembayaran" className="max-h-40 rounded-lg" />
                ) : (
                  <>
                    <Icon name="upload_file" className="text-primary" size="text-3xl" />
                    <span className="text-body-md text-on-surface-variant">Klik untuk pilih gambar bukti transfer</span>
                  </>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </div>
              <Button fullWidth size="lg" className="mt-md" disabled={!file} loading={uploading} onClick={handleUpload}>
                Unggah Bukti Pembayaran
              </Button>
            </div>
          )}

          {isTunai && (
            <div className="w-full bg-primary-fixed/20 border border-primary/20 rounded-xl p-md mb-lg text-left">
              <p className="font-title-md text-on-surface mb-xs flex items-center gap-sm">
                <Icon name="storefront" className="text-primary" />
                Bayar Tunai di Kasir
              </p>
              <p className="font-body-md text-on-surface-variant">
                Sebutkan kode order <span className="font-bold text-on-surface">{order.kode_order}</span> ke kasir.
                Kasir akan mengonfirmasi pembayaranmu langsung di sistem.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-md w-full">
            <Button className="flex-1" icon="local_shipping" onClick={() => navigate("/orders")}>
              Track Order
            </Button>
            <Button className="flex-1" variant="secondary" icon="arrow_forward" iconPosition="right" onClick={() => navigate("/browse")}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
