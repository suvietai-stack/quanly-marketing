// Isolated navigation rendering; not loaded by application routes or backed by user data.
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createRootRoute, createRoute, createRouter, RouterProvider, useRouterState } from '@tanstack/react-router';
import { AppNavigation } from '../src/components/AppNavigation';
import { visibleNavigation } from '../src/lib/navigation';
import { Button } from '../src/components/ui/button';
import '../src/styles.css';

function Fixture() {
  const path = useRouterState({ select: s => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const groups = visibleNavigation({ can: () => true, isSuperAdmin: true, isKpiAdmin: true, isKpiManager: true, kpiEnabled: true, hasAssignedApprovals: true, canApprove: true, pendingCount: 2 });
  const sidebar = <aside className={`${collapsed ? 'w-16' : 'w-72'} h-screen flex flex-col bg-sidebar text-sidebar-foreground`}><AppNavigation groups={groups} path={path} userId="navigation-fixture" collapsed={collapsed} onNavigate={() => setOpen(false)} /><Button aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'} onClick={() => setCollapsed(v => !v)}>{collapsed ? 'Mở' : 'Thu gọn'}</Button></aside>;
  return <div className="flex"><div className="hidden md:block">{sidebar}</div><div className="md:hidden"><Button onClick={() => setOpen(v => !v)}>Mở menu</Button>{open && <div className="fixed inset-y-0 left-0 z-40">{sidebar}</div>}</div><main className="p-4 min-w-0"><h1>Kiểm thử điều hướng</h1><p>{path}</p></main></div>;
}
const rootRoute = createRootRoute({ component: Fixture });
const home = createRoute({ getParentRoute: () => rootRoute, path: '/' });
const other = createRoute({ getParentRoute: () => rootRoute, path: '$' });
const router = createRouter({ routeTree: rootRoute.addChildren([home, other]) });
const root = document.getElementById('root');
if (root) createRoot(root).render(<RouterProvider router={router} />);