#!/usr/bin/env bash
# Restore a Lovable Cloud database export (pg custom format) into an EMPTY
# Supabase project, then compare per-table row counts with the backup.
# Usage: restore.sh inspect|restore  (env: BACKUP_FILE, TARGET_DB_URL for restore)
set -euo pipefail
MODE="${1:-inspect}"
B="${BACKUP_FILE:?BACKUP_FILE required}"
WORK="$(mktemp -d)"

# Schemas Supabase creates and manages itself. App schemas are everything else.
MANAGED='^(auth|storage|realtime|_realtime|supabase_functions|supabase_migrations|extensions|graphql|graphql_public|vault|pgsodium|pgsodium_masks|net|cron|pgbouncer|_analytics|pg_catalog|information_schema|topology|tiger|tiger_data)$'
# Auth/storage/cron rows we carry over as data only.
# Sessions are not copied (everyone signs in again), so session-bound MFA rows
# (mfa_amr_claims, mfa_challenges) are skipped too.
AUTH_DATA='^(users|identities|mfa_factors)$'

pg_restore -l "$B" > "$WORK/toc.txt"
echo "== Backup TOC summary =="
grep -c ';' "$WORK/toc.txt" | sed 's/^/entries: /'
echo "-- schemas:"; awk '$4=="SCHEMA"{print $6}' "$WORK/toc.txt" | sort -u | tr '\n' ' '; echo
echo "-- extensions:"; awk '$4=="EXTENSION"{print $6}' "$WORK/toc.txt" | sort -u | tr '\n' ' '; echo

# Row counts straight from the COPY blocks of the backup (no server needed).
pg_restore --data-only -f - "$B" | awk '
  /^COPY /{t=$2; n=0; inblk=1; next}
  inblk && /^\\\.$/{print t"\t"n; inblk=0; next}
  inblk{n++}
' | sed 's/"//g' | sort > "$WORK/backup_counts.tsv"
echo "-- tables with data: $(wc -l < "$WORK/backup_counts.tsv"), rows total: $(awk -F'\t' '{s+=$2}END{print s}' "$WORK/backup_counts.tsv")"
echo "-- auth.users rows: $(awk -F'\t' '$1=="auth.users"{print $2}' "$WORK/backup_counts.tsv")"
echo "-- cron jobs: $(awk -F'\t' '$1=="cron.job"{print $2}' "$WORK/backup_counts.tsv")"
echo "-- storage objects (files are NOT in the backup): $(awk -F'\t' '$1=="storage.objects"{print $2}' "$WORK/backup_counts.tsv")"

