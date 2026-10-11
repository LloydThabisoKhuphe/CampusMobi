// Notifications page (route "/notifications") — currently derived from
// the signed-in student's own payment history (a payment succeeding/
// failing IS a notification) rather than a separate notifications table.
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useCampus, formatZAR } from "@/lib/frontend/campus-store";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — CampusMobi" },
      {
        name: "description",
        content: "Payment confirmations and account alerts for your student account.",
      },
      { property: "og:title", content: "Notifications — CampusMobi" },
      {
        property: "og:description",
        content: "Payment confirmations and account alerts in one feed.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <NotificationsContent />
    </AppShell>
  ),
});

// The shape each notification is normalised into, regardless of what it
// was actually derived from (only payments today, but the "kind" system
// below is generic enough to add other sources later without a rewrite).
type Item = {
  id: string;
  kind: "alert" | "info" | "success";
  title: string;
  detail: string;
  timestamp: string;
};

function NotificationsContent() {
  const { user, myPayments } = useCampus();
  if (!user) return null; // guards against a render before the user has loaded

  const items: Item[] = [];

  // Turn the most recent 10 payments into notification items — one
  // payment record becomes one notification, styled by its status.
  myPayments.slice(0, 10).forEach((p) => {
    items.push({
      id: `pay-${p.id}`,
      // Maps the payment's DB status to a notification "kind", which
      // decides the colour via the `tone` lookup further down.
      kind: p.status === "success" ? "success" : p.status === "failed" ? "alert" : "info",
      title:
        p.status === "success"
          ? "Payment confirmed"
          : p.status === "failed"
            ? "Payment failed"
            : "Payment pending",
      detail: `${formatZAR(p.amount)} — ${p.feeType}.`,
      timestamp: p.createdAt,
    });
  });

  // Newest first — ISO timestamps sort correctly as plain strings, no
  // Date parsing needed for the comparison itself.
  items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  // Tailwind class per notification kind — keeps the JSX below from
  // needing a chain of conditionals for styling.
  const tone: Record<Item["kind"], string> = {
    alert: "border-destructive/40 bg-destructive/10",
    success: "border-accent/40 bg-accent/10",
    info: "border-border bg-card",
  };

  return (
    <div>
      <PageHeader title="Notifications" blurb="Payment confirmations and account alerts." />
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">You're all caught up.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li key={n.id} className={`rounded-xl border px-4 py-3 ${tone[n.kind]}`}>
              <div className="text-sm font-medium text-foreground">{n.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{n.detail}</div>
              {/* Full local date/time string, e.g. "19/09/2026, 14:32:10" */}
              <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                {new Date(n.timestamp).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
