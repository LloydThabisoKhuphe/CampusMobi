// The app "shell" — TanStack Router renders this around EVERY page.
// Anything that must exist on every route (the <html>/<head>, global CSS,
// the React Query provider, the auth context, the 404 and error screens)
// lives here. Individual pages (src/routes/*.tsx) render inside <Outlet />
// below and know nothing about this wrapper.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

// `?url` tells Vite "give me the built file's URL, don't inline it" — we
// then hand that URL to TanStack Router's <HeadContent /> as a <link>.
import appCss from "../styles.css?url";
// The React context that holds the signed-in user + every campus.functions.ts
// call the UI needs (login, timetable, payments, ...). Wrapping <Outlet />
// in it below is what makes useCampus() work in every page.
import { CampusProvider } from "../lib/frontend/campus-store";

// Shown by TanStack Router whenever a URL doesn't match any route file.
function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

// Shown whenever a route's loader/component throws — e.g. a server function
// call fails. TanStack Router catches the throw and renders this instead of
// a blank page. `reset()` lets the person retry without a full page reload.
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  // Full detail still goes to the browser/server console for debugging —
  // the on-screen message below stays generic on purpose (see the same
  // pattern in campus.functions.ts's login handler).
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              // router.invalidate() re-runs loaders; reset() clears the
              // error boundary so the retried render actually shows.
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

// createRootRouteWithContext<{ queryClient }>() types the context every
// route's loader receives — see src/router.tsx, where queryClient is
// actually constructed and handed in.
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // head() runs on the server and controls everything inside <head> —
  // page title, meta tags (SEO + social-share previews), and stylesheet
  // links. TanStack Router merges this with any per-route head() (see
  // src/routes/auth.tsx for an example that overrides the title).
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CampusMobi — WSU Student Services" },
      {
        name: "description",
        content:
          "CampusMobi puts your student card, timetable and fee payments in one app.",
      },
      { name: "author", content: "CampusMobi" },
      { property: "og:title", content: "CampusMobi" },
      {
        property: "og:description",
        content: "Student card, timetable and fee payments in one app.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      // Google Fonts: preconnect first (opens the connection early), then
      // the actual stylesheet — CampusMobi's 3 brand fonts (display/sans/mono).
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  // shellComponent renders the actual <html> document (server-side only,
  // once per request) — component below renders the React tree *inside*
  // <body>, on both server and client.
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Renders every <meta>/<link> from head() above. */}
        <HeadContent />
      </head>
      <body>
        {children}
        {/* Injects the client-side JS bundle — without this the page would
            render on the server but never become interactive. */}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  // Pulls the { queryClient } that createRootRouteWithContext typed above
  // out of the router's context (constructed once in src/router.tsx).
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* CampusProvider makes useCampus() available to every page — sign-in
          state, dashboard data, timetable, payments all flow through it. */}
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <CampusProvider>
        <Outlet />
      </CampusProvider>
    </QueryClientProvider>
  );
}
