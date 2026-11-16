import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, expect, it } from "vitest";
const db = new PGlite();
const candidate = readFileSync("docs/distribution-roles-2026-11-16/candidate.sql", "utf8");
const rollback = readFileSync("docs/distribution-roles-2026-11-16/rollback.sql", "utf8");
beforeAll(async () => {
  await db.exec(`CREATE SCHEMA private;
  CREATE TABLE app_roles(id text primary key,name text,description text,permissions text[],is_system boolean,catalog_state text,catalog_group text,role_kind text,role_code text,signal_scope_all boolean,signal_scope text[],catalog_generation int);
  CREATE TABLE org_units(id text,active boolean,kind text);
  INSERT INTO org_units VALUES('3df93c75-8a46-4c2f-bc09-7583aa672b52',true,'system');
  CREATE TABLE base_permission_catalog(key text);
  INSERT INTO base_permission_catalog SELECT unnest(ARRAY['att.create','att.view_own','k3.use','k3hub.use','k3hub.center','leave.create','leave.recall','leave.view_own']);
  CREATE TABLE org_position_roles(role_id text); CREATE TABLE org_position_slots(role_id text);
  CREATE TABLE base_title_role_links(role_id text); CREATE TABLE user_roles(role_id text); CREATE TABLE mkt_specialties(role_id text);
  CREATE TABLE audit(role_id text);
  CREATE FUNCTION private.grant_source_ready(text,text) RETURNS boolean LANGUAGE sql AS $$ SELECT EXISTS(SELECT 1 FROM base_permission_catalog WHERE key=$2) $$;
  CREATE FUNCTION private.role_editor_validate(text,text[],text[]) RETURNS void LANGUAGE plpgsql AS $$ BEGIN IF EXISTS(SELECT 1 FROM unnest($2) p WHERE NOT private.grant_source_ready($1,p)) THEN RAISE EXCEPTION 'unsupported'; END IF; END $$;
  CREATE FUNCTION private.record() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO audit VALUES(NEW.id); RETURN NEW; END $$;
  CREATE TRIGGER audit AFTER INSERT ON app_roles FOR EACH ROW EXECUTE FUNCTION private.record();
  INSERT INTO app_roles(id,name,permissions) VALUES('role-v2-sales-staff','Original Sales',ARRAY['order.approve']);`);
});
afterAll(() => db.close());
it("executes exact staged SQL: four catalog Roles, 7 staff keys and 8 manager keys; old Sales untouched", async () => {
  await db.exec(candidate);
  const rows = (
    await db.query<{ id: string; name: string; permissions: string[]; signal_scope_all: boolean }>(
      "select id,name,permissions,signal_scope_all from app_roles where id like $1 order by id",
      ["role-v2-distribution-%"],
    )
  ).rows;
  expect(rows.map((r) => r.name)).toEqual([
    "Giám đốc Kinh doanh Phân Phối",
    "Trưởng phòng Phân phối",
    "Nhân viên phân phối",
    "Trưởng nhóm Phân phối",
  ]);
  expect(rows.find((r) => r.id === "role-v2-distribution-staff")?.permissions).toEqual([
    "att.create",
    "att.view_own",
    "k3.use",
    "k3hub.use",
    "leave.create",
    "leave.recall",
    "leave.view_own",
  ]);
  expect(
    rows
      .filter((r) => r.id !== "role-v2-distribution-staff")
      .every((r) => r.permissions.length === 8 && r.permissions.includes("k3hub.center")),
  ).toBe(true);
  expect(
    rows.every(
      (r) =>
        !r.signal_scope_all &&
        !r.permissions.some((p) => /^(order|finance|biz|settings)\./.test(p)),
    ),
  ).toBe(true);
  expect(
    (
      await db.query<{ permissions: string[] }>("select permissions from app_roles where id=$1", [
        "role-v2-sales-staff",
      ])
    ).rows[0]?.permissions,
  ).toEqual(["order.approve"]);
  expect(
    (await db.query("select * from audit where role_id like $1", ["role-v2-distribution-%"])).rows,
  ).toHaveLength(4);
});
it("rerun retains administrator edits and does not add audit inserts", async () => {
  await db.exec(
    "update app_roles set permissions=ARRAY['k3hub.use'] where id='role-v2-distribution-staff'",
  );
  await db.exec(candidate);
  expect(
    (
      await db.query<{ permissions: string[] }>(
        "select permissions from app_roles where id='role-v2-distribution-staff'",
      )
    ).rows[0]?.permissions,
  ).toEqual(["k3hub.use"]);
  expect(
    (await db.query("select * from audit where role_id like $1", ["role-v2-distribution-%"])).rows,
  ).toHaveLength(4);
});
it("rollback refuses referenced Roles instead of removing position rights", async () => {
  await db.exec("insert into org_position_roles values('role-v2-distribution-head')");
  await expect(db.exec(rollback)).rejects.toThrow(/referenced/);
  await db.exec("ROLLBACK;");
  expect(
    (
      await db.query<{ catalog_state: string }>(
        "select catalog_state from app_roles where id='role-v2-distribution-head'",
      )
    ).rows[0]?.catalog_state,
  ).toBe("standard");
});
it("candidate fails closed on conflicting Role identity", async () => {
  await db.exec("update app_roles set name='Different' where id='role-v2-distribution-head'");
  await expect(db.exec(candidate)).rejects.toThrow(/Conflicting/);
  await db.exec("ROLLBACK;");
});
it("rollback refuses customized unreferenced Roles", async () => {
  await db.exec("delete from org_position_roles");
  await expect(db.exec(rollback)).rejects.toThrow(/Customized/);
  await db.exec("ROLLBACK;");
});
