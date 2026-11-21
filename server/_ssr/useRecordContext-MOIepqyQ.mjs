import { r as reactExports } from "../_libs/react.mjs";
const entries = /* @__PURE__ */ new Map();
const listeners = /* @__PURE__ */ new Set();
let snapshot = null;
function emit() {
  snapshot = [...entries.values()].at(-1) ?? null;
  listeners.forEach((fn) => fn());
}
function useRegisterAiRecord(kind, id) {
  reactExports.useEffect(() => {
    if (!id) return;
    const token = /* @__PURE__ */ Symbol();
    entries.set(token, { kind, id });
    emit();
    return () => {
      entries.delete(token);
      emit();
    };
  }, [kind, id]);
}
function useAiRecordContext() {
  return reactExports.useSyncExternalStore((fn) => {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, () => snapshot, () => null);
}
function openRecordAi() {
  window.dispatchEvent(new Event("suviet-ai-open"));
}
export {
  useRegisterAiRecord as a,
  openRecordAi as o,
  useAiRecordContext as u
};
