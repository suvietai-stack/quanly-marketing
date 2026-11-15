import { describe, expect, it } from 'vitest';
import { parseMessenger, safeAttachmentUrl, sendWindow, subscriptionUnion } from './model';
import { verifyMessagingCandidate } from '../fbLeads/pageDiscovery.server';
const body = (message: unknown) => ({ object: 'page', entry: [{ id: '1', messaging: [message] }] });
describe('Messenger intake boundary', () => {
  it('does not parse Lead events as conversations', () => expect(parseMessenger({ object:'page',entry:[{ changes:[{ field:'leadgen',value:{ page_id:'1',leadgen_id:'2' } }] }] })).toEqual([]));
  it('normalizes incoming and outbound echo identities', () => {
    expect(parseMessenger(body({ sender:{id:'2'},recipient:{id:'1'},timestamp:1700000000000,message:{mid:'m1',text:'Xin chào'} }))[0]).toMatchObject({page_id:'1',customer_id:'2',direction:'in',mid:'m1'});
    expect(parseMessenger(body({ sender:{id:'1'},recipient:{id:'2'},timestamp:1700000000000,message:{mid:'m2',is_echo:true} }))[0]).toMatchObject({page_id:'1',customer_id:'2',direction:'out'});
  });
  it('rejects mismatched Page identities and missing timestamps', () => {
    expect(() => parseMessenger(body({ sender:{id:'2'},recipient:{id:'3'},timestamp:1,message:{mid:'x'} }))).toThrow();
    expect(() => parseMessenger(body({ sender:{id:'2'},recipient:{id:'1'},message:{mid:'x'} }))).toThrow();
  });
  it('retains both Lead and Messenger webhook subscriptions', () => {
    const a=subscriptionUnion(['leadgen','feed'],false,true);expect(a).toContain('leadgen');expect(a).toContain('messages');expect(a).toContain('feed');
    expect(subscriptionUnion(a,true,false)).toEqual(a);
  });
  it('sanitizes attachment URLs without accepting foreign or disguised hosts', () => {
    expect(safeAttachmentUrl('https://scontent.fbcdn.net/a.jpg')).toBeTruthy();
    for (const url of ['javascript:alert(1)','http://facebook.com/a','https://fbcdn.net.evil.test/a','https://user:secret@fbcdn.net/a','https://evil.test/a']) expect(safeAttachmentUrl(url)).toBeNull();
  });
  it('does not permit expired, future or invalid sending windows', () => {
    const now=Date.parse('2026-11-15T10:00:00Z');
    expect(sendWindow('2026-11-14T10:00:00Z',now)).toBe(false);expect(sendWindow('2026-11-15T09:00:00Z',now)).toBe(true);
    expect(sendWindow(null,now)).toBe(false);expect(sendWindow('bad',now)).toBe(false);expect(sendWindow('2026-11-16T10:00:00Z',now)).toBe(false);
  });
  it('verifies Messenger independently from Lead Forms', async () => {
    const calls:string[]=[];
    const graph=async(path:string) => {calls.push(path);return path==='/debug_token'?{data:{is_valid:true,app_id:'app',type:'PAGE',profile_id:'1',scopes:['pages_messaging','pages_manage_metadata']}}:{id:'1'};};
    const p={id:'1',name:'Page',token:'test',tasks:['MESSAGING'],origins:[],eligible:false,message:''};
    expect((await verifyMessagingCandidate(graph,'app','app-token',p)).eligible).toBe(true);
    expect(calls.some(p=>p.includes('lead'))).toBe(false);
    expect((await verifyMessagingCandidate(graph,'app','app-token',{...p,tasks:[]})).eligible).toBe(false);
  });
});
