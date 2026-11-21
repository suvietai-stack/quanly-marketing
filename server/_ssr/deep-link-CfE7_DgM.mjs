function readOpenParam(key) {
  if (typeof window === "undefined") return null;
  try {
    return new URLSearchParams(window.location.search).get(key);
  } catch {
    return null;
  }
}
function syncOpenParam(key, id) {
  if (typeof window === "undefined") return;
  try {
    const u = new URL(window.location.href);
    if (id) u.searchParams.set(key, id);
    else u.searchParams.delete(key);
    window.history.replaceState(null, "", u);
  } catch {
  }
}
export {
  readOpenParam as r,
  syncOpenParam as s
};
