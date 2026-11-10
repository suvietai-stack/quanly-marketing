import { describe, expect, it } from 'vitest';
import { buildBizBlock } from '@/lib/orgChart';
import type { OrgData } from '@/lib/biz/organization';
import type { PositionsData } from '@/lib/biz/positions';

const org: OrgData = {
  systems: [{ id: 'sys1', name: 'Kinh doanh 1', active: true }],
  departments: [
    { id: 'dep1', system_id: 'sys1', name: 'Kinh doanh 1', active: true },
    { id: 'dep2', system_id: null, name: 'Phòng cũ', active: true },
  ],
  teams: [{ id: 'team1', department_id: 'dep1', name: 'Nhóm A', active: true }],
  members: [],
  team_members: [],
  managers: [],
  events: [],
} as unknown as OrgData;

const positions = { server_now: new Date().toISOString(), positions: [], appointments: [] } as unknown as PositionsData;
const nameOf = (id: string) => id;

describe('buildBizBlock — ngữ cảnh bổ nhiệm trên sơ đồ tổng', () => {
  const block = buildBizBlock(org, positions, nameOf);
  const sys = block.children.find(c => c.id === 'sys1')!;
  const dep = sys.children.find(c => c.id === 'dep1')!;
  const team = dep.children.find(c => c.id === 'team1')!;
  const legacyDep = block.children.find(c => c.id === 'dep2')!;

  it('giữ nguyên cấu trúc Hệ → Phòng → Nhóm và phòng chưa ánh xạ', () => {
    expect(block.name).toBe('Khối Kinh doanh');
    expect(sys.kind).toBe('system');
    expect(dep.kind).toBe('department');
    expect(team.kind).toBe('team');
    expect(legacyDep.name).toBe('Phòng cũ');
  });

  it('mỗi cấp mang đúng mã chức vụ quản lý', () => {
    expect(sys.leaderCode).toBe('director');
    expect(dep.leaderCode).toBe('department_head');
    expect(team.leaderCode).toBe('team_lead');
  });

  it('mỗi nút mang đủ định danh đơn vị để mở form bổ nhiệm đúng phạm vi', () => {
    expect(sys.biz).toEqual({ systemId: 'sys1' });
    expect(dep.biz).toEqual({ systemId: 'sys1', departmentId: 'dep1' });
    expect(team.biz).toEqual({ systemId: 'sys1', departmentId: 'dep1', teamId: 'team1' });
  });

  it('phòng chưa ánh xạ Hệ vẫn bổ nhiệm được theo phòng, không gán Hệ sai', () => {
    expect(legacyDep.biz).toEqual({ systemId: undefined, departmentId: 'dep2' });
  });
});
