import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/api/public/web-chat/guest')({server:{handlers:{POST:async({request})=>{
  try { return await (await import('@/lib/webChat/chat.server')).guest(request); }
  catch { return Response.json({error:'Chưa xử lý được tin nhắn. Vui lòng thử lại.'},{status:503,headers:{'Cache-Control':'no-store'}}); }
}}}});
