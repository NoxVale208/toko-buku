export const ROLE_HOME = {
  admin: "/admin/dashboard",
  kasir: "/kasir/pos",
  customer: "/browse",
};

export function roleHome(role) {
  return ROLE_HOME[role] ?? "/browse";
}
