// Admin-only panel (route "/admin") — registered users list + payment
// totals, from the `admin` block getMyDashboard only populates for
// role === "admin" accounts (see campus.functions.ts). A non-admin never
// receives that data in the first place, so this page has nothing to hide
// even without an extra client-side gate — though see AppShell.tsx for
// where the nav link itself is hidden from non-admins.
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useCampus, formatZAR } from "@/lib/frontend/campus-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — CampusMobi" },
      {
        name: "description",
        content: "Staff overview of CampusMobi accounts, verification status and fee payments.",
      },
      { property: "og:title", content: "Admin Dashboard — CampusMobi" },
      { property: "og:description", content: "Staff overview of accounts and payments." },
    ],
  }),
  component: () => (
    <AppShell>
      <AdminContent />
    </AppShell>
  ),
});

function AdminContent() {
  const { user, adminData } = useCampus();
  if (!user) return null; // guards against a render before the user has loaded

  // adminData is undefined for a non-admin (getMyDashboard only populates
  // it for role === "admin" — see campus.functions.ts) — this is the
  // actual access-control check, not just cosmetic; a student literally
  // never receives the admin data in the API response.
  if (!adminData) {
    return (
      <div>
        <PageHeader title="Admin" blurb="Restricted area." />
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          You need a staff account to view this page.
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Admin dashboard" blurb="Accounts, verification status and fee payments." />

      {/* Three summary stat cards — counts/totals computed server-side in getMyDashboard */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Users" value={String(adminData.users.length)} />
        <Stat label="Payments" value={String(adminData.paymentCount)} />
        <Stat label="Revenue (successful)" value={formatZAR(adminData.revenue)} />
      </div>

      {/* Full accounts table — one row per registered user */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
        <h2 className="border-b border-border px-5 py-3 font-display text-lg font-semibold">
          Accounts
        </h2>
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-2">Name</th>
              <th className="px-5 py-2">Student ID</th>
              <th className="px-5 py-2">Role</th>
              <th className="px-5 py-2 text-right">2FA verified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {adminData.users.map((u) => (
              <tr key={u.id}>
                <td className="px-5 py-3">
                  {u.name}
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </td>
                <td className="px-5 py-3 font-mono text-xs">{u.studentId}</td>
                <td className="px-5 py-3 capitalize">{u.role}</td>
                <td className="px-5 py-3 text-right">
                  {/* isVerified reflects the REGISTRATION otp step only — see the
                      is_verified comment in campus.functions.ts's verifyOtp handler */}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      u.isVerified
                        ? "bg-success/15 text-success"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {u.isVerified ? "Verified" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Small reusable stat-card, used 3 times above for Users/Payments/Revenue.
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="font-mono text-2xl text-accent">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
