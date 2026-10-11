// Digital student card (route "/student-card") — read-only display of the
// signed-in student's own profile fields (name, student number, faculty,
// etc.), all sourced from `user` in useCampus(); no server calls of its own.
import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useCampus } from "@/lib/frontend/campus-store";

// TanStack Router reads this file's exported `Route` to build the route
// tree (src/routeTree.gen.ts is auto-generated from files like this one).
export const Route = createFileRoute("/student-card")({
  // Per-page <head> overrides — merged with __root.tsx's defaults, so only
  // the title/description actually change here.
  head: () => ({
    meta: [
      { title: "Student Card — CampusMobi | Walter Sisulu University" },
      { name: "description", content: "Your virtual WSU student card." },
    ],
  }),
  // Every route wraps its page content in <AppShell> for the shared nav/header.
  component: () => (
    <AppShell>
      <StudentCardContent />
    </AppShell>
  ),
});

// Deterministic bar pattern for the barcode visual — generated from the
// student number so the same student always gets the same-looking barcode
// every time they open this page. It is NOT a real, scannable Code128/39
// barcode — purely decorative, built to look plausible from a distance.
function barWidths(seed: string) {
  let h = 0;
  // Simple string hash: fold each character's char code into a running
  // total (h * 31 + charCode is a classic "polynomial rolling hash").
  // `>>> 0` forces the result back to an unsigned 32-bit int after the
  // multiplication, since JS numbers would otherwise drift into floats.
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const widths: number[] = [];
  // A basic linear congruential generator (LCG) — a classic "pseudo-random
  // but 100% reproducible from the same seed" number generator. Seeded
  // with the hash above, so `seed` fully determines every bar's width.
  for (let i = 0; i < 50; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    widths.push(1 + (h % 3)); // each bar is 1, 2, or 3px wide
  }
  return widths;
}

function StudentCardContent() {
  const { user } = useCampus();
  // Shouldn't normally happen (this route is only reachable once signed
  // in), but guards against a render before `user` has loaded.
  if (!user) return null;

  // Falls back to the internal account id if studentId is somehow empty,
  // so the barcode still renders something rather than crashing on an
  // empty seed string.
  const widths = barWidths(user.studentId || user.id);
  const year = String(new Date().getFullYear());

  return (
    <div>
      <PageHeader
        eyebrow="Identification"
        title="Student card"
        blurb="Your WSU virtual student card — laid out to match the physical card issued at registration."
      />

      <div className="mx-auto max-w-md">
        <div className="animate-rise relative overflow-hidden rounded-xl border border-border bg-white shadow-lift">
          {/* Top row: photo + year stack on the left, black WSU banner on the right */}
          <div className="flex items-stretch gap-3 p-4 pb-2">
            <div className="flex shrink-0 items-stretch gap-2">
              <div className="grid h-20 w-16 place-items-center rounded-sm bg-neutral-200 text-[9px] text-neutral-500">
                Photo
              </div>
              {/* Year rendered as stacked individual digits (vertical text), matching the physical card's design */}
              <div className="flex flex-col justify-center font-display text-2xl font-black leading-[0.85] text-neutral-800">
                {year.split("").map((digit, i) => (
                  <span key={i}>{digit}</span>
                ))}
              </div>
            </div>

            <div className="ml-auto flex w-[58%] flex-col justify-center rounded-md bg-neutral-900 px-3 py-2.5 text-white">
              <div className="flex items-center gap-1.5">
                {/* 4 small dots standing in for the university's logo mark */}
                <div className="grid grid-cols-2 gap-[2px]">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <span key={i} className="h-[3px] w-[3px] rounded-full bg-white" />
                  ))}
                </div>
                <span className="font-display text-lg font-extrabold tracking-tight">WSU</span>
              </div>
              <p className="mt-0.5 text-[9px] leading-tight text-neutral-300">
                Walter Sisulu University
              </p>
              <p className="text-[8px] italic leading-tight text-neutral-400">
                In pursuit of excellence
              </p>
            </div>
          </div>

          {/* Name / degree / campus — all straight from the signed-in user's profile */}
          <div className="px-4 pb-2 pt-1">
            <p className="truncate text-[15px] font-bold uppercase tracking-tight text-neutral-900">
              {user.name}
            </p>
            <p className="truncate text-[13px] text-neutral-700">{user.course}</p>
            {/* Hardcoded — every seeded roster entry is Mthatha Campus in this dataset */}
            <p className="text-[13px] text-neutral-700">Mthatha Campus</p>
          </div>

          {/* Student number */}
          <div className="px-4 pb-3">
            <p className="font-mono text-[13px] font-semibold text-neutral-900">{user.studentId}</p>
          </div>

          {/* Barcode — bars rendered from the widths[] array computed above */}
          <div className="bg-neutral-100 px-4 py-3">
            <div className="flex h-9 items-end gap-[1px] rounded-sm bg-white px-2 py-1">
              {widths.map((w, i) => (
                <span key={i} className="h-full bg-black" style={{ width: `${w}px` }} />
              ))}
            </div>
            <p className="mt-1 text-center font-mono text-[11px] text-neutral-800">
              {user.studentId}
            </p>
          </div>

          {/* Footer strip — reminds anyone reading the UI that 2FA is a real part of this account's story */}
          <div className="flex items-center justify-center gap-2 border-t border-border bg-brand py-2 text-primary-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="text-[11px] font-medium">Two-factor verified account</span>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Present this card together with a photo ID for campus services that require verification.
        </p>
      </div>
    </div>
  );
}
