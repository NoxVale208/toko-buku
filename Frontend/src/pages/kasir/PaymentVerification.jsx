import { useEffect, useMemo, useState } from "react";
import KasirSidebar from "../../components/kasir/KasirSidebar";
import Icon from "../../components/ui/Icon";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import api from "../../lib/api";

function formatIDR(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value ?? 0
  );
}

export default function PaymentVerification() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [tab, setTab] = useState("transfer"); // 'transfer' | 'tunai'
  const [cashInput, setCashInput] = useState({}); // { [paymentId]: string }
  const [cashError, setCashError] = useState({});
  const [kembalianInfo, setKembalianInfo] = useState(null);

  const fetchPending = () => {
    setLoading(true);
    api
      .get("/payment/pending")
      .then((res) => setPayments(res.data.data ?? res.data))
      .finally(() => setLoading(false));
  };

  useEffect(fetchPending, []);

  const transferPayments = useMemo(() => payments.filter((p) => p.metode === "transfer"), [payments]);
  const tunaiPayments = useMemo(() => payments.filter((p) => p.metode === "tunai"), [payments]);

  const handleVerify = async (id, status, jumlahBayar) => {
    setBusyId(id);
    setCashError((e) => ({ ...e, [id]: "" }));
    try {
      const res = await api.put(`/payment/${id}/verify`, {
        status,
        ...(jumlahBayar !== undefined ? { jumlah_bayar: jumlahBayar } : {}),
      });
      if (res.data.kembalian !== null && res.data.kembalian !== undefined) {
        setKembalianInfo({ id, amount: res.data.kembalian });
      }
      setPayments((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setCashError((e) => ({ ...e, [id]: err.response?.data?.message ?? "Gagal memproses pembayaran." }));
    } finally {
      setBusyId(null);
    }
  };

  const grandTotalOf = (p) => p.order?.grand_total ?? p.sale?.grand_total ?? 0;

  return (
    <div className="bg-background font-body-md text-on-surface min-h-screen">
      <KasirSidebar />
      <main className="ml-0 md:ml-[280px] min-h-screen pt-20 md:pt-margin-desktop px-margin-mobile md:px-margin-desktop pb-margin-mobile md:pb-margin-desktop">
        <header className="mb-lg">
          <h2 className="font-title-lg font-bold text-primary text-title-lg">Payment Verification</h2>
          <p className="text-on-surface-variant">Verifikasi pembayaran transfer & konfirmasi pembayaran tunai online.</p>
        </header>

        {kembalianInfo && (
          <div className="mb-lg px-md py-3 rounded-auth bg-primary-fixed/30 text-on-primary-fixed-variant text-body-md flex items-center justify-between gap-sm">
            <span className="flex items-center gap-sm">
              <Icon name="check_circle" size="text-lg" />
              Pembayaran dikonfirmasi. Kembalian: <span className="font-bold">{formatIDR(kembalianInfo.amount)}</span>
            </span>
            <button className="text-on-primary-fixed-variant/70 hover:text-on-primary-fixed-variant" onClick={() => setKembalianInfo(null)}>
              <Icon name="close" size="text-lg" />
            </button>
          </div>
        )}

        <div className="flex items-center bg-surface-container-low rounded-xl border border-outline-variant p-1 mb-xl w-fit">
          <button
            className={`flex items-center gap-2 px-lg py-2 text-label-md font-semibold rounded-lg transition-all ${
              tab === "transfer" ? "text-primary bg-white shadow-sm" : "text-on-surface-variant hover:text-primary"
            }`}
            onClick={() => setTab("transfer")}
          >
            <Icon name="account_balance" size="text-lg" />
            Transfer ({transferPayments.length})
          </button>
          <button
            className={`flex items-center gap-2 px-lg py-2 text-label-md font-semibold rounded-lg transition-all ${
              tab === "tunai" ? "text-primary bg-white shadow-sm" : "text-on-surface-variant hover:text-primary"
            }`}
            onClick={() => setTab("tunai")}
          >
            <Icon name="payments" size="text-lg" />
            Tunai ({tunaiPayments.length})
          </button>
        </div>

        {loading ? (
          <p className="text-on-surface-variant">Memuat...</p>
        ) : tab === "transfer" ? (
          transferPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-md text-center">
              <Icon name="task_alt" size="text-[64px]" className="text-outline" />
              <p className="text-title-md text-on-surface-variant">Tidak ada pembayaran transfer menunggu verifikasi.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              {transferPayments.map((p) => (
                <div key={p.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg shadow-level1">
                  <div className="flex justify-between items-start mb-md">
                    <div>
                      <p className="font-title-md text-on-surface">{p.order?.kode_order ?? p.sale?.kode_transaksi}</p>
                      <p className="text-caption text-outline">{p.order?.customer_name ?? p.sale?.customer_name}</p>
                      <p className="font-bold text-primary mt-xs">{formatIDR(grandTotalOf(p))}</p>
                    </div>
                    <Badge tone="warning">Pending</Badge>
                  </div>
                  {p.bukti_pembayaran ? (
                    <button
                      className="w-full aspect-video rounded-lg overflow-hidden bg-surface-container mb-md border border-outline-variant/20"
                      onClick={() => setPreview(p.bukti_pembayaran)}
                    >
                      <img src={p.bukti_pembayaran} alt="Bukti pembayaran" className="w-full h-full object-cover" />
                    </button>
                  ) : (
                    <div className="w-full aspect-video rounded-lg bg-surface-container mb-md border border-outline-variant/20 flex items-center justify-center text-caption text-outline">
                      Belum ada bukti transfer diunggah
                    </div>
                  )}
                  <div className="flex gap-sm">
                    <Button
                      variant="danger"
                      className="flex-1"
                      icon="close"
                      loading={busyId === p.id}
                      onClick={() => handleVerify(p.id, "rejected")}
                    >
                      Tolak
                    </Button>
                    <Button
                      className="flex-1"
                      icon="check"
                      loading={busyId === p.id}
                      disabled={!p.bukti_pembayaran}
                      onClick={() => handleVerify(p.id, "verified")}
                    >
                      Verifikasi
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : tunaiPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-md text-center">
            <Icon name="task_alt" size="text-[64px]" className="text-outline" />
            <p className="text-title-md text-on-surface-variant">Tidak ada pembayaran tunai yang menunggu konfirmasi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {tunaiPayments.map((p) => {
              const total = grandTotalOf(p);
              const input = cashInput[p.id] ?? "";
              const numeric = Number(input) || 0;
              const kembalian = numeric - total;
              return (
                <div key={p.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg shadow-level1">
                  <div className="flex justify-between items-start mb-md">
                    <div>
                      <p className="font-title-md text-on-surface">{p.order?.kode_order ?? p.sale?.kode_transaksi}</p>
                      <p className="text-caption text-outline">{p.order?.customer_name ?? p.sale?.customer_name}</p>
                    </div>
                    <Badge tone="warning">Pending</Badge>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-md mb-md">
                    <p className="text-caption text-outline">Total Tagihan</p>
                    <p className="font-headline-md text-headline-md text-primary">{formatIDR(total)}</p>
                  </div>
                  <label className="text-label-md text-on-surface-variant block mb-xs">Uang Diterima</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full border border-outline-variant rounded-xl px-md py-2 mb-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Masukkan jumlah uang tunai..."
                    value={input}
                    onChange={(e) => setCashInput((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  />
                  <p className={`text-body-md mb-md ${kembalian < 0 ? "text-error" : "text-on-surface-variant"}`}>
                    Kembalian: <span className="font-bold">{numeric > 0 ? formatIDR(kembalian) : "—"}</span>
                  </p>
                  {cashError[p.id] && <p className="text-error text-caption mb-sm">{cashError[p.id]}</p>}
                  <Button
                    fullWidth
                    icon="check"
                    disabled={numeric < total}
                    loading={busyId === p.id}
                    onClick={() => handleVerify(p.id, "verified", numeric)}
                  >
                    Konfirmasi Pembayaran
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {preview && (
          <div className="fixed inset-0 bg-on-background/50 backdrop-blur-sm flex items-center justify-center z-[100] p-xl" onClick={() => setPreview(null)}>
            <img src={preview} alt="Bukti pembayaran" className="max-w-2xl max-h-[80vh] rounded-xl shadow-level3" />
          </div>
        )}
      </main>
    </div>
  );
}
