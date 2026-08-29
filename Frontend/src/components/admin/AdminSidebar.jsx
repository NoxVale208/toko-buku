import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../ui/Icon";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "dashboard", to: "/admin/dashboard" },
  { label: "Inventory", icon: "inventory_2", to: "/admin/books" },
  { label: "Procurement", icon: "shopping_cart", to: "/admin/purchases" },
  { label: "Orders", icon: "receipt_long", to: "/admin/orders" },
  { label: "Sales", icon: "point_of_sale", to: "/admin/sales" },
  { label: "Reports", icon: "bar_chart", to: "/admin/reports" },
  { label: "Settings", icon: "settings", to: "/admin/settings" },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger trigger — hidden on desktop, sidebar always visible there */}
      <button
        className="fixed top-3 left-3 z-[60] md:hidden w-10 h-10 flex items-center justify-center bg-surface-container-lowest border border-outline-variant rounded-lg shadow-level1 text-on-surface"
        onClick={() => setOpen(true)}
        aria-label="Buka menu"
      >
        <Icon name="menu" />
      </button>

      {/* Backdrop — mobile only, closes sidebar on click */}
      {open && (
        <div
          className="fixed inset-0 bg-on-background/40 z-[55] md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-[280px] bg-surface-container-lowest border-r border-outline-variant flex flex-col py-lg z-[58] transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="px-lg mb-xl flex items-center gap-sm">
          <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white">
            <Icon name="book_2" style={{ fontVariationSettings: "'FILL' 1" }} />
          </div>
          <div>
            <h1 className="font-title-lg text-title-lg font-bold text-primary">BookVault</h1>
            <p className="font-body-md text-body-md text-on-surface-variant opacity-70">Enterprise ERP</p>
          </div>
          <button
            className="ml-auto md:hidden p-1 text-on-surface-variant hover:text-error transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
          >
            <Icon name="close" />
          </button>
        </div>
        <nav className="flex-1 px-sm space-y-xs overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-md px-md py-sm rounded-r-lg transition-colors duration-200 ${
                  active
                    ? "bg-primary-container/10 text-primary font-title-md border-l-4 border-primary"
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                }`}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-sm pt-lg mt-auto border-t border-outline-variant space-y-xs">
          <button
            className="flex items-center gap-md px-md py-sm text-error hover:bg-error-container/10 rounded-lg transition-colors duration-200 w-full"
            onClick={() => logout().then(() => navigate("/"))}
          >
            <Icon name="logout" />
            <span>Sign Out</span>
          </button>
          <div className="px-md pt-sm text-caption text-on-surface-variant truncate">{user?.email}</div>
        </div>
      </aside>
    </>
  );
}
