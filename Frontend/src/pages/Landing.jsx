import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomerNavbar from "../components/customer/CustomerNavbar";
import BookCard from "../components/customer/BookCard";
import Icon from "../components/ui/Icon";
import api from "../lib/api";

const HERO_ILLUSTRATION =
  "https://lh3.googleusercontent.com/aida/AEtjO1Vg6CIEgfhNB8G7Fo0zmuNElMV7KAYGPYdwg42scMWGG1S_8llY0GHDJ56ZcqXJ5edwTmVuBAVhzhiFgJoGO3n_gZzcTRYkASc0KG2gk0NY1a6lcTWPYZ285Ef7LJTOKrgs-SrNVOWopiwgnMy6HgiMOzDlDAxEy-UDdeSL0rv5KRDzv-w_95vk4PTdiMQgdDxDLs_RtcRzL8DccVDYQ2lqDnxHw8OAmVSCtbbF4jw7PbHtjsBvNMihCyc";

const CATEGORY_ICONS = {
  default: "category",
  fiction: "auto_stories",
  fantasy: "science",
  history: "history_edu",
  psychology: "psychology",
  technology: "code",
  business: "business_center",
  science: "science",
};

function categoryIcon(name) {
  const key = name?.toLowerCase() ?? "";
  return Object.entries(CATEGORY_ICONS).find(([k]) => key.includes(k))?.[1] ?? CATEGORY_ICONS.default;
}

export default function Landing() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/books")
      .then((res) => setBooks(res.data.data ?? res.data))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Map();
    books.forEach((b) => b.category && set.set(b.category.id, b.category.nama));
    return [...set.entries()].slice(0, 6);
  }, [books]);

  const featured = useMemo(() => {
    return [...books].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8);
  }, [books]);

  return (
    <div className="bg-background text-on-background min-h-screen antialiased">
      <CustomerNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto overflow-hidden">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-primary-container/20 rounded-full blur-[100px] z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-secondary-fixed-dim/30 rounded-full blur-[120px] z-0 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
          <div className="lg:col-span-6 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect text-primary font-label-md text-label-md uppercase tracking-wider shadow-sm">
              <Icon name="verified" size="text-[16px]" />
              Premium Enterprise Library
            </div>
            <h1 className="font-display text-display text-on-background leading-tight">
              Discover Your Next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Favorite Book
              </span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
              Jelajahi katalog buku kami dan temukan bacaan favorit berikutnya — dari novel, teknologi,
              hingga bisnis, semua dalam satu tempat.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/browse"
                className="bg-primary text-white rounded-[18px] px-8 py-3.5 font-title-md text-title-md shadow-level2 flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Browse Books
                <Icon name="arrow_forward" />
              </Link>
              <a
                href="#featured"
                className="bg-white text-primary border border-outline-variant rounded-[18px] px-8 py-3.5 font-title-md text-title-md shadow-sm hover:bg-surface-container-low transition-colors"
              >
                Explore Collection
              </a>
            </div>
            <div className="flex items-center gap-6 pt-8 border-t border-outline-variant/30">
              <div className="flex -space-x-3">
                {["auto_stories", "category", "menu_book"].map((icon) => (
                  <div
                    key={icon}
                    className="w-10 h-10 rounded-full bg-surface-container border-2 border-white flex items-center justify-center text-primary-container shadow-sm"
                  >
                    <Icon name={icon} size="text-[20px]" />
                  </div>
                ))}
              </div>
              <div className="text-on-surface-variant font-caption text-caption">
                <strong className="text-on-background font-body-md text-body-md block">
                  {loading ? "…" : `${books.length}+`}
                </strong>
                Judul Tersedia
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative mt-12 lg:mt-0">
            <div className="glass-effect p-4 rounded-[24px] shadow-level3 relative">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary-container to-secondary rounded-xl opacity-50 blur-xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-surface-tint to-primary rounded-full opacity-40 blur-2xl" />
              <img
                alt="BookVault Digital Archive Illustration"
                className="w-full h-auto rounded-xl shadow-inner relative z-10"
                src={HERO_ILLUSTRATION}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto pb-16">
          <div className="flex items-center justify-between mb-md">
            <h2 className="font-headline-md text-headline-md text-on-background">Kategori</h2>
            <Link to="/browse" className="font-label-md text-label-md text-primary hover:underline">
              Lihat Semua
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map(([id, name]) => (
              <button
                key={id}
                onClick={() => navigate(`/browse`)}
                className="flex-none bg-surface-container border border-outline-variant/30 rounded-[18px] py-2 px-4 flex items-center gap-2 shadow-sm whitespace-nowrap hover:border-primary/40 transition-colors"
              >
                <Icon name={categoryIcon(name)} size="text-[18px]" className="text-primary" />
                <span className="font-title-md text-title-md">{name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Featured Books — real published books, newest first */}
      <section id="featured" className="px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto pb-20 scroll-mt-24">
        <div className="flex items-center justify-between mb-lg">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-background">Featured Books</h2>
            <p className="font-body-md text-on-surface-variant">Rilisan terbaru dari katalog kami.</p>
          </div>
          <Link to="/browse" className="font-label-md text-label-md text-primary hover:underline hidden sm:block">
            Lihat Semua
          </Link>
        </div>
        {loading ? (
          <p className="text-on-surface-variant">Memuat buku...</p>
        ) : featured.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-md">
            <Icon name="menu_book" size="text-[48px]" className="text-outline" />
            <p className="text-on-surface-variant">Belum ada buku yang dipublikasikan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-gutter">
            {featured.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* Why BookVault */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto pb-24">
        <div className="bg-surface-container-low rounded-[24px] p-xl border border-outline-variant/30">
          <h2 className="font-headline-md text-headline-md text-center mb-xl">Why BookVault?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
            {[
              {
                icon: "inventory_2",
                title: "Katalog Lengkap",
                desc: "Ribuan judul dari berbagai kategori, mudah dicari dan dijelajahi.",
              },
              {
                icon: "security",
                title: "Transaksi Aman",
                desc: "Pembayaran transfer bank atau tunai, dengan verifikasi yang jelas.",
              },
              {
                icon: "local_shipping",
                title: "Proses Cepat",
                desc: "Pesanan diproses cepat begitu pembayaran dikonfirmasi.",
              },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="bg-white p-2 rounded-full shadow-sm border border-outline-variant/20 shrink-0 text-primary">
                  <Icon name={f.icon} />
                </div>
                <div>
                  <h3 className="font-title-md text-title-md text-on-surface">{f.title}</h3>
                  <p className="font-body-md text-on-surface-variant">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop border-t border-outline-variant/20">
        <p className="font-caption text-caption text-on-surface-variant mb-4 md:mb-0">
          © 2026 BookVault Enterprise. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors" href="#">
            Privacy Policy
          </a>
          <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors" href="#">
            Terms of Service
          </a>
          <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors" href="#">
            Help Center
          </a>
        </div>
      </footer>
    </div>
  );
}
