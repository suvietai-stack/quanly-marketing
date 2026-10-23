import { describe, expect, it, vi } from "vitest";
import { discoverPages, readEdge, verifyCandidate, type DiscoveredPage } from "./pageDiscovery.server";

const page: DiscoveredPage = { id: "2203946849869073", name: "Xưởng Gốm Sứ Việt", token: "page-token", tasks: [], origins: [], eligible: false, message: "" };
const scopes = ["pages_show_list", "pages_read_engagement", "pages_manage_metadata", "leads_retrieval"];
describe("Meta Page discovery and eligibility", () => {
  it("follows next pages even without cursor metadata and strips credentials", async () => {
    const graph = vi.fn().mockResolvedValueOnce({ data: [{ id: "1" }], paging: { next: "https://graph.facebook.com/v23.0/me/accounts?after=next&access_token=secret" } }).mockResolvedValueOnce({ data: [{ id: "2" }] });
    expect(await readEdge(graph, "/me/accounts", "user")).toEqual([{ id: "1" }, { id: "2" }]);
    expect(graph).toHaveBeenLastCalledWith("/me/accounts", "user", { params: { after: "next" } });
  });
  it("never follows a foreign paging URL", async () => {
    const graph = vi.fn().mockResolvedValue({ data: [], paging: { next: "https://attacker.example/accounts" } });
    await expect(readEdge(graph, "/me/accounts", "user")).rejects.toThrow("không hợp lệ");
    expect(graph).toHaveBeenCalledTimes(1);
  });
  it("rejects another Page's token even when it can read the public Page name", async () => {
    const graph = vi.fn().mockResolvedValue({ data: { is_valid: true, app_id: "app", type: "PAGE", profile_id: "other", scopes } });
    expect((await verifyCandidate(graph, "app", "app-token", page)).eligible).toBe(false);
    expect(graph).toHaveBeenCalledTimes(1);
  });
  it("requires real lead retrieval permission, not just Form read access", async () => {
    const graph = vi.fn().mockResolvedValueOnce({ data: { is_valid: true, app_id: "app", type: "PAGE", profile_id: page.id, scopes } }).mockResolvedValueOnce({ id: page.id }).mockResolvedValueOnce({ data: [{ id: "form" }] }).mockRejectedValueOnce(new Error("(#10) User has insufficient privileges on the page."));
    const result = await verifyCandidate(graph, "app", "app-token", page);
    expect(result.eligible).toBe(false);
    expect(result.message).toContain("(#10) User has insufficient privileges");
  });
  it("does not claim lead-read verification for a Page with no Form", async () => {
    const graph = vi.fn().mockResolvedValueOnce({ data: { is_valid: true, app_id: "app", type: "PAGE", profile_id: page.id, scopes } }).mockResolvedValueOnce({ id: page.id }).mockResolvedValueOnce({ data: [] });
    expect((await verifyCandidate(graph, "app", "app-token", page)).eligible).toBe(false);
  });
  it("merges owned and client Pages across businesses, obtains their token and verifies access", async () => {
    const graph = vi.fn(async (path: string, token: string, init?: { params?: Record<string, string> }) => {
      if (path === "/me/permissions") return { data: [{ permission: "business_management", status: "granted" }] };
      if (path === "/debug_token") return { data: init?.params?.input_token === "user" ? { is_valid: true, app_id: "app", type: "USER", granular_scopes: [{ scope: "pages_show_list", target_ids: [page.id] }] } : { is_valid: true, app_id: "app", type: "PAGE", profile_id: page.id, scopes } };
      if (path === "/me/accounts") return { data: [] };
      if (path === "/me/businesses") return { data: [{ id: "bm1", name: "A" }, { id: "bm2", name: "B" }] };
      if (path.endsWith("/owned_pages") || path.endsWith("/client_pages")) return { data: [{ id: page.id, name: page.name }] };
      if (path === `/${page.id}`) return { id: page.id, access_token: token === "user" ? "page-token" : undefined };
      if (path.endsWith("/leadgen_forms")) return { data: [{ id: "form" }] };
      if (path === "/form/leads") return { data: [] };
      throw new Error(`Unexpected ${path}`);
    });
    const result = await discoverPages(graph, "user", "app", "app-token");
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].id).toBe("2203946849869073");
    expect(result.pages[0].eligible).toBe(true);
    expect(result.pages[0].origins).toHaveLength(4);
    expect(result.granular[0].target_ids).toEqual(["2203946849869073"]);
    expect(graph).toHaveBeenCalledWith("/form/leads", "page-token", { params: { fields: "id", limit: "1" } });
  });
});