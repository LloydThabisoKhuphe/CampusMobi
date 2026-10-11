// The shared page layout — top nav bar (desktop) / bottom nav (mobile),
// page-title header, and the sign-out control. Every route (except /auth)
// wraps its content in <AppShell>...</AppShell>; the nav items themselves
// adapt based on useCampus()'s isAdmin flag (an admin sees an extra link).
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  LayoutDashboard,
  IdCard,
  CalendarDays,
  CreditCard,
  Bell,
  Shield,
  Menu,
  X,
  LogOut,
  GraduationCap,
  Phone,
  Mail,
  Search,
  ChevronRight,
} from "lucide-react";
import { useCampus } from "@/lib/frontend/campus-store";
import { useNow } from "@/hooks/use-live";

// Base nav — every signed-in user sees these 5, in this order, both in the
// desktop top bar and the mobile bottom tab bar (see `links` below, which
// appends an Admin entry conditionally).
const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student-card", label: "Student card", icon: IdCard },
  { to: "/timetable", label: "Timetable", icon: CalendarDays },
  { to: "/pay", label: "Pay fees", icon: CreditCard },
  { to: "/notifications", label: "Notices", icon: Bell },
] as const;

// Powers the header search box: a typed word is matched against each
// entry's `keywords` (substring match, not exact), and the first match
// wins — a lightweight "search" that's really just a keyword router, not
// a real full-text search over page content.
const SEARCH_HINTS: { keywords: string[]; to: string }[] = [
  { keywords: ["card", "student card", "id"], to: "/student-card" },
  {
    keywords: ["timetable", "calendar", "celcat", "module", "schedule", "class"],
    to: "/timetable",
  },
  { keywords: ["pay", "fee", "fees", "gateway", "money", "exam", "remark"], to: "/pay" },
  { keywords: ["notice", "alert", "news", "announcement", "notification"], to: "/notifications" },
  { keywords: ["admin", "staff", "users"], to: "/admin" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { ready, loading, user, logout } = useCampus();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false); // mobile hamburger menu open/closed
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false); // for the header's shrink-on-scroll effect
  const now = useNow(1000); // live clock, re-renders every second — see hooks/use-live.ts

  // The actual "you must be signed in AND verified to see any page wrapped
  // in AppShell" gate — every protected page goes through this same check
  // since they all render <AppShell>. Waits for `ready` (the initial
  // session check to finish) so it doesn't bounce someone to /auth for a
  // split second while a valid session is still loading.
  useEffect(() => {
    if (ready && !loading && (!user || !user.isVerified)) navigate({ to: "/auth" });
  }, [ready, loading, user, navigate]);

  // Closes the mobile menu automatically whenever the route changes (e.g.
  // after tapping a nav link) — without this it would stay open.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Tracks scroll position purely for the header's shrink animation
  // (see the `scrolled ?` conditionals in the JSX below).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll(); // run once immediately, so a page loaded already-scrolled starts in the right state
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While the auth check above is still pending (or about to redirect),
  // show a loading spinner instead of a flash of page content.
  if (!ready || !user || !user.isVerified) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading CampusMobi…</p>
      </div>
    );
  }

  // Admin accounts get one extra nav entry appended; everyone else sees
  // exactly the base NAV array.
  const links =
    user.role === "admin" ? [...NAV, { to: "/admin", label: "Admin", icon: Shield }] : NAV;

  // Keyword-router search (see SEARCH_HINTS above) — first matching entry
  // wins, falls back to the dashboard if nothing matches.
  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;
    const hit = SEARCH_HINTS.find((h) => h.keywords.some((k) => q.includes(k)));
    navigate({ to: hit?.to ?? "/" });
    setQuery("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Utility strip */}
      <div className="bg-gold text-accent-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 text-[11px] font-medium tracking-wide">
          <span className="opacity-90">Nelson Mandela Drive Campus, Mthatha</span>
          <span className="hidden items-center gap-4 opacity-90 sm:flex">
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3 w-3" /> 047 502 2100
            </span>
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" /> support@mywsu.ac.za
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              {now
                ? now.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })
                : "--:--"}
            </span>
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-md">
        <div
          className={`mx-auto flex max-w-6xl items-center gap-4 px-4 transition-all duration-300 ${
            scrolled ? "py-2" : "py-3.5"
          }`}
        >
          <Link to="/" className="flex items-center gap-2.5">
            <span
              className={`grid place-items-center rounded-lg bg-brand text-primary-foreground shadow-soft transition-all duration-300 ${
                scrolled ? "h-8 w-8" : "h-10 w-10"
              }`}
            >
              <GraduationCap className={scrolled ? "h-4 w-4" : "h-5 w-5"} />
            </span>
            <span className="leading-none">
              <span className="block font-display text-lg font-bold tracking-tight text-primary">
                CampusMobi
              </span>
              <span
                className={`block overflow-hidden text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition-all duration-300 ${
                  scrolled ? "max-h-0 opacity-0" : "max-h-4 opacity-100"
                }`}
              >
                WSU Student Services
              </span>
            </span>
          </Link>

          <form onSubmit={onSearch} className="ml-auto hidden max-w-xs flex-1 md:block">
            <label className="flex items-center gap-2 rounded-md border border-input bg-secondary/60 px-3 py-2 transition-colors focus-within:border-primary focus-within:bg-card">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search student card, timetable, fees, venues…"
                aria-label="Search CampusMobi"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
          </form>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Link
              to="/pay"
              className="hidden items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-semibold transition-colors hover:border-primary/40 hover:bg-primary-soft sm:inline-flex"
            >
              <CreditCard className="h-4 w-4" />
              Pay fees
            </Link>
            <Link
              to="/notifications"
              aria-label="Notices"
              className="relative hidden rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:block"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
            </Link>
            <div className="hidden items-center gap-2 lg:flex">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-primary-foreground">
                {user.avatarInitials}
              </span>
              <button
                onClick={() => {
                  logout().then(() => navigate({ to: "/auth" }));
                }}
                aria-label="Sign out"
                className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              className="rounded-md border border-border p-2 lg:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* WSU-style nav bar */}
        <nav className="hidden border-t border-border bg-secondary/70 lg:block">
          <div className="mx-auto flex max-w-6xl items-center gap-1 px-4">
            {/* Desktop top nav — underline slides in under whichever link is active */}
            {links.map((item) => {
              // Dashboard ("/") needs an exact match (every other route also
              // starts with "/"), everything else just needs a prefix match so
              // e.g. "/pay" stays highlighted on any future "/pay/..." sub-route.
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative inline-flex items-center gap-1.5 px-3.5 py-3 text-sm font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  <span
                    className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary transition-transform duration-300 ${
                      active ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </Link>
              );
            })}
            <span className="ml-auto py-3 text-xs text-muted-foreground">
              {now
                ? now.toLocaleDateString("en-ZA", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                  })
                : ""}
            </span>
          </div>
        </nav>

        {open && (
          <div className="animate-fade border-t border-border bg-card px-4 py-3 lg:hidden">
            <div className="grid gap-1">
              {links.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="inline-flex items-center gap-2 rounded-md px-3 py-3 text-sm font-medium text-foreground hover:bg-secondary"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    {item.label}
                    <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  logout().then(() => navigate({ to: "/auth" }));
                }}
                className="mt-1 inline-flex items-center gap-2 rounded-md px-3 py-3 text-left text-sm font-medium text-destructive hover:bg-secondary"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:py-8 lg:pb-8">
        {children}
      </main>

      {/* Mobile tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
          {/* Mobile bottom tab bar — same active-link logic as the desktop nav above */}
          {links.slice(0, 5).map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "scale-110" : ""} transition-transform`} />
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
        </div>
      </nav>

      <footer className="mt-10 border-t-4 border-accent bg-primary-deep text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-lg font-bold">CampusMobi</p>
            <p className="mt-2 text-sm opacity-75">
              The official student services companion for Walter Sisulu University — student card,
              timetable and fee payments in one place.
            </p>
          </div>
          <FooterCol
            title="Services"
            items={["Student card", "Timetable", "Fee payments", "2FA & password reset"]}
          />
          <FooterCol
            title="Support"
            items={["Student help desk", "IT services", "Financial aid", "Report a fault"]}
          />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider">Contact</p>
            <ul className="mt-3 space-y-2 text-sm opacity-75">
              <li>Nelson Mandela Drive, Mthatha</li>
              <li>047 502 2100</li>
              <li>support@mywsu.ac.za</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/15">
          <div className="mx-auto max-w-6xl px-4 py-4 text-xs opacity-70">
            © {new Date().getFullYear()} Walter Sisulu University · CampusMobi. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider">{title}</p>
      <ul className="mt-3 space-y-2 text-sm opacity-75">
        {items.map((i) => (
          <li key={i} className="transition-opacity hover:opacity-100">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PageHeader({
  title,
  blurb,
  eyebrow,
  action,
}: {
  title: string;
  blurb: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <header className="animate-rise mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
      <div>
        {eyebrow && (
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <span className="h-px w-6 bg-accent" />
            {eyebrow}
          </span>
        )}
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{blurb}</p>
      </div>
      {action}
    </header>
  );
}

export function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-border pb-2">
      <h2 className="font-display text-xl font-semibold tracking-tight">
        <span className="mr-2 inline-block h-3 w-1 translate-y-0.5 rounded-full bg-accent" />
        {title}
      </h2>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}
