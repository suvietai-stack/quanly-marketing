import type { MouseEvent, KeyboardEvent } from "react";

/** Explicit opt-out also covers future controls with their own handlers. */
export const SIGNAL_INTERACTIVE_SELECTOR = 'a, button, input, select, textarea, label, summary, [role="button"], [role="link"], [role="checkbox"], [role="menuitem"], [role="switch"], [role="combobox"], [role="slider"], [role="textbox"], [contenteditable]:not([contenteditable="false"]), [tabindex], [data-signal-interactive]';

function hasSelection(element: HTMLElement) {
  const selection = element.ownerDocument.getSelection();
  return !!selection && !selection.isCollapsed;
}

/** Keep native selection/copy, modified clicks and child actions untouched. */
export function signalSurfaceClick(open: () => void) {
  return (event: MouseEvent<HTMLElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || hasSelection(event.currentTarget)) return;
    const target = event.target;
    if (!(target instanceof Element) || target.closest(SIGNAL_INTERACTIVE_SELECTOR)) return;
    open();
  };
}

export function signalNameClick(open: () => void) {
  return (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || hasSelection(event.currentTarget)) return;
    open();
  };
}

export function signalNameKeyDown(open: () => void) {
  return (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget || event.defaultPrevented || event.repeat || !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    open();
  };
}