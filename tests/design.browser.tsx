import React from 'react';
import {createRoot} from 'react-dom/client';
import {createRootRoute,createRoute,createRouter,RouterProvider} from '@tanstack/react-router';
import {DesignWork} from '../src/components/DesignWork';
import {useAuth} from '../src/lib/auth';
import {useStore} from '../src/lib/store';
import {supabase} from '../src/integrations/supabase/client';
import '../src/styles.css';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
const queryClient=new QueryClient();
const catalogRows=[...['Chụp sản phẩm','Chụp bộ sưu tập','Khác'].map((name,i)=>({id:`photo-${i}`,name,workflow_kind:'photo',kind:'work',active:true,position:i,is_other:name==='Khác'})),...['Banner Website','Thumbnail Video','Khác'].map((name,i)=>({id:`marketing-${i}`,name,workflow_kind:'marketing_design',kind:'work',active:true,position:i,is_other:name==='Khác'})),...['Thiết kế in logo','Ma-két bộ quà tặng','Khác'].map((name,i)=>({id:`mockup-${i}`,name,workflow_kind:'order_mockup',kind:'work',active:true,position:i,is_other:name==='Khác'})),...['Ấm chén','Hộp quà / Bao bì','Khác'].map((name,i)=>({id:`product-${i}`,name,workflow_kind:'order_mockup',kind:'product',active:true,position:i,is_other:name==='Khác'}))];
queryClient.setQueryData(['design-catalogs','fixture-user'],catalogRows);
queryClient.setQueryDefaults(['design-catalogs'],{staleTime:Infinity});
const permissions=['order.view','order.view_all','order.create','order.edit','order.assign','order.report_view','order.take'];
useAuth.setState({loaded:true,currentUserId:'fixture-user',users:[{id:'fixture-user',username:'fixture',fullName:'Quản lý',status:'Đang hoạt động',roleId:'fixture-role'}],roles:[{id:'fixture-role',name:'Fixture',permissions}] } as never);
const history=[{at:'2026-11-01T01:00:00Z',byName:'Quản lý',action:'Tạo',toStatus:'Chờ phân công' as const}];
useStore.setState({loaded:true,orders:[{id:'photo',title:'Chụp bộ quà tặng Sứ Việt',brandId:'brand',type:'Chụp ảnh',workflowKind:'photo',source:'Leader',status:'Chờ phân công',requester:'Quản lý',deadline:'2026-11-09',history},{id:'marketing',title:'Catalogue bộ sưu tập mùa lễ hội',brandId:'brand',type:'Catalogue / profile',workflowKind:'marketing_design',source:'Web',status:'Đang thực hiện',requester:'Quản lý',assignee:'Designer',deadline:'2026-11-06',history:[...history,{at:'2026-11-02T01:00:00Z',byName:'Designer',action:'Nhận',toStatus:'Đang thực hiện'}]},{id:'mockup',title:'Ma-két bộ ấm chén khách hàng',brandId:'brand',type:'Khác',workflowKind:'order_mockup',source:'Leader',status:'Chờ duyệt',requester:'Quản lý',reviewer:'Quản lý',assignee:'Designer',history:[...history,{at:'2026-11-03T01:00:00Z',byName:'Designer',action:'Gửi duyệt',toStatus:'Chờ duyệt'}]},{id:'legacy',title:'Order cũ chưa phân loại',brandId:'brand',type:'Khác',source:'Web',status:'Hoàn thành',requester:'Quản lý',deadline:'2026-11-04',history:[...history,{at:'2026-11-02T01:00:00Z',byName:'Designer',action:'Nhận',toStatus:'Đang thực hiện'},{at:'2026-11-03T01:01:03Z',byName:'Quản lý',action:'Hoàn thành',toStatus:'Hoàn thành'}]}],brands:[{id:'brand',name:'Sứ Việt'}],people:[],reload:async()=>{}} as never);
const client=supabase as unknown as {rpc:(name:string,args:Record<string,unknown>)=>Promise<{data:unknown;error:null}>};
client.rpc=async(name,args)=>{if(name==='design_team_access')return {data:true,error:null};if(name==='design_assignable_staff')return {data:[{user_id:'fixture-designer',name:'Designer'}],error:null};if(name==='design_order_save'){const p=args._patch as Record<string,unknown>;useStore.setState({orders:[...useStore.getState().orders,{...p,id:args._id} as never]});return {data:{...p,id:args._id},error:null};}return {data:null,error:null};};
const storage=supabase.storage as unknown as {from:(name:string)=>unknown};
storage.from=()=>({upload:async()=>({data:{path:'uploaded'},error:null}),createSignedUrl:async()=>({data:{signedUrl:'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'},error:null})});
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
const home=createRoute({getParentRoute:()=>rootRoute,path:'/'});const router=createRouter({routeTree:rootRoute.addChildren([home])});const root=document.getElementById('root');if(root)createRoot(root).render(<QueryClientProvider client={queryClient}><RouterProvider router={router}/></QueryClientProvider>);