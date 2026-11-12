# Candidate checksum verification (read-only, 12/11/2026 07:42 UTC)
- File on disk = HEAD = 9611e9a9: 8736 bytes, 8722 chars, UTF-8, LF only (0 CR), starts "-- ", ends ";\n".
- sha256sum (byte-level) = 6acee6d6a91a55c035811c5342c30fba38608fc03749f2609f1cd38579ffba25 (matches approved).
- Same file minus final trailing "\n" (8735 bytes / 8721 chars) = 183ce57aff009af62f345aad5699cb4bf77abcabda1d29e6034d4323c52cde9d — exactly the independent hash; the reader stripped the trailing newline.
- 796cf228 version = 331ad3a8… (old superseded candidate, not approved).
- rollback.sql sha256 = b2a675a4eb782ffd9b933f4141efacc2bc683213e0c99d867c3eda3d17b4327f (matches report).
- Apply must submit full file bytes including the final newline; SQL semantics are identical either way, but approval is bound to 6acee6d6.
- No SQL/DDL/migration executed.
