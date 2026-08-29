import { useState } from "react";
import CustomerNavbar from "../../components/customer/CustomerNavbar";
import Icon from "../../components/ui/Icon";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

export default function ProfileSettings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name ?? "", email: user?.email ?? "" });

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <CustomerNavbar />
      <main className="pt-24 pb-xl px-margin-mobile md:px-margin-desktop max-w-[800px] mx-auto">
        <header className="mb-xl">
          <h1 className="font-headline-lg text-headline-lg text-on-background">Account Settings</h1>
        </header>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[18px] p-lg shadow-level1 mb-lg flex items-start gap-md">
          <Icon name="info" className="text-primary shrink-0" />
          <p className="text-body-md text-on-surface-variant">
            Fitur pembaruan profil belum tersambung ke backend (belum ada endpoint update profil). Form di
            bawah menampilkan data akun kamu saat ini.
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[18px] p-lg shadow-level1 space-y-lg">
          <h2 className="font-title-lg text-title-lg text-on-surface">Personal Information</h2>
          <Input
            label="Full Name"
            icon="person"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled
          />
          <Input
            label="Email Address"
            icon="mail"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled
          />
          <Button disabled>Save Changes</Button>
        </div>
      </main>
    </div>
  );
}
