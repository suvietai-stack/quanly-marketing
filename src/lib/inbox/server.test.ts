import { beforeEach, describe, expect, it, vi } from 'vitest';
const { token, rpc } = vi.hoisted(() => ({ token: vi.fn(), rpc: vi.fn() }));
vi.mock('../fbLeads/fb.server', () => ({ GRAPH:'https://graph.facebook.com/v23.0',pageToken:token }));
vi.mock('@/integrations/supabase/client.server', () => ({ supabaseAdmin:{ rpc } }));
import { ingestMessenger, sendText } from './inbox.server';
beforeEach(()=>{vi.resetAllMocks();token.mockResolvedValue('secret-test');rpc.mockResolvedValue({error:null});});
describe('outbound uncertainty and credential boundaries',()=>{
 it('does not contact Meta when Page credentials are unavailable',async()=>{
  token.mockRejectedValue(new Error('invalid'));const transport=vi.fn();expect((await sendText('1','2','Hi','req',transport)).state).toBe('failed');expect(transport).not.toHaveBeenCalled();
 });
 it('sends one request with a bearer token and accepts only an actual message id',async()=>{
  const transport=vi.fn().mockResolvedValue(new Response(JSON.stringify({message_id:'mid'}),{status:200}));
  expect(await sendText('1','2','Hi','req',transport)).toMatchObject({state:'accepted',mid:'mid'});
  expect(transport).toHaveBeenCalledTimes(1);const [url,init]=transport.mock.calls[0];expect(url).not.toContain('secret-test');expect(init.headers.Authorization).toBe('Bearer secret-test');expect(JSON.parse(init.body)).toMatchObject({message:{metadata:'sv-inbox:req'}});
 });
 it('never retries timeouts, malformed responses or 5xx outcomes',async()=>{
  for(const response of [new Error('connection lost'),new Response('bad',{status:200}),new Response('{}',{status:503}),new Response('{}',{status:200})]){
   const transport=vi.fn();if(response instanceof Error)transport.mockRejectedValue(response);else transport.mockResolvedValue(response);
   expect((await sendText('1','2','Hi','req',transport)).state).toBe('unknown');expect(transport).toHaveBeenCalledTimes(1);
  }
 });
 it('reports an explicit rejection without retry',async()=>{const transport=vi.fn().mockResolvedValue(new Response(JSON.stringify({error:{code:190}}),{status:400}));expect((await sendText('1','2','Hi','req',transport)).state).toBe('failed');expect(transport).toHaveBeenCalledTimes(1);});
});
describe('staged callback compatibility',()=>{
 const input={object:'page',entry:[{id:'1',messaging:[{sender:{id:'2'},recipient:{id:'1'},timestamp:1700000000000,message:{mid:'mid'}}]}]};
 it('leaves Lead-only callbacks independent of Inbox installation',async()=>{await ingestMessenger({object:'page',entry:[{changes:[]}]});expect(rpc).not.toHaveBeenCalled();});
 it('does not break callbacks before the Inbox migration is installed',async()=>{rpc.mockResolvedValue({error:{code:'PGRST202'}});await expect(ingestMessenger(input)).resolves.toBeUndefined();expect(rpc).toHaveBeenCalledTimes(1);});
 it('requires persistence before acknowledging an enabled Inbox event',async()=>{rpc.mockResolvedValueOnce({error:null}).mockResolvedValueOnce({error:{code:'db_failure'}});await expect(ingestMessenger(input)).rejects.toThrow('persistence');expect(rpc).toHaveBeenCalledWith('inbox_ingest',expect.anything());});
});
