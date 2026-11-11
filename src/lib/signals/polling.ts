/** Only an observed server token change may invalidate scoped list reads. */
export function observedSignalChange(previous: string | undefined, next: string | undefined): boolean {
  return previous !== undefined && next !== undefined && previous !== next;
}