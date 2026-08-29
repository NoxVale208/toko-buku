import { useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Icon from "../../components/ui/Icon";
import SalesReport from "./reports/SalesReport";
import PurchaseReport from "./reports/PurchaseReport";
import InventorySummary from "./reports/InventorySummary";

const TABS = [
  { key: "sales", label: "Sales Report", icon: "trending_up" },
  { key: "purchases", label: "Purchase Report", icon: "shopping_cart" },
  { key: "inventory", label: "Inventory Summary", icon: "inventory_2" },
];

export default function ReportsHub() {
  const [tab, setTab] = useState("sales");

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen">
      <AdminSidebar />
      <AdminNavbar />
      <main className="ml-0 md:ml-[280px] pt-24 pb-12 px-margin-mobile md:px-margin-desktop">
        <header className="mb-xl">
          <nav className="flex items-center gap-2 text-label-md text-on-surface-variant mb-2">
            <span>Dashboard</span>
            <Icon name="chevron_right" size="text-[14px]" />
            <span className="text-primary font-bold">Reports</span>
          </nav>
          <h2 className="font-display text-headline-lg text-on-surface">Reports &amp; Analytics</h2>
          <p className="text-body-lg text-on-surface-variant mt-1">
            Ringkasan penjualan, pembelian, dan inventori — seluruhnya dari data nyata.
          </p>
        </header>

        <div className="flex items-center bg-surface-container-low rounded-xl border border-outline-variant p-1 mb-xl w-fit">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`flex items-center gap-2 px-lg py-2 text-label-md font-semibold rounded-lg transition-all ${
                tab === t.key ? "text-primary bg-white shadow-sm" : "text-on-surface-variant hover:text-primary"
              }`}
              onClick={() => setTab(t.key)}
            >
              <Icon name={t.icon} size="text-lg" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "sales" && <SalesReport />}
        {tab === "purchases" && <PurchaseReport />}
        {tab === "inventory" && <InventorySummary />}
      </main>
    </div>
  );
}
