type TimedFetchOptions = RequestInit & {
  /**
   * If provided, used as the label in logs; otherwise uses the URL.
   */
  label?: string;
};

/**
 * Dev-only wrapper around fetch that logs duration (and status) for quick perf verification.
 * In production it behaves exactly like fetch without extra logging.
 */
export async function timedFetch(
  input: RequestInfo | URL,
  init?: TimedFetchOptions
): Promise<Response> {
  const isDev =
    // Vite
    (typeof import.meta !== "undefined" && (import.meta as any).env?.DEV) ||
    // Fallback
    (typeof process !== "undefined" && process.env?.NODE_ENV === "development");

  if (!isDev) {
    // eslint-disable-next-line no-restricted-globals
    return fetch(input as any, init);
  }

  const label =
    init?.label ||
    (typeof input === "string"
      ? input
      : input instanceof URL
      ? input.toString()
      : "fetch");

  const start = typeof performance !== "undefined" ? performance.now() : Date.now();
  try {
    // eslint-disable-next-line no-restricted-globals
    const res = await fetch(input as any, init);
    const end = typeof performance !== "undefined" ? performance.now() : Date.now();
    const ms = Math.round(end - start);
    // Keep this log lightweight; easy to filter in console.
    console.log(`[timedFetch] ${ms}ms ${res.status} ${label}`);
    return res;
  } catch (err) {
    const end = typeof performance !== "undefined" ? performance.now() : Date.now();
    const ms = Math.round(end - start);
    console.log(`[timedFetch] ${ms}ms ERROR ${label}`);
    throw err;
  }
}


