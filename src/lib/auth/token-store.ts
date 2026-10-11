type Listener = (token: string | null) => void;

let accessToken: string | null = null;
let expiresAt = 0;
const listeners = new Set<Listener>();

/** In-memory access token holder. The token is never persisted to storage. */
export const tokenStore = {
  get(): string | null {
    return accessToken;
  },
  set(token: string | null, expiresInSeconds?: number): void {
    accessToken = token;
    expiresAt = token && expiresInSeconds ? Date.now() + expiresInSeconds * 1000 : 0;
    for (const listener of listeners) listener(token);
  },
  clear(): void {
    tokenStore.set(null);
  },
  /** True when the token is missing or expires within `skewMs`. */
  isStale(skewMs = 30_000): boolean {
    return !accessToken || (expiresAt > 0 && Date.now() > expiresAt - skewMs);
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
