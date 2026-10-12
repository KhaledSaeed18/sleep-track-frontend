import type { AuthResponse } from '@/types/models';

type AuthEventMap = {
  refreshed: AuthResponse;
  expired: undefined;
};

type Handler<K extends keyof AuthEventMap> = (payload: AuthEventMap[K]) => void;

const handlers: { [K in keyof AuthEventMap]: Set<Handler<K>> } = {
  refreshed: new Set(),
  expired: new Set(),
};

/** Tiny typed event bus that lets the HTTP layer notify the auth provider without importing React. */
export const authEvents = {
  on<K extends keyof AuthEventMap>(event: K, handler: Handler<K>): () => void {
    handlers[event].add(handler);
    return () => handlers[event].delete(handler);
  },
  emit<K extends keyof AuthEventMap>(event: K, payload: AuthEventMap[K]): void {
    for (const handler of handlers[event]) handler(payload);
  },
};
