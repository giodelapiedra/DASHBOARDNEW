/**
 * Format a date to a readable string
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Generate a slug from a string
 * @param text Text to convert to slug
 * @returns Slug string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Truncate a string to a specified length
 * @param text Text to truncate
 * @param length Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Convert MongoDB document ID to string
 */
export function toStringId(id: string | { toString(): string } | null | undefined): string {
  if (!id) return '';
  return id.toString();
}

/**
 * Safe access to populated document properties
 */
export function getPopulatedField<T>(obj: Record<string, unknown>, field: string, defaultValue: T): T {
  if (!obj || obj[field] === undefined || obj[field] === null) {
    return defaultValue;
  }
  return obj[field] as T;
} 