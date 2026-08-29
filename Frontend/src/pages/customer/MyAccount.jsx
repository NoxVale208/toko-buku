import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CustomerNavbar from "../../components/customer/CustomerNavbar";
import Icon from "../../components/ui/Icon";
import { useAuth } from "../../context/AuthContext";
import { roleHome } from "../../lib/roleHome";
import api from "../../lib/api";

export default function MyAccount() {
  const { user } = useAuth();
  const isCustomer = user?.role === "customer";
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!isCustomer) return;
    api.get("/orders").then((res) => setOrders(res.data.data ?? res.data));
  }, [isCustomer]);

  const completed = orders.filter((o) => o.status === "completed").length;
  const pending = orders.filter((o) => o.status === "waiting_confirmation").length;

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <CustomerNavbar />
      <main className="pt-24 pb-xl px-margin-mobile md:px-margin-desktop max-w-content mx-auto">
        <header className="mb-xl">
          <h1 className="font-headline-lg text-headline-lg text-on-background">My Account</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="md:col-span-1 bg-surface-container-lowest border border-outline-variant/30 rounded-[18px] p-lg shadow-level1 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center mb-md">
              <Icon name="account_circle" size="text-[48px]" className="text-on-primary-container" />
            </div>
            <h2 className="font-title-lg text-title-lg text-on-surface">{user?.name}</h2>
            <p className="text-body-md text-on-surface-variant">{user?.email}</p>
            <p className="text-caption text-outline uppercase mt-xs">{user?.role}</p>
            {isCustomer ? (
              <Link
                to="/settings"
                className="mt-lg w-full bg-surface-container-low hover:bg-primary hover:text-on-primary text-primary px-4 py-2 rounded-[18px] font-label-md transition-all"
              >
                Edit Profile
              </Link>
            ) : (
              <Link
                to={roleHome(user?.role)}
                className="mt-lg w-full bg-surface-container-low hover:bg-primary hover:text-on-primary text-primary px-4 py-2 rounded-[18px] font-label-md transition-all flex items-center justify-center gap-xs"
              >
                <Icon name="arrow_back" size="text-lg" />
                Kembali ke Dashboard
              </Link>
            )}
          </div>

          {isCustomer ? (
            <div className="md:col-span-2 space-y-md">
              <div className="grid grid-cols-2 gap-md">
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[18px] p-lg shadow-level1">
                  <p className="text-caption text-outline uppercase mb-xs">Total Pesanan</p>
                  <p className="font-headline-md text-headline-md text-primary">{orders.length}</p>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[18px] p-lg shadow-level1">
                  <p className="text-caption text-outline uppercase mb-xs">Selesai</p>
                  <p className="font-headline-md text-headline-md text-primary">{completed}</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[18px] p-lg shadow-level1 flex items-center justify-between">
                <div className="flex items-center gap-md">
                  <Icon name="receipt_long" className="text-primary" />
                  <div>
                    <p className="font-title-md text-on-surface">Riwayat Pesanan</p>
                    <p className="text-caption text-outline">{pending} menunggu konfirmasi pembayaran</p>
                  </div>
                </div>
                <Link to="/orders" className="text-primary hover:underline font-label-md">
                  Lihat semua
                </Link>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[18px] p-lg shadow-level1 flex items-center justify-between">
                <div className="flex items-center gap-md">
                  <Icon name="favorite" className="text-primary" />
                  <p className="font-title-md text-on-surface">Wishlist</p>
                </div>
                <Link to="/wishlist" className="text-primary hover:underline font-label-md">
                  Lihat semua
                </Link>
              </div>
            </div>
          ) : (
            <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-[18px] p-lg shadow-level1 flex items-center gap-md">
              <Icon name="info" className="text-primary" />
              <p className="text-body-md text-on-surface-variant">
                Kamu sedang login sebagai <span className="font-bold capitalize">{user?.role}</span> dan sedang
                menjelajah katalog buku publik. Fitur pesanan dan wishlist khusus untuk akun customer.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
