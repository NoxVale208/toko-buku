import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Icon from "../../components/ui/Icon";
import api from "../../lib/api";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "nonaktif", label: "Nonaktif" },
];

const EMPTY_FORM = {
  kode_buku: "",
  barcode: "",
  category_id: "",
  author_id: "",
  publisher_id: "",
  judul: "",
  isbn: "",
  tahun_terbit: "",
  harga_beli: "",
  harga_jual: "",
  stok: "",
  minimal_stok: "",
  deskripsi: "",
  status: "draft",
};

export default function BookForm() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(isEdit && !state?.book);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAll = async (endpoint) => {
      let page = 1;
      let all = [];
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const res = await api.get(endpoint, { params: { page } });
        const data = res.data.data;
        all = all.concat(data.data ?? data);
        if (!data.next_page_url) break;
        page++;
      }
      return all;
    };
    Promise.all([loadAll("/categories"), loadAll("/authors"), loadAll("/publishers")]).then(
      ([cats, auths, pubs]) => {
        setCategories(cats);
        setAuthors(auths);
        setPublishers(pubs);
      }
    );
  }, []);

  const applyBook = (book) => {
    setForm({
      kode_buku: book.kode_buku ?? "",
      barcode: book.barcode ?? "",
      category_id: book.category?.id ?? "",
      author_id: book.author?.id ?? "",
      publisher_id: book.publisher?.id ?? "",
      judul: book.judul ?? "",
      isbn: book.isbn ?? "",
      tahun_terbit: book.tahun_terbit ?? "",
      harga_beli: book.harga?.beli ?? "",
      harga_jual: book.harga?.jual ?? "",
      stok: book.stok?.tersedia ?? "",
      minimal_stok: book.stok?.minimal ?? "",
      deskripsi: book.deskripsi ?? "",
      status: book.status ?? "draft",
    });
    setCoverPreview(book.cover ?? null);
  };

  useEffect(() => {
    if (isEdit && state?.book) {
      applyBook(state.book);
    } else if (isEdit) {
      api.get(`/books-management/${id}`).then((res) => {
        applyBook(res.data.data ?? res.data);
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setDirty(true);
  };

  const handleCoverChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setCoverFile(f);
      setCoverPreview(URL.createObjectURL(f));
      setDirty(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "" && value !== null) formData.append(key, value);
    });
    if (coverFile) formData.append("cover", coverFile);

    try {
      if (isEdit) {
        formData.append("_method", "PUT");
        await api.post(`/books-management/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post("/books", formData, { headers: { "Content-Type": "multipart/form-data" } });
      }
      navigate("/admin/books");
    } catch (err) {
      const messages = err.response?.data?.errors;
      setError(messages ? Object.values(messages).flat().join(" ") : err.response?.data?.message ?? "Gagal menyimpan buku.");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm("Arsipkan buku ini? Buku akan disembunyikan dari katalog customer.")) return;
    await api.post(`/books-management/${id}`, { _method: "PUT", status: "nonaktif" });
    navigate("/admin/books");
  };

  const handleDelete = async () => {
    if (!confirm("Hapus buku ini secara permanen? Tindakan tidak bisa dibatalkan.")) return;
    await api.delete(`/books-management/${id}`);
    navigate("/admin/books");
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <AdminSidebar />
        <AdminNavbar />
        <div className="ml-0 md:ml-[280px] pt-32 text-center text-on-surface-variant">Memuat data buku...</div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen">
      <AdminSidebar />
      <AdminNavbar />
      <main className="ml-0 md:ml-[280px] pt-24 pb-40 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-5xl mx-auto">
          <nav className="flex items-center gap-2 text-on-surface-variant text-caption mb-md">
            <span className="hover:text-primary cursor-pointer" onClick={() => navigate("/admin/books")}>
              Inventory
            </span>
            <Icon name="chevron_right" size="text-[14px]" />
            <span className="text-primary font-medium">{isEdit ? "Edit Book" : "Add Book"}</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                {isEdit ? form.judul || "Edit Book" : "Add New Book"}
              </h2>
              {isEdit && <p className="text-on-surface-variant font-body-md mt-1">Kode: {form.kode_buku}</p>}
            </div>
          </div>

          {error && (
            <div className="mb-lg px-md py-3 rounded-auth bg-error-container text-on-error-container text-body-md flex items-center gap-sm">
              <Icon name="error" size="text-lg" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            <div className="lg:col-span-2 space-y-gutter">
              <section className="bg-surface-container-lowest p-xl rounded-xl shadow-level1 border border-outline-variant">
                <div className="flex items-center gap-sm mb-lg border-b border-outline-variant pb-md">
                  <Icon name="info" className="text-primary" />
                  <h3 className="font-title-lg text-title-lg">General Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <Field label="Book Title" className="col-span-full">
                    <input
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-body-lg font-medium outline-none"
                      value={form.judul}
                      onChange={(e) => update("judul", e.target.value)}
                    />
                  </Field>
                  <Field label="Kode Buku">
                    <input
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-body-md outline-none"
                      value={form.kode_buku}
                      onChange={(e) => update("kode_buku", e.target.value)}
                    />
                  </Field>
                  <Field label="Barcode (opsional)">
                    <input
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-body-md outline-none"
                      value={form.barcode}
                      onChange={(e) => update("barcode", e.target.value)}
                    />
                  </Field>
                  <Field label="ISBN">
                    <input
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-body-md outline-none"
                      value={form.isbn}
                      onChange={(e) => update("isbn", e.target.value)}
                    />
                  </Field>
                  <Field label="Tahun Terbit">
                    <input
                      type="number"
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-body-md outline-none"
                      value={form.tahun_terbit}
                      onChange={(e) => update("tahun_terbit", e.target.value)}
                    />
                  </Field>
                  <Field label="Category">
                    <select
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-body-md outline-none"
                      value={form.category_id}
                      onChange={(e) => update("category_id", e.target.value)}
                    >
                      <option value="">Pilih kategori</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nama}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Author">
                    <select
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-body-md outline-none"
                      value={form.author_id}
                      onChange={(e) => update("author_id", e.target.value)}
                    >
                      <option value="">Pilih penulis</option>
                      {authors.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nama}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Publisher">
                    <select
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-body-md outline-none"
                      value={form.publisher_id}
                      onChange={(e) => update("publisher_id", e.target.value)}
                    >
                      <option value="">Pilih penerbit</option>
                      {publishers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nama}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Summary & Description" className="col-span-full">
                    <textarea
                      rows={4}
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-body-md outline-none resize-none"
                      value={form.deskripsi}
                      onChange={(e) => update("deskripsi", e.target.value)}
                    />
                  </Field>
                </div>
              </section>

              <section className="bg-surface-container-lowest p-xl rounded-xl shadow-level1 border border-outline-variant">
                <div className="flex items-center gap-sm mb-lg border-b border-outline-variant pb-md">
                  <Icon name="analytics" className="text-primary" />
                  <h3 className="font-title-lg text-title-lg">Inventory & Pricing</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-md">
                  <Field label="Harga Beli (IDR)">
                    <input
                      type="number"
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-body-md font-bold outline-none"
                      value={form.harga_beli}
                      onChange={(e) => update("harga_beli", e.target.value)}
                    />
                  </Field>
                  <Field label="Harga Jual (IDR)">
                    <input
                      type="number"
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-body-md font-bold outline-none"
                      value={form.harga_jual}
                      onChange={(e) => update("harga_jual", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <Field label="Stok Tersedia">
                    <input
                      type="number"
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-body-md font-bold outline-none"
                      value={form.stok}
                      onChange={(e) => update("stok", e.target.value)}
                    />
                  </Field>
                  <Field label="Threshold Alert (Minimal Stok)">
                    <input
                      type="number"
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-body-md outline-none"
                      value={form.minimal_stok}
                      onChange={(e) => update("minimal_stok", e.target.value)}
                    />
                  </Field>
                </div>
              </section>

              {isEdit && (
                <section className="bg-error-container/20 p-xl rounded-xl border border-error/20">
                  <div className="flex items-center gap-sm mb-md text-error">
                    <Icon name="warning" />
                    <h3 className="font-title-lg text-title-lg">Danger Zone</h3>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-lg bg-surface/50 p-lg rounded-lg border border-error-container mb-md">
                    <div>
                      <h4 className="font-title-md text-on-surface font-bold">Archive Book</h4>
                      <p className="text-on-surface-variant text-body-md">
                        Set status jadi "Nonaktif" — tidak terlihat customer, data tetap tersimpan.
                      </p>
                    </div>
                    <button
                      className="whitespace-nowrap px-lg py-sm rounded-full border border-error text-error font-semibold hover:bg-error hover:text-on-error transition-all active:scale-95"
                      onClick={handleArchive}
                    >
                      Archive Book
                    </button>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-lg p-lg bg-error-container/40 rounded-lg">
                    <div>
                      <h4 className="font-title-md text-on-error-container font-bold">Delete Permanently</h4>
                      <p className="text-on-error-container/80 text-body-md">
                        Tindakan permanen, buku akan dihapus dari database.
                      </p>
                    </div>
                    <button
                      className="whitespace-nowrap px-lg py-sm rounded-full bg-error text-on-error font-semibold hover:brightness-90 transition-all active:scale-95"
                      onClick={handleDelete}
                    >
                      Delete Entry
                    </button>
                  </div>
                </section>
              )}
            </div>

            <div className="space-y-gutter">
              <section className="bg-surface-container-lowest p-xl rounded-xl shadow-level1 border border-outline-variant">
                <h3 className="font-title-md text-title-md mb-md">Cover Art</h3>
                <label className="relative group aspect-[2/3] rounded-lg overflow-hidden border border-outline-variant bg-surface-container flex items-center justify-center cursor-pointer block">
                  {coverPreview ? (
                    <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={coverPreview} alt="Cover" />
                  ) : (
                    <Icon name="image" className="text-outline" size="text-4xl" />
                  )}
                  <div className="absolute inset-0 bg-inverse-surface/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <span className="flex items-center gap-2 bg-surface text-primary px-lg py-sm rounded-full font-bold shadow-lg">
                      <Icon name="upload_file" />
                      Change Cover
                    </span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                </label>
                <p className="text-caption text-on-surface-variant mt-md text-center">Accepted: JPG, PNG, WEBP (Max 2MB)</p>
              </section>

              <section className="bg-surface-container-lowest p-xl rounded-xl shadow-level1 border border-outline-variant space-y-md">
                <h3 className="font-title-md text-title-md">Product Status</h3>
                <select
                  className="w-full p-md bg-surface-container-low rounded-lg border border-outline-variant text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </section>
            </div>
          </div>
        </div>
      </main>

      <div
        className={`fixed bottom-0 left-0 md:left-[280px] right-0 z-[45] transition-transform duration-500 ease-in-out ${
          dirty ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="m-md md:m-xl p-md bg-inverse-surface text-inverse-on-surface rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-md sm:justify-between">
          <div className="flex items-center gap-md sm:pl-md">
            <div className="w-10 h-10 bg-primary-container/20 rounded-full flex items-center justify-center shrink-0">
              <Icon name="draw" className="text-primary-fixed-dim" />
            </div>
            <p className="font-bold text-center sm:text-left">Ada perubahan yang belum disimpan</p>
          </div>
          <div className="flex items-center gap-md">
            <button
              className="px-lg py-sm font-medium hover:bg-white/10 rounded-full transition-colors"
              onClick={() => navigate("/admin/books")}
            >
              Batal
            </button>
            <button
              className="px-xl py-sm bg-primary-container text-on-primary font-bold rounded-full shadow-lg disabled:opacity-50"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? "Menyimpan..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <div className={`space-y-xs ${className}`}>
      <label className="text-label-md text-on-surface-variant ml-1 block">{label}</label>
      <div className="border border-outline-variant rounded-[18px] transition-all flex items-center px-md py-3 bg-surface focus-within:ring-2 focus-within:ring-primary/20">
        {children}
      </div>
    </div>
  );
}
