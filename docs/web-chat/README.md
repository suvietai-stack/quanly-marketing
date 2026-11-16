# Chat Web / Đốm AI

One WordPress plugin supports multiple sites, with a separate connection and persona per site. AI collects needs and a Vietnamese phone number supplied by the visitor. It does not close sales. A successful lead transaction publishes a summary and asks the visitor to wait for Sales. Subsequent messages do not create another signal. A staff takeover fences in-flight AI replies for that conversation; staff can respond or resume AI.

## Installation

1. Apply `supabase/migrations/20261115090000_web_chat.sql` to the existing Base database after the Website Forms migrations, then apply `supabase/migrations/20261116100000_web_chat_presence.sql` for visitor live status. Both are additive; do not rerun or drop existing tables. Normal database backup/PITR procedures apply.
2. Build and publish the GitHub source through the existing hosting workflow. The guest route must be available at `https://base.suviet.vn/api/public/web-chat/guest`.
3. Existing OpenAI credentials are reused server-side. No employee data search or internal knowledge retrieval is called by Web Chat.
4. An active integration manager (`wf_can_manage`, existing `integration.website_forms`) creates a website at `/web-chat`, chooses an existing Signal source, and configures its persona, style, goals and customer-approved knowledge. Copy the site ID and one-time connection key. Disabled by default.
5. Install the **1.5.0** package `public/downloads/suviet-base-chat.zip` in WordPress; enter ID/key in Settings → Base Chat. The configured hostname must exactly match the website (including www). Enable in both applications. Grant selected active employees site access from Base.
6. Verify customer send/AI reply, real lead creation, Đốm AI creator display, transcript link and takeover in a controlled conversation before using publicly.

## Data and authorization

Visitor capabilities are random 256-bit tokens, hashed and scoped per site on the server. WordPress retains the private connection key, proxies to one fixed HTTPS Base endpoint, and signs site/time/nonce/body. Nonces reject replay, request IDs deduplicate messages, and site/visitor/message rate limits bound intake. Chat tables and service RPCs are denied to anon/authenticated clients. Every staff server function checks active membership and manager or explicit site access.

Signals reuse the Website Forms completion transaction and existing signal notifications/assignment workflow. A distinct system creator ID `00000000-0000-0000-0000-00000000dc01` is displayed as **Đốm AI** in signal lists/details/reports; it is not a login or employee. The source and transcript remain separately identified. No existing staff account is renamed. No progress notes, sales ownership or statuses are fabricated.

## Visitor live status (Base Chat 1.5.0)

- Every browser tab gets its own ephemeral session. Signed guest requests mark a conversation as **Đang chat** when its chat panel is visible, **Đang xem website** when its tab remains visible but the panel is closed, or **Đã rời** after there is no active heartbeat for **45 seconds** (or after a best-effort leave signal). A different active tab keeps the visitor online.
- The plugin sends a heartbeat about every 15 seconds while browsing. Existing 10-second chat polling carries presence automatically; background tabs do not claim the visitor is watching the page. A browser closing or network loss may prevent final signals, so offline is an estimate, not a guaranteed exact departure time.
- Only existing conversations record presence; loading a page without opening chat does not create a phantom thread. Last seen time is retained for the conversation sessions, with stale individual tab records reclaimed after seven days.
- Base overview shows live badges, last seen when known, online/chat counters and a website-scoped presence filter. Staff authorization follows the same site-level access checks as conversation reads.
- Old 1.4.0 WordPress plugins continue messaging but cannot report presence. Install 1.5.0 on each website before relying on the online counters.

## Operational limits

Polling is 10 seconds for visitors and 5–10 seconds for staff while visible; latency is not instantaneous. Visitor polling recovers persisted pending turns, with up to three bounded AI attempts. If visitors close the widget, pending work resumes when opened; no scheduled worker is installed. Site-wide limit is 600 calls/minute; visitor 40/minute, new messages 12/minute. Lists show 100 recent conversations; transcripts cap at 500 messages, guest history at 100. Phone validation checks format and appearance in customer messages; it does not verify ownership or a Zalo account. Avatar upload accepts PNG/JPEG/WebP under 70 KB; approved knowledge is plain text capped at 30,000 characters. No attachments, voice or automated product scraping.

## Checks

`node --test tests/web-chat/*.test.mjs` executes model and PostgreSQL/PGlite behavior tests using the real Website Forms completion SQL, with only existing external network dispatch stubbed. CI also checks PHP syntax, deterministic ZIP, build and TypeScript. These tests do not claim a live WordPress/OpenAI deployment has been verified.

Disable a site or the WordPress plugin to stop intake while preserving records. Roll back frontend deployment without dropping chat data. Never restore the entire production database merely to remove this feature.
