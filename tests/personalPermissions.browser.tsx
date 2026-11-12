import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StaffPermissionEditor } from '../src/components/StaffPermissionEditor';
import { useAuth } from '../src/lib/auth';
import type { EffectivePermission } from '../src/lib/basePermissions/types';
import '../src/styles.css';
useAuth.setState({ currentUserId: 'fixture-admin', users: [{ id: 'fixture-admin', username: 'fixture', fullName: 'Kiểm thử', status: 'Đang hoạt động', createdAt: '2026-01-01', passwordHash: '', passwordSalt: '' }], roles: [], loaded: true, initialized: true });
// Fixture reload never performs app writes; all RPC responses are intercepted by Playwright.
useAuth.setState({ reload: async () => {} });
const effective = [{ key: 'leave.view_own', allowed: true, sources: [{ effect: 'ALLOW', source_kind: 'common', source_name: 'Quyền chung' }] }] as EffectivePermission[];
const root = document.getElementById('root');
if (root) createRoot(root).render(<QueryClientProvider client={new QueryClient()}><main className="mx-auto max-w-5xl p-4"><StaffPermissionEditor userId="fixture-staff" effective={effective}/></main></QueryClientProvider>);