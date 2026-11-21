async function readEdge(graph, path, token, params = {}) {
  const rows = [];
  const seen = /* @__PURE__ */ new Set();
  for (let n = 0; n < 1e3; n++) {
    const fingerprint = JSON.stringify([path, params]);
    if (seen.has(fingerprint)) throw new Error("Meta lặp trang kết quả; danh sách chưa đầy đủ");
    seen.add(fingerprint);
    const j = await graph(path, token, { params });
    rows.push(...j.data ?? []);
    if (!j.paging?.next) return rows;
    const next = new URL(j.paging.next);
    if (next.origin !== "https://graph.facebook.com") throw new Error("Meta trả địa chỉ phân trang không hợp lệ");
    path = next.pathname.replace(/^\/v\d+\.\d+/, "");
    params = Object.fromEntries(next.searchParams);
    delete params.access_token;
    delete params.appsecret_proof;
  }
  throw new Error("Đã chạm giới hạn phân trang an toàn; danh sách chưa đầy đủ");
}
async function verifyCandidate(graph, appId, appToken, page) {
  if (!page.token) return { eligible: false, message: "Meta không cấp Page Access Token; cần cấp quyền Page qua Kết nối lại" };
  try {
    const { data: debug } = await graph("/debug_token", appToken, { params: { input_token: page.token } });
    if (!debug?.is_valid || debug.app_id !== appId || debug.type !== "PAGE" || String(debug.profile_id) !== page.id) {
      return { eligible: false, message: "Token không hợp lệ hoặc không thuộc đúng Page/ứng dụng" };
    }
    const required = ["pages_show_list", "pages_read_engagement", "pages_manage_metadata", "leads_retrieval"];
    const missing = required.filter((scope) => !(debug.scopes ?? []).includes(scope));
    if (missing.length) return { eligible: false, message: `Token thiếu quyền: ${missing.join(", ")}. Kết nối lại và cấp quyền cho Page này.` };
    const identity = await graph(`/${page.id}`, page.token, { params: { fields: "id,name" } });
    if (String(identity.id) !== page.id) return { eligible: false, message: "Meta trả danh tính Page không khớp" };
    const forms = await graph(`/${page.id}/leadgen_forms`, page.token, { params: { fields: "id", limit: "1" } });
    const form = forms.data?.[0];
    if (!form) return { eligible: false, message: "Đọc được Page nhưng chưa có Form để xác minh quyền lấy lead; tạo Form rồi kiểm tra lại" };
    await graph(`/${form.id}/leads`, page.token, { params: { fields: "id", limit: "1" } });
    return { eligible: true, message: "Token đúng Page; Meta cho phép đọc Form và lấy lead (không nhập dữ liệu)" };
  } catch (e) {
    return { eligible: false, message: `${e.message} Kiểm tra quyền Page và Leads Access của người dùng/ứng dụng, rồi Kết nối lại.` };
  }
}
async function discoverPages(graph, userToken, appId, appToken) {
  const diagnostics = [];
  const permissions = await readEdge(graph, "/me/permissions", userToken);
  const debug = await graph("/debug_token", appToken, { params: { input_token: userToken } });
  if (!debug.data?.is_valid || debug.data.app_id !== appId || debug.data.type !== "USER") throw new Error("Meta OAuth không cấp User Access Token hợp lệ cho ứng dụng");
  const granular = (debug.data.granular_scopes ?? []).map((g) => ({ scope: g.scope, ...g.target_ids ? { target_ids: g.target_ids } : {} }));
  const pages = /* @__PURE__ */ new Map();
  const add = (rows2, origin) => {
    for (const p of rows2) {
      const old = pages.get(String(p.id));
      pages.set(String(p.id), { id: String(p.id), name: p.name ?? String(p.id), token: p.access_token || old?.token || "", tasks: p.tasks ?? old?.tasks ?? [], origins: [.../* @__PURE__ */ new Set([...old?.origins ?? [], origin])], eligible: false, message: "Chưa kiểm tra" });
    }
  };
  try {
    add(await readEdge(graph, "/me/accounts", userToken, { fields: "id,name,access_token,tasks", limit: "100" }), "/me/accounts");
  } catch (e) {
    diagnostics.push(`/me/accounts: ${e.message}`);
  }
  if (permissions.some((p) => p.permission === "business_management" && p.status === "granted")) {
    try {
      const businesses = await readEdge(graph, "/me/businesses", userToken, { fields: "id,name", limit: "100" });
      for (const bm of businesses) for (const edge of ["owned_pages", "client_pages"]) {
        try {
          add(await readEdge(graph, `/${bm.id}/${edge}`, userToken, { fields: "id,name", limit: "100" }), `${bm.name ?? bm.id} · ${edge}`);
        } catch (e) {
          diagnostics.push(`${bm.name ?? bm.id} /${edge}: ${e.message}`);
        }
      }
    } catch (e) {
      diagnostics.push(`/me/businesses: ${e.message}`);
    }
  } else diagnostics.push("Meta chưa cấp business_management: không thể kiểm tra owned_pages/client_pages. Kết nối lại và cấp quyền Business Portfolio.");
  const rows = [...pages.values()];
  for (let i = 0; i < rows.length; i += 3) await Promise.all(rows.slice(i, i + 3).map(async (p) => {
    if (!p.token) {
      try {
        const j = await graph(`/${p.id}`, userToken, { params: { fields: "id,name,access_token" } });
        p.token = j.access_token ?? "";
      } catch (e) {
        p.message = e.message;
        return;
      }
    }
    Object.assign(p, await verifyCandidate(graph, appId, appToken, p));
    p.messaging = await verifyMessagingCandidate(graph, appId, appToken, p);
  }));
  return { pages: rows, diagnostics, permissions: permissions.map((p) => ({ permission: p.permission, status: p.status })), granular };
}
async function verifyMessagingCandidate(graph, appId, appToken, page) {
  try {
    if (!page.token) return { eligible: false, message: "Cần kết nối lại để lấy token Page" };
    const { data: debug } = await graph("/debug_token", appToken, { params: { input_token: page.token } });
    if (!debug?.is_valid || debug.app_id !== appId || debug.type !== "PAGE" || String(debug.profile_id) !== page.id) return { eligible: false, message: "Token hết hạn hoặc không đúng Page/App; kết nối lại" };
    const required = ["pages_messaging", "pages_manage_metadata"];
    const missing = required.filter((s) => !(debug.scopes ?? []).includes(s));
    if (missing.length) return { eligible: false, message: `Cần kết nối lại và cấp ${missing.join(", ")}; có thể cần Meta App Review/Advanced Access` };
    if (!page.tasks.includes("MESSAGING") && !page.tasks.includes("MESSAGE")) return { eligible: false, message: "Meta chưa xác nhận nhiệm vụ MESSAGING của người kết nối; cần cấp quyền Page và kết nối lại" };
    const identity = await graph(`/${page.id}`, page.token, { params: { fields: "id" } });
    if (String(identity.id) !== page.id) return { eligible: false, message: "Danh tính Page không khớp" };
    return { eligible: true, message: "Token đúng Page; có pages_messaging và nhiệm vụ MESSAGING. Gửi vẫn cần cửa sổ và quyền Meta hợp lệ." };
  } catch {
    return { eligible: false, message: "Không xác minh được Messenger; kiểm tra quyền Page hoặc kết nối lại" };
  }
}
export {
  discoverPages,
  readEdge,
  verifyCandidate,
  verifyMessagingCandidate
};
