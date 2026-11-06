// Browser-only fixture; requests are intercepted, no live writes.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createRootRoute,createRoute,createRouter,RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LeavePage } from '../src/components/leave/LeaveUi';
import { useAuth } from '../src/lib/auth';
import { Toaster } from '../src/components/ui/sonner';
import '../src/styles.css';
const permissions=['leave.view_own','leave.create','leave.view_assigned','leave.approve','leave.view_all','leave.report','leave.edit_own','leave.recall'];
useAuth.setState({currentUserId:'employee',users:[{id:'employee',fullName:'Nhân viên kiểm tra',username:'test',roleId:'test-role',status:'Đang hoạt động'},{id:'manager',fullName:'Người phê duyệt',username:'manager',roleId:'test-role',status:'Đang hoạt động'}] as never,roles:[{id:'test-role',name:'Test',permissions}] as never});
const qc=new QueryClient({defaultOptions:{queries:{retry:false}}});
function Fixture(){return <QueryClientProvider client={qc}><div className="base-app-shell"><header className="fixed top-0 z-30 w-full bg-card border-b p-4 md:hidden"><h1 className="text-base">Nghỉ phép &amp; Đi sớm muộn</h1></header><main className="base-app-content px-4 md:p-6"><LeavePage/></main><nav className="fixed bottom-0 z-30 w-full bg-card border-t p-4 md:hidden" aria-label="Điều hướng mobile"><a href="/">Trang chủ</a></nav></div><Toaster/></QueryClientProvider>}
const rootRoute=createRootRoute({component:Fixture});const leaf=createRoute({getParentRoute:()=>rootRoute,path:'$'});const router=createRouter({routeTree:rootRoute.addChildren([leaf])});const root=document.getElementById('root');if(root)createRoot(root).render(<RouterProvider router={router}/>);
