import { expect, it } from "vitest";
import locations from "./locations.json";
it("uses the 34-province two-tier baseline and valid dependent ward codes", () => {
  expect(locations.provinces).toHaveLength(34);
  expect(locations.wards).toHaveLength(3321);
  expect(new Set(locations.provinces.map((p) => p.code)).size).toBe(34);
  expect(new Set(locations.wards.map((p) => p.code)).size).toBe(3321);
  expect(
    locations.wards.every((w) => locations.provinces.some((p) => p.code === w.province_code)),
  ).toBe(true);
  expect(locations.provinces.find((p) => p.code === "01")?.name).toBe("Thành phố Hà Nội");
  expect(locations.provinces.find((p) => p.code === "75")?.name).toBe("Tỉnh Đồng Nai");
});
