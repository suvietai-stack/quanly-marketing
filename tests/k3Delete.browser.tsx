// Browser-only regression fixture. Not imported by application routes.
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { K3DeleteMenuItem, K3DeleteProvider } from '../src/components/biz/Biz3KDelete';
import { Button } from '../src/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../src/components/ui/dropdown-menu';
import '../src/styles.css';

const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
Object.assign(window, { k3Test: { refetch: () => client.invalidateQueries() } });
function Fixture() {
 const [visible, setVisible] = useState(true);
 return <div className="p-6"><h1>Kiểm thử Xóa 3K</h1>{visible && <DropdownMenu><DropdownMenuTrigger asChild><Button>Menu công việc</Button></DropdownMenuTrigger><DropdownMenuContent><K3DeleteMenuItem kind="goal" id="goal-123" name="Công việc kiểm thử" onDeleted={() => setVisible(false)} /></DropdownMenuContent></DropdownMenu>}{!visible && <p>Đã xóa khỏi danh sách</p>}</div>;
}
const root = document.getElementById('root');
if (root) createRoot(root).render(<QueryClientProvider client={client}><K3DeleteProvider><Fixture /></K3DeleteProvider></QueryClientProvider>);