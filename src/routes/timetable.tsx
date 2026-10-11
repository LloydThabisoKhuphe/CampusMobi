// Weekly timetable (route "/timetable") — calls loadTimetable() on mount,
// which hits getMyTimetable in campus.functions.ts: the real per-student
// schedule, joined from this student's actual module enrolments and the
// WSU Faculty of Natural Sciences catalog's class slots.
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Info, Loader2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useCampus, type ClassSession } from "@/lib/frontend/campus-store";

export const Route = createFileRoute("/timetable")({
  head: () => ({
    meta: [
      { title: "Timetable — CampusMobi | Walter Sisulu University" },
      { name: "description", content: "Your weekly class timetable." },
    ],
  }),
  component: () => (
    <AppShell>
      <TimetableContent />
    </AppShell>
  ),
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
const START_HOUR = 7; // grid starts at 07:00
const END_HOUR = 18; // grid ends at 18:00
const PX_PER_MIN = 1.1; // vertical scale — 1 minute of class time = 1.1px tall

// Tailwind classes per session type, applied both to the grid blocks and
// the legend swatches below.
const KIND_STYLE: Record<ClassSession["kind"], string> = {
  Lecture: "bg-primary/90 border-primary",
  Practical: "bg-success/90 border-success",
  Tutorial: "bg-accent/90 border-accent",
};

// "09:30" -> 570 (minutes since midnight) — the grid positions everything
// in minutes-since-midnight, converted to pixels via PX_PER_MIN below.
function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

function TimetableContent() {
  const { myTimetable, timetableLoading, loadTimetable } = useCampus();
  const [selected, setSelected] = useState<ClassSession | null>(null); // the session shown in the detail modal, if any
  const totalMins = (END_HOUR - START_HOUR) * 60;
  // The hour labels down the left side: [7, 8, 9, ..., 18]
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  // Fetch the timetable once, on mount — loadTimetable() itself is a
  // no-op if there's no session token yet (see campus-store.tsx).
  useEffect(() => {
    loadTimetable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Module timetable"
        title="Timetable"
        blurb="Your weekly class schedule, styled after the WSU CELCAT timetabling system."
      />

      <div className="mb-4 flex items-start gap-2 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p>
          This view mirrors the layout of WSU's CELCAT timetable. Live CELCAT data isn't pulled in
          here — that system requires an institutional sign-in — so this shows the modules you're
          actually enrolled in from CampusMobi's own database, for your qualification and year of
          study.
        </p>
      </div>

      {timetableLoading && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your timetable…
        </div>
      )}
      {!timetableLoading && myTimetable.length === 0 && (
        <div className="mb-4 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          No scheduled classes found for your current modules.
        </div>
      )}

      <div className="surface overflow-x-auto p-0">
        <div className="min-w-[720px]">
          {/* Day header */}
          <div className="grid grid-cols-[64px_repeat(5,1fr)] border-b border-border bg-secondary/60">
            <div />
            {DAYS.map((d) => (
              <div
                key={d}
                className="border-l border-border px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Grid body */}
          <div className="relative grid grid-cols-[64px_repeat(5,1fr)]">
            {/* Hour labels + gridlines */}
            <div>
              {hours.map((h) => (
                <div
                  key={h}
                  className="flex h-[66px] items-start justify-end pr-2 pt-0 text-[11px] text-muted-foreground"
                >
                  <span className="-translate-y-2">{String(h).padStart(2, "0")}:00</span>
                </div>
              ))}
            </div>

            {DAYS.map((day) => (
              <div key={day} className="relative border-l border-border">
                {/* Background hour gridlines for this day's column */}
                {hours.map((h) => (
                  <div key={h} className="h-[66px] border-b border-border/60" />
                ))}
                {/* This day's classes, absolutely positioned on top of the gridlines by time */}
                {myTimetable.filter((c) => c.day === day).map((c) => {
                  // Vertical position/height in pixels, derived straight from
                  // the class's start/end time — e.g. a class starting 30min
                  // after START_HOUR sits 30 * PX_PER_MIN px from the top.
                  const top = (toMinutes(c.start) - START_HOUR * 60) * PX_PER_MIN;
                  const height = (toMinutes(c.end) - toMinutes(c.start)) * PX_PER_MIN;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelected(c)}
                      style={{ top, height }}
                      className={`absolute inset-x-1 overflow-hidden rounded-md border-l-4 px-2 py-1 text-left text-[11px] leading-tight text-white shadow-sm transition-transform hover:z-10 hover:scale-[1.02] ${KIND_STYLE[c.kind]}`}
                    >
                      <p className="truncate font-semibold">{c.code}</p>
                      <p className="truncate opacity-90">{c.venue}</p>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend — one swatch per session kind, colour pulled from KIND_STYLE */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        {(Object.keys(KIND_STYLE) as ClassSession["kind"][]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-sm ${KIND_STYLE[k].split(" ")[0]}`} />
            {k}
          </span>
        ))}
      </div>

      {/* Detail modal for a tapped class block — only rendered when `selected` is set */}
      {selected && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => setSelected(null)} // clicking the backdrop closes it
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-lift"
            onClick={(e) => e.stopPropagation()} // stop the backdrop's onClick from firing when clicking inside the card
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              {selected.kind}
            </p>
            <h3 className="mt-1 font-display text-xl font-bold">{selected.module}</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Code" value={selected.code} />
              <Row label="Day" value={selected.day} />
              <Row label="Time" value={`${selected.start} – ${selected.end}`} />
              <Row label="Venue" value={selected.venue} />
              <Row label="Lecturer" value={selected.lecturer} />
            </dl>
            <button
              onClick={() => setSelected(null)}
              className="mt-5 w-full rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold hover:bg-secondary/80"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// One label/value line in the detail modal's definition list.
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
