import React from 'react';
import {createRoot} from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InboxWorkspace } from '../../src/components/inbox/InboxWorkspace';
import '../../src/styles.css';
createRoot(document.getElementById('root')!).render(<QueryClientProvider client={new QueryClient()}><div className="mx-auto max-w-[1450px] p-4 md:p-8"><InboxWorkspace/></div></QueryClientProvider>);
