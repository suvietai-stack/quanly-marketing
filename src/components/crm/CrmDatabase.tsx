import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Database, Eye, X } from "lucide-react";
import { crmRpc } from "@/lib/crm/queries";
import { formatDate } from "@/lib/crm/logic";
import type { Catalog } from "@/lib/crm/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pick } from "./CrmControls";
import { segmentOptions } from "@/lib/crm/classification";
import { CrmModal } from "./CrmForms";

type DatabaseRow = {
  id: string; code: string; name: string; phone_masked: string;
  owner_name: string; group_id: string | null; segment_id: string | null;
  priority_id: string | null; profile_kind: string; archived_at: string | null;
  created_at: string;
};
type DatabasePage = { total: number; rows: DatabaseRow[]; page: number; page_size: number };
type DatabaseDetail = {
  id: string; code: string; name: string; phone: string; email: string;
  address: string; tax_code: string; legal_name: string; website: string;
  note: string; owner_name: string; group_id: string | null;
  segment_id: string | null; priority_id: string | null; source_id: string | null;
  relationship_id: string | null; created_at: string; archived_at: string | null;
};
const PAGE_SIZE = 50;

/** Separate read-only register; the server returns only masked phones on list requests. */
export function CrmDatabase({ uid, catalogs }: { uid: string; catalogs: Catalog[] }) {
  const [group, setGroup] = useState("");
  const [segment, setSegment] = useState("");
  const [archive, setArchive] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchText.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);
  useEffect(() => { setPage(1); }, [group, segment, archive, search]);

  const query = useQuery({
    queryKey: ["crm_database_list", uid, group, segment, archive, search, page],
    queryFn: () => crmRpc<DatabasePage>("crm_database_list", {
      _group: group || null, _segment: segment || null, _search: search,
      _archive: archive, _page: page, _size: PAGE_SIZE,
    }),
    staleTime: 30_000,
    retry: false,
  });
  const detail = useQuery({
    queryKey: ["crm_database_detail", uid, detailId],
    queryFn: () => crmRpc<DatabaseDetail>("crm_database_detail", { _id: detailId }),
    enabled: !!detailId,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
  const nameOf = (id: string | null) => catalogs.find((cat) => cat.id === id)?.name ?? "—";
  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold"><Database className="h-5 w-5" />Toàn bộ dữ liệu khách hàng</h2>
          <p className="text-sm text-muted-foreground">Tra cứu toàn công ty · Chỉ xem, không chỉnh sửa · Điện thoại được che trong danh sách</p>
        </div>
        <Badge variant="secondary">{query.isLoading ? "Đang tải…" : total.toLocaleString("vi-VN") + " khách"}</Badge>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <div className="relative sm:col-span-2 xl:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input aria-label="Tìm tên hoặc mã khách hàng" className="pl-9" value={searchText}
            placeholder="Tên hoặc mã khách hàng…" onChange={(e) => setSearchText(e.target.value)} maxLength={150} />
        </div>
        <Pick label="Tất cả nhóm khách" value={group} onChange={(value) => { setGroup(value); setSegment(""); }}
          options={catalogs.filter((cat) => cat.kind === "group").map((cat) => ({ id: cat.id, name: cat.name }))} />
        <Pick label="Tất cả tệp khách" value={segment} onChange={setSegment}
          options={(group ? segmentOptions(catalogs, group) : catalogs.filter((cat) => cat.kind === "segment"))
            .map((cat) => ({ id: cat.id, name: cat.name }))} />
        <Pick label="Tất cả hồ sơ" value={archive} onChange={setArchive}
          options={[{ id: "all", name: "Tất cả hồ sơ" }, { id: "active", name: "Đang quản lý" },
            { id: "archived", name: "Đã lưu trữ" }]} />
      </div>

      {query.error && (
        <div role="alert" className="rounded-lg border border-destructive/40 p-3 text-sm text-destructive">
          {query.error.message} <Button variant="link" onClick={() => query.refetch()}>Thử lại</Button>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              {["Mã khách", "Tên khách hàng", "Số điện thoại", "Nhóm", "Tệp khách", "Phụ trách", "Trạng thái", "Chi tiết"].map((title) => (
                <th key={title} scope="col" className="px-3 py-3 text-left font-medium">{title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(query.data?.rows ?? []).map((customer) => (
              <tr key={customer.id} className="border-t hover:bg-muted/30">
                <td className="px-3 py-2 font-mono text-xs">{customer.code}</td>
                <td className="px-3 py-2 font-medium">{customer.name}</td>
                <td className="px-3 py-2 font-mono tabular-nums">{customer.phone_masked || "—"}</td>
                <td className="px-3 py-2">{nameOf(customer.group_id)}</td>
                <td className="px-3 py-2">{nameOf(customer.segment_id)}</td>
                <td className="px-3 py-2">{customer.owner_name || "—"}</td>
                <td className="px-3 py-2">{customer.archived_at ? "Đã lưu trữ" : "Đang quản lý"}</td>
                <td className="px-3 py-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setDetailId(customer.id)}>
                    <Eye className="mr-1.5 h-4 w-4" />Xem
                  </Button>
                </td>
              </tr>
            ))}
            {query.isLoading && <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Đang tải danh sách…</td></tr>}
            {!query.isLoading && !query.error && !query.data?.rows.length &&
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Không tìm thấy khách hàng phù hợp.</td></tr>}
          </tbody>
        </table>
      </div>
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-end gap-3 text-sm">
          <span>Trang {page} / {pageCount}</span>
          <Button variant="outline" size="sm" disabled={page === 1 || query.isFetching}
            onClick={() => setPage((p) => p - 1)}>Trước</Button>
          <Button variant="outline" size="sm" disabled={page >= pageCount || query.isFetching}
            onClick={() => setPage((p) => p + 1)}>Sau</Button>
        </div>
      )}
      {detailId && (
        <CrmModal title="Chi tiết khách hàng" onClose={() => setDetailId("")}>
          {detail.isLoading && <p className="text-sm text-muted-foreground">Đang tải chi tiết…</p>}
          {detail.error && <p role="alert" className="text-sm text-destructive">{detail.error.message}</p>}
          {detail.data && (
            <div className="space-y-3 text-sm">
              <div className="text-base font-semibold">{detail.data.name} <span className="text-sm font-normal text-muted-foreground">({detail.data.code})</span></div>
              <dl className="grid grid-cols-[minmax(115px,auto)_minmax(0,1fr)] gap-x-3 gap-y-2">
                {([
                  ["Số điện thoại", detail.data.phone], ["Email", detail.data.email],
                  ["Nhóm khách", nameOf(detail.data.group_id)], ["Tệp khách", nameOf(detail.data.segment_id)],
                  ["Ưu tiên", nameOf(detail.data.priority_id)], ["Nguồn", nameOf(detail.data.source_id)],
                  ["Phụ trách", detail.data.owner_name], ["Địa chỉ", detail.data.address],
                  ["Tên pháp lý", detail.data.legal_name], ["Mã số thuế", detail.data.tax_code],
                  ["Website", detail.data.website], ["Ghi chú", detail.data.note],
                  ["Ngày tạo", formatDate(detail.data.created_at)],
                ] as [string, string | null][]).map(([key, value]) => (
                  <div key={key} className="contents">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="min-w-0 break-words font-medium">{value || "—"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          <div className="flex justify-end"><Button variant="outline" onClick={() => setDetailId("")}><X className="mr-1 h-4 w-4" />Đóng</Button></div>
        </CrmModal>
      )}
    </section>
  );
}
