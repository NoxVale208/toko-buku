import { useEffect, useState } from "react";
import CustomerNavbar from "../../components/customer/CustomerNavbar";
import BookCard from "../../components/customer/BookCard";
import Icon from "../../components/ui/Icon";
import api from "../../lib/api";
import { useWishlist } from "../../context/WishlistContext";
import { Link } from "react-router-dom";

export default function MyWishlist() {
  const { ids } = useWishlist();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/books")
      .then((res) => {
        const all = res.data.data ?? res.data;
        setBooks(all.filter((b) => ids.includes(b.id)));
      })
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <CustomerNavbar />
      <main className="pt-24 pb-xl px-margin-mobile md:px-margin-desktop max-w-content mx-auto">
        <header className="mb-xl">
          <h1 className="font-headline-lg text-headline-lg text-on-background">My Wishlist</h1>
          <p className="font-body-md text-on-surface-variant">
            Tersimpan di perangkat ini — fitur wishlist tersinkron ke akun akan menyusul.
          </p>
        </header>

        {loading ? (
          <p className="text-on-surface-variant">Memuat...</p>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-md text-center">
            <Icon name="favorite" size="text-[64px]" className="text-outline" />
            <p className="text-title-md text-on-surface-variant">Wishlist kamu masih kosong.</p>
            <Link to="/browse" className="text-primary hover:underline">Jelajahi katalog</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-gutter">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
