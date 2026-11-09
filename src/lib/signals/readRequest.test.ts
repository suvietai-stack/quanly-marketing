import { afterEach, expect, it, vi } from 'vitest';
import { signalRead, SIGNAL_READ_TIMEOUT_MS } from './readRequest';
afterEach(()=>vi.useRealTimers());
it('stops an unresolved read at 15 seconds without retrying',async()=>{
  vi.useFakeTimers();let aborted=false;
  const run=vi.fn((s:AbortSignal)=>{s.addEventListener('abort',()=>aborted=true);return new Promise(()=>{});});
  const result=signalRead(run);const assertion=expect(result).rejects.toThrow('Tải Tín hiệu quá lâu');
  await vi.advanceTimersByTimeAsync(SIGNAL_READ_TIMEOUT_MS);await assertion;
  expect(aborted).toBe(true);expect(run).toHaveBeenCalledTimes(1);
});
it('cancels an obsolete request and does not start an already canceled one',async()=>{
  const parent=new AbortController();const run=vi.fn(()=>new Promise(()=>{}));
  const result=signalRead(run,parent.signal);const assertion=expect(result).rejects.toMatchObject({name:'AbortError'});
  parent.abort();await assertion;await expect(signalRead(run,parent.signal)).rejects.toMatchObject({name:'AbortError'});
  expect(run).toHaveBeenCalledTimes(1);
});
it('returns successful results and clears the timeout',async()=>{
  vi.useFakeTimers();expect(await signalRead(()=>Promise.resolve({rows:[1]}))).toEqual({rows:[1]});expect(vi.getTimerCount()).toBe(0);
});