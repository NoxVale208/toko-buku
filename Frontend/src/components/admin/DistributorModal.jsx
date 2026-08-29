import { useEffect, useState } from "react";
import Icon from "../ui/Icon";
import Button from "../ui/Button";
import api from "../../lib/api";

export default function DistributorModal({ onClose, onChanged }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ kode_distributor: "", nama: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/distributors", { params: { search: search || undefined } })
      .then((res) => setItems(res.data.data?.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const resetForm = () => {
    setForm({ kode_distributor: "", nama: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama.trim() || !form.kode_distributor.trim()) return;
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await api.put(`/distributors/${editingId}`, form);
      } else {
        await api.post("/distributors", form);
      }
      resetForm();
      load();
      onChanged?.();
    } catch (err) {
      const messages = err.response?.data?.errors;
      setError(messages ? Object.values(messages).flat().join(" ") : err.response?.data?.message ?? "Gagal menyimpan distributor.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus distributor ini?")) return;
    await api.delete(`/distributors/${id}`);
    load();
    onChanged?.();
  };

  return (
    <div className="fixed inset-0 bg-on-background/50 backdrop-blur-sm flex items-center justify-center z-[200] p-md">
      <div className="bg-surface-container-lowest rounded-[18px] shadow-level3 w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-lg border-b border-outline-variant/30">
          <h2 className="font-title-lg text-title-lg text-on-surface">Kelola Distributor</h2>
          <button className="p-1 text-on-surface-variant hover:text-error transition-colors" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        <div className="p-lg border-b border-outline-variant/20">
          <input
            className="w-full px-md py-2 bg-surface-container-low rounded-full text-body-md outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Cari nama atau kode distributor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-lg space-y-sm">
          {loading ? (
            <p className="text-on-surface-variant text-center py-md">Memuat...</p>
          ) : items.length === 0 ? (
            <p className="text-on-surface-variant text-center py-md">Belum ada distributor.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-md py-2 rounded-lg hover:bg-surface-container-low">
                <div>
                  <p className="text-body-md text-on-surface">{item.nama}</p>
                  <p className="text-caption text-outline">{item.kode_distributor}</p>
                </div>
                <div className="flex gap-xs">
                  <button
                    className="p-1 text-primary hover:bg-primary/10 rounded"
                    onClick={() => {
                      setEditingId(item.id);
                      setForm({ kode_distributor: item.kode_distributor, nama: item.nama });
                    }}
                  >
                    <Icon name="edit" size="text-[18px]" />
                  </button>
                  <button className="p-1 text-error hover:bg-error-container/20 rounded" onClick={() => handleDelete(item.id)}>
                    <Icon name="delete" size="text-[18px]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <form className="p-lg border-t border-outline-variant/30 space-y-sm" onSubmit={handleSubmit}>
          {error && <p className="text-error text-caption">{error}</p>}
          <div className="flex gap-sm">
            <input
              className="w-32 px-md py-2 bg-surface-container-low rounded-full text-body-md outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Kode"
              value={form.kode_distributor}
              onChange={(e) => setForm({ ...form, kode_distributor: e.target.value })}
            />
            <input
              className="flex-1 px-md py-2 bg-surface-container-low rounded-full text-body-md outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Nama distributor"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-sm">
            {editingId && (
              <button type="button" className="px-md py-2 text-on-surface-variant" onClick={resetForm}>
                Batal
              </button>
            )}
            <Button type="submit" size="sm" loading={saving}>
              {editingId ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
