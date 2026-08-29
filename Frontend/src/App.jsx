import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Placeholder from "./pages/Placeholder";
import BrowseBooks from "./pages/customer/BrowseBooks";
import BookDetail from "./pages/customer/BookDetail";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import OrderConfirmed from "./pages/customer/OrderConfirmed";
import TrackOrder from "./pages/customer/TrackOrder";
import OrderDetail from "./pages/customer/OrderDetail";
import MyAccount from "./pages/customer/MyAccount";
import MyWishlist from "./pages/customer/MyWishlist";
import ProfileSettings from "./pages/customer/ProfileSettings";
import PosTerminal from "./pages/kasir/PosTerminal";
import ReceiptPreview from "./pages/kasir/ReceiptPreview";
import TransactionHistory from "./pages/kasir/TransactionHistory";
import PaymentVerification from "./pages/kasir/PaymentVerification";
import AdminDashboard from "./pages/admin/AdminDashboard";
import InventoryList from "./pages/admin/InventoryList";
import BookForm from "./pages/admin/BookForm";
import PurchaseList from "./pages/admin/procurement/PurchaseList";
import CreatePurchase from "./pages/admin/procurement/CreatePurchase";
import PurchaseDetail from "./pages/admin/procurement/PurchaseDetail";
import ReportsHub from "./pages/admin/ReportsHub";
import SettingsHub from "./pages/admin/SettingsHub";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminSales from "./pages/admin/AdminSales";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<Placeholder title="Forgot Password" />} />

              {/* Public catalog — guests can browse freely, no login required */}
              <Route path="/browse" element={<BrowseBooks />} />
              <Route path="/search" element={<BrowseBooks />} />
              <Route path="/books/:id" element={<BookDetail />} />

              {/* Customer — requires account */}
              <Route path="/cart" element={<ProtectedRoute roles={["customer"]}><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute roles={["customer"]}><Checkout /></ProtectedRoute>} />
              <Route path="/order-confirmed" element={<ProtectedRoute roles={["customer"]}><OrderConfirmed /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute roles={["customer"]}><TrackOrder /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute roles={["customer"]}><OrderDetail /></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute roles={["customer","admin","kasir"]}><MyAccount /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute roles={["customer"]}><MyWishlist /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute roles={["customer"]}><ProfileSettings /></ProtectedRoute>} />

              {/* Kasir */}
              <Route path="/kasir/pos" element={<ProtectedRoute roles={["kasir"]}><PosTerminal /></ProtectedRoute>} />
              <Route path="/kasir/receipt" element={<ProtectedRoute roles={["kasir"]}><ReceiptPreview /></ProtectedRoute>} />
              <Route path="/kasir/receipt/:id" element={<ProtectedRoute roles={["kasir","admin"]}><ReceiptPreview /></ProtectedRoute>} />
              <Route path="/kasir/transactions" element={<ProtectedRoute roles={["kasir","admin"]}><TransactionHistory /></ProtectedRoute>} />
              <Route path="/kasir/payments" element={<ProtectedRoute roles={["kasir","admin"]}><PaymentVerification /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin/dashboard" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/books" element={<ProtectedRoute roles={["admin"]}><InventoryList /></ProtectedRoute>} />
              <Route path="/admin/books/new" element={<ProtectedRoute roles={["admin"]}><BookForm /></ProtectedRoute>} />
              <Route path="/admin/books/:id/edit" element={<ProtectedRoute roles={["admin"]}><BookForm /></ProtectedRoute>} />
              <Route path="/admin/purchases" element={<ProtectedRoute roles={["admin","kasir"]}><PurchaseList /></ProtectedRoute>} />
              <Route path="/admin/purchases/new" element={<ProtectedRoute roles={["admin","kasir"]}><CreatePurchase /></ProtectedRoute>} />
              <Route path="/admin/purchases/:id" element={<ProtectedRoute roles={["admin","kasir"]}><PurchaseDetail /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute roles={["admin"]}><AdminOrders /></ProtectedRoute>} />
              <Route path="/admin/orders/:id" element={<ProtectedRoute roles={["admin"]}><AdminOrderDetail /></ProtectedRoute>} />
              <Route path="/admin/sales" element={<ProtectedRoute roles={["admin"]}><AdminSales /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute roles={["admin"]}><ReportsHub /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute roles={["admin"]}><ReportsHub /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute roles={["admin"]}><SettingsHub /></ProtectedRoute>} />

              <Route path="*" element={<Placeholder title="404 - Halaman tidak ditemukan" />} />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
