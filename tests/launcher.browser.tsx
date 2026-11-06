// Isolated real launcher UI, no application sessions or business writes.
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createRootRoute, createRoute, createRouter, RouterProvider, useRouterState } from '@tanstack/react-router';
import { MobileLauncher } from '../src/components/MobileLauncher';
import { visibleNavigation } from '../src/lib/navigation';
import { AppNavigation } from '../src/components/AppNavigation';
import { Button } from '../src/components/ui/button';
import '../src/styles.css';
function Fixture() {
  const { pathname, search } = useRouterState({ select: s => s.location });
  const [revoked, setRevoked] = useState(false);
  const permissions = ['k3.use','leave.create','order.view','ot.view_own','finance.incoming.view','brand.view'];
  const groups = visibleNavigation({ can: p => permissions.includes(p) && !(revoked && p === 'k3.use'), isSuperAdmin: false, isKpiAdmin: false, isKpiManager: false, kpiEnabled: true, hasAssignedApprovals: false, canApprove: false, pendingCount: 0 });
  return <div className="flex min-h-screen"><aside className="hidden md:block w-72 bg-sidebar text-sidebar-foreground"><AppNavigation groups={groups} path={pathname} userId="launcher-fixture" /></aside><main className="w-full min-w-0 p-4"><Button onClick={() => setRevoked(v => !v)}>Thu hồi 3K</Button><div className="md:hidden max-w-xl mx-auto">{pathname === '/' ? <MobileLauncher groups={groups} userId="launcher-fixture" area={(search as { area?: string }).area} /> : <><h1>Module hiện có</h1><p>{pathname}</p><Button asChild><a href="/">Trang chủ</a></Button></>}</div><p className="hidden md:block">Desktop giữ Sidebar</p></main></div>;
}
const rootRoute = createRootRoute({ component: Fixture });
const home = createRoute({ getParentRoute: () => rootRoute, path: '/', validateSearch: (s: Record<string,unknown>) => ({ area: typeof s.area === 'string' ? s.area : undefined, view: s.view === 'dashboard' ? 'dashboard' : undefined }) });
const other = createRoute({ getParentRoute: () => rootRoute, path: '$' });
const router = createRouter({ routeTree: rootRoute.addChildren([home,other]) });
const root = document.getElementById('root');
if (root) createRoot(root).render(<RouterProvider router={router} />);