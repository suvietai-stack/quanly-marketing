// Isolated signal UI; browser runner intercepts every backend request, no live writes.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createRootRoute,createRoute,createRouter,RouterProvider } from '@tanstack/react-router';
import { QueryClient,QueryClientProvider } from '@tanstack/react-query';
import { SignalsPage } from '../src/components/signals/SignalsUi';
import { SignalsReport } from '../src/components/signals/SignalsReport';
import { useAuth } from '../src/lib/auth';
import { Toaster } from '../src/components/ui/sonner';
import '../src/styles.css';
const uid='00000000-0000-0000-0000-000000000001';
useAuth.setState({currentUserId:uid,users:[{id:uid,fullName:'Sale cách ly',username:'fixture',roleId:'fixture',status:'Đang hoạt động'}] as never,roles:[{id:'fixture',name:'Fixture',permissions:window.location.pathname.includes('sale-priority-fixture') ? ['signal.sale','signal.report'] : ['signal.sale','signal.report','signal.create','signal.catalog','signal.manage','signal.view_all','signal.assign']}] as never});
const qc=new QueryClient({defaultOptions:{queries:{retry:false}}});
function Fixture(){const report=window.location.pathname.includes('report');return <QueryClientProvider client={qc}><header className="fixed top-0 z-30 w-full border-b bg-card p-4 md:hidden"><h1>{report?'Báo cáo tín hiệu':'Tín hiệu cơ hội'}</h1></header><main className="base-app-content px-4 md:p-6">{report?<SignalsReport/>:<SignalsPage/>}</main><nav className="fixed bottom-0 z-30 w-full border-t bg-card p-4 md:hidden"><a href="/">Trang chủ</a></nav><Toaster/></QueryClientProvider>;}
const root=createRootRoute({component:Fixture});const leaf=createRoute({getParentRoute:()=>root,path:'$'});const router=createRouter({routeTree:root.addChildren([leaf])});
const container=document.getElementById('root');if(container)createRoot(container).render(<RouterProvider router={router}/>);