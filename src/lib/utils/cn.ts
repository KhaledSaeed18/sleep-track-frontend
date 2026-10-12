type ClassValue =
  string | number | false | null | undefined | ClassValue[] | Record<string, unknown>;

/** Joins class names, skipping falsy values. Accepts strings, arrays and `{ class: condition }` maps. */
export function cn(...values: ClassValue[]): string {
  const out: string[] = [];
  for (const value of values) {
    if (!value) continue;
    if (typeof value === 'string' || typeof value === 'number') {
      out.push(String(value));
    } else if (Array.isArray(value)) {
      const nested = cn(...value);
      if (nested) out.push(nested);
    } else {
      for (const [key, enabled] of Object.entries(value)) if (enabled) out.push(key);
    }
  }
  return out.join(' ');
}
