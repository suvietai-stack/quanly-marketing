import React from 'react';
import {createRoot} from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WebChatComingSoon } from '../../src/components/inbox/WebChatComingSoon';
import { InboxWorkspace } from '../../src/components/inbox/InboxWorkspace';
import '../../src/styles.css';
createRoot(document.getElementById('root')!).render(<QueryClientProvider client={new QueryClient()}><div className="mx-auto max-w-[1450px] p-4 md:p-8"><nav className="mb-4 flex gap-4"><a href="/">Facebook Messenger</a><a href="/web-chat">Chat Web</a></nav>{location.pathname === "/web-chat" ? <WebChatComingSoon/> : <InboxWorkspace/>}</div></QueryClientProvider>);
