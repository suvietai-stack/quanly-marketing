# Minimal shared permission editor — NOT an expansion rollout

- One PermissionChecklist and PermissionToggle for all Role kinds and personal drafts; full authenticated catalog stays 510 keys / 24 modules.
- isGrantable(key, policy) does not accept a Role kind. It trusts the backend universal flag, or conservatively intersects existing readiness in old responses.
- Compatibility fallback retains current source-specific controls until separately approved backend changes. Removing that fallback now would disable existing legitimate controls. This is explicitly not full 510-key grant availability.
- Exactly one candidate replaces two function bodies: private.role_editor_validate and public.permission_editor_read. No schema, RLS, ACL, resolver, role, override, appointment, leave or history writes. Existing preview/save/audit remain authoritative; personal validator is unchanged because the twelve universal keys already pass it.
- Universal proven intersection: **12 existing keys; 0 newly activated keys**. Current policy exposes 43 keys, of which 15 are personal. Other **467 catalog keys are not published by this editor policy**, NOT proven to lack backend enforcement. No whole-catalog enforcement audit or new scope editor was performed.
- Candidate expresses the universal branch and readiness flag without changing any existing validation outcome. It intentionally does not expand source-scoped rights that existing resolvers would ignore.
- Baseline/owner/ACL guarded; snapshot and backup included. SHA256SUMS is authoritative. Owner must approve candidate separately; **NOT APPLIED**. Earlier broad work is superseded for this request.
- Desktop four draft toggle/preview/cancel flows passed with HTTP 200; no business save. Mobile draft still becomes read-only when searching, so mobile acceptance is FAIL and no mobile fix is claimed.
- Release: commit `335cf3f3`, production deployment core `c8852150-7425-4b64-9b57-a34a76cdac49`, HTTP 200 on https://base.suviet.vn/organization. Four production desktop preview/cancel requests HTTP 200, no page errors. 401 Base tests passed; build OK. SQL remains staged, not applied.

Candidate SHA256: `ac37b039d9711e0e9d4bd3b41cb626a5ab2ba8abc8d2759a0695ac48ea79ffbf`

Rollback SHA256: `33d0a69ed165ae3823aa39e2388ecb027f87005f7d4ab105088cbebd396dbd2e`