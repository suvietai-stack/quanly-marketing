import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

describe('CRM data-loading contract', () => {
  const source = readFileSync('src/lib/crm/queries.ts','utf8');
  it('does not poll the CRM customer list every minute', () => {
    expect(source).toContain('refetchInterval: 120_000');
    expect(source).toContain('refetchIntervalInBackground: false');
    expect(source).toContain('refetchOnWindowFocus: true');
    expect(source).not.toContain('refetchInterval: 60000');
  });
  it('caches employee, catalog and template lookups across repeated form mounts', () => {
    expect(source).toMatch(/queryKey: \["crm_people", uid\], staleTime: 5 \* 60_000/);
    expect(source).toMatch(/queryKey: \["crm_catalogs", uid\],\s*staleTime: 5 \* 60_000/);
    expect(source).toMatch(/queryKey: \["crm_templates", uid\],\s*staleTime: 5 \* 60_000/);
  });
  it('invalidates CRM data after successful saves instead of relying on polling', () => {
    expect(source).toContain("onSuccess: async () =>");
    expect(source).toContain('qc.invalidateQueries');
    expect(source).toContain('startsWith("crm_")');
    expect(source).toContain('crm_access_save');
  });
});
