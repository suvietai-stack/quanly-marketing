import { useEffect, useRef } from "react";

/** One in-flight refresh; stop while hidden and refresh on return. */
export function useVisibleRefresh(refresh: () => Promise<unknown>, interval = 10000) {
  const current = useRef(refresh);
  current.current = refresh;
  useEffect(() => {
    let stopped = false;
    let running = false;
    const run = async () => {
      if (stopped || running || document.visibilityState !== "visible") return;
      running = true;
      try { await current.current(); } catch { /* caller owns error display */ }
      finally { running = false; }
    };
    const timer = window.setInterval(run, interval);
    document.addEventListener("visibilitychange", run);
    window.addEventListener("focus", run);
    return () => { stopped = true; clearInterval(timer); document.removeEventListener("visibilitychange", run); window.removeEventListener("focus", run); };
  }, [interval]);
}