import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";
import { CENTER_ROLE_PRESETS } from "./centerRoleDefaults";

it("inserts only missing Roles with work-ready defaults and preserves existing Showroom rights", async () => {
  expect(CENTER_ROLE_PRESETS).toHaveLength(11);
  expect(new Set(CENTER_ROLE_PRESETS.map((r) => r.id)).size).toBe(11);
  const db = new PGlite();
  try {
    await db.exec(`CREATE SCHEMA private;
      CREATE TABLE app_roles(id text primary key,name text,description text,permissions text[] NOT NULL,is_system boolean,catalog_state text,catalog_group text,role_kind text,role_code text,signal_scope_all boolean,signal_scope text[],catalog_generation int);
      CREATE TABLE org_units(id text,kind text,active boolean);
      INSERT INTO org_units VALUES ('624e6e56-eeab-42d5-85af-6af284e72f34','system',true),('3df93c75-8a46-4c2f-bc09-7583aa672b52','system',true),('showroom-block','block',true);
      CREATE TABLE base_permission_catalog(key text primary key);
      CREATE FUNCTION private.grant_source_ready(text,text) RETURNS boolean LANGUAGE SQL AS $$ SELECT EXISTS(SELECT 1 FROM base_permission_catalog WHERE key=$2) $$;
      CREATE FUNCTION private.role_editor_validate(text,text[],text[]) RETURNS void LANGUAGE plpgsql AS $$ BEGIN IF EXISTS(SELECT 1 FROM unnest($2) p WHERE NOT private.grant_source_ready($1,p)) THEN RAISE EXCEPTION 'invalid permission'; END IF; END $$;
    `);
    for (const key of new Set(CENTER_ROLE_PRESETS.flatMap((r) => [...r.permissions])))
      await db.query("INSERT INTO base_permission_catalog(key) VALUES($1)", [key]);
    await db.exec("INSERT INTO app_roles(id,name,permissions,is_system,catalog_state,catalog_group,role_kind,role_code,catalog_generation,signal_scope_all) VALUES ('role-v2-showroom-staff','Nhân viên Showroom',ARRAY['showroom.view'],false,'standard','Showroom','position','role-v2-showroom-staff',2,false),('role-v2-showroom-manager','Cửa hàng trưởng',ARRAY['showroom.view'],false,'standard','Showroom','position','role-v2-showroom-manager',2,false)");
    const sql = readFileSync("docs/center-roles-2026-11-17/seed-missing-roles.sql", "utf8");
    await db.exec(sql);
    const rows = (await db.query<{ id:string;name:string;permissions:string[] }>("SELECT id,name,permissions FROM app_roles ORDER BY id")).rows;
    expect(rows).toHaveLength(11);
    for (const wanted of CENTER_ROLE_PRESETS) {
      const found = rows.find((x)=>x.id===wanted.id);
      expect(found?.name).toBe(wanted.name);
      if (wanted.id.startsWith("role-v2-showroom-")) expect(found?.permissions).toEqual(["showroom.view"]);
      else expect(new Set(found?.permissions)).toEqual(new Set(wanted.permissions));
    }
    await db.exec(sql);
    expect((await db.query("SELECT id FROM app_roles")).rows).toHaveLength(11);
    expect(rows.find(x=>x.id==="role-v2-b2b-staff")?.permissions).toContain("order.create");
    expect(rows.find(x=>x.id==="role-v2-distribution-staff")?.permissions).not.toContain("order.create");
    expect(rows.find(x=>x.id==="role-v2-btc-director")?.permissions).toContain("showroom.shift.view_all");
  } finally { await db.close(); }
});
