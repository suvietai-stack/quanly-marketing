import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Unit/database tests do not use Start's production server-function transform.
export default defineConfig({ resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } } });