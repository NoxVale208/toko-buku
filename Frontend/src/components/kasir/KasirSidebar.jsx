import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../ui/Icon";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { label: "POS Terminal", icon: "point_of_sale", to: "/kasir/pos" },
  { label: "Transactions", icon: "receipt_long", to: "/kasir/transactions" },
  { label: "Payment Verification", icon: "verified", to: "/kasir/payments" },
];

export default function KasirSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="fixed top-3 left-3 z-[60] md:hidden w-10 h-10 flex items-center justify-center bg-surface-container-lowest border border-outline-variant rounded-lg shadow-level1 text-on-surface"
        onClick={() => setOpen(true)}
        aria-label="Buka menu"
      >
        <Icon name="menu" />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-on-background/40 z-[55] md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-[280px] bg-surface-container-lowest border-r border-outline-variant shadow-sm flex flex-col py-xl px-md z-[58] transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="mb-xl px-md flex items-center justify-between">
          <div>
            <h1 className="font-display text-title-lg text-primary tracking-tight font-bold">BookVault</h1>
            <p className="text-on-surface-variant font-caption text-caption">
              {user?.name ?? "Kasir"} • Terminal
            </p>
          </div>
          <button
            className="md:hidden p-1 text-on-surface-variant hover:text-error transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
          >
            <Icon name="close" />
          </button>
        </div>
        <nav className="flex-1 flex flex-col gap-xs overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-md px-md py-sm rounded-xl transition-colors active:scale-95 duration-200 ${
                  active
                    ? "bg-primary-container/10 text-primary border-l-4 border-primary rounded-r-xl"
                    : "text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                <Icon name={item.icon} />
                <span className="font-title-md text-title-md">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-xs border-t border-outline-variant pt-md">
          <button
            className="flex items-center gap-md text-error px-md py-sm hover:bg-error-container/20 transition-colors rounded-xl"
            onClick={() => logout().then(() => navigate("/"))}
          >
            <Icon name="logout" />
            <span className="font-title-md text-title-md">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
