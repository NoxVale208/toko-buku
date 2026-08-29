import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../lib/api";
import CustomerNavbar from "../../components/customer/CustomerNavbar";
import BookCard from "../../components/customer/BookCard";
import Icon from "../../components/ui/Icon";

const SORTS = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "title", label: "Title A-Z" },
];

export default function BrowseBooks() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [sort, setSort] = useState(searchParams.get("sort") ?? "newest");

  useEffect(() => {
    setLoading(true);
    api
      .get("/books")
      .then((res) => setBooks(res.data.data ?? res.data))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Map();
    books.forEach((b) => b.category && set.set(b.category.id, b.category.nama));
    return [...set.entries()];
  }, [books]);

  const filtered = useMemo(() => {
    let list = books;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (b) => b.judul?.toLowerCase().includes(q) || b.author?.nama?.toLowerCase().includes(q)
      );
    }
    if (genres.length) list = list.filter((b) => b.category && genres.includes(b.category.id));

    const sorted = [...list];
    if (sort === "price_asc") sorted.sort((a, b) => a.harga.jual - b.harga.jual);
    else if (sort === "price_desc") sorted.sort((a, b) => b.harga.jual - a.harga.jual);
    else if (sort === "title") sorted.sort((a, b) => a.judul.localeCompare(b.judul));
    else sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return sorted;
  }, [books, query, genres, sort]);

  const toggleGenre = (id) => {
    setGenres((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  };

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <CustomerNavbar />
      <div className="flex max-w-content mx-auto pt-24 px-margin-mobile md:px-margin-desktop gap-gutter">
        {/* Sidebar filters */}
        <aside className="hidden lg:flex flex-col w-[280px] shrink-0 gap-xl sticky top-24 h-[calc(100vh-120px)] overflow-y-auto pr-4">
          <div className="flex flex-col gap-sm">
            <h3 className="font-label-md text-label-md text-outline uppercase tracking-wider mb-2">
              Refine Results
            </h3>
            <span className="font-title-md text-body-lg text-on-surface-variant mb-1">Genre</span>
            <div className="flex flex-col gap-xs pl-sm">
              {categories.map(([id, name]) => (
                <label key={id} className="flex items-center gap-sm p-xs cursor-pointer hover:text-primary transition-colors">
                  <input
                    type="checkbox"
                    className="rounded-sm border-outline text-primary focus:ring-primary"
                    checked={genres.includes(id)}
                    onChange={() => toggleGenre(id)}
                  />
                  <span className="text-body-md">{name}</span>
                </label>
              ))}
              {categories.length === 0 && (
                <span className="text-caption text-outline">Belum ada kategori</span>
              )}
            </div>
          </div>
          <div className="mt-auto p-lg rounded-xl bg-primary-container text-on-primary-container relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <p className="font-title-md text-title-md mb-2">50,000+ Titles</p>
              <p className="font-caption text-caption mb-4 opacity-90">
                Explore our curated collection from worldwide authors.
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Icon name="diamond" size="text-[120px]" />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 pb-xl">
          <div className="flex flex-col gap-md mb-xl">
            <div className="flex items-center gap-sm text-caption font-caption text-outline">
              <span>Home</span>
              <Icon name="chevron_right" size="text-[14px]" />
              <span className="text-on-surface">Browse Catalog</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
              <div>
                <h1 className="font-display text-headline-lg text-primary">
                  {query ? `Results for "${query}"` : "Discover Your Next Story"}
                </h1>
                <p className="font-body-md text-body-lg text-on-surface-variant max-w-xl">
                  {filtered.length} judul tersedia di katalog kami.
                </p>
              </div>
              <div className="flex items-center gap-sm">
                <span className="text-body-md text-on-surface-variant whitespace-nowrap">Sort by:</span>
                <select
                  className="bg-surface border border-outline-variant rounded-[18px] px-md py-2 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-on-surface-variant">Memuat buku...</p>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-md">
              <Icon name="menu_book" size="text-[64px]" className="text-outline" />
              <p className="text-title-md text-on-surface-variant">Tidak ada buku ditemukan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-gutter">
              {filtered.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
