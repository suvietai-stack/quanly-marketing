import { describe, it, expect } from "vitest";
import { liveState } from "./wf.server";

const now = Date.parse("2026-10-26T10:00:00Z");
describe("liveState", () => {
  it("pending với lease còn hạn là đang xử lý", () => {
    expect(liveState({ status: "pending", received_at: "2026-10-26T09:59:00Z", lease_until: "2026-10-26T10:01:00Z" }, now)).toBe("processing");
  });
  it("pending có lease đã hết hạn là quá hạn xử lý", () => {
    expect(liveState({ status: "pending", received_at: "2026-10-26T09:43:47Z", lease_until: "2026-10-26T09:45:47Z" }, now)).toBe("stuck");
  });
  it("failed còn lượt là chờ thử lại, hết 10 lượt là cần can thiệp", () => {
    expect(liveState({ status: "failed", received_at: "2026-10-26T09:00:00Z", attempts: 3 }, now)).toBe("retry_wait");
    expect(liveState({ status: "failed", received_at: "2026-10-26T09:00:00Z", attempts: 10 }, now)).toBe("needs_action");
  });
  it("có signal_id là thành công", () => {
    expect(liveState({ status: "pending", received_at: "2026-10-26T09:00:00Z", signal_id: "x" }, now)).toBe("success");
  });
});
