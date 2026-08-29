import { useEffect, useState } from "react";
import Icon from "../ui/Icon";
import Button from "../ui/Button";
import api from "../../lib/api";

export default function MasterDataModal({ title, endpoint, onClose, onChanged }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [nama, setNama] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get(endpoint, { params: { search: search || undefined } })
      .then((res) => setItems(res.data.data?.data ?? res.data.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nama.trim()) return;
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await api.put(`${endpoint}/${editingId}`, { nama });
      } else {
        await api.post(endpoint, { nama });
      }
      setNama("");
      setEditingId(null);
      load();
      onChanged?.();
    } catch (err) {
      setError(err.response?.data?.message ?? "Gagal menyimpan data.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus data ini?")) return;
    await api.delete(`${endpoint}/${id}`);
    load();
    onChanged?.();
  };

  return (
    <div className="fixed inset-0 bg-on-background/50 backdrop-blur-sm flex items-center justify-center z-[200] p-md">
      <div className="bg-surface-container-lowest rounded-[18px] shadow-level3 w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-lg border-b border-outline-variant/30">
          <h2 className="font-title-lg text-title-lg text-on-surface">Kelola {title}</h2>
          <button className="p-1 text-on-surface-variant hover:text-error transition-colors" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        <div className="p-lg border-b border-outline-variant/20">
          <input
            className="w-full px-md py-2 bg-surface-container-low rounded-full text-body-md outline-none focus:ring-2 focus:ring-primary/20"
            placeholder={`Cari ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-lg space-y-sm">
          {loading ? (
            <p className="text-on-surface-variant text-center py-md">Memuat...</p>
          ) : items.length === 0 ? (
            <p className="text-on-surface-variant text-center py-md">Belum ada data.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-md py-2 rounded-lg hover:bg-surface-container-low">
                <span className="text-body-md text-on-surface">{item.nama}</span>
                <div className="flex gap-xs">
                  <button
                    className="p-1 text-primary hover:bg-primary/10 rounded"
                    onClick={() => {
                      setEditingId(item.id);
                      setNama(item.nama);
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

        <form className="p-lg border-t border-outline-variant/30 flex gap-sm" onSubmit={handleSubmit}>
          {error && <p className="text-error text-caption w-full">{error}</p>}
          <input
            className="flex-1 px-md py-2 bg-surface-container-low rounded-full text-body-md outline-none focus:ring-2 focus:ring-primary/20"
            placeholder={editingId ? `Edit nama ${title.toLowerCase()}` : `Tambah ${title.toLowerCase()} baru`}
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
          {editingId && (
            <button
              type="button"
              className="px-md py-2 text-on-surface-variant"
              onClick={() => {
                setEditingId(null);
                setNama("");
              }}
            >
              Batal
            </button>
          )}
          <Button type="submit" size="sm" loading={saving}>
            {editingId ? "Simpan" : "Tambah"}
          </Button>
        </form>
      </div>
    </div>
  );
}
