import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("bookvault_user");
    return raw ? JSON.parse(raw) : null;
  });
  // We already know `user` synchronously from localStorage above, so there's no need
  // to block rendering while GET /me revalidates the token in the background — that
  // would force a global loading screen on every refresh even for an already-valid
  // session. Only block when there's a token but we don't yet have a cached user to
  // optimistically render with (rare: e.g. a corrupted/partial localStorage state).
  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem("bookvault_token");
    const cachedUser = localStorage.getItem("bookvault_user");
    return !!token && !cachedUser;
  });

  useEffect(() => {
    const token = localStorage.getItem("bookvault_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/me")
      .then((res) => {
        setUser(res.data.user ?? res.data);
        localStorage.setItem("bookvault_user", JSON.stringify(res.data.user ?? res.data));
      })
      .catch(() => {
        localStorage.removeItem("bookvault_token");
        localStorage.removeItem("bookvault_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/login", { email, password });
    localStorage.setItem("bookvault_token", res.data.token);
    localStorage.setItem("bookvault_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password) => {
    const res = await api.post("/register", { name, email, password });
    localStorage.setItem("bookvault_token", res.data.token);
    localStorage.setItem("bookvault_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem("bookvault_token");
    localStorage.removeItem("bookvault_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
