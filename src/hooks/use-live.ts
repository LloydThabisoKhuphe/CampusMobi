import { useEffect, useState } from "react";

// Ticking clock — re-renders the component using it every `intervalMs`.
// Client-only (returns null until the first effect runs) so server-side
// rendering never bakes a stale timestamp into the HTML, which would
// otherwise mismatch the client's first render and trigger a hydration
// warning. Used by AppShell.tsx for the live clock in the header.
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date()); // set immediately on mount — don't wait for the first interval tick
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id); // stop ticking when the component unmounts
  }, [intervalMs]);

  return now;
}
