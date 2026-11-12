import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BaseOrganization } from '../src/components/BaseOrganization';
import { useAuth } from '../src/lib/auth';
import '../src/styles.css';
useAuth.setState({ currentUserId:'performance-user', users:[{id:'performance-user',username:'test',fullName:'Test',status:'Đang hoạt động',createdAt:'2026-01-01',passwordHash:'',passwordSalt:''}],roles:[],loaded:true,initialized:true });
const root=document.getElementById('root');
if(root)createRoot(root).render(<QueryClientProvider client={new QueryClient()}><BaseOrganization/></QueryClientProvider>);