import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../components/ui/Icon";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

function getStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score; // 0-4
}

const STRENGTH_LABEL = ["Weak", "Weak", "Fair", "Good", "Strong"];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => getStrength(form.password), [form.password]);
  const hasLen = form.password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/browse");
    } catch (err) {
      const messages = err.response?.data?.errors;
      setError(
        messages ? Object.values(messages).flat().join(" ") : err.response?.data?.message ?? "Registrasi gagal"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full overflow-x-hidden bg-surface">
      {/* Left Side: Illustration */}
      <section className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden bg-gradient-to-br from-surface-container to-surface-variant">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary rounded-full blur-[120px]" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-secondary rounded-full blur-[120px]" />
        </div>
        <div className="z-10 w-full max-w-2xl px-12 transition-transform duration-700 hover:scale-[1.02]">
          <img
            alt=""
            className="w-full h-auto drop-shadow-2xl rounded-xl"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuADvuumGoPK-zwMakELL7iwjZ4whBY2h8bnO9GKp535n7y8Xrj9D7RfEh9tyPIyklHxzFWEXj78Clg9ejAvvDk3j-jcmtdjE7xRb6TFYFfFWCvda7mBoFFJrtIij9rOSIN1O6Et-zeEtWKPGDTbiF1ERB9vh76KZsrMNFZTJEOv2OauQPJnq-NeRYoPuUFGoY4axDueTzMEzqVcodglVlF64oVcMEXhLV0uMjmqjS08Z55XydtBNANr"
          />
          <div className="mt-12 text-center">
            <h2 className="font-display text-display text-on-surface mb-4">
              Enterprise Grade Security
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mx-auto">
              Manage your inventory with the vault-class protection that 2,000+ publishers
              trust every single day.
            </p>
          </div>
        </div>
      </section>

      {/* Right Side: Registration Form */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-margin-desktop bg-surface relative">
        <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-surface-container to-surface-variant -z-10 opacity-40" />
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8 text-center">
            <img
              alt=""
              className="w-16 h-16 mb-4"
              src="https://lh3.googleusercontent.com/aida/AP1WRLuoe3eViNzzQd-4a2arC21aHikYsGefH3Stmb4TgM4z_36k23Q9A0jfGplgQ_4joA74y_I2pqDpAxN1C31l4WHrnkaocDqfqNvtWk0LEut9tecwPs1gxK-H8MYNS7lP1pIv8_i28baePS0Tm6uVUrQMOZYGhxcHe4VpN7n9KmTJWymf7pFKredrmTLPhR0kIoHtx5nJ_pd4L2kUf7dHUjRl7DV-9qoI9KaGeHB3uNMxZZhRi57c-UhQbA"
            />
            <h1 className="font-headline-lg text-headline-lg text-primary">BookVault</h1>
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mt-2">
              The New Standard in ERP
            </p>
          </div>

          <div className="glass-effect p-8 md:p-10 rounded-auth shadow-level3">
            <div className="mb-8">
              <h2 className="font-title-lg text-title-lg text-on-surface mb-2">
                Create Account
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Enter your details to start managing your library.
              </p>
            </div>

            {error && (
              <div className="mb-6 px-4 py-3 rounded-auth bg-error-container text-on-error-container text-body-md flex items-center gap-2">
                <Icon name="error" size="text-lg" />
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="fullName">
                  FULL NAME
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    person
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-white/50 border border-outline-variant rounded-auth font-body-md text-body-md focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline/60"
                    id="fullName"
                    placeholder="Jane Doe"
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="email">
                  EMAIL
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    mail
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-white/50 border border-outline-variant rounded-auth font-body-md text-body-md focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline/60"
                    id="email"
                    placeholder="jane@example.com"
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="password">
                  PASSWORD
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    lock
                  </span>
                  <input
                    className="w-full pl-12 pr-12 py-3 bg-white/50 border border-outline-variant rounded-auth font-body-md text-body-md focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline/60"
                    id="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    <Icon name={showPassword ? "visibility_off" : "visibility"} />
                  </button>
                </div>

                {/* Password Strength Meter */}
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1 h-1 w-full">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-full w-1/4 rounded-full transition-all ${
                          strength > i
                            ? strength <= 2
                              ? "bg-error"
                              : strength === 3
                              ? "bg-amber-500"
                              : "bg-green-600"
                            : "bg-surface-container"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="font-caption text-caption text-outline">
                      Strength: {form.password ? STRENGTH_LABEL[strength] : "—"}
                    </span>
                    <div className="flex items-center gap-1">
                      <Icon
                        name={hasLen ? "check_circle" : "close"}
                        className={hasLen ? "text-green-600" : "text-error"}
                        size="text-[14px]"
                      />
                      <span className="font-caption text-caption text-on-surface-variant">
                        6+ chars
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" fullWidth size="lg" icon="arrow_forward" iconPosition="right" loading={loading}>
                Sign Up
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Already have an account?{" "}
                <Link className="text-primary font-bold hover:underline" to="/login">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
