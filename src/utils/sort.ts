type SortOrder = 'asc' | 'desc';

export function sortBy<T>(
  array: T[],
  key: keyof T,
  order: SortOrder = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const valA = a[key];
    const valB = b[key];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return order === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    } else if (typeof valA === 'number' && typeof valB === 'number') {
      return order === 'asc' ? valA - valB : valB - valA;
    } else if (valA instanceof Date && valB instanceof Date) {
      return order === 'asc'
        ? valA.getTime() - valB.getTime()
        : valB.getTime() - valA.getTime();
    }

    return 0;
  });
}
