import { describe, expect, it } from 'vitest';
import { createCoalescer } from './singleFlight';
const deferred = () => { let r!: () => void; const p = new Promise<void>(x => (r = x)); return { p, r }; };
describe('createCoalescer', () => {
  it('join shares one in-flight load for the same user', async () => {
    let calls = 0; const d = deferred();
    const c = createCoalescer(async () => { calls++; await d.p; });
    const a = c.join('u1'); const b = c.join('u1'); d.r(); await Promise.all([a, b]);
    expect(calls).toBe(1);
  });
  it('refresh during a load runs exactly one more load afterwards', async () => {
    let calls = 0; const gates = [deferred(), deferred()];
    const c = createCoalescer(async () => { await gates[calls++].p; });
    const first = c.join('u1'); const r1 = c.refresh('u1'); const r2 = c.refresh('u1');
    gates[0].r(); await first; gates[1].r(); await Promise.all([r1, r2]);
    expect(calls).toBe(2);
  });
  it('a different user never reuses another user load', async () => {
    const seen: string[] = [];
    const c = createCoalescer(async (k: string) => { seen.push(k); });
    await Promise.all([c.join('u1'), c.join('u2')]);
    expect(seen).toEqual(['u1', 'u2']);
  });
  it('a failed load does not block the next one', async () => {
    let calls = 0;
    const c = createCoalescer(async () => { calls++; if (calls === 1) throw new Error('timeout'); });
    await expect(c.join('u1')).rejects.toThrow('timeout');
    await c.join('u1'); expect(calls).toBe(2);
  });
});
