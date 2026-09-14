export const PRIVACY_SAFE_ROOT_ERROR_HANDLERS = Object.freeze({
  onCaughtError: (error: unknown) => { void error; },
  onUncaughtError: (error: unknown) => { void error; },
  onRecoverableError: (error: unknown) => { void error; },
});
