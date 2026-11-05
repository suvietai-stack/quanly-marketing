// Browser-only regression fixture. Not imported by application routes.
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { K3DeleteMenuItem, K3DeleteProvider } from '../src/components/biz/Biz3KDelete';
import { Button } from '../src/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../src/components/ui/dropdown-menu';
import '../src/styles.css';

const calls: { name: string; args: unknown }[] = [];
let fail = false;
let release: (() => void) | undefined;
let deleted = false;
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
Object.assign(window, { k3Test: { calls, fail: () => { fail = true; }, release: () => release?.(), refetch: () => client.invalidateQueries(), deleted: () => deleted } });
Object.assign(supabase, { rpc: async (name: string, args: unknown) => {
  if (name === 'k3_deletable') return { data: { ok: true }, error: null };
  calls.push({ name, args });
  await new Promise<void>(resolve => { release = resolve; });
  if (fail) { fail = false; return { data: null, error: { message: 'Bạn không có quyền xóa công việc.' } }; }
  deleted = true;
  return { data: { ok: true }, error: null };
} });
function Fixture() {
 const [visible, setVisible] = useState(true);
 return <div className="p-6"><h1>Kiểm thử Xóa 3K</h1>{visible && <DropdownMenu><DropdownMenuTrigger asChild><Button>Menu công việc</Button></DropdownMenuTrigger><DropdownMenuContent><K3DeleteMenuItem kind="goal" id="goal-123" name="Công việc kiểm thử" onDeleted={() => setVisible(false)} /></DropdownMenuContent></DropdownMenu>}{!visible && <p>Đã xóa khỏi danh sách</p>}</div>;
}
const root = document.getElementById('root');
if (root) createRoot(root).render(<QueryClientProvider client={client}><K3DeleteProvider><Fixture /></K3DeleteProvider></QueryClientProvider>);