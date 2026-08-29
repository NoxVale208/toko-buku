import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleHome } from "../lib/roleHome";
import Landing from "../pages/Landing";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">
          progress_activity
        </span>
      </div>
    );
  }

  if (user) return <Navigate to={roleHome(user.role)} replace />;

  // Guest: the public landing page — not the login form, not the raw catalog.
  return <Landing />;
}
