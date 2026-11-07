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
  const [accessPending, setAccessPending] = useState(new URLSearchParams(window.location.search).has('pending'));
  const [approvalsPending, setApprovalsPending] = useState(false);
  const permissions = ['biz.crm_use','k3.use','leave.create','order.view','ot.view_own','finance.incoming.view','brand.view'];
  const groups = visibleNavigation({ can: p => permissions.includes(p) && !(revoked && p === 'k3.use') && !(accessPending && (p.startsWith('biz.') || p.startsWith('k3.'))), isSuperAdmin: false, isKpiAdmin: false, isKpiManager: false, kpiEnabled: true, hasAssignedApprovals: !accessPending && !approvalsPending, canApprove: false, pendingCount: 0 });
  React.useEffect(() => {
    const access = (event: Event) => setAccessPending((event as CustomEvent<boolean>).detail);
    const approvals = (event: Event) => setApprovalsPending((event as CustomEvent<boolean>).detail);
    window.addEventListener('fixture-access-pending', access);
    window.addEventListener('fixture-approvals-pending', approvals);
    return () => { window.removeEventListener('fixture-access-pending', access); window.removeEventListener('fixture-approvals-pending', approvals); };
  }, []);
  return <div className="flex min-h-screen"><aside className="hidden md:block w-72 bg-sidebar text-sidebar-foreground"><AppNavigation groups={groups} path={pathname} userId="launcher-fixture" /></aside><main className="w-full min-w-0 p-4"><Button onClick={() => setRevoked(v => !v)}>Thu hồi 3K</Button><div className="md:hidden max-w-xl mx-auto">{pathname === '/' ? <MobileLauncher groups={groups} userId="launcher-fixture" accessReady={!accessPending && !approvalsPending} area={(search as { area?: string }).area} /> : <><h1>Module hiện có</h1><p>{pathname}</p><Button asChild><a href="/">Trang chủ</a></Button></>}</div><p className="hidden md:block">Desktop giữ Sidebar</p></main></div>;
}
const rootRoute = createRootRoute({ component: Fixture });
const home = createRoute({ getParentRoute: () => rootRoute, path: '/', validateSearch: (s: Record<string,unknown>) => ({ pending: s.pending === '1' ? '1' : undefined, area: typeof s.area === 'string' ? s.area : undefined, view: s.view === 'dashboard' ? 'dashboard' : undefined }) });
const other = createRoute({ getParentRoute: () => rootRoute, path: '$' });
const router = createRouter({ routeTree: rootRoute.addChildren([home,other]) });
const root = document.getElementById('root');
if (root) createRoot(root).render(<RouterProvider router={router} />);