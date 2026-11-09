import { supabase } from '@/integrations/supabase/client';
import { timeBounds, type ListFilter } from './report';
import { todayKey, type Signal, type LastNote } from './catalog';
import type { SignalSort, WorkQuick } from './potential';
import { signalRead } from './readRequest';

export interface ListRow extends Signal { note_count: number; last_note: LastNote | null }
export interface ListCounts { total: number; status: Record<string,number>; needs: Record<string,number>; sales: string[]; creators: string[]; mine: {waiting:number;active:number;quoted:number;won:number} }
export const listParams = (f: ListFilter, work: WorkQuick) => {
  const [from,to] = timeBounds(f,todayKey());
  return {...f,from,to,work};
};
export async function signalPage(filter: Record<string,unknown>, sort: SignalSort, offset: number, limit: number, signal?: AbortSignal): Promise<{rows:ListRow[]}> {
  const request = supabase.rpc('signal_list_page',{_filter:filter as never,_sort:sort,_offset:offset,_limit:limit});
  const {data,error}=await signalRead(s=>request.abortSignal(s),signal);
  if(error)throw error;
  if(!data||!Array.isArray((data as unknown as {rows:unknown}).rows))throw new Error('Không nhận được danh sách Tín hiệu. Vui lòng thử tải lại.');
  return data as unknown as {rows:ListRow[]};
}
export async function signalCounts(filter: Record<string,unknown>,signal?:AbortSignal): Promise<ListCounts> {
  const {data,error}=await signalRead(s=>supabase.rpc('signal_list_counts',{_filter:filter as never}).abortSignal(s),signal);
  if(error)throw error;
  if(!data||typeof (data as unknown as ListCounts).total!=='number')throw new Error('Không nhận được số liệu Tín hiệu. Vui lòng thử tải lại.');
  return data as unknown as ListCounts;
}
export async function signalById(id:string): Promise<Signal|null> {
  const {data,error}=await supabase.from('opportunity_signals').select('*').eq('id',id).maybeSingle();
  if(error)throw error;return data as Signal|null;
}
export async function saveNote(id:string,requestId:string,note:string) {
  const {data,error}=await supabase.rpc('signal_note_save',{_id:id,_request_id:requestId,_note:note});
  if(error)throw error;return data;
}
export async function changeToken(signal?:AbortSignal) {
  const {data,error}=await signalRead(s=>supabase.rpc('signal_change_token').abortSignal(s),signal);if(error)throw error;return data;
}