import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { Catalog, ReadData, DetailData, Person, ReportData, Template } from "./types";
import type { DynamicFilter } from './fields';
export async function crmRpc<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.rpc(fn as never, args as never);
  if (error) throw new Error(error.message);
  return data as T;
}
export const catalogsQuery = (uid: string) =>
  queryOptions({
    queryKey: ["crm_catalogs", uid],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_catalogs")
        .select("*")
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return data as Catalog[];
    },
  });
export const crmReadQuery = (uid: string, mine = true, owner = "", search = "", archived = false, group='',segment='',priority='',filters:DynamicFilter[]=[]) =>
  queryOptions({
    queryKey: ["crm_read", uid, mine, owner, search, archived,group,segment,priority,filters],
    queryFn: () =>
      crmRpc<ReadData>("crm_read_dynamic", {
        _group:group||null,_segment:segment||null,_priority:priority||null,_filters:filters.filter(f=>f.id),
        _mine: mine,
        _owner: owner || null,
        _search: search,
        _archived: archived,
      }),
    staleTime: 60_000,
    refetchInterval: 120_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
export const crmDetailQuery = (uid: string, id: string) =>
  queryOptions({
    queryKey: ["crm_detail", uid, id],
    queryFn: () => crmRpc<DetailData>("crm_detail", { _id: id }),
    staleTime: 30_000,
    enabled: !!id,
  });
export const crmPeopleQuery = (uid: string) =>
  queryOptions({ queryKey: ["crm_people", uid], staleTime: 5 * 60_000, queryFn: () => crmRpc<Person[]>("crm_people") });
export const crmTemplatesQuery = (uid: string) =>
  queryOptions({
    queryKey: ["crm_templates", uid],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.from("crm_templates").select("*").order("name");
      if (error) throw error;
      return data as Template[];
    },
  });
export const crmReportQuery = (
  uid: string,
  start: string,
  end: string,
  mine: boolean,
  filters: Record<string, string>,
  dynamic:DynamicFilter[]=[],
) =>
  queryOptions({
    queryKey: ["crm_report", uid, start, end, mine, filters,dynamic],
    staleTime: 60_000,
    queryFn: () =>
      crmRpc<ReportData>("crm_report_dynamic", {
        _filters:dynamic.filter(f=>f.id),
        _start: start,
        _end: end,
        _mine: mine,
        _owner: filters.owner || null,
        _group: filters.group || null,
        _province: filters.province || null,
        _department: filters.department || null,
        _system: filters.system || null,
        _team: filters.team || null,
        _segment: filters.segment || null,
        _priority: filters.priority || null,
        _relationship: filters.relationship || null,
      }),
  });
export function useCrmMutation(fn: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => crmRpc<unknown>(fn, { _data: data }),
    onSuccess: async () => {
      await qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("crm_") });
      if (fn === "crm_access_save") await useAuth.getState().refreshBizAccess(true);
    },
  });
}
