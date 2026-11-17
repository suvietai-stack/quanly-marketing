import { expect, it } from 'vitest';
import { reviewerAccountId, reviewerIsAssignee } from './reviewer';

const staff = [
  { id: 'a', name: 'Người A', username: 'user.a' },
  { id: 'b', name: 'Người B', username: 'user.b' },
];

it('reviewer is always selected by stable ID when available', () => {
  expect(reviewerAccountId(staff, 'b', 'Người A')).toBe('b');
  expect(reviewerAccountId(staff, undefined, 'Người A')).toBe('a');
  expect(reviewerAccountId(staff, undefined, 'user.b')).toBe('b');
  expect(reviewerAccountId(staff, undefined, 'Người không tồn tại')).toBeUndefined();
});

it('never guesses duplicate legacy names', () => {
  expect(reviewerAccountId([...staff, { id: 'c', name: 'Người A' }], undefined, 'Người A')).toBeUndefined();
});

it('self approval compares IDs rather than names when both IDs exist', () => {
  expect(reviewerIsAssignee('a','a','Người A','Người B')).toBe(true);
  expect(reviewerIsAssignee('a','b','Trùng tên','Trùng tên')).toBe(false);
  expect(reviewerIsAssignee(undefined,undefined,'Người A','Người A')).toBe(true);
});
