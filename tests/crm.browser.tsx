// Browser-only fixture; all CRM requests intercepted, no live writes.
import React from 'react';
import {createRoot} from 'react-dom/client';
import {createRootRoute,createRoute,createRouter,RouterProvider} from '@tanstack/react-router';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {Crm} from '../src/components/crm/Crm';
import {useAuth} from '../src/lib/auth';
import {Toaster} from '../src/components/ui/sonner';
import '../src/styles.css';
const id='00000000-0000-0000-0000-000000000002';
useAuth.setState({currentUserId:id,users:[{id,fullName:'Sale kiểm tra cách ly',username:'test',roleId:'test',status:'Đang hoạt động'}] as never,roles:[{id:'test',name:'Test',permissions:[]}] as never,bizAccess:{user_id:id,permissions:['biz.crm_use','biz.crm_view_scope','biz.crm_settings','biz.crm_export'],appointments:[],exceptions:[],legacy_assignments:[],server_now:new Date().toISOString(),next_change:null,super_admin:false}});
const qc=new QueryClient({defaultOptions:{queries:{retry:false}}});
function Fixture(){return <QueryClientProvider client={qc}><header className="fixed top-0 z-30 w-full border-b bg-card p-4 md:hidden"><h1>CRM Khách Hàng</h1></header><main className="base-app-content px-4 md:p-6"><Crm/></main><nav className="fixed bottom-0 z-30 w-full border-t bg-card p-4 md:hidden" aria-label="Điều hướng mobile"><a href="/">Trang chủ</a></nav><Toaster/></QueryClientProvider>;}
const rootRoute=createRootRoute({component:Fixture});const leaf=createRoute({getParentRoute:()=>rootRoute,path:'$'});const router=createRouter({routeTree:rootRoute.addChildren([leaf])});const root=document.getElementById('root');if(root)createRoot(root).render(<RouterProvider router={router}/>);