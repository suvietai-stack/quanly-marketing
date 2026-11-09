"""Mock backend dùng chung cho các suite trình duyệt Tín hiệu (API phân trang signal_list_page/counts)."""
import json
from urllib.parse import urlparse, parse_qs

UID = '00000000-0000-0000-0000-000000000001'


def _filter_rows(rows, f, include_quick=True):
    items = list(rows)
    q = (f.get('q') or '').strip().lower()
    if q:
        items = [r for r in items if q in r['customer_name'].lower() or q in (r.get('phone') or '')]
    if include_quick:
        quick = f.get('quick') or 'all'
        if quick == 'unassigned':
            items = [r for r in items if not r.get('assigned_to')]
        elif quick != 'all':
            items = [r for r in items if r.get('status') == quick]
    if f.get('potential'):
        items = [r for r in items if r.get('potential') == f['potential']]
    if f.get('needGroup'):
        items = [r for r in items if f['needGroup'] in (r.get('need_groups') or ([r['need_group']] if r.get('need_group') else []))]
    if f.get('saleId'):
        items = [r for r in items if r.get('assigned_to') == f['saleId']]
    if f.get('source'):
        items = [r for r in items if r.get('source') == f['source']]
    if f.get('labelId'):
        items = [r for r in items if f['labelId'] in (r.get('label_ids') or [])]
    if f.get('cancelled'):
        items = [r for r in items if r.get('cancelled_at')]
    else:
        items = [r for r in items if not r.get('cancelled_at')]
    return items


def _rank(r):
    if not r.get('assigned_to'):
        return 0
    if r.get('status') == 'waiting':
        return 1
    if r.get('status') in ('won', 'lost') or r.get('cancelled_at'):
        return 6
    return r.get('list_work_priority', 5)


def _sort_rows(rows, sort):
    items = sorted(rows, key=lambda r: r['id'])
    if sort == 'newest':
        return sorted(items, key=lambda r: (r.get('detected_on') or '', r.get('created_at') or ''), reverse=True)
    if sort == 'oldest':
        return sorted(items, key=lambda r: (r.get('detected_on') or '', r.get('created_at') or ''))
    # work/priority và các kiểu còn lại: nhóm ưu tiên công việc rồi chờ lâu trước
    return sorted(items, key=lambda r: (_rank(r), r.get('list_wait_since') or '', r['id']))


def _counts(rows, f):
    items = _filter_rows(rows, f, include_quick=False)
    status = {'all': len(items), 'unassigned': len([r for r in items if not r.get('assigned_to')])}
    for r in items:
        if r.get('status'):
            status[r['status']] = status.get(r['status'], 0) + 1
    return dict(total=len(items), status=status, needs={'all': len(items)}, sales=[], creators=[],
                mine=dict(waiting=0, active=0, quoted=0, won=0))


def make_backend(rows, notes=None, labels=None, links=None, rpc=None, table=None):
    """rpc(path, payload) -> data hoặc (status, data); table(path) -> data cho bảng chưa khai báo."""

    async def backend(route):
        url = route.request.url
        path = urlparse(url).path.split('/rest/v1/')[-1]
        payload = route.request.post_data_json if route.request.method == 'POST' else None
        status = 200
        data = []
        if path == 'rpc/signal_list_page':
            p = payload or {}
            items = _sort_rows(_filter_rows(rows, p.get('_filter') or {}), p.get('_sort') or 'work')
            off = p.get('_offset') or 0
            data = {'rows': items[off:off + (p.get('_limit') or 30)]}
        elif path == 'rpc/signal_list_counts':
            data = _counts(rows, (payload or {}).get('_filter') or {})
        elif path == 'rpc/signal_change_token':
            data = 'mock-token'
        elif path == 'opportunity_signals':
            wanted = (parse_qs(urlparse(url).query).get('id') or [''])[0].replace('eq.', '')
            data = next((r for r in rows if r['id'] == wanted), None)
        elif path == 'opportunity_signal_notes':
            data = notes if notes is not None else []
        elif path == 'rpc/signal_note_count':
            data = len(notes or [])
        elif path == 'signal_labels':
            data = labels or []
        elif path == 'signal_label_links':
            wanted = (parse_qs(urlparse(url).query).get('signal_id') or [''])[0].replace('eq.', '')
            data = [l for l in (links or []) if not wanted or l.get('signal_id') == wanted]
        elif path == 'catalogs':
            data = None
        elif rpc and path.startswith('rpc/'):
            result = rpc(path, payload or {})
            if isinstance(result, tuple):
                status, data = result
            else:
                data = result
        elif table:
            data = table(path)
        await route.fulfill(status=status, content_type='application/json', body=json.dumps(data))

    return backend
