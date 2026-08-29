import { useEffect, useState } from "react";
import Icon from "../../../components/ui/Icon";
import Button from "../../../components/ui/Button";
import api from "../../../lib/api";

export default function StoreProfile() {
  const [form, setForm] = useState({ nama_toko: "", email: "", telepon: "", alamat: "" });
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .get("/settings")
      .then((res) => {
        const s = res.data.data;
        setForm({
          nama_toko: s?.nama_toko ?? "",
          email: s?.email ?? "",
          telepon: s?.telepon ?? "",
          alamat: s?.alamat ?? "",
        });
        setLogo(s?.logo ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      await api.put("/settings", form);
      setSuccess(true);
    } catch (err) {
      const messages = err.response?.data?.errors;
      setError(messages ? Object.values(messages).flat().join(" ") : err.response?.data?.message ?? "Gagal menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-on-surface-variant py-xl text-center">Memuat pengaturan toko...</p>;

  return (
    <div className="max-w-2xl">
      {error && (
        <div className="mb-lg px-md py-3 rounded-auth bg-error-container text-on-error-container text-body-md flex items-center gap-sm">
          <Icon name="error" size="text-lg" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-lg px-md py-3 rounded-auth bg-primary-fixed/30 text-on-primary-fixed-variant text-body-md flex items-center gap-sm">
          <Icon name="check_circle" size="text-lg" />
          Pengaturan toko berhasil disimpan.
        </div>
      )}

      {logo && (
        <div className="mb-lg flex items-center gap-md">
          <img src={logo} alt="Logo toko" className="w-16 h-16 rounded-xl object-cover border border-outline-variant" />
          <p className="text-caption text-outline">
            Logo saat ini. Upload logo baru belum didukung backend (lihat catatan di README_PROGRESS.md).
          </p>
        </div>
      )}

      <form className="bg-surface-container-lowest p-xl rounded-xl shadow-level1 border border-outline-variant space-y-lg" onSubmit={handleSave}>
        <Field label="Nama Toko" required>
          <input
            className="w-full bg-transparent border-none focus:ring-0 p-0 text-body-md outline-none"
            value={form.nama_toko}
            onChange={(e) => setForm({ ...form, nama_toko: e.target.value })}
            required
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            className="w-full bg-transparent border-none focus:ring-0 p-0 text-body-md outline-none"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Nomor Telepon">
          <input
            className="w-full bg-transparent border-none focus:ring-0 p-0 text-body-md outline-none"
            value={form.telepon}
            onChange={(e) => setForm({ ...form, telepon: e.target.value })}
          />
        </Field>
        <Field label="Alamat">
          <textarea
            rows={3}
            className="w-full bg-transparent border-none focus:ring-0 p-0 text-body-md outline-none resize-none"
            value={form.alamat}
            onChange={(e) => setForm({ ...form, alamat: e.target.value })}
          />
        </Field>
        <Button type="submit" loading={saving}>
          Simpan Perubahan
        </Button>
      </form>
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <div className="space-y-xs">
      <label className="text-label-md text-on-surface-variant ml-1 block">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <div className="border border-outline-variant rounded-[18px] px-md py-3 bg-surface focus-within:ring-2 focus-within:ring-primary/20">
        {children}
      </div>
    </div>
  );
}
