// Startup file for cPanel "Setup Node.js App" (Passenger) on AZDIGI hosting.
// Passenger requires a CommonJS entry; the Nitro node-server bundle is ESM,
// so load it with a dynamic import. Passenger hooks server.listen itself, so
// PORT/host do not need to be configured here.
import("./server/index.mjs").catch((err) => {
  console.error("[base] failed to start server bundle", err);
  process.exit(1);
});
