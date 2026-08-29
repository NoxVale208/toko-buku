import Icon from "../ui/Icon";
import { useAuth } from "../../context/AuthContext";

export default function AdminNavbar() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 md:left-[280px] right-0 h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant flex justify-between items-center pl-16 pr-margin-mobile md:px-margin-desktop z-40">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full hidden sm:block">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-transparent rounded-full font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary border-outline-variant outline-none"
            placeholder="Search books, orders, or customers..."
            type="text"
            disabled
          />
        </div>
      </div>
      <div className="flex items-center gap-lg">
        <div className="h-8 w-px bg-outline-variant hidden sm:block" />
        <div className="flex items-center gap-sm">
          <div className="text-right hidden sm:block">
            <p className="font-label-md text-label-md text-on-surface">{user?.name}</p>
            <p className="text-[10px] text-on-surface-variant leading-none uppercase">{user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold">
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
        </div>
      </div>
    </header>
  );
}
