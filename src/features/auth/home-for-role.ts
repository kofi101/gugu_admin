import type { Role } from '@/lib/types';

export function homeForRole(role: Role): string {
  if (role === 'admin') return '/admin';
  if (role === 'merchant') return '/merchant';
  return '/no-access';
}

/** Only same-origin paths inside the role's own area are honoured. */
export function safeNext(next: string | null, role: Role): string {
  const home = homeForRole(role);
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return home;
  if (role === 'admin' && next.startsWith('/admin')) return next;
  if (role === 'merchant' && next.startsWith('/merchant')) return next;
  return home;
}
