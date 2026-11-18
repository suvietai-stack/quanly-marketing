import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkK3QuickCreate, checkK3ResultSave, checkK3TaskSave, isK3AmbiguousWrite } from './k3SaveRecovery';

const { from } = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from } }));

const uid = '00000000-0000-0000-0000-0000000000a1';
const requestKey = '11111111-1111-4111-8111-111111111111';

function mockedQuery(answer: { data: unknown; error: unknown }) {
  const chain = {
    select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn().mockResolvedValue(answer),
  };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  from.mockReturnValue(chain);
  return chain;
}

beforeEach(() => from.mockReset());

describe('3K uncertain-write classification', () => {
  it('recognizes statement timeouts and network failures', () => {
    expect(isK3AmbiguousWrite({ code: '57014', message: 'canceling statement due to statement timeout' })).toBe(true);
    expect(isK3AmbiguousWrite({ status: 504, message: 'Gateway Timeout' })).toBe(true);
    expect(isK3AmbiguousWrite(new TypeError('Failed to fetch'))).toBe(true);
    expect(isK3AmbiguousWrite({ code: '08006', message: 'connection failure' })).toBe(true);
  });
  it('does not conceal permissions, validation or revision conflicts as a retryable timeout', () => {
    expect(isK3AmbiguousWrite({ code: '42501', message: 'permission denied' })).toBe(false);
    expect(isK3AmbiguousWrite({ code: '23505', message: 'unique_violation' })).toBe(false);
    expect(isK3AmbiguousWrite({ code: 'P0001', message: 'Hạn hoàn thành không hợp lệ.' })).toBe(false);
    expect(isK3AmbiguousWrite(null)).toBe(false);
  });
});

describe('3K owner-scoped read-only reconciliation', () => {
  it('finds a committed KG by exact owner and original request key', async () => {
    const chain = mockedQuery({ data: { id: 'goal-id' }, error: null });
    expect(await checkK3QuickCreate(uid, requestKey)).toEqual({ status: 'saved', id: 'goal-id' });
    expect(from).toHaveBeenCalledWith('k3_goals');
    expect(chain.select).toHaveBeenCalledWith('id');
    expect(chain.eq).toHaveBeenNthCalledWith(1, 'user_id', uid);
    expect(chain.eq).toHaveBeenNthCalledWith(2, 'request_key', requestKey);
  });
  it('does not claim success when no matching KG exists', async () => {
    mockedQuery({ data: null, error: null });
    expect(await checkK3QuickCreate(uid, requestKey)).toEqual({ status: 'missing' });
  });
  it('reports unknown when the user-scoped read is denied or offline', async () => {
    mockedQuery({ data: null, error: { code: '42501' } });
    expect(await checkK3QuickCreate(uid, requestKey)).toEqual({ status: 'unknown' });
  });
  it('detects saved KPI results using immutable request history, not inferred values', async () => {
    const chain = mockedQuery({ data: { result_id: 'result-id' }, error: null });
    expect(await checkK3ResultSave(uid, requestKey)).toEqual({ status: 'saved', id: 'result-id' });
    expect(from).toHaveBeenCalledWith('k3_kpi_result_versions');
    expect(chain.eq).toHaveBeenNthCalledWith(1, 'actor_id', uid);
    expect(chain.eq).toHaveBeenNthCalledWith(2, 'request_key', requestKey);
  });
  it('detects recorded daily KF execution by original owner request key', async () => {
    const chain = mockedQuery({ data: { id: 'task-id' }, error: null });
    expect(await checkK3TaskSave(uid, requestKey)).toEqual({ status: 'saved', id: 'task-id' });
    expect(from).toHaveBeenCalledWith('k3_tasks');
    expect(chain.eq).toHaveBeenNthCalledWith(1, 'user_id', uid);
    expect(chain.eq).toHaveBeenNthCalledWith(2, 'request_key', requestKey);
  });
  it('does not declare a KF execution complete when its read failed', async () => {
    mockedQuery({ data: null, error: { code: 'PGRST000' } });
    expect(await checkK3TaskSave(uid, requestKey)).toEqual({ status: 'unknown' });
  });
  it('never probes data if the actor or request key is absent', async () => {
    expect(await checkK3ResultSave('', requestKey)).toEqual({ status: 'unknown' });
    expect(await checkK3QuickCreate(uid, '')).toEqual({ status: 'unknown' });
    expect(from).not.toHaveBeenCalled();
  });
});
