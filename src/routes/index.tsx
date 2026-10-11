// The dashboard / home page (route "/") — student card preview, quick
// links to timetable/payments/notifications, and real WSU campus stats
// from campus-data.ts. Reads everything it needs from useCampus(); doesn't
// call any server function directly itself.
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  IdCard,
  CalendarDays,
  CreditCard,
  Bell,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  QrCode,
  MapPin,
  Phone,
  GraduationCap,
} from "lucide-react";
import { AppShell, PageHeader, SectionTitle } from "@/components/AppShell";
import { useCampus } from "@/lib/frontend/campus-store";
import { CAMPUS_STATS, FACULTIES, CAMPUSES, EXTERNAL_SERVICES } from "@/lib/shared/campus-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CampusMobi — Walter Sisulu University" },
      {
        name: "description",
        content:
          "Your WSU student hub: virtual student card, class timetable and fee payments.",
      },
      { property: "og:title", content: "CampusMobi — Your WSU campus in one app" },
      {
        property: "og:description",
        content: "Virtual student card, timetable and fee payments for WSU students.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  );
}

function DashboardContent() {
  const { user } = useCampus();
  if (!user) return null; // guards against a render before the user has loaded

  return (
    <div className="space-y-14">
      {/* Hero, styled after wsu.ac.za's welcome banner */}
      <section className="relative overflow-hidden rounded-3xl bg-brand px-6 py-12 text-primary-foreground shadow-lift sm:px-10 sm:py-16">
        <div className="absolute -right-24 -top-16 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-success/15 blur-3xl" />
        <div className="relative max-w-2xl">
          {/* Isixhosa greeting + first name only — split(" ")[0] drops the surname */}
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            Molo, {user.name.split(" ")[0]}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
            Welcome to Walter Sisulu.
          </h1>
          <p className="mt-4 text-base leading-relaxed opacity-85">
            {user.course} · Year {user.yearOfStudy} · {user.faculty}
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed opacity-75">
            CampusMobi brings your student card, timetable and fee payments into one
            place — no queues, no separate logins.
          </p>
          <Link
            to="/pay"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-lift transition-transform hover:-translate-y-0.5"
          >
            Pay a fee <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Quick actions — 4 cards to the app's other pages, defined inline as
          an array and mapped over rather than 4 hand-written <Link>s, so
          adding a 5th tile later is a one-line change. */}
      <section>
        <SectionTitle title="Quick actions" hint="Everything you use daily" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              to: "/student-card",
              title: "Student card",
              blurb: "Your virtual WSU ID",
              icon: IdCard,
            },
            {
              to: "/timetable",
              title: "Timetable",
              blurb: "This week's classes",
              icon: CalendarDays,
            },
            { to: "/pay", title: "Pay fees", blurb: "Admin fees via Paystack", icon: CreditCard },
            { to: "/notifications", title: "Notices", blurb: "Campus announcements", icon: Bell },
          ].map((item, i) => {
            const Icon = item.icon; // capitalised so JSX treats it as a component, not the literal string "icon"
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`animate-rise stagger-${i + 1} group surface p-5 transition-all hover:-translate-y-1 hover:shadow-lift`}
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.blurb}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Student card teaser — a banner linking to the full /student-card page */}
      <Link
        to="/student-card"
        className="animate-rise group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-brand p-6 text-primary-foreground shadow-lift transition-transform hover:-translate-y-1 sm:flex-row sm:items-center sm:p-8"
      >
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-accent/25 blur-2xl" />
        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.28em] opacity-75">
            Walter Sisulu University
          </p>
          <p className="mt-1 font-display text-2xl font-bold">{user.name}</p>
          <p className="text-sm opacity-80">
            {user.course} · Student no. {user.studentId}
          </p>
          <div className="mt-3 inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium opacity-80">Two-factor verified account</span>
          </div>
        </div>
        <QrCode className="relative mt-6 h-16 w-16 opacity-90 sm:mt-0" />
      </Link>

      {/* About WSU — real public facts from campus-data.ts, not fabricated content */}
      <section className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <SectionTitle title="A technology infused African university" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Walter Sisulu University plays a central role in the Eastern Cape's rural development,
            with roughly 30 000 students and close to 1 800 staff working across four campuses in
            Mthatha, Butterworth, Buffalo City (East London) and Komani.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CAMPUS_STATS.map((s) => (
              <div key={s.label} className="surface p-4 text-center">
                <p className="font-display text-2xl font-bold text-primary">{s.value}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle title="Faculties" />
          <div className="surface divide-y divide-border">
            {FACULTIES.map((f) => (
              <div key={f} className="flex items-center gap-3 p-3.5">
                <GraduationCap className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campuses — one card per entry in CAMPUSES, phone number shown only if present */}
      <section>
        <SectionTitle title="Our campuses" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAMPUSES.map((c) => (
            <div key={c.name} className="surface p-5">
              <MapPin className="h-4 w-4 text-primary" />
              <h3 className="mt-3 font-display text-base font-semibold">{c.name}</h3>
              <p className="text-sm text-muted-foreground">{c.town}</p>
              {c.phone && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" /> {c.phone}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* WSU systems that need your real institutional login — link out (new
          tab), not embedded, since this app can't verify real WSU credentials */}
      <section>
        <SectionTitle title="More WSU services" hint="Opens the official WSU system in a new tab" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EXTERNAL_SERVICES.map((svc) => (
            <a
              key={svc.name}
              href={svc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group surface flex flex-col justify-between p-5 transition-all hover:-translate-y-1 hover:shadow-lift"
            >
              <div>
                <h3 className="font-display text-base font-semibold">{svc.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{svc.description}</p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                Open <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
