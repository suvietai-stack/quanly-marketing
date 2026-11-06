// Isolated UI regression: all reads/writes are intercepted by the browser test.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Biz3K } from '../src/components/biz/Biz3K';
import { useAuth } from '../src/lib/auth';
import { Toaster } from '../src/components/ui/sonner';
import '../src/styles.css';

useAuth.setState({ currentUserId: 'mobile-ui-test' });
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const root = document.getElementById('root');
if (root) createRoot(root).render(<QueryClientProvider client={client}><div className="base-app-shell"><header className="mobile-app-header fixed top-0 z-30 w-full border-b bg-card p-4 md:hidden" role="banner"><h1 className="text-base">Quản lý 3K</h1></header><main className="base-app-content px-4 md:p-6"><Biz3K /></main><nav aria-label="Điều hướng mobile" className="mobile-bottom-nav fixed bottom-0 z-30 w-full border-t bg-card p-4 md:hidden"><a href="/">Trang chủ</a></nav></div><Toaster /></QueryClientProvider>);