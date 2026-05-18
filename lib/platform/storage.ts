const STORAGE_PREFIX = "fingiendo-jugar:game";
const DEFAULT_SCOPE = "state";

export function getGameStorageKey(gameId: string, scope = DEFAULT_SCOPE) {
  return `${STORAGE_PREFIX}:${gameId}:${scope}`;
}

export function readGameStorage<T>(
  gameId: string,
  fallback: T,
  scope = DEFAULT_SCOPE,
) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(getGameStorageKey(gameId, scope));

  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

export function writeGameStorage<T>(
  gameId: string,
  value: T,
  scope = DEFAULT_SCOPE,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    getGameStorageKey(gameId, scope),
    JSON.stringify(value),
  );
}

export function clearGameStorage(gameId: string, scope = DEFAULT_SCOPE) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(getGameStorageKey(gameId, scope));
}
