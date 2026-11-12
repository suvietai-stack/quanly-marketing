import React from 'react';
import { createRoot } from 'react-dom/client';
import { createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LeaveAccess } from '../src/components/leave/LeaveAccess';
import { useAuth } from '../src/lib/auth';
import '../src/styles.css';
const actor = 'fixture-employee';
const fixtureUser = {id:actor,username:'fixture',fullName:'Nhân viên fixture',status:'Đang hoạt động' as const,createdAt:'2026-01-01',passwordHash:'',passwordSalt:''};
let resolveAccess: (() => void) | undefined;
let refreshes = 0;
useAuth.setState({currentUserId:actor,users:[fixtureUser],roles:[],loaded:true,initialized:true,baseAccess:null,
 refreshBaseAccess: async () => { refreshes++; await new Promise<void>(resolve => {resolveAccess=resolve;}); }});
const controls = {
 grant(keys=['leave.view_own']) { useAuth.setState({baseAccess:{user_id:actor,revision:1,server_now:'2026-11-12',permissions:keys.map(key=>({key,label:key,module:'Leave',tier:1,scope:'own',conflict:false,supported:true,allowed:true,decision:'ALLOW',sources:[],legacy:{allowed:false,source:{kind:'none',tier:0}}}))}});resolveAccess?.(); },
 fail() {resolveAccess?.();},
 signOut() {useAuth.setState({currentUserId:null,users:[],baseAccess:null});resolveAccess?.();},
 calls() {return refreshes;},
};
Object.assign(window,{leaveFixture:controls});
const rootRoute=createRootRoute({component:LeaveAccess});
const router=createRouter({routeTree:rootRoute});
const root=document.getElementById('root');
if(root)createRoot(root).render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><RouterProvider router={router}/></QueryClientProvider>);