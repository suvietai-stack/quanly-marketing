import { describe, expect, it } from "vitest";
import { validChipiSize, chipiChatDelay, nextChipiLine, chipiGreeting } from "./chipiChat";
describe("Chipi preferences and timing", () => {
  it.each([90,120,150,180])("allows chosen size %i", (size) => expect(validChipiSize(size)).toBe(size));
  it("defaults to large 150px", () => expect(validChipiSize(undefined)).toBe(150));
  it("starts chat no earlier than 60 minutes", () => expect(chipiChatDelay(0)).toBe(60*60000));
  it("caps chat delay at 120 minutes", () => expect(chipiChatDelay(1)).toBe(120*60000));
  it("never selects the previous line", () => expect(nextChipiLine(0, 0)).not.toBe(0));
  it("uses Vietnam morning even when UTC is night", () => expect(chipiGreeting(new Date("2026-10-27T01:00:00Z"))).toContain("buổi sáng"));
});