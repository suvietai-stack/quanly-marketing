import { describe, expect, it } from "vitest";
import {
  ATT_PERM_CATEGORIES,
  ATT_PERSONAL_PERMS,
  LEAVE_PERM_CATEGORIES,
  LEAVE_PERSONAL_PERMS,
  categoryState,
  toggleCategory,
} from "./permCategories";

const cat = (list: typeof LEAVE_PERM_CATEGORIES, key: string) => list.find((c) => c.key === key)!;

describe("permCategories", () => {
  it("leave categories map to the exact granular permissions", () => {
    expect(cat(LEAVE_PERM_CATEGORIES, "create").perms).toEqual(["leave.create", "leave.create_for"]);
    expect(cat(LEAVE_PERM_CATEGORIES, "approve").perms).toEqual(["leave.view_assigned", "leave.approve"]);
    expect(cat(LEAVE_PERM_CATEGORIES, "settings").perms).toEqual(["leave.settings"]);
    expect(cat(LEAVE_PERM_CATEGORIES, "manage").perms).toContain("leave.view_all");
  });

  it("att categories map to the exact granular permissions", () => {
    expect(cat(ATT_PERM_CATEGORIES, "create").perms).toEqual(["att.create"]);
    expect(cat(ATT_PERM_CATEGORIES, "approve").perms).toEqual(["att.witness"]);
    expect(cat(ATT_PERM_CATEGORIES, "manage").perms).toEqual(["att.view_all", "att.reconcile", "att.report", "att.manage"]);
    expect(cat(ATT_PERM_CATEGORIES, "settings").perms).toEqual(["att.settings"]);
  });

  it("categoryState reports on/off/partial", () => {
    const c = cat(LEAVE_PERM_CATEGORIES, "create");
    expect(categoryState([], c)).toBe("off");
    expect(categoryState(["leave.create"], c)).toBe("partial");
    expect(categoryState(["leave.create", "leave.create_for"], c)).toBe("on");
  });

  it("toggling a category on preserves personal and unrelated permissions", () => {
    const before = ["leave.view_own", "leave.edit_own", "leave.recall", "att.create"];
    const after = toggleCategory(before, cat(LEAVE_PERM_CATEGORIES, "create"), true);
    for (const k of before) expect(after).toContain(k);
    expect(after).toContain("leave.create");
    expect(after).toContain("leave.create_for");
  });

  it("toggling a category off removes only that category's keys", () => {
    const before = ["leave.settings", "leave.view_own", "leave.create", "att.settings"];
    const after = toggleCategory(before, cat(LEAVE_PERM_CATEGORIES, "settings"), false);
    expect(after).not.toContain("leave.settings");
    expect(after).toContain("leave.view_own");
    expect(after).toContain("leave.create");
    expect(after).toContain("att.settings");
  });

  it("personal permission lists stay out of every category", () => {
    const allCat = [...LEAVE_PERM_CATEGORIES, ...ATT_PERM_CATEGORIES].flatMap((c) => c.perms);
    for (const k of [...LEAVE_PERSONAL_PERMS, ...ATT_PERSONAL_PERMS]) expect(allCat).not.toContain(k);
  });
});
