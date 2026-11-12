import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Biz3KQuickCreate } from '../src/components/biz/Biz3KQuickCreate';
import '../src/styles.css';
const client=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}});
function Fixture(){const [open,setOpen]=useState(true);return open?<Biz3KQuickCreate variant="personal" defaultDate="2026-11-12" onClose={()=>setOpen(false)}/>:<p>Đã lưu công việc</p>;}
const root=document.getElementById('root');if(root)createRoot(root).render(<QueryClientProvider client={client}><Fixture/></QueryClientProvider>);