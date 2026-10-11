// Fee payment page (route "/pay") — pick a fee from FEE_TYPES, then either
// a real Paystack sandbox checkout (PAYSTACK_SECRET_KEY configured) or an
// in-app simulated card form (not configured, the default). See
// initiatePayment/completeSimulatedPayment/verifyPayment in
// campus.functions.ts for the corresponding backend logic.
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreditCard, Loader2, CheckCircle2, XCircle, Clock, Lock } from "lucide-react";
import { AppShell, PageHeader, SectionTitle } from "@/components/AppShell";
import { useCampus, formatZAR, relativeTime, FEE_TYPES, type FeeType } from "@/lib/frontend/campus-store";

export const Route = createFileRoute("/pay")({
  head: () => ({
    meta: [
      { title: "Pay Fees — CampusMobi | Walter Sisulu University" },
      { name: "description", content: "Pay WSU administration fees securely through Paystack." },
    ],
  }),
  component: () => (
    <AppShell>
      <PayContent />
    </AppShell>
  ),
});

function PayContent() {
  const { myPayments, payFee, confirmPayment, finalizeSimulatedPayment } = useCampus();
  const [busyFee, setBusyFee] = useState<string | null>(null); // which fee id is mid-submission, for its button's spinner
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false); // true while we're verifying a just-returned-from-Paystack payment
  const [confirmResult, setConfirmResult] = useState<"success" | "failed" | null>(null);
  // The simulated-checkout modal's state — set only when a payment started
  // WITHOUT a real Paystack key configured (see startPayment below).
  const [checkout, setCheckout] = useState<{ paymentId: string; fee: FeeType } | null>(null);

  // Paystack redirects back with ?reference=... (or ?trxref=...) after checkout.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") ?? params.get("trxref");
    if (!reference) return; // normal page load, not a Paystack redirect — nothing to do
    setConfirming(true);
    // confirmPayment calls verifyPayment server-side, which asks Paystack
    // itself for the real outcome — never trusts the redirect alone.
    confirmPayment(reference).then((res) => {
      setConfirming(false);
      if (res.ok) setConfirmResult(res.status ?? null);
      // Strips the ?reference=... query string from the URL so refreshing
      // the page doesn't re-trigger this confirmation flow.
      window.history.replaceState({}, "", window.location.pathname);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kicks off a payment for one fee. Three possible outcomes from the server:
  // failure (show the error), a real Paystack checkout URL (redirect the
  // whole page there), or a simulated payment id (open the in-app modal).
  const startPayment = async (fee: FeeType) => {
    setError("");
    setBusyFee(fee.id);
    const res = await payFee(fee.id);
    setBusyFee(null);
    if (!res.ok) {
      setError(res.error ?? "Could not start payment.");
      return;
    }
    if (res.authorizationUrl) {
      // Real Paystack flow — leave the app entirely for their checkout page;
      // the useEffect above picks things back up when Paystack redirects here.
      window.location.href = res.authorizationUrl;
      return;
    }
    if (res.simulated && res.paymentId) setCheckout({ paymentId: res.paymentId, fee });
  };

  // Styling + icon per payment status, looked up by key in the JSX below
  // rather than a chain of if/else per row.
  const statusStyle: Record<string, string> = {
    success: "bg-success/15 text-success",
    failed: "bg-destructive/12 text-destructive",
    pending: "bg-secondary text-muted-foreground",
  };
  const statusIcon: Record<string, typeof CheckCircle2> = {
    success: CheckCircle2,
    failed: XCircle,
    pending: Clock,
  };

  return (
    <div>
      <PageHeader
        eyebrow="Payment gateway"
        title="Pay fees"
        blurb="Pay WSU administration fees securely through Paystack (sandbox / test mode)."
      />

      {confirming && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Confirming your payment with Paystack…
        </div>
      )}
      {!confirming && confirmResult && (
        <div
          className={`mb-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            confirmResult === "success"
              ? "border-success/30 bg-success/10 text-success"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {confirmResult === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          {confirmResult === "success"
            ? "Payment confirmed — thank you."
            : "That payment did not go through."}
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* One card per fee type, each with its own "Pay" button + spinner while busyFee matches its id */}
      <SectionTitle title="Administration fees" hint="2026 approved rates" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEE_TYPES.map((fee) => (
          <div key={fee.id} className="surface flex flex-col justify-between p-5">
            <div>
              <p className="font-display text-lg font-semibold">{fee.label}</p>
              <p className="mt-1 font-mono text-2xl font-bold text-primary">
                {formatZAR(fee.amount)}
              </p>
            </div>
            <button
              onClick={() => startPayment(fee)}
              disabled={busyFee === fee.id}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-70"
            >
              {busyFee === fee.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              Pay with Paystack
            </button>
          </div>
        ))}
      </div>

      {/* Payment history — every row this student's payments table has, newest first (server already orders it) */}
      <div className="mt-10">
        <SectionTitle title="Payment history" />
        {myPayments.length === 0 ? (
          <p className="surface p-6 text-sm text-muted-foreground">No payments yet.</p>
        ) : (
          <div className="surface divide-y divide-border">
            {myPayments.map((p) => {
              const Icon = statusIcon[p.status];
              return (
                <div key={p.id} className="flex items-center gap-3 p-4">
                  <Icon className="h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.feeType}</p>
                    <p className="text-xs text-muted-foreground">{relativeTime(p.createdAt)}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${statusStyle[p.status]}`}
                  >
                    {p.status}
                  </span>
                  <span className="w-24 shrink-0 text-right font-mono text-sm">
                    {formatZAR(p.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Simulated checkout modal — only mounted while `checkout` state is set (see startPayment) */}
      {checkout && (
        <SimulatedCheckoutModal
          fee={checkout.fee}
          onCancel={() => setCheckout(null)}
          onPaid={async () => {
            const res = await finalizeSimulatedPayment(checkout.paymentId);
            setCheckout(null);
            if (!res.ok) {
              setError(res.error ?? "Could not confirm payment.");
              return;
            }
            setConfirmResult("success");
          }}
        />
      )}
    </div>
  );
}

// Card-entry UI for the simulated Paystack fallback (used when PAYSTACK_SECRET_KEY
// isn't configured yet). No card data is transmitted anywhere — this only exists so
// the payment flow is fully demoable end to end; the DB write behind it is real.
function SimulatedCheckoutModal({
  fee,
  onCancel,
  onPaid,
}: {
  fee: FeeType;
  onCancel: () => void;
  onPaid: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  // Prefilled with Paystack's own published test-card numbers — nothing
  // entered here is validated or transmitted anywhere; it's purely for show.
  const [card, setCard] = useState("4084 0840 8408 4081");
  const [expiry, setExpiry] = useState("12/28");
  const [cvv, setCvv] = useState("408");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900)); // brief pause so it reads as a real charge, not an instant no-op
    onPaid(); // tells the parent (PayContent) to call finalizeSimulatedPayment and close this modal
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="font-display text-lg font-bold text-[#011B33]">Paystack</span>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
            Test mode
          </span>
        </div>
        <p className="text-sm text-neutral-500">Paying</p>
        <p className="font-display text-2xl font-bold text-[#011B33]">{formatZAR(fee.amount)}</p>
        <p className="text-sm text-neutral-500">{fee.label} · Walter Sisulu University</p>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-neutral-500">Card number</span>
            <input
              value={card}
              onChange={(e) => setCard(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 font-mono text-sm text-[#011B33] outline-none focus:border-[#011B33]"
            />
          </label>
          <div className="flex gap-3">
            <label className="block flex-1">
              <span className="text-xs font-medium text-neutral-500">Expiry</span>
              <input
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 font-mono text-sm text-[#011B33] outline-none focus:border-[#011B33]"
              />
            </label>
            <label className="block flex-1">
              <span className="text-xs font-medium text-neutral-500">CVV</span>
              <input
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 font-mono text-sm text-[#011B33] outline-none focus:border-[#011B33]"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#011B33] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Lock className="h-3.5 w-3.5" />
            )}
            Pay {formatZAR(fee.amount)}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full text-center text-xs font-medium text-neutral-500 hover:underline"
          >
            Cancel
          </button>
        </form>

        <p className="mt-4 text-center text-[10px] text-neutral-400">
          Simulated checkout — no live Paystack key configured. Add PAYSTACK_SECRET_KEY to switch to
          real sandbox payments.
        </p>
      </div>
    </div>
  );
}
