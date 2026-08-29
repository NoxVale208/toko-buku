import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../ui/Icon";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { roleHome } from "../../lib/roleHome";

const NAV_LINKS = [
  { label: "Browse", to: "/browse" },
  { label: "Best Sellers", to: "/browse?sort=best_selling" },
  { label: "New Releases", to: "/browse?sort=newest" },
];

export default function CustomerNavbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleAccountClick = () => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    setMenuOpen((s) => !s);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-sm">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-md max-w-content mx-auto">
        <div className="flex items-center gap-xl">
          <Link className="flex items-center gap-base" to="/browse">
            <div className="w-8 h-8 flex items-center justify-center bg-primary rounded-lg text-on-primary">
              <Icon name="auto_stories" size="text-[20px]" />
            </div>
            <span className="font-display text-title-lg font-bold text-primary">BookVault</span>
          </Link>
          <nav className="hidden md:flex gap-lg">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors py-1"
                to={l.to}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-md">
          <form className="relative hidden lg:block" onSubmit={handleSearch}>
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size="text-[20px]" />
            <input
              className="bg-surface-container border border-outline-variant rounded-[18px] pl-10 pr-4 py-2 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-64 transition-all"
              placeholder="Search for books, authors..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
          <div className="flex gap-sm items-center">
            <Link
              className="relative p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant active:scale-95 duration-200"
              to={user ? "/cart" : "/login"}
              state={user ? undefined : { from: location }}
            >
              <Icon name="shopping_cart" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-error text-on-error text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <div className="relative">
              <button
                className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant active:scale-95 duration-200"
                onClick={handleAccountClick}
              >
                <Icon name="account_circle" />
              </button>
              {menuOpen && user && (
                <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-level2 py-2 flex flex-col">
                  <Link className="px-4 py-2 text-body-md hover:bg-surface-container-low" to="/account" onClick={() => setMenuOpen(false)}>
                    My Account
                  </Link>
                  {user.role === "customer" && (
                    <>
                      <Link className="px-4 py-2 text-body-md hover:bg-surface-container-low" to="/orders" onClick={() => setMenuOpen(false)}>
                        My Orders
                      </Link>
                      <Link className="px-4 py-2 text-body-md hover:bg-surface-container-low" to="/wishlist" onClick={() => setMenuOpen(false)}>
                        Wishlist
                      </Link>
                      <Link className="px-4 py-2 text-body-md hover:bg-surface-container-low" to="/settings" onClick={() => setMenuOpen(false)}>
                        Settings
                      </Link>
                    </>
                  )}
                  {user.role !== "customer" && (
                    <Link
                      className="px-4 py-2 text-body-md hover:bg-surface-container-low flex items-center gap-2"
                      to={roleHome(user.role)}
                      onClick={() => setMenuOpen(false)}
                    >
                      <Icon name="arrow_back" size="text-lg" />
                      Kembali ke Dashboard
                    </Link>
                  )}
                  <button
                    className="px-4 py-2 text-body-md text-left text-error hover:bg-surface-container-low"
                    onClick={() => {
                      setMenuOpen(false);
                      logout().then(() => navigate("/"));
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
          {!user && (
            <Link
              className="hidden sm:block bg-primary text-on-primary px-lg py-2 rounded-[18px] font-title-md text-title-md hover:opacity-90 active:scale-95 transition-all"
              to="/login"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
