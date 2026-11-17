/** Account-bound reviewer selection. Display names are historical/visual only. */
export interface ReviewerAccount {
  id: string;
  name: string;
  username?: string;
}

/** Legacy orders without reviewerId may resolve by name only when unambiguous. */
export function reviewerAccountId(
  accounts: ReadonlyArray<ReviewerAccount>,
  storedId?: string,
  storedName?: string,
): string | undefined {
  if (storedId) return storedId;
  if (!storedName) return undefined;
  const matches = accounts.filter(a => a.name === storedName || a.username === storedName);
  return matches.length === 1 ? matches[0].id : undefined;
}

export function reviewerIsAssignee(reviewerId?: string, assigneeId?: string, reviewerName?: string, assigneeName?: string) {
  if (reviewerId && assigneeId) return reviewerId === assigneeId;
  return !!reviewerName && !!assigneeName && reviewerName === assigneeName;
}
