// The single React context every page reads app state through: who's
// signed in, their dashboard/payments/timetable data, and every action
// that can change that state (login, register, pay a fee, ...). Pages
// never call a server function directly — they call useCampus() and use
// the functions this file exposes, which handle loading/error state and
// keep the local cache (the `data` state below) in sync after each action.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useServerFn } from "@tanstack/react-start";
import { getStoredToken, setStoredToken } from "./auth-attacher";
import { validateCampusEmail } from "../shared/campus-constants";
import {
  getMyDashboard,
  getMyTimetable,
  registerStudent as registerStudentServerFn,
  login as loginServerFn,
  logout as logoutServerFn,
  requestOtp as requestOtpServerFn,
  verifyOtp as verifyOtpServerFn,
  requestPasswordReset as requestPasswordResetServerFn,
  resetPassword as resetPasswordServerFn,
  initiatePayment as initiatePaymentServerFn,
  verifyPayment as verifyPaymentServerFn,
  completeSimulatedPayment as completeSimulatedPaymentServerFn,
  type DashboardData,
  type User,
  type Payment,
  type ClassSession,
} from "../backend/campus.functions";

// Re-exported here so pages only ever need ONE import line
// (`@/lib/frontend/campus-store`) for both state/actions and these shared
// constants/types, instead of also reaching into shared/backend directly.
export {
  STUDENT_EMAIL_PATTERN,
  STUDENT_EMAIL_DOMAIN,
  FEE_TYPES,
  type FeeType,
} from "../shared/campus-constants";
export type { ClassSession } from "../backend/campus.functions";

// "registration" | "login" — the two OTP flows the UI ever has to trigger
// directly (password_reset is handled separately below, since it happens
// BEFORE the person is signed in at all).
type OtpPurpose = "registration" | "login";

type AuthResult = { ok: boolean; error?: string };
type OtpResult = { ok: boolean; error?: string; mockInboxCode?: string; email?: string };
type PasswordResetRequestResult = { ok: boolean; error?: string; mockInboxCode?: string };
type PaymentResult = {
  ok: boolean;
  error?: string;
  authorizationUrl?: string;
  status?: "success" | "failed";
  paymentId?: string;
  simulated?: boolean;
};

// The full shape of what useCampus() returns — every page's contract with
// this file. Add a new field here first, then implement it below; TS will
// then flag every place still missing it.
type Ctx = {
  ready: boolean; // true once the initial "am I signed in?" check has finished (avoids a login-page flash on refresh)
  loading: boolean;
  user: User | null;
  myPayments: Payment[];
  myTimetable: ClassSession[];
  timetableLoading: boolean;
  isAdmin: boolean;
  adminData: DashboardData["admin"] | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (input: { studentNumber: string; password: string; personalEmail: string }) => Promise<AuthResult>;
  logout: () => Promise<void>;
  requestOtp: (purpose?: OtpPurpose) => Promise<OtpResult>;
  verifyOtpCode: (code: string, purpose?: OtpPurpose) => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<PasswordResetRequestResult>;
  resetPassword: (input: { email: string; code: string; newPassword: string }) => Promise<AuthResult>;
  loadTimetable: () => Promise<void>;
  payFee: (feeId: string) => Promise<PaymentResult>;
  finalizeSimulatedPayment: (paymentId: string) => Promise<PaymentResult>;
  confirmPayment: (reference: string) => Promise<PaymentResult>;
  refresh: () => Promise<void>;
};

const CampusContext = createContext<Ctx | null>(null);

export function CampusProvider({ children }: { children: ReactNode }) {
  // `ready` flips true exactly once, after the very first loadDashboard()
  // call resolves — pages use it to avoid rendering "please sign in"
  // before we've actually checked whether a token exists.
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  // Tracks "did the last dashboard load actually succeed", separately from
  // whether a token merely EXISTS in localStorage — a stale/expired token
  // still exists as a string but shouldn't count as "signed in".
  const [hasToken, setHasToken] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [timetable, setTimetable] = useState<ClassSession[]>([]);
  const [timetableLoading, setTimetableLoading] = useState(false);

  // useServerFn() wraps each imported server function so it can be called
  // like a normal async function from client code — TanStack Start swaps
  // in the real RPC call under the hood.
  const getMyDashboardFn = useServerFn(getMyDashboard);
  const getMyTimetableFn = useServerFn(getMyTimetable);
  const registerStudentServer = useServerFn(registerStudentServerFn);
  const loginServer = useServerFn(loginServerFn);
  const logoutServer = useServerFn(logoutServerFn);
  const requestOtpServer = useServerFn(requestOtpServerFn);
  const verifyOtpServer = useServerFn(verifyOtpServerFn);
  const requestPasswordResetServer = useServerFn(requestPasswordResetServerFn);
  const resetPasswordServer = useServerFn(resetPasswordServerFn);
  const initiatePaymentServer = useServerFn(initiatePaymentServerFn);
  const verifyPaymentServer = useServerFn(verifyPaymentServerFn);
  const completeSimulatedPaymentServer = useServerFn(completeSimulatedPaymentServerFn);

  // The one function that (re)populates `data` from the server — called
  // after every action that changes state (login, register, pay, ...) so
  // the UI never shows stale data. If there's no token at all, skips the
  // network call entirely and just marks state as "ready, signed out".
  const loadDashboard = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setData(null);
      setLoading(false);
      setReady(true);
      return;
    }
    setLoading(true);
    try {
      const d = await getMyDashboardFn();
      setData(d);
      setHasToken(true);
    } catch (e) {
      // Token missing/expired/invalid — drop it and treat as signed out.
      console.error("Failed to load dashboard", e);
      setStoredToken(null);
      setHasToken(false);
      setData(null);
    } finally {
      setLoading(false);
      setReady(true);
    }
  }, [getMyDashboardFn]);

  // Runs exactly once, on mount — checks whether a stored session token is
  // still valid, so a page refresh doesn't bounce a signed-in person back
  // to the login screen.
  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const user = data?.user ?? null;
  const isAdmin = data?.isAdmin ?? false;
  const myPayments = useMemo(() => data?.payments ?? [], [data]);

  const login: Ctx["login"] = useCallback(
    async (email, password) => {
      // Client-side format check first — catches an obviously-wrong email
      // before even making the network round trip.
      const invalid = validateCampusEmail(email);
      if (invalid) return { ok: false, error: invalid };
      try {
        const res = await loginServer({ data: { email: email.trim().toLowerCase(), password } });
        if (!res.ok) return { ok: false, error: res.error };
        setStoredToken(res.token);
        // Load the dashboard now so the OTP screen that follows (see
        // auth.tsx) has `user` data to show — the caller here does NOT
        // treat the person as "fully signed in" yet; auth.tsx is
        // responsible for following this up with a requestOtp("login") +
        // OTP screen before navigating anywhere.
        await loadDashboard();
        return { ok: true };
      } catch (e) {
        return { ok: false, error: (e as Error).message ?? "Sign-in failed." };
      }
    },
    [loginServer, loadDashboard],
  );

  const register: Ctx["register"] = useCallback(
    async (input) => {
      const studentNumber = input.studentNumber.trim();
      if (!/^\d{9}$/.test(studentNumber))
        return { ok: false, error: "Enter your 9-digit WSU student number." };
      if (input.password.length < 6)
        return { ok: false, error: "Password must be at least 6 characters." };
      if (validateCampusEmail(input.personalEmail) === null) {
        // validateCampusEmail is built for the @iws.ac.za/@wsu.ac.za
        // institutional format — a personal email should NOT match that
        // pattern, so this branch existing at all would mean someone typed
        // their institutional address by mistake into the personal-email
        // field. A plain regex email check (not validateCampusEmail) is
        // what actually validates the personal email's format below.
        return { ok: false, error: "Enter your own personal email, not a university one." };
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.personalEmail)) {
        return { ok: false, error: "Enter a valid personal email address." };
      }

      try {
        const res = await registerStudentServer({
          data: {
            studentNumber,
            password: input.password,
            personalEmail: input.personalEmail.trim().toLowerCase(),
          },
        });
        if (!res.ok) return { ok: false, error: res.error };
        setStoredToken(res.token);
        await loadDashboard();
        return { ok: true };
      } catch (e) {
        return { ok: false, error: (e as Error).message ?? "Registration failed." };
      }
    },
    [registerStudentServer, loadDashboard],
  );

  const logout: Ctx["logout"] = useCallback(async () => {
    try {
      await logoutServer();
    } catch {
      // Session may already be gone server-side — clear locally regardless.
    }
    setStoredToken(null);
    setHasToken(false);
    setData(null);
    setTimetable([]);
  }, [logoutServer]);

  // Kicks off an OTP send for either the registration-verification flow or
  // the sign-in 2FA flow — `purpose` decides which (defaults to
  // "registration" so any existing call site that doesn't pass one keeps
  // working). Requires a token to already be stored, since the server
  // function this calls is auth-gated (it sends to WHOEVER the token
  // belongs to, not to an email address the client supplies).
  const requestOtp: Ctx["requestOtp"] = useCallback(
    async (purpose = "registration") => {
      if (!hasToken) return { ok: false, error: "Not signed in." };
      try {
        const res = await requestOtpServer({ data: { purpose } });
        return { ok: true, mockInboxCode: res.mockInboxCode, email: res.email };
      } catch (e) {
        return { ok: false, error: (e as Error).message ?? "Could not send a code." };
      }
    },
    [hasToken, requestOtpServer],
  );

  const verifyOtpCode: Ctx["verifyOtpCode"] = useCallback(
    async (code, purpose = "registration") => {
      if (!hasToken) return { ok: false, error: "Not signed in." };
      try {
        const res = await verifyOtpServer({ data: { code, purpose } });
        if (!res.ok) return { ok: false, error: res.error };
        // Refresh dashboard data — for the registration flow this picks
        // up the now-true isVerified flag; harmless no-op for the login
        // flow, where isVerified was already true.
        await loadDashboard();
        return { ok: true };
      } catch (e) {
        return { ok: false, error: (e as Error).message ?? "Verification failed." };
      }
    },
    [hasToken, verifyOtpServer, loadDashboard],
  );

  const requestPasswordReset: Ctx["requestPasswordReset"] = useCallback(
    async (email) => {
      try {
        const res = await requestPasswordResetServer({ data: { email: email.trim().toLowerCase() } });
        return { ok: res.ok, mockInboxCode: res.mockInboxCode };
      } catch (e) {
        return { ok: false, error: (e as Error).message ?? "Could not send a code." };
      }
    },
    [requestPasswordResetServer],
  );

  const resetPassword: Ctx["resetPassword"] = useCallback(
    async ({ email, code, newPassword }) => {
      try {
        const res = await resetPasswordServer({
          data: { email: email.trim().toLowerCase(), code, newPassword },
        });
        if (!res.ok) return { ok: false, error: res.error };
        return { ok: true };
      } catch (e) {
        return { ok: false, error: (e as Error).message ?? "Could not reset your password." };
      }
    },
    [resetPasswordServer],
  );

  const loadTimetable: Ctx["loadTimetable"] = useCallback(async () => {
    if (!hasToken) return;
    setTimetableLoading(true);
    try {
      const res = await getMyTimetableFn();
      setTimetable(res.sessions);
    } catch (e) {
      console.error("Failed to load timetable", e);
    } finally {
      setTimetableLoading(false);
    }
  }, [hasToken, getMyTimetableFn]);

  const payFee: Ctx["payFee"] = useCallback(
    async (feeId) => {
      if (!hasToken) return { ok: false, error: "Not signed in." };
      try {
        const res = await initiatePaymentServer({ data: { feeId } });
        if (!res.ok) return { ok: false, error: res.error };
        // Simulated payments finish immediately (finalizeSimulatedPayment
        // below), so there's nothing new to refresh yet; a real Paystack
        // payment is still 'pending' at this point (the person hasn't
        // been through checkout yet), so refreshing now would be pointless.
        if (!res.simulated) await loadDashboard();
        return {
          ok: true,
          authorizationUrl: res.authorizationUrl,
          paymentId: res.paymentId,
          simulated: res.simulated,
        };
      } catch (e) {
        return { ok: false, error: (e as Error).message ?? "Could not start payment." };
      }
    },
    [hasToken, initiatePaymentServer, loadDashboard],
  );

  const finalizeSimulatedPayment: Ctx["finalizeSimulatedPayment"] = useCallback(
    async (paymentId) => {
      if (!hasToken) return { ok: false, error: "Not signed in." };
      try {
        const res = await completeSimulatedPaymentServer({ data: { paymentId } });
        if (!res.ok) return { ok: false, error: res.error };
        await loadDashboard();
        return { ok: true, status: "success" };
      } catch (e) {
        return { ok: false, error: (e as Error).message ?? "Could not confirm payment." };
      }
    },
    [hasToken, completeSimulatedPaymentServer, loadDashboard],
  );

  const confirmPayment: Ctx["confirmPayment"] = useCallback(
    async (reference) => {
      if (!hasToken) return { ok: false, error: "Not signed in." };
      try {
        const res = await verifyPaymentServer({ data: { reference } });
        if (!res.ok) return { ok: false, error: res.error };
        await loadDashboard();
        return { ok: true, status: res.status };
      } catch (e) {
        return { ok: false, error: (e as Error).message ?? "Could not confirm payment." };
      }
    },
    [hasToken, verifyPaymentServer, loadDashboard],
  );

  // Everything above assembled into the one object every page reads via
  // useCampus() — see the type Ctx definition near the top for what each
  // field means.
  const value: Ctx = {
    ready,
    loading,
    user,
    myPayments,
    myTimetable: timetable,
    timetableLoading,
    isAdmin,
    adminData: data?.admin ?? null,
    login,
    register,
    logout,
    requestOtp,
    verifyOtpCode,
    requestPasswordReset,
    resetPassword,
    loadTimetable,
    payFee,
    finalizeSimulatedPayment,
    confirmPayment,
    refresh: loadDashboard,
  };

  return <CampusContext.Provider value={value}>{children}</CampusContext.Provider>;
}

// The hook every page actually calls. Throws (rather than returning null)
// if used outside <CampusProvider> — a loud failure at the call site
// instead of a silent `undefined.user` crash somewhere else.
export function useCampus() {
  const ctx = useContext(CampusContext);
  if (!ctx) throw new Error("useCampus must be used inside CampusProvider");
  return ctx;
}

// South African Rand formatting — used everywhere a fee/payment amount is
// displayed, so the "R" prefix and comma grouping stay consistent.
export function formatZAR(value: number) {
  return `R${value.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Turns an ISO timestamp into "5 min ago" / "3 hr ago" / "2 days ago" style
// text for the notifications/payments lists, falling back to an actual
// date once it's more than a week old.
export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-ZA", { day: "2-digit", month: "short" });
}
