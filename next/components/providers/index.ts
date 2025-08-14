// Re-export providers for better module resolution
export { default as AuthSessionProvider } from './session-provider';
export { default as ZustandProvider } from './zustand-provider';

// Default exports for backwards compatibility
import AuthSessionProviderDefault from './session-provider';
import ZustandProviderDefault from './zustand-provider';

export default {
  AuthSessionProvider: AuthSessionProviderDefault,
  ZustandProvider: ZustandProviderDefault,
};
