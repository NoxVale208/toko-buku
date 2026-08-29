import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../../components/ui/Icon";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { roleHome } from "../../lib/roleHome";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const from = location.state?.from?.pathname;
      navigate(from ?? roleHome(user.role));
    } catch (err) {
      setError(err.response?.data?.message ?? "Email atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden bg-background">
      {/* Left Side: Illustration */}
      <section className="hidden md:flex relative bg-primary-container items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-xl">
          <img
            alt="BookVault 3D Illustration"
            className="w-[85%] max-w-[600px] object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuADvuumGoPK-zwMakELL7iwjZ4whBY2h8bnO9GKp535n7y8Xrj9D7RfEh9tyPIyklHxzFWEXj78Clg9ejAvvDk3j-jcmtdjE7xRb6TFYFfFWCvda7mBoFFJrtIij9rOSIN1O6Et-zeEtWKPGDTbiF1ERB9vh76KZsrMNFZTJEOv2OauQPJnq-NeRYoPuUFGoY4axDueTzMEzqVcodglVlF64oVcMEXhLV0uMjmqjS08Z55XydtBNANr"
          />
          <div className="mt-xl text-center max-w-md">
            <h2 className="font-headline-lg text-headline-lg text-white mb-md">
              Enterprise Digital Archiving
            </h2>
            <p className="font-body-lg text-body-lg text-primary-fixed opacity-90">
              Seamlessly manage your inventory, sales, and staff with our state-of-the-art
              secure digital vault.
            </p>
          </div>
        </div>
      </section>

      {/* Right Side: Login Form */}
      <section className="flex flex-col items-center justify-center px-margin-mobile md:px-xl relative">
        <div className="md:hidden absolute inset-0 bg-primary/5 -z-10" />
        <div className="w-full max-w-[480px] glass-effect p-xl rounded-auth shadow-level3 border border-white/40 flex flex-col">
          <div className="flex items-center gap-md mb-xl">
            <img
              alt="BookVault Logo"
              className="h-12 w-12 object-contain"
              src="https://lh3.googleusercontent.com/aida/AP1WRLuoe3eViNzzQd-4a2arC21aHikYsGefH3Stmb4TgM4z_36k23Q9A0jfGplgQ_4joA74y_I2pqDpAxN1C31l4WHrnkaocDqfqNvtWk0LEut9tecwPs1gxK-H8MYNS7lP1pIv8_i28baePS0Tm6uVUrQMOZYGhxcHe4VpN7n9KmTJWymf7pFKredrmTLPhR0kIoHtx5nJ_pd4L2kUf7dHUjRl7DV-9qoI9KaGeHB3uNMxZZhRi57c-UhQbA"
            />
            <span className="font-headline-md text-headline-md text-primary font-bold">
              BookVault
            </span>
          </div>

          <div className="mb-xl">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">
              Welcome Back
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Please enter your credentials to access the ERP dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-lg px-md py-3 rounded-auth bg-error-container text-on-error-container text-body-md flex items-center gap-sm">
              <Icon name="error" size="text-lg" />
              {error}
            </div>
          )}

          <form className="space-y-lg" onSubmit={handleSubmit}>
            <div className="space-y-base">
              <label
                className="font-label-md text-label-md text-on-surface-variant uppercase ml-sm"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">
                  mail
                </span>
                <input
                  className="w-full pl-[48px] pr-md py-3 bg-surface-container-lowest border border-outline-variant/60 rounded-auth focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline/50 font-body-md text-on-surface"
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-base">
              <div className="flex justify-between items-center px-sm">
                <label
                  className="font-label-md text-label-md text-on-surface-variant uppercase"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  className="font-label-md text-label-md text-primary hover:underline transition-all"
                  to="/forgot-password"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">
                  lock
                </span>
                <input
                  className="w-full pl-[48px] pr-[48px] py-3 bg-surface-container-lowest border border-outline-variant/60 rounded-auth focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline/50 font-body-md text-on-surface"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  <Icon name={showPassword ? "visibility_off" : "visibility"} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-sm px-sm">
              <input
                className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                id="remember"
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setForm({ ...form, remember: e.target.checked })}
              />
              <label
                className="font-body-md text-body-md text-on-surface-variant select-none"
                htmlFor="remember"
              >
                Remember me for 30 days
              </label>
            </div>

            <Button type="submit" fullWidth size="lg" icon="arrow_forward" iconPosition="right" loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="mt-xl text-center font-body-md text-body-md text-on-surface-variant">
            Don't have an account?{" "}
            <Link className="text-primary font-bold hover:underline" to="/register">
              Sign up
            </Link>
          </p>
        </div>

        <footer className="mt-xl flex gap-lg opacity-60">
          <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors" href="#">
            Privacy Policy
          </a>
          <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors" href="#">
            Terms of Service
          </a>
          <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors" href="#">
            Help Center
          </a>
        </footer>
      </section>
    </main>
  );
}
