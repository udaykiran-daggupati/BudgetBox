export function getBackend(): string {
  const raw = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  return raw.replace(/\/+$/, '');
}