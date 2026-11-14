import { useEffect, useSyncExternalStore } from 'react';
import type { RecordContext } from './recordContext';
const entries = new Map<symbol, RecordContext>();
const listeners = new Set<() => void>();
let snapshot: RecordContext | null = null;
function emit() { snapshot = [...entries.values()].at(-1) ?? null; listeners.forEach(fn => fn()); }
export function useRegisterAiRecord(kind: RecordContext['kind'], id?: string | null) {
  useEffect(() => {
    if (!id) return;
    const token = Symbol(); entries.set(token, {kind,id}); emit();
    return () => { entries.delete(token); emit(); };
  }, [kind,id]);
}
export function useAiRecordContext() {
  return useSyncExternalStore(fn => {listeners.add(fn);return () => {listeners.delete(fn);};}, () => snapshot, () => null);
}

export function openRecordAi() { window.dispatchEvent(new Event("suviet-ai-open")); }
