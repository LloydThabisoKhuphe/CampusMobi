import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  GraduationCap,
  ShieldCheck,
  CreditCard,
  CalendarDays,
  Loader2,
  MailCheck,
  KeyRound,
  Lock,
} from "lucide-react";
import { useCampus, STUDENT_EMAIL_DOMAIN } from "@/lib/frontend/campus-store";
import { CAMPUS_STATS } from "@/lib/shared/campus-data";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Student Sign In — CampusMobi | Walter Sisulu University" },
      {
        name: "description",
        content:
          "Sign in to CampusMobi with your WSU student email to access your virtual student card, timetable and campus services.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { ready, user, login, register, requestOtp, verifyOtpCode, requestPasswordReset, resetPassword } =
    useCampus();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register" | "otp" | "forgot" | "reset">("login");
  const [email, setEmail] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  // Real address (Gmail, etc.) collected at registration — this is where
  // OTP codes actually get emailed to (see email.server.ts). Separate from
  // `email` above, which is the fixed @iws.ac.za login address.
  const [personalEmail, setPersonalEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [mockCode, setMockCode] = useState("");
  const [otpInput, setOtpInput] = useState("");
  // Which flow the current OTP screen belongs to — decides which purpose
  // gets sent to requestOtp/verifyOtpCode, since the same OTP screen JSX
  // below is shared between "just registered" and "just signed in".
  const [otpPurpose, setOtpPurpose] = useState<"registration" | "login">("registration");
  // The actual address the current code was (or would be) sent to —
  // captured from requestOtp()'s response so the on-screen text always
  // reflects reality instead of a guessed/hardcoded address.
  const [otpEmail, setOtpEmail] = useState("");

  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetDone, setResetDone] = useState(false);

  // Already signed in and verified, landing on /auth directly (e.g. typed
  // the URL, or clicked back) — bounce straight to the dashboard. Guarded
  // with `!busy`: during the login/register submit flow below, `login()`
  // loads dashboard data (to populate the OTP screen) WHILE `busy` is
  // still true — without this guard, that data load makes `user.isVerified`
  // true a beat before `mode` switches to "otp", and this effect would
  // race ahead and navigate home before the OTP screen ever shows.
  useEffect(() => {
    if (ready && user?.isVerified && !busy) navigate({ to: "/" });
  }, [ready, user, busy, navigate]);

  // Signed in but not yet verified (e.g. refreshed mid-registration) — jump to OTP step.
  useEffect(() => {
    if (ready && user && !user.isVerified && mode !== "otp") {
      setOtpPurpose("registration");
      setMode("otp");
      requestOtp("registration").then((res) => {
        if (res.ok) {
          setMockCode(res.mockInboxCode ?? "");
          setOtpEmail(res.email ?? "");
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res =
      mode === "login"
        ? await login(email, password)
        : await register({ studentNumber, password, personalEmail });
    if (!res.ok) {
      setBusy(false);
      setError(res.error ?? "Something went wrong.");
      return;
    }
    // Both branches now continue into the SAME OTP step — registration
    // always did; sign-in follows it here too, so 2FA applies every time,
    // not just at sign-up.
    const purpose = mode === "register" ? "registration" : "login";
    const otpRes = await requestOtp(purpose);
    setBusy(false);
    if (!otpRes.ok) {
      setError(
        otpRes.error ??
          (mode === "register"
            ? "Account created, but the verification code failed to send."
            : "Signed in, but the verification code failed to send."),
      );
      return;
    }
    setOtpPurpose(purpose);
    setMockCode(otpRes.mockInboxCode ?? "");
    setOtpEmail(otpRes.email ?? "");
    setMode("otp");
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await verifyOtpCode(otpInput, otpPurpose);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Incorrect code.");
      return;
    }
    navigate({ to: "/" });
  };

  const submitForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await requestPasswordReset(forgotEmail);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Something went wrong.");
      return;
    }
    setMockCode(res.mockInboxCode ?? "");
    setMode("reset");
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    const res = await resetPassword({ email: forgotEmail, code: resetCode, newPassword });
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Could not reset your password.");
      return;
    }
    setResetDone(true);
    setEmail(forgotEmail);
    setPassword("");
    setResetCode("");
    setNewPassword("");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden bg-brand p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-success/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-accent-foreground">
            <GraduationCap className="h-6 w-6" />
          </span>
          <div>
            <p className="font-display text-xl font-bold">CampusMobi</p>
            <p className="text-xs uppercase tracking-[0.2em] opacity-75">
              Walter Sisulu University
            </p>
          </div>
        </div>

        <div className="relative max-w-lg">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Your campus, <span className="text-accent">in your pocket.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed opacity-80">
            One secure, two-factor-verified sign-in for your virtual student card, timetable and
            fee payments.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              { icon: CreditCard, text: "Pay admin fees securely through a real payment gateway" },
              { icon: CalendarDays, text: "See your real enrolled modules and class schedule" },
              {
                icon: ShieldCheck,
                text: "Registration checked against WSU's enrolled-students list",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.text} className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-foreground/12">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="opacity-90">{item.text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative grid grid-cols-4 gap-4 border-t border-primary-foreground/20 pt-6">
          {CAMPUS_STATS.map((s) => (
            <div key={s.label}>
              <p className="font-display text-xl font-bold text-accent">{s.value}</p>
              <p className="text-[10px] uppercase tracking-wider opacity-70">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form panel */}
      <section className="flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-lg font-bold text-primary">CampusMobi</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Walter Sisulu University
              </p>
            </div>
          </div>

          {mode === "login" || mode === "register" ? (
            <>
              <h1 className="mt-8 font-display text-3xl font-bold tracking-tight lg:mt-0">
                {mode === "login" ? "Sign in to CampusMobi" : "Register your student account"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "login"
                  ? "Access is limited to registered WSU students."
                  : "Your student number is checked against WSU's enrolled-students list — your name, faculty and programme are pulled from there automatically."}
              </p>

              <div className="surface mt-7 p-6">
                <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1">
                  {(["login", "register"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMode(m);
                        setError("");
                      }}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        mode === m
                          ? "bg-card text-primary shadow-soft"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {m === "login" ? "Sign in" : "Register"}
                    </button>
                  ))}
                </div>

                <form onSubmit={submit} className="space-y-4">
                  {mode === "login" ? (
                    <Field
                      label="University email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      placeholder={`123456789@${STUDENT_EMAIL_DOMAIN}`}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Field
                          label="Student number"
                          value={studentNumber}
                          onChange={(v) => setStudentNumber(v.replace(/\D/g, "").slice(0, 9))}
                          placeholder="219045123"
                        />
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          9 digits. Your account will be{" "}
                          <span className="font-mono">
                            {studentNumber || "•········"}@{STUDENT_EMAIL_DOMAIN}
                          </span>
                        </p>
                      </div>
                      <div>
                        <Field
                          label="Personal email"
                          type="email"
                          value={personalEmail}
                          onChange={setPersonalEmail}
                          placeholder="you@gmail.com"
                        />
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          A real address you check — your verification code goes here, not to the
                          university address above.
                        </p>
                      </div>
                    </div>
                  )}

                  <Field
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    placeholder="••••••••"
                  />

                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setResetDone(false);
                        setForgotEmail(email);
                        setMode("forgot");
                      }}
                      className="-mt-2 block text-xs font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}

                  {resetDone && mode === "login" && (
                    <p className="rounded-xl border border-success/30 bg-success/10 px-3 py-2.5 text-sm text-success">
                      Password reset — sign in with your new password.
                    </p>
                  )}

                  {error && (
                    <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-semibold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5 disabled:opacity-70"
                  >
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                    {mode === "login" ? "Sign in" : "Register"}
                  </button>
                </form>
              </div>
            </>
          ) : mode === "forgot" ? (
            <>
              <h1 className="mt-8 font-display text-3xl font-bold tracking-tight lg:mt-0">
                Reset your password
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your university email and we'll send a 6-digit code to reset your password.
              </p>

              <div className="surface mt-7 p-6">
                <form onSubmit={submitForgot} className="space-y-4">
                  <Field
                    label="University email"
                    type="email"
                    value={forgotEmail}
                    onChange={setForgotEmail}
                    placeholder={`123456789@${STUDENT_EMAIL_DOMAIN}`}
                  />
                  {error && (
                    <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-semibold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5 disabled:opacity-70"
                  >
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                    Send reset code
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setMode("login");
                    }}
                    className="w-full text-center text-xs font-medium text-primary hover:underline"
                  >
                    Back to sign in
                  </button>
                </form>
              </div>
            </>
          ) : mode === "reset" ? (
            <>
              <h1 className="mt-8 font-display text-3xl font-bold tracking-tight lg:mt-0">
                Enter your reset code
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                If an account exists for <span className="font-mono">{forgotEmail}</span>, a code
                was sent to it.
              </p>

              {/* Fallback: Gmail isn't configured (or no personal email on file) — the
                  code was never actually emailed, so it's shown here instead. */}
              {mockCode && (
                <div className="surface mt-7 flex items-start gap-3 border-accent/30 bg-accent/5 p-4">
                  <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                      Mock inbox · {forgotEmail}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your password reset code is{" "}
                      <span className="font-mono text-base font-bold text-foreground">
                        {mockCode}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              <div className="surface mt-4 p-6">
                <form onSubmit={submitReset} className="space-y-4">
                  <Field
                    label="6-digit code"
                    value={resetCode}
                    onChange={(v) => setResetCode(v.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                  />
                  <Field
                    label="New password"
                    type="password"
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder="••••••••"
                  />
                  {error && (
                    <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={busy || resetCode.length !== 6}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-semibold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5 disabled:opacity-70"
                  >
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Lock className="h-4 w-4" />
                    Reset password
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await requestPasswordReset(forgotEmail);
                      if (res.ok) setMockCode(res.mockInboxCode ?? "");
                    }}
                    className="w-full text-center text-xs font-medium text-primary hover:underline"
                  >
                    Resend code
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setMode("login");
                    }}
                    className="w-full text-center text-xs font-medium text-muted-foreground hover:underline"
                  >
                    Back to sign in
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <h1 className="mt-8 font-display text-3xl font-bold tracking-tight lg:mt-0">
                {otpPurpose === "login" ? "Confirm it's you" : "Verify your account"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We've sent a 6-digit code to <span className="font-mono">{otpEmail}</span>.
              </p>

              {mockCode ? (
                // Fallback path: Gmail isn't configured (or this account has
                // no personal email on file) — the code was never actually
                // emailed, so it's shown here instead, same as the original
                // demo-only "mock inbox". See email.server.ts.
                <div className="surface mt-7 flex items-start gap-3 border-accent/30 bg-accent/5 p-4">
                  <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                      Mock inbox · {otpEmail}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your CampusMobi {otpPurpose === "login" ? "sign-in" : "verification"} code is{" "}
                      <span className="font-mono text-base font-bold text-foreground">{mockCode}</span>
                    </p>
                  </div>
                </div>
              ) : (
                // Real path: the code was actually emailed via Gmail — no
                // code appears on screen at all, by design.
                <div className="surface mt-7 flex items-start gap-3 border-accent/30 bg-accent/5 p-4">
                  <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <p className="text-sm text-muted-foreground">
                    Check that inbox for the code — it expires in 5 minutes.
                  </p>
                </div>
              )}

              <div className="surface mt-4 p-6">
                <form onSubmit={submitOtp} className="space-y-4">
                  <Field
                    label="6-digit code"
                    value={otpInput}
                    onChange={(v) => setOtpInput(v.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                  />
                  {error && (
                    <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={busy || otpInput.length !== 6}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-semibold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5 disabled:opacity-70"
                  >
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                    <KeyRound className="h-4 w-4" />
                    Verify & continue
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await requestOtp(otpPurpose);
                      if (res.ok) {
                        setMockCode(res.mockInboxCode ?? "");
                        setOtpEmail(res.email ?? "");
                      }
                    }}
                    className="w-full text-center text-xs font-medium text-primary hover:underline"
                  >
                    Resend code
                  </button>
                </form>
              </div>
            </>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By signing in you accept the WSU ICT acceptable use policy.
          </p>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
    </label>
  );
}
