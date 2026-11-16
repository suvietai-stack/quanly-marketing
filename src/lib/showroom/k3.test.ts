import { describe, expect, it } from 'vitest';
import { showroomK3Summary, SHOWROOM_K3_LABELS, type ShowroomK3Member } from './k3';

const member = (state: ShowroomK3Member['state'], goals = 0, results = 0): ShowroomK3Member => ({
  user_id: state, full_name: state, store_id: 'hanoi',
  store_name: 'Showroom Hà Nội', position: 'Nhân viên Showroom',
  state, goals_count: goals, actions_count: 0, results_count: results,
  planned_at: null, summarized_at: null, confirmed_at: null, can_comment: false,
});

describe('showroom 3K read-only report presentation', () => {
  it('does not interpret missing entries as task completion', () => {
    expect(showroomK3Summary([member('none'), member('planned', 2),
      member('updated', 1, 1), member('confirmed', 2, 3)])).toEqual({
      total: 4, none: 1, active: 2, confirmed: 1, goals: 5, results: 4,
    });
  });
  it('keeps explicit result states and no fabricated completion', () => {
    expect(Object.keys(SHOWROOM_K3_LABELS)).toEqual(['none','planned','updated','confirmed']);
    expect(showroomK3Summary([])).toEqual({
      total: 0, none: 0, active: 0, confirmed: 0, goals: 0, results: 0,
    });
  });
});
