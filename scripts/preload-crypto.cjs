// Polyfill globalThis.crypto for Node 18 — needed by serialize-javascript@7
// (transitively required by vite-plugin-pwa → workbox-build).
const { webcrypto } = require('node:crypto');
if (!globalThis.crypto) globalThis.crypto = webcrypto;
