import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";

const PUBLIC_PATHS = ["/login", "/register", "/pending"];

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

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
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

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Base Marketing — Quản lý công việc Digital Marketing" },
      { name: "description", content: "App quản lý quy trình thực thi của phòng Digital Marketing Sứ Việt: thương hiệu, kênh, sản xuất nội dung, video, thiết kế." },
      { name: "author", content: "Base Marketing" },
      { property: "og:title", content: "Base Marketing — Quản lý công việc Digital Marketing" },
      { property: "og:description", content: "App quản lý quy trình thực thi của phòng Digital Marketing Sứ Việt: thương hiệu, kênh, sản xuất nội dung, video, thiết kế." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Base Marketing — Quản lý công việc Digital Marketing" },
      { name: "twitter:description", content: "App quản lý quy trình thực thi của phòng Digital Marketing Sứ Việt: thương hiệu, kênh, sản xuất nội dung, video, thiết kế." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ec880516-e8be-4672-a572-913d855fcebf/id-preview-2207d860--675090b6-a1a5-4398-8f91-8662e5eccf3a.lovable.app-1778767853386.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ec880516-e8be-4672-a572-913d855fcebf/id-preview-2207d860--675090b6-a1a5-4398-8f91-8662e5eccf3a.lovable.app-1778767853386.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const isPublic = PUBLIC_PATHS.includes(path);

  return (
    <QueryClientProvider client={queryClient}>
      <SignalCacheGuard />
      <AuthGate>
        {isPublic ? <Outlet /> : <AppShell><Outlet /></AppShell>}
      </AuthGate>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
