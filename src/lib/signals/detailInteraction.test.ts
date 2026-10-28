import { afterEach, describe, expect, it, vi } from "vitest";
import type { MouseEvent, KeyboardEvent } from "react";
import { signalSurfaceClick, signalNameClick, signalNameKeyDown, SIGNAL_INTERACTIVE_SELECTOR } from "./detailInteraction";

class FakeElement {
  constructor(private interactive = false) {}
  closest(selector: string) { return selector === SIGNAL_INTERACTIVE_SELECTOR && this.interactive ? this : null; }
}
afterEach(() => vi.unstubAllGlobals());

function click({ interactive = false, selected = false, ...overrides } = {}) {
  vi.stubGlobal("Element", FakeElement);
  return {
    target: new FakeElement(interactive),
    currentTarget: { ownerDocument: { getSelection: () => ({ isCollapsed: !selected }) } },
    button: 0, defaultPrevented: false, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false,
    stopPropagation: vi.fn(), ...overrides,
  } as unknown as MouseEvent<HTMLElement>;
}

describe("signal detail navigation guards", () => {
  it("opens once from a passive surface", () => {
    const open = vi.fn(); signalSurfaceClick(open)(click()); expect(open).toHaveBeenCalledTimes(1);
  });
  it("leaves nested independent actions alone", () => {
    const open = vi.fn(); signalSurfaceClick(open)(click({ interactive: true })); expect(open).not.toHaveBeenCalled();
  });
  it("preserves selecting and copying text on both surface and name", () => {
    const open = vi.fn(); const event = click({ selected: true });
    signalSurfaceClick(open)(event); signalNameClick(open)(event); expect(open).not.toHaveBeenCalled();
  });
  it("does not open on prevented, modified or non-primary clicks", () => {
    const open = vi.fn();
    for (const overrides of [{ defaultPrevented: true }, { ctrlKey: true }, { metaKey: true }, { altKey: true }, { shiftKey: true }, { button: 1 }]) {
      const event = click(overrides); signalSurfaceClick(open)(event); signalNameClick(open)(event);
    }
    expect(open).not.toHaveBeenCalled();
  });
  it("name opens once and stops bubbling", () => {
    const open = vi.fn(); const event = click({ interactive: true });
    signalNameClick(open)(event); signalSurfaceClick(open)(event);
    expect(open).toHaveBeenCalledTimes(1); expect(event.stopPropagation).toHaveBeenCalledTimes(1);
  });
  it.each(["Enter", " "])("name keyboard %s opens once without native double activation", (key) => {
    const open = vi.fn(); const target = {};
    const event = { key, target, currentTarget: target, defaultPrevented: false, repeat: false, preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as KeyboardEvent<HTMLElement>;
    signalNameKeyDown(open)(event);
    expect(open).toHaveBeenCalledTimes(1); expect(event.preventDefault).toHaveBeenCalledTimes(1); expect(event.stopPropagation).toHaveBeenCalledTimes(1);
  });
  it("ignores other keys, repeats and descendant keyboard events", () => {
    const open = vi.fn(); const target = {};
    for (const overrides of [{ key: "Tab" }, { repeat: true }, { defaultPrevented: true }, { target: {} }]) {
      signalNameKeyDown(open)({ key: "Enter", target, currentTarget: target, ...overrides } as unknown as KeyboardEvent<HTMLElement>);
    }
    expect(open).not.toHaveBeenCalled();
  });
});