import React from 'react';
import {createRoot} from 'react-dom/client';
import {createRootRoute,createRoute,createRouter,RouterProvider} from '@tanstack/react-router';
import {DesignWork} from '../src/components/DesignWork';
import {useAuth} from '../src/lib/auth';
import {useStore} from '../src/lib/store';
import {supabase} from '../src/integrations/supabase/client';
import '../src/styles.css';
const permissions=['order.view','order.view_all','order.create','order.edit','order.assign','order.report_view','order.take'];
useAuth.setState({loaded:true,currentUserId:'fixture-user',users:[{id:'fixture-user',username:'fixture',fullName:'Quản lý',status:'Đang hoạt động',roleId:'fixture-role'}],roles:[{id:'fixture-role',name:'Fixture',permissions}] } as never);
const history=[{at:'2026-11-01T01:00:00Z',byName:'Quản lý',action:'Tạo',toStatus:'Chờ phân công' as const}];
useStore.setState({loaded:true,orders:[{id:'photo',title:'Chụp bộ quà tặng Sứ Việt',brandId:'brand',type:'Chụp ảnh',workflowKind:'photo',source:'Leader',status:'Chờ phân công',requester:'Quản lý',deadline:'2026-11-09',history},{id:'marketing',title:'Catalogue bộ sưu tập mùa lễ hội',brandId:'brand',type:'Catalogue / profile',workflowKind:'marketing_design',source:'Web',status:'Đang thực hiện',requester:'Quản lý',assignee:'Designer',deadline:'2026-11-06',history:[...history,{at:'2026-11-02T01:00:00Z',byName:'Designer',action:'Nhận',toStatus:'Đang thực hiện'}]},{id:'mockup',title:'Ma-két bộ ấm chén khách hàng',brandId:'brand',type:'Khác',workflowKind:'order_mockup',source:'Leader',status:'Chờ duyệt',requester:'Quản lý',reviewer:'Quản lý',assignee:'Designer',history:[...history,{at:'2026-11-03T01:00:00Z',byName:'Designer',action:'Gửi duyệt',toStatus:'Chờ duyệt'}]},{id:'legacy',title:'Order cũ chưa phân loại',brandId:'brand',type:'Khác',source:'Web',status:'Hoàn thành',requester:'Quản lý',deadline:'2026-11-04',history:[...history,{at:'2026-11-02T01:00:00Z',byName:'Designer',action:'Nhận',toStatus:'Đang thực hiện'},{at:'2026-11-03T01:01:03Z',byName:'Quản lý',action:'Hoàn thành',toStatus:'Hoàn thành'}]}],brands:[{id:'brand',name:'Sứ Việt'}],people:[],reload:async()=>{}} as never);
const client=supabase as unknown as {rpc:(name:string,args:Record<string,unknown>)=>Promise<{data:unknown;error:null}>};
client.rpc=async(name,args)=>{if(name==='design_order_save'){const p=args._patch as Record<string,unknown>;useStore.setState({orders:[...useStore.getState().orders,{...p,id:args._id} as never]});return {data:{...p,id:args._id},error:null};}return {data:null,error:null};};
const realFetch=window.fetch.bind(window);
window.fetch=async(input,init)=>{
  const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
  if(url.includes('/rest/v1/rpc/design_order_save')){
    const args=JSON.parse(String(init?.body || '{}'));const p=args._patch;
    useStore.setState({orders:[...useStore.getState().orders,{...p,id:args._id}]});
    return new Response(JSON.stringify({...p,id:args._id}),{status:200,headers:{'Content-Type':'application/json'}});
  }
  return realFetch(input,init);
};
const rootRoute=createRootRoute({component:()=>{const mode=new URLSearchParams(location.search).get('flow');return <main className="p-4 min-w-0"><DesignWork flow={mode==='photo'?'photo':mode==='marketing'?'marketing_design':mode==='mockup'?'order_mockup':undefined} reportOnly={mode==='report'}/></main>;}});
const home=createRoute({getParentRoute:()=>rootRoute,path:'/'});const router=createRouter({routeTree:rootRoute.addChildren([home])});const root=document.getElementById('root');if(root)createRoot(root).render(<RouterProvider router={router}/>);