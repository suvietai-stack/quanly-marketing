# Release evidence
- Code commit: 9611e9a9; publish requested once, frontend compatible with unchanged live backend.
- 55/55 targeted tests passed; harness build OK. Authenticated localhost desktop/mobile navigation passed full510/24, single editor catalogGET, full effective only on explicit tab, no page errors/overflow. Fixtures passed mocked preview/save/readback and policy-error checks.
- Final live roles/assignments/slots/overrides/user_roles checksums EXACTLY match baseline in report.md; no DB/Role/history writes.
- 2026-11-12T07:33:27Z HTTPS base.suviet.vn/organization HTTP200, x-deployment-id `psr2.e65746b1-c281-466f-8191-54df6c3944bb.1795073606.9RxhNFbZU-Px2G93ivFsEDclxh13SXC5Dm1rFy_X12E`; Lovable URL302→same custom-domain path.
- Production authenticated read opened organization but Sources default assertion failed because old published UI still defaults to Effective. This is evidence of OLD release, not new-code failure. New deployment pending/unverified; no second publish requested.
- SQL candidate remains UNAPPLIED, sole exact SHA6acee6d6a91a55c035811c5342c30fba38608fc03749f2609f1cd38579ffba25. Three existing functions only; separate explicit approval required.
- Production root timeout and cold p95 target NOT claimed fixed/met; broad gen1 retirement and compact global auth/store reads remain blocked by native-scope reconcile + approved SQL.