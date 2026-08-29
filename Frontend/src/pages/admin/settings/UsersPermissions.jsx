import { useCallback, useEffect, useState } from "react";
import Icon from "../../../components/ui/Icon";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Pagination from "../../../components/ui/Pagination";
import api from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";

const ROLES = [
  { value: "admin", label: "Admin", tone: "info" },
  { value: "kasir", label: "Kasir", tone: "warning" },
  { value: "customer", label: "Customer", tone: "success" },
];

const ROLE_TONE = Object.fromEntries(ROLES.map((r) => [r.value, r.tone]));

const EMPTY_FORM = { name: "", email: "", password: "", role: "customer" };

export default function UsersPermissions() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get("/users", { params: { page, search: search || undefined, role: roleFilter || undefined } })
      .then((res) => {
        setUsers(res.data.data ?? []);
        setMeta(res.data.meta ?? null);
      })
      .catch((err) => setError(err.response?.data?.message ?? "Gagal memuat daftar user."))
      .finally(() => setLoading(false));
  }, [page, search, roleFilter]);

  useEffect(load, [load]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const openAdd = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, { name: form.name, email: form.email, role: form.role });
      } else {
        await api.post("/users", form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      const messages = err.response?.data?.errors;
      setFormError(messages ? Object.values(messages).flat().join(" ") : err.response?.data?.message ?? "Gagal menyimpan user.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u) => {
    if (u.id === currentUser?.id) {
      alert("Tidak bisa menghapus akun sendiri.");
      return;
    }
    if (!confirm(`Hapus user "${u.name}"? Tindakan tidak bisa dibatalkan.`)) return;
    await api.delete(`/users/${u.id}`);
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-md mb-lg">
        <form className="flex flex-wrap gap-sm" onSubmit={handleFilterSubmit}>
          <input
            className="bg-surface-container-low border-none rounded-full px-md py-2 text-body-md outline-none focus:ring-2 focus:ring-primary/20 min-w-[220px]"
            placeholder="Cari nama atau email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <select
            className="bg-surface-container-low border-none rounded-full px-md py-2 text-body-md outline-none focus:ring-2 focus:ring-primary/20"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua Role</option>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <button type="submit" className="px-lg py-2 bg-surface-container-low rounded-full font-title-md text-primary">
            Cari
          </button>
        </form>
        <button
          className="flex items-center gap-2 bg-primary text-on-primary px-lg py-2 rounded-xl shadow-sm font-title-md hover:opacity-90 active:scale-95 transition-all"
          onClick={openAdd}
        >
          <Icon name="person_add" size="text-lg" />
          Add User
        </button>
      </div>

      {error && (
        <div className="mb-lg px-md py-3 rounded-auth bg-error-container text-on-error-container text-body-md flex items-center gap-sm">
          <Icon name="error" size="text-lg" />
          {error}
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-level1 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low border-b border-outline-variant">
            <tr>
              <th className="px-lg py-md font-label-md text-on-surface-variant uppercase">Nama</th>
              <th className="px-lg py-md font-label-md text-on-surface-variant uppercase">Email</th>
              <th className="px-lg py-md font-label-md text-on-surface-variant uppercase">Role</th>
              <th className="px-lg py-md font-label-md text-on-surface-variant uppercase">Bergabung</th>
              <th className="px-lg py-md font-label-md text-on-surface-variant uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-lg py-xl text-center text-on-surface-variant">
                  Memuat daftar user...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-lg py-xl text-center text-on-surface-variant">
                  <div className="flex flex-col items-center gap-sm py-md">
                    <Icon name="group" size="text-[48px]" className="text-outline" />
                    Tidak ada user yang cocok.
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-sm">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">
                        {u.name[0]?.toUpperCase()}
                      </div>
                      <span className="font-title-md text-on-surface">
                        {u.name} {u.id === currentUser?.id && <span className="text-caption text-outline">(kamu)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-lg py-md text-on-surface-variant">{u.email}</td>
                  <td className="px-lg py-md">
                    <Badge tone={ROLE_TONE[u.role] ?? "neutral"}>{u.role}</Badge>
                  </td>
                  <td className="px-lg py-md text-on-surface-variant">
                    {new Date(u.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-lg py-md text-right">
                    <div className="flex justify-end gap-1">
                      <button className="p-1.5 text-outline hover:text-primary hover:bg-primary/10 rounded-lg transition-all" onClick={() => openEdit(u)}>
                        <Icon name="edit" size="text-lg" />
                      </button>
                      <button
                        className="p-1.5 text-outline hover:text-error hover:bg-error/10 rounded-lg transition-all disabled:opacity-30"
                        onClick={() => handleDelete(u)}
                        disabled={u.id === currentUser?.id}
                      >
                        <Icon name="delete" size="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination meta={meta} onPageChange={setPage} />
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-on-background/50 backdrop-blur-sm flex items-center justify-center z-[200] p-md">
          <div className="bg-surface-container-lowest rounded-[18px] shadow-level3 w-full max-w-md">
            <div className="flex items-center justify-between p-lg border-b border-outline-variant/30">
              <h2 className="font-title-lg text-title-lg text-on-surface">{editingUser ? "Edit User" : "Add User"}</h2>
              <button className="p-1 text-on-surface-variant hover:text-error transition-colors" onClick={() => setModalOpen(false)}>
                <Icon name="close" />
              </button>
            </div>
            <form className="p-lg space-y-md" onSubmit={handleSubmit}>
              {formError && <p className="text-error text-caption">{formError}</p>}
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant block">Nama</label>
                <input
                  className="w-full border border-outline-variant rounded-xl px-md py-2 outline-none focus:ring-2 focus:ring-primary/20"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant block">Email</label>
                <input
                  type="email"
                  className="w-full border border-outline-variant rounded-xl px-md py-2 outline-none focus:ring-2 focus:ring-primary/20"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              {!editingUser && (
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant block">Password</label>
                  <input
                    type="password"
                    minLength={8}
                    className="w-full border border-outline-variant rounded-xl px-md py-2 outline-none focus:ring-2 focus:ring-primary/20"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>
              )}
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant block">Role</label>
                <div className="flex gap-sm">
                  {ROLES.map((r) => (
                    <button
                      type="button"
                      key={r.value}
                      className={`flex-1 py-2 rounded-xl border font-title-md text-body-md transition-all ${
                        form.role === r.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-outline-variant text-on-surface-variant hover:border-primary/40"
                      }`}
                      onClick={() => setForm({ ...form, role: r.value })}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-sm pt-sm">
                <button type="button" className="px-lg py-2 text-on-surface-variant" onClick={() => setModalOpen(false)}>
                  Batal
                </button>
                <Button type="submit" loading={saving}>
                  {editingUser ? "Simpan" : "Tambah User"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
