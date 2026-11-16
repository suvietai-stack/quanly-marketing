import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";
it("executes exact candidate, preserves shared Roles, audits five inserts and refuses changed rollback", async () => {
  const db = new PGlite();
  try {
    await db.exec(`CREATE SCHEMA private;
 CREATE TABLE app_roles(id text primary key,name text,description text,permissions text[],is_system boolean,catalog_state text,catalog_group text,role_kind text,role_code text,signal_scope_all boolean,signal_scope text[],catalog_generation int);
 CREATE TABLE org_units(id text,active boolean,kind text);
 INSERT INTO org_units VALUES('624e6e56-eeab-42d5-85af-6af284e72f34',true,'system');
 CREATE TABLE private.role_catalog_audit(role_id text,action text,reason text,after_data jsonb,created_at timestamptz default now());
 CREATE FUNCTION private.grant_source_ready(text,text) RETURNS boolean LANGUAGE sql AS $$ SELECT $2=ANY(ARRAY['att.create','att.view_own','k3.use','k3hub.use','k3hub.center','leave.create','leave.recall','leave.view_own','k3hub.biz','order.view_mine','order.create','oq.view_own','oq.create','signal.sale','biz.crm_use']) $$;
 CREATE FUNCTION private.role_editor_validate(text,text[],text[]) RETURNS void LANGUAGE plpgsql AS $$ BEGIN IF EXISTS(SELECT 1 FROM unnest($2) p WHERE NOT private.grant_source_ready($1,p)) THEN RAISE EXCEPTION 'unsafe'; END IF; END $$;
 CREATE TABLE base_permission_catalog(key text); INSERT INTO base_permission_catalog SELECT unnest(ARRAY['att.create','att.view_own','k3.use','k3hub.use','k3hub.center','leave.create','leave.recall','leave.view_own','k3hub.biz','order.view_mine','order.create','oq.view_own','oq.create','signal.sale','biz.crm_use']);
 CREATE FUNCTION private.record() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO private.role_catalog_audit(role_id,action,reason,after_data) VALUES(NEW.id,TG_OP,current_setting('app.role_reason',true),to_jsonb(NEW)); RETURN NEW; END $$;
 CREATE TRIGGER audit AFTER INSERT ON app_roles FOR EACH ROW EXECUTE FUNCTION private.record();
 CREATE TABLE org_position_roles(role_id text);CREATE TABLE org_position_slots(role_id text);CREATE TABLE base_title_role_links(role_id text);CREATE TABLE user_roles(role_id text);CREATE TABLE mkt_specialties(role_id text);
 INSERT INTO app_roles(id,name,permissions) VALUES('role-v2-sales-staff','Original',ARRAY['order.approve']),('role-v2-showroom-staff','Nhân viên Showroom',ARRAY['showroom.view']);`);
    const candidate = readFileSync("docs/org-centers-2026-11-16/candidate.sql", "utf8");
    const rollback = readFileSync("docs/org-centers-2026-11-16/rollback.sql", "utf8");
    await db.exec(candidate);
    expect(
      (
        await db.query("select * from private.role_catalog_audit where reason=$1", [
          "Năm Role vị trí B2B/BTC độc lập; không thay bổ nhiệm",
        ])
      ).rows,
    ).toHaveLength(5);
    expect(
      (
        await db.query<{ permissions: string[] }>(
          "select permissions from app_roles where id='role-v2-showroom-staff'",
        )
      ).rows[0]?.permissions,
    ).toEqual(["showroom.view"]);
    expect(
      (
        await db.query<{ permissions: string[] }>(
          "select permissions from app_roles where id='role-v2-b2b-staff'",
        )
      ).rows[0]?.permissions,
    ).toContain("order.create");
    expect(
      (
        await db.query<{ permissions: string[] }>(
          "select permissions from app_roles where id='role-v2-btc-director'",
        )
      ).rows[0]?.permissions,
    ).not.toContain("order.create");
    await db.exec(candidate);
    expect(
      (
        await db.query(
          "select * from private.role_catalog_audit where reason='Năm Role vị trí B2B/BTC độc lập; không thay bổ nhiệm'",
        )
      ).rows,
    ).toHaveLength(5);
    await db.exec("insert into org_position_roles values('role-v2-b2b-head')");
    await expect(db.exec(rollback)).rejects.toThrow(/Referenced/);
    await db.exec("ROLLBACK;");
    await db.exec(
      "delete from org_position_roles; update app_roles set name='Custom' where id='role-v2-b2b-head'",
    );
    await expect(db.exec(rollback)).rejects.toThrow(/customized/);
    await db.exec("ROLLBACK;");
  } finally {
    await db.close();
  }
});
