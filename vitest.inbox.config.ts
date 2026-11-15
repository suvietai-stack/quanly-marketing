import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
export default defineConfig({ resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } }, test: { environment: 'node', include: ['src/lib/inbox/*.test.ts', 'src/lib/fbLeads/pageDiscovery.test.ts', 'src/lib/fbLeads/webhook.test.ts'] } });
