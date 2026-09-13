/**
 * Versioned source-level privacy boundary for the zero-backend v0.1 browser app.
 *
 * Protected values may exist only in active JavaScript memory. This contract is
 * intentionally data-only: it neither observes nor receives personal values.
 * Runtime-source regression tests enforce the forbidden capabilities below.
 */
export const PRIVACY_CONTRACT_VERSION = 'inyeon-zero-retention-v1' as const;

export const PROTECTED_PERSONAL_DATA = Object.freeze([
  'birth-date',
  'birth-time-and-precision',
  'birthplace-and-coordinates',
  'time-zone-when-linked-to-a-person',
  'normalized-personal-chart-and-four-pillars',
  'derived-personal-chart-features',
  'private-pair-compatibility-evidence',
  'private-compatibility-narrative',
  'user-entered-someone-i-know-data',
] as const);

export const FORBIDDEN_RUNTIME_CAPABILITIES = Object.freeze([
  Object.freeze({ id: 'local-storage', capability: 'localStorage', rule: 'no-access' }),
  Object.freeze({ id: 'session-storage', capability: 'sessionStorage', rule: 'no-access' }),
  Object.freeze({ id: 'indexed-database', capability: 'indexedDB', rule: 'no-access' }),
  Object.freeze({ id: 'cache-api', capability: 'caches', rule: 'no-access' }),
  Object.freeze({ id: 'cookies', capability: 'document.cookie', rule: 'no-access' }),
  Object.freeze({ id: 'service-worker-registration', capability: 'navigator.serviceWorker.register', rule: 'no-call' }),
  Object.freeze({ id: 'beacon-egress', capability: 'navigator.sendBeacon', rule: 'no-call' }),
  Object.freeze({ id: 'fetch-egress', capability: 'fetch', rule: 'no-call' }),
  Object.freeze({ id: 'xhr-egress', capability: 'XMLHttpRequest', rule: 'no-construct-or-call' }),
  Object.freeze({ id: 'websocket-egress', capability: 'WebSocket', rule: 'no-construct-or-call' }),
  Object.freeze({ id: 'console-output', capability: 'console', rule: 'no-call' }),
  Object.freeze({ id: 'history-persistence', capability: 'history.pushState/replaceState', rule: 'no-call' }),
] as const);

/**
 * These local presentation paths do not authorize protected data in a share
 * payload. The sharing module separately enforces its closed, claim-free schema.
 */
export const ALLOWED_LOCAL_BROWSER_CAPABILITIES = Object.freeze([
  'native-web-share-with-validated-share-artifacts',
  'clipboard-with-validated-share-url',
  'canvas-rendering',
  'blob-and-short-lived-object-url-downloads',
  'dynamic-import-of-checked-in-static-assets',
] as const);

