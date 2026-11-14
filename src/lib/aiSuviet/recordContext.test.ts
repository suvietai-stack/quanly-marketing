import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { readRecordContext } from './recordContext.server';
import { validRecordContext } from './recordContext';
import { answerAiSuviet } from './assistant.server';

vi.mock('./providerKey.server',()=>({providerKey:async()=>''}));

const id='12345678-1234-1234-1234-123456789abc';
function caller(rows:Record<string,unknown>, denied=false) {
  const filters:unknown[]=[];
  const from=vi.fn((table:string)=>{
    const q={select:vi.fn(()=>q),eq:vi.fn((key:string,value:unknown)=>{filters.push([table,key,value]);return q;}),
      maybeSingle:vi.fn(async()=>({data:denied?null:rows[table]??null,error:denied?{code:'42501'}:null}))};
    return q;
  });
  const rpc=vi.fn(async()=>({data:[{id:'person',full_name:'Người phụ trách'}],error:null}));
  return {db:{from,rpc} as unknown as SupabaseClient,from,rpc,filters};
}
describe('record assistance respects caller reads',()=>{
  it('answers from the current record without an API key or any provider call',async()=>{
    const c=caller({opportunity_signals:{customer_name:'Khách đang mở',status:'waiting',assigned_to:'person'}});
    const network=vi.spyOn(globalThis,'fetch').mockRejectedValue(new Error('Provider must not be called'));
    try {
      const r=await answerAiSuviet(c.db,'Hồ sơ này chờ ai?',[],{kind:'signal',id});
      expect(r.mode).toBe('guide');
      expect(r.answer).toContain('Khách đang mở');
      expect(r.answer).toContain('xác nhận nhận tín hiệu');
      expect(r.sources).toHaveLength(1);
      expect(network).not.toHaveBeenCalled();
      expect(c.rpc.mock.calls).toHaveLength(1);
    } finally { network.mockRestore(); }
  });
  it('rejects unsupported kinds and injected identifiers before any reads',async()=>{
    const c=caller({});
    for(const value of [{kind:'profiles',id},{kind:'design',id:'../secret'},null]){
      expect(validRecordContext(value)).toBe(false);
      await expect(readRecordContext(c.db,value as never)).rejects.toThrow('không hợp lệ');
    }
    expect(c.from).not.toHaveBeenCalled();expect(c.rpc).not.toHaveBeenCalled();
  });
  it.each(['design','signal','finance'] as const)('does not fabricate a summary when %s RLS denies the row',async(kind)=>{
    const c=caller({},true);
    await expect(readRecordContext(c.db,{kind,id})).rejects.toThrow('quyền hiện tại');
    expect(c.filters).toContainEqual([kind==='design'?'orders':kind==='signal'?'opportunity_signals':'fr_requests','id',id]);
  });
  it('uses the actual current financial approval step and salary route',async()=>{
    const c=caller({fr_requests:{code:'UL01',title:'Tạm ứng',kind:'salary_advance',status:'pending',amount:2000000,current_step:2,requester_id:'author'},fr_steps:{approver_id:'person',label:'Duyệt'}});
    const r=await readRecordContext(c.db,{kind:'finance',id});
    expect(r.text).toContain('Người phụ trách');
    expect(c.filters).toContainEqual(['fr_steps','step_no',2]);
    expect(c.filters).toContainEqual(['fr_steps','request_id',id]);
    expect(r.href).toBe(`/finance/salary?open=${id}`);
    expect(c.from.mock.calls.map(x=>x[0])).toEqual(['fr_requests','fr_steps']);
  });
  it('does not tell staff to keep working a cancelled signal',async()=>{
    const c=caller({opportunity_signals:{customer_name:'Khách',status:'waiting',assigned_to:'person',cancelled_at:'2026-11-14'}});
    const r=await readRecordContext(c.db,{kind:'signal',id});
    expect(r.text).toContain('Không còn bước xử lý đang chờ');
    expect(r.text).toContain('Tín hiệu đã hủy');
  });
  it('guides design delivery to completion and links the record detail',async()=>{
    const c=caller({orders:{id:'job1',data:{title:'Mẫu ly',status:'Đã bàn giao',requester:'Người yêu cầu',assignee:'Thiết kế',workflowKind:'order_mockup'}}});
    const r=await readRecordContext(c.db,{kind:'design',id:'job1'});
    expect(r.text).toContain('Đang chờ/phụ trách: Người yêu cầu');
    expect(r.text).toContain('xác nhận hoàn thành');
    expect(r.href).toBe('/orders?open=job1');
  });
});
