// Isolated real mobile chrome and launcher; no account or business data writes.
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createRootRoute, createRoute, createRouter, RouterProvider, useRouterState, Link } from '@tanstack/react-router';
import { MobileAppChrome } from '../src/components/MobileAppChrome';
import { MobileLauncher } from '../src/components/MobileLauncher';
import { navigationGroups } from '../src/lib/navigation';
import { Button } from '../src/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../src/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../src/components/ui/popover';
import '../src/styles.css';
function Fixture() {
  const { pathname, search } = useRouterState({ select:s => s.location });
  const [menu, setMenu] = useState(false);
  return <div className="base-app-shell min-h-screen"><MobileAppChrome groups={navigationGroups} userId="shell-fixture" name="Người kiểm thử" brandName="Base Sứ Việt" logo={<span>SV</span>} onMenu={() => setMenu(v=>!v)} notifications={<Popover><PopoverTrigger asChild><Button aria-label="Thông báo">🔔</Button></PopoverTrigger><PopoverContent><Link to="/order-tracking/order-notification">Thông báo đơn hàng</Link></PopoverContent></Popover>} /><main className="base-app-content px-4 py-6">{menu && <p>Menu hiện hữu</p>}{pathname === '/' ? <MobileLauncher groups={navigationGroups} userId="shell-fixture" area={(search as {area?:string}).area} /> : <><h1>{pathname}</h1><Link to="/biz/3k/detail">Chi tiết công việc</Link><div className="h-[1800px]">Nội dung cuộn</div><label>Ghi chú<input className="block w-full border p-3" aria-label="Ghi chú" /></label><Button>Lưu nội dung</Button><Dialog><DialogTrigger asChild><Button>Xác nhận xóa</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Xác nhận công việc</DialogTitle></DialogHeader><Button>Đồng ý</Button></DialogContent></Dialog><div className="fixed bottom-0 inset-x-0 border-t bg-card p-3 z-20"><Button>Nút cố định hiện hữu</Button></div></>}</main></div>;
}
const rootRoute = createRootRoute({component:Fixture});
const home = createRoute({getParentRoute:()=>rootRoute,path:'/',validateSearch:(s:Record<string,unknown>)=>({area:typeof s.area==='string'?s.area:undefined,view:s.view==='dashboard'?'dashboard':undefined})});
const other = createRoute({getParentRoute:()=>rootRoute,path:'$'});
const router=createRouter({routeTree:rootRoute.addChildren([home,other]),scrollRestoration:true});
const root=document.getElementById('root');
if(root)createRoot(root).render(<RouterProvider router={router}/>);