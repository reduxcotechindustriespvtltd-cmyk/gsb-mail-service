const TTL_MS = 10 * 60 * 1000;
const seen = new Map<string, number>();

/**
 * In-memory-only dedupe (no persistence — this service has no database).
 * Protects against admin_crm accidentally firing the same event twice in
 * quick succession (e.g. a double-click before a button disables); does not
 * survive a service restart, which is an accepted gap at this volume.
 */
export function isDuplicateEvent(key: string): boolean {
  const now = Date.now();
  for (const [k, expiresAt] of seen) {
    if (expiresAt <= now) seen.delete(k);
  }

  if (seen.has(key)) return true;
  seen.set(key, now + TTL_MS);
  return false;
}