[ "$MODE" = "inspect" ] && { cp "$WORK"/*.tsv "$WORK"/toc.txt "${OUT_DIR:-.}/" 2>/dev/null || true; exit 0; }

T="${TARGET_DB_URL:?TARGET_DB_URL required}"
q() { psql "$T" -v ON_ERROR_STOP=1 -At -c "$1"; }

echo "== Safety: target must be empty =="
N=$(q "select count(*) from pg_tables where schemaname='public'")
U=$(q "select count(*) from auth.users")
if [ "$N" != "0" ] || [ "$U" != "0" ]; then
  echo "Target is not empty (public tables=$N, auth.users=$U). Refusing to restore."; exit 1
fi

echo "== Extensions =="
for e in $(awk '$4=="EXTENSION"{print $6}' "$WORK/toc.txt" | sort -u); do
  case "$e" in plpgsql) continue;; esac
  if [ "$e" = "pg_cron" ] || [ "$e" = "pg_net" ]; then s=""; else s=" schema extensions"; fi
  q "create extension if not exists \"$e\"$s" || echo "WARN: extension $e not created"
done

# Build TOC lists with a parser that knows multi-word entry types.
python3 - "$WORK" "$MANAGED" "$AUTH_DATA" <<'PYEOF'
import re, sys
work, managed, auth_data = sys.argv[1], re.compile(sys.argv[2]), re.compile(sys.argv[3])
TYPES = sorted("""MATERIALIZED VIEW DATA|SEQUENCE OWNED BY|TABLE DATA|SEQUENCE SET|FK CONSTRAINT|DEFAULT ACL|MATERIALIZED VIEW|EVENT TRIGGER|ROW SECURITY|INDEX ATTACH|TABLE ATTACH|TEXT SEARCH CONFIGURATION|TEXT SEARCH DICTIONARY|LARGE OBJECT|BLOB METADATA|BLOBS|DATABASE PROPERTIES|ACL|AGGREGATE|CAST|COLLATION|COMMENT|CONSTRAINT|CONVERSION|DATABASE|DEFAULT|DOMAIN|ENCODING|EXTENSION|FOREIGN TABLE|FUNCTION|INDEX|OPERATOR|POLICY|PROCEDURE|PUBLICATION|PUBLICATION TABLE|RULE|SCHEMA|SEQUENCE|SERVER|STDSTRINGS|SEARCHPATH|STATISTICS|SUBSCRIPTION|TABLE|TRIGGER|TYPE|USER MAPPING|VIEW""".split("|"), key=len, reverse=True)
out = {k: [] for k in ("app", "auth_data", "storage_data", "late", "cron")}
for line in open(f"{work}/toc.txt"):
    if line.startswith(";") or not line.strip():
        continue
    m = re.match(r"^\d+;\s+\d+\s+\d+\s+(.*)$", line.rstrip("\n"))
    if not m:
        continue
    rest = m.group(1)
    typ = next((t for t in TYPES if rest.startswith(t + " ")), rest.split(" ")[0])
    toks = rest[len(typ):].split()
    schema = toks[0] if toks else "-"
    name = toks[1] if len(toks) > 1 else ""
    if typ in ("EXTENSION", "DATABASE", "DATABASE PROPERTIES", "ENCODING", "STDSTRINGS", "SEARCHPATH"):
        continue
    if typ == "COMMENT" and schema == "-" and name in ("EXTENSION", "SCHEMA"):
        continue
    if typ == "SCHEMA":
        if not managed.match(name) and name != "public":
            out["app"].append(line)
        continue
    if typ == "TABLE DATA" and schema == "auth" and auth_data.match(name):
        out["auth_data"].append(line); continue
    if typ == "TABLE DATA" and schema == "storage" and name == "buckets":
        out["storage_data"].append(line); continue
    if typ == "TABLE DATA" and schema == "cron" and name == "job":
        out["cron"].append(line); continue
    if (typ == "TRIGGER" and schema == "auth") or (typ == "POLICY" and schema == "storage"):
        out["late"].append(line); continue
    if schema == "-" or not managed.match(schema):
        out["app"].append(line)
# Auth tables keep their foreign keys, so parents must load first.
AUTH_ORDER = ["users", "identities", "mfa_factors"]
out["auth_data"].sort(key=lambda l: next((i for i, n in enumerate(AUTH_ORDER) if f" auth {n} " in l), 99))
for k, v in out.items():
    open(f"{work}/{k}.list", "w").writelines(v)
PYEOF
wc -l "$WORK"/*.list

# Replica mode: user triggers (audit, notification outbox, auth->profile) and FK
# checks do not fire while rows are copied, so nothing is duplicated or sent.
export PGOPTIONS="-c session_replication_role=replica"
echo "session_replication_role via this connection: $(q 'show session_replication_role' 2>&1)"
R() { pg_restore --no-owner --exit-on-error -d "$T" "$@" "$B"; }
echo "== 1/5 auth users (data only, before app triggers exist) =="
R --data-only -L "$WORK/auth_data.list"
echo "== 2/5 app schemas: structure, data, grants, RLS =="
pg_restore --no-owner -d "$T" -L "$WORK/app.list" "$B" 2> "$WORK/app_errors.log" || true
grep -E 'ERROR' "$WORK/app_errors.log" | sort | uniq -c | sort -rn | head -40 || true
echo "== 3/5 storage buckets =="
R --data-only -L "$WORK/storage_data.list" || echo "WARN: buckets restore failed"
echo "== 4/5 auth triggers + storage policies =="
pg_restore --no-owner -d "$T" -L "$WORK/late.list" "$B" 2>&1 | grep ERROR || true
echo "== 5/5 cron jobs =="
pg_restore --no-owner --data-only -d "$T" -L "$WORK/cron.list" "$B" 2>&1 | grep ERROR || echo "cron ok"

unset PGOPTIONS
echo "== Row count comparison =="
FAIL=0
while IFS=$'\t' read -r tbl n; do
  case "$tbl" in auth.*) [[ "${tbl#auth.}" =~ ${AUTH_DATA} ]] || continue;; storage.*) [ "$tbl" = "storage.buckets" ] || continue;; cron.*) [ "$tbl" = "cron.job" ] || continue;; supabase_*|realtime.*|vault.*|net.*|_*) continue;; esac
  s="${tbl%%.*}"; t="${tbl#*.}"
  m=$(q "select count(*) from \"$s\".\"$t\"" 2>/dev/null || echo "MISSING")
  if [ "$m" != "$n" ]; then echo "MISMATCH $tbl backup=$n target=$m"; FAIL=1; fi
done < "$WORK/backup_counts.tsv"
[ "$FAIL" = 0 ] && echo "ALL TABLE COUNTS MATCH" || { echo "Some tables differ, see above"; exit 2; }
