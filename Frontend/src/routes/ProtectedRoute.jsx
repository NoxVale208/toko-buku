import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleHome } from "../lib/roleHome";

export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">
          progress_activity
        </span>
      </div>
    );
  }

  // Not authenticated at all — this is a real auth gate, send to login.
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  // Authenticated, but this route isn't for their role — they're still logged in,
  // so send them to their own area instead of treating them like a guest.
  if (roles && !roles.includes(user.role)) return <Navigate to={roleHome(user.role)} replace />;

  return children;
}
