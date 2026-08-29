import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import MasterDataModal from "../../components/admin/MasterDataModal";
import Icon from "../../components/ui/Icon";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import api from "../../lib/api";
import { fetchAllPages } from "../../lib/fetchAllPages";

function formatIDR(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value ?? 0
  );
}

const STATUS_BADGE = {
  published: { tone: "success", icon: "check_circle", label: "Published" },
  draft: { tone: "warning", icon: "edit_note", label: "Draft" },
  nonaktif: { tone: "neutral", icon: "block", label: "Nonaktif" },
};

export default function InventoryList() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [stockLevel, setStockLevel] = useState("");

  const [categories, setCategories] = useState([]);
  const [masterModal, setMasterModal] = useState(null); // 'Kategori' | 'Penulis' | 'Penerbit'
  const [busyId, setBusyId] = useState(null);

  // Category options for the filter dropdown need the FULL category list (not just
  // what's on the current page of books), so fetch it separately once.
  useEffect(() => {
    fetchAllPages("/categories").then(setCategories);
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get("/books-management", {
        params: {
          page,
          search: search || undefined,
          category_id: category || undefined,
          status: status || undefined,
          stock_level: stockLevel || undefined,
        },
      })
      .then((res) => {
        setBooks(res.data.data ?? []);
        setMeta(res.data.meta ?? null);
      })
      .catch((err) => setError(err.response?.data?.message ?? "Gagal memuat data buku."))
      .finally(() => setLoading(false));
  }, [page, search, category, status, stockLevel]);

  useEffect(load, [load]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setStatus("");
    setStockLevel("");
    setPage(1);
  };

  const handlePublish = async (id) => {
    setBusyId(id);
    try {
      await api.post(`/books-management/${id}/publish`);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus buku ini? Tindakan tidak bisa dibatalkan.")) return;
    setBusyId(id);
    try {
      await api.delete(`/books-management/${id}`);
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen">
      <AdminSidebar />
      <AdminNavbar />
      <main className="ml-0 md:ml-[280px] pt-24 pb-12 px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-xl">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Inventory Management</h2>
            <nav className="flex text-on-surface-variant font-label-md mt-1 gap-2">
              <span>Catalog</span>
              <span>/</span>
              <span className="text-primary">Book List</span>
            </nav>
          </div>
          <div className="flex items-center gap-sm flex-wrap">
            <button
              className="flex items-center gap-2 px-md py-2 border border-outline-variant bg-white rounded-xl text-on-surface-variant font-title-md hover:bg-surface-container-high transition-colors"
              onClick={() => setMasterModal("Kategori")}
            >
              <Icon name="category" size="text-lg" />
              Kategori
            </button>
            <button
              className="flex items-center gap-2 px-md py-2 border border-outline-variant bg-white rounded-xl text-on-surface-variant font-title-md hover:bg-surface-container-high transition-colors"
              onClick={() => setMasterModal("Penulis")}
            >
              <Icon name="person" size="text-lg" />
              Penulis
            </button>
            <button
              className="flex items-center gap-2 px-md py-2 border border-outline-variant bg-white rounded-xl text-on-surface-variant font-title-md hover:bg-surface-container-high transition-colors"
              onClick={() => setMasterModal("Penerbit")}
            >
              <Icon name="storefront" size="text-lg" />
              Penerbit
            </button>
            <button
              className="flex items-center gap-2 px-md py-2 bg-primary text-on-primary rounded-xl font-title-md shadow-sm hover:opacity-90 active:scale-95 transition-all"
              onClick={() => navigate("/admin/books/new")}
            >
              <Icon name="add" size="text-lg" />
              Add Book
            </button>
          </div>
        </div>

        {/* Filter Row — search/category/status/stock-level now sent to the server */}
        <form
          className="bg-surface-container-lowest rounded-2xl p-md mb-lg grid grid-cols-1 md:grid-cols-5 gap-md items-end border border-outline-variant/30 shadow-level1"
          onSubmit={handleFilterSubmit}
        >
          <div className="md:col-span-2">
            <label className="block text-label-md text-on-surface-variant mb-2">Search</label>
            <div className="relative">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size="text-lg" />
              <input
                className="w-full pl-10 pr-md py-2 bg-surface-container-low border-none rounded-xl text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Judul, ISBN, atau kode buku..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-label-md text-on-surface-variant mb-2">Category</label>
            <select
              className="w-full bg-surface-container-low border-none rounded-xl text-body-md py-2 px-md focus:ring-2 focus:ring-primary/20"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-label-md text-on-surface-variant mb-2">Status</label>
            <select
              className="w-full bg-surface-container-low border-none rounded-xl text-body-md py-2 px-md focus:ring-2 focus:ring-primary/20"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-label-md text-on-surface-variant mb-2">Stock</label>
              <select
                className="w-full bg-surface-container-low border-none rounded-xl text-body-md py-2 px-md focus:ring-2 focus:ring-primary/20"
                value={stockLevel}
                onChange={(e) => {
                  setStockLevel(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Levels</option>
                <option value="in">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-3 py-2 mt-auto bg-primary text-on-primary rounded-xl h-[42px]"
              title="Terapkan pencarian"
            >
              <Icon name="search" />
            </button>
            <button
              type="button"
              className="px-3 py-2 mt-auto border border-outline-variant rounded-xl text-on-surface-variant hover:bg-surface-container-high h-[42px]"
              title="Clear All"
              onClick={clearFilters}
            >
              <Icon name="filter_alt_off" />
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-lg px-md py-3 rounded-auth bg-error-container text-on-error-container text-body-md flex items-center gap-sm">
            <Icon name="error" size="text-lg" />
            {error}
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="p-md font-label-md text-on-surface-variant uppercase tracking-wider">Book Detail</th>
                  <th className="p-md font-label-md text-on-surface-variant uppercase tracking-wider">ISBN / Kode</th>
                  <th className="p-md font-label-md text-on-surface-variant uppercase tracking-wider">Category</th>
                  <th className="p-md font-label-md text-on-surface-variant uppercase tracking-wider">Stock</th>
                  <th className="p-md font-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="p-md font-label-md text-on-surface-variant uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-xl text-center text-on-surface-variant">
                      Memuat data buku...
                    </td>
                  </tr>
                ) : books.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-xl text-center text-on-surface-variant">
                      <div className="flex flex-col items-center gap-sm py-md">
                        <Icon name="menu_book" size="text-[48px]" className="text-outline" />
                        Tidak ada buku yang cocok.
                      </div>
                    </td>
                  </tr>
                ) : (
                  books.map((book) => {
                    const badge = STATUS_BADGE[book.status] ?? STATUS_BADGE.draft;
                    const pct = book.stok.minimal > 0 ? Math.min(100, (book.stok.tersedia / (book.stok.minimal * 3)) * 100) : 100;
                    const low = book.stok.tersedia <= book.stok.minimal;
                    return (
                      <tr key={book.id} className="hover:bg-surface-bright transition-colors group">
                        <td className="p-md">
                          <div className="flex items-center gap-md">
                            <div className="w-12 h-16 rounded-lg overflow-hidden bg-surface shadow-sm border border-outline-variant flex-shrink-0">
                              {book.cover && <img className="w-full h-full object-cover" src={book.cover} alt={book.judul} />}
                            </div>
                            <div>
                              <h4 className="font-title-md text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                                {book.judul}
                              </h4>
                              <p className="text-xs text-on-surface-variant">{book.author?.nama ?? "-"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-md font-mono text-xs text-on-surface-variant">
                          {book.isbn || book.kode_buku}
                        </td>
                        <td className="p-md">
                          <span className="bg-surface-container-high text-on-surface-variant text-[11px] font-bold px-2 py-1 rounded-full uppercase">
                            {book.category?.nama ?? "-"}
                          </span>
                        </td>
                        <td className="p-md">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden w-24">
                              <div
                                className={`h-full ${low ? "bg-error" : "bg-primary"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-on-surface">{book.stok.tersedia}</span>
                          </div>
                          <p className={`text-[10px] mt-1 ${low ? "text-error" : "text-on-surface-variant"}`}>
                            {book.stok.tersedia <= 0 ? "Out of Stock" : low ? "Low Stock" : "In Stock"}
                          </p>
                        </td>
                        <td className="p-md">
                          <Badge tone={badge.tone}>
                            <Icon name={badge.icon} size="text-[14px]" />
                            {badge.label}
                          </Badge>
                        </td>
                        <td className="p-md">
                          <div className="flex items-center gap-1">
                            {book.status !== "published" && (
                              <button
                                className="p-1.5 text-outline hover:text-primary hover:bg-primary/10 rounded-lg transition-all disabled:opacity-40"
                                title="Publish"
                                disabled={busyId === book.id}
                                onClick={() => handlePublish(book.id)}
                              >
                                <Icon name="publish" />
                              </button>
                            )}
                            <button
                              className="p-1.5 text-outline hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                              title="Edit"
                              onClick={() => navigate(`/admin/books/${book.id}/edit`, { state: { book } })}
                            >
                              <Icon name="edit" />
                            </button>
                            <button
                              className="p-1.5 text-outline hover:text-error hover:bg-error/10 rounded-lg transition-all disabled:opacity-40"
                              title="Hapus"
                              disabled={busyId === book.id}
                              onClick={() => handleDelete(book.id)}
                            >
                              <Icon name="delete" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      </main>

      {masterModal === "Kategori" && (
        <MasterDataModal title="Kategori" endpoint="/categories" onClose={() => setMasterModal(null)} onChanged={load} />
      )}
      {masterModal === "Penulis" && (
        <MasterDataModal title="Penulis" endpoint="/authors" onClose={() => setMasterModal(null)} onChanged={load} />
      )}
      {masterModal === "Penerbit" && (
        <MasterDataModal title="Penerbit" endpoint="/publishers" onClose={() => setMasterModal(null)} onChanged={load} />
      )}
    </div>
  );
}
