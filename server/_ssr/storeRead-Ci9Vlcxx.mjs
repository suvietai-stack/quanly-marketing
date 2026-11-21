async function readAllPages(read, pageSize = 500, timeoutMs = 2e4) {
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    const controller = new AbortController();
    let timer;
    const deadline = new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject({ code: "57014", message: "Read deadline exceeded" });
        controller.abort();
      }, timeoutMs);
    });
    const { data, error } = await Promise.race([Promise.resolve().then(() => read(from, from + pageSize - 1, controller.signal)), deadline]).finally(() => clearTimeout(timer));
    if (error) throw error;
    const page = data ?? [];
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}
function isTransientStoreRead(error) {
  if (error instanceof TypeError) return true;
  if (!error || typeof error !== "object") return false;
  const e = error;
  return e.code === "57014" || e.code === "PGRST000" || e.code === "PGRST001" || e.code === "PGRST002" || e.code === "PGRST003" || typeof e.status === "number" && e.status >= 500 || /failed to fetch|networkerror|network request failed|load failed|statement timeout|fetch failed/i.test(e.message ?? "");
}
export {
  isTransientStoreRead as i,
  readAllPages as r
};
