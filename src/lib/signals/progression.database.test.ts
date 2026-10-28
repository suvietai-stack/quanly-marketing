import { readFileSync } from 'node:fs';
import { describe,it,expect } from 'vitest';
const sql=readFileSync('drizzle/migrations/0069_signal_progression_tracking.sql','utf8');
describe('progression database safeguards',()=>{
  it('same request is globally unique and payload mismatch is rejected',()=>{
    expect(sql).toMatch(/CREATE UNIQUE INDEX signal_notes_request_unique[^;]+\(request_id\)/);
    expect(sql).toContain('existing.request_payload<>payload');
    expect(sql).toContain('existing.signal_id<>_id');
    expect(sql).toContain('existing.author_id<>auth.uid()');
  });
  it('locks the signal and deduplicates equal content for exactly 60 seconds',()=>{
    expect(sql).toContain('WHERE id=_id FOR UPDATE');
    expect(sql).toContain("request_payload=payload AND created_at>=now()-interval '60 seconds'");
  });
  it('Sale must own signal; manager scope is checked',()=>{
    expect(sql).toContain("s.assigned_to=auth.uid() AND private.sig_can(auth.uid(),'signal.sale')");
    expect(sql).toContain("private.sig_can(auth.uid(),'signal.manage') AND private.sig_scope_ok(auth.uid(),s.need_groups)");
  });
  it('lost still requires a reason; no 5-note prerequisite blocks closing',()=>{
    expect(sql).toContain("IF ns='lost' AND coalesce(trim(_lost_reason),'')='' THEN RAISE EXCEPTION");
    const save=sql.split('CREATE FUNCTION public.signal_progression_save')[1]?.split('CREATE FUNCTION public.signal_progression_rows')[0] ?? '';
    expect(save).not.toMatch(/count\(\*\)|total\s*[<>=]\s*5/i);
  });
  it('read aggregate is invoker scoped, Vietnamese calendar period and no direct writer grant',()=>{
    expect(sql).toContain('LANGUAGE sql STABLE SECURITY INVOKER');
    expect(sql).toContain("(v.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date>=_from");
    expect(sql).not.toMatch(/GRANT\s+(?:INSERT|UPDATE|ALL)\s+ON\s+public.opportunity_signal_notes/i);
  });
  it('migration never backfills or deletes old history',()=>{
    expect(sql).not.toMatch(/UPDATE\s+public.opportunity_signal_notes|DELETE\s+FROM\s+public.opportunity_signal_notes/i);
  });
});