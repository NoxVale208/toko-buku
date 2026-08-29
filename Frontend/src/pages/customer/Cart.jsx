import { Link, useNavigate } from "react-router-dom";
import CustomerNavbar from "../../components/customer/CustomerNavbar";
import Icon from "../../components/ui/Icon";
import Button from "../../components/ui/Button";
import { useCart } from "../../context/CartContext";

const PLACEHOLDER_COVER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC5XH4GiZ7LKT_ZbUpw0nuP52HuOdmdjj6rrngi68v_1JN55-MoZzUzx-dpOsH1Zdk_CWUnqti3EJTRKfj24Iv0Cs8AHcHE5eadeB3K3jL7tnkWiQPPiU3k6hD_zwnTXl61KRwFDP-Z-4DiEhEBOh9MzhcOkuK9VPQbI045wrESnI6MtugEEEMKPOyyOZYRKUtEpD14k7emMIPGDyKUHpn0iLykDjJgoIHvSOMepcPWPSXc4EjJ03J-";

function formatIDR(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value ?? 0
  );
}

export default function Cart() {
  const { items, subtotal, updateQty, removeItem, loading } = useCart();
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <CustomerNavbar />
      <main className="pt-[100px] pb-xl px-margin-mobile md:px-margin-desktop max-w-content mx-auto min-h-screen">
        <header className="mb-xl">
          <h1 className="font-headline-lg text-headline-lg text-on-background mb-base">Your Shopping Cart</h1>
          <p className="font-body-md text-on-surface-variant">
            Review your items before proceeding to secure checkout.
          </p>
        </header>

        {loading ? (
          <p className="text-on-surface-variant">Memuat keranjang...</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-md text-center">
            <Icon name="shopping_cart" size="text-[64px]" className="text-outline" />
            <p className="text-title-md text-on-surface-variant">Keranjang kamu masih kosong.</p>
            <Button onClick={() => navigate("/browse")}>Mulai Belanja</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-md">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg flex flex-col sm:flex-row gap-lg transition-all duration-300 hover:shadow-level1"
                >
                  <div className="w-full sm:w-32 h-44 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      src={item.book?.cover || PLACEHOLDER_COVER}
                      alt={item.book?.judul}
                    />
                  </div>
                  <div className="flex flex-col flex-grow justify-between py-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-title-lg text-title-lg text-on-surface mb-xs">
                          {item.book?.judul}
                        </h3>
                        <p className="font-body-md text-on-surface-variant">
                          ISBN: {item.book?.isbn ?? "—"}
                        </p>
                        <span className="inline-flex items-center mt-sm text-primary font-medium text-body-md">
                          <Icon name="check_circle" size="text-[18px]" className="mr-xs" /> In Stock
                        </span>
                      </div>
                      <button
                        aria-label="Remove item"
                        className="text-on-surface-variant hover:text-error transition-colors p-xs"
                        onClick={() => removeItem(item.id)}
                      >
                        <Icon name="delete" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-lg">
                      <div className="flex items-center gap-xs bg-surface-container-low rounded-full px-xs py-xs border border-outline-variant/30">
                        <button
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors active:scale-90"
                          onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                        >
                          <Icon name="remove" size="text-[20px]" />
                        </button>
                        <span className="w-8 text-center font-title-md">{item.qty}</span>
                        <button
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors active:scale-90"
                          onClick={() => updateQty(item.id, item.qty + 1)}
                        >
                          <Icon name="add" size="text-[20px]" />
                        </button>
                      </div>
                      <span className="font-headline-md text-headline-md text-primary">
                        {formatIDR(item.qty * item.harga)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg sticky top-[100px] shadow-level1">
                <h2 className="font-title-lg text-title-lg text-on-background mb-lg">Order Summary</h2>
                <div className="space-y-md mb-lg">
                  <div className="flex justify-between font-body-md text-on-surface-variant">
                    <span>Subtotal ({items.length} items)</span>
                    <span>{formatIDR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-body-md text-on-surface-variant">
                    <span>Estimated Shipping</span>
                    <span className="text-primary font-medium">Free</span>
                  </div>
                  <div className="pt-sm border-t border-outline-variant/30 flex justify-between font-title-lg text-on-surface font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatIDR(subtotal)}</span>
                  </div>
                </div>
                <Button fullWidth size="lg" icon="arrow_forward" iconPosition="right" onClick={() => navigate("/checkout")}>
                  Proceed to Checkout
                </Button>
                <Link
                  to="/browse"
                  className="block text-center mt-md font-body-md text-primary hover:underline"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
