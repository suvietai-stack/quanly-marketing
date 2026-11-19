import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkCrmCustomerCreated, isAmbiguousCrmWrite } from './saveRecovery';

const { from } = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from } }));

const actorId = '00000000-0000-0000-0000-0000000000a1';
const requestKey = '11111111-1111-4111-8111-111111111111';

function setupQuery(result: { data: unknown; error: unknown }) {
  const chain = {
    select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn().mockResolvedValue(result),
  };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  from.mockReturnValue(chain);
  return chain;
}

beforeEach(() => from.mockReset());

describe('CRM save error classification', () => {
  it('treats network failures and statement timeouts as uncertain commits', () => {
    expect(isAmbiguousCrmWrite({ code: '57014', message: 'statement timeout' })).toBe(true);
    expect(isAmbiguousCrmWrite({ code: '08006', message: 'connection failed' })).toBe(true);
    expect(isAmbiguousCrmWrite({ status: 504, message: 'Gateway Timeout' })).toBe(true);
    expect(isAmbiguousCrmWrite(new TypeError('Failed to fetch'))).toBe(true);
  });
  it('does not turn denied rights or validation errors into retry loops', () => {
    expect(isAmbiguousCrmWrite({ code: '42501', message: 'permission denied' })).toBe(false);
    expect(isAmbiguousCrmWrite({ code: '23505', message: 'unique violation' })).toBe(false);
    expect(isAmbiguousCrmWrite({ code: 'P0001', message: 'Danh mục không hợp lệ' })).toBe(false);
    expect(isAmbiguousCrmWrite(null)).toBe(false);
  });
});

describe('CRM customer save receipt', () => {
  it('reconciles exactly one owner/request-key pair and no other customer', async () => {
    const chain = setupQuery({ data: { id: 'new-customer-id' }, error: null });
    expect(await checkCrmCustomerCreated(actorId, requestKey)).toEqual({ status: 'saved', id: 'new-customer-id' });
    expect(from).toHaveBeenCalledWith('crm_customers');
    expect(chain.select).toHaveBeenCalledWith('id');
    expect(chain.eq).toHaveBeenNthCalledWith(1, 'created_by', actorId);
    expect(chain.eq).toHaveBeenNthCalledWith(2, 'request_key', requestKey);
  });
  it('missing is not misreported as success', async () => {
    setupQuery({ data: null, error: null });
    expect(await checkCrmCustomerCreated(actorId, requestKey)).toEqual({ status: 'missing' });
  });
  it('a failed or RLS-blocked lookup is unknown, never missing', async () => {
    setupQuery({ data: null, error: { code: '42501' } });
    expect(await checkCrmCustomerCreated(actorId, requestKey)).toEqual({ status: 'unknown' });
  });
  it('does not issue unauthenticated lookup', async () => {
    expect(await checkCrmCustomerCreated('', requestKey)).toEqual({ status: 'unknown' });
    expect(await checkCrmCustomerCreated(actorId, '')).toEqual({ status: 'unknown' });
    expect(from).not.toHaveBeenCalled();
  });
});
