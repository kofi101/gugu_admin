import dayjs from 'dayjs';

export function formatDate(
  date?: string,
  format: string = 'DD MMM, YYYY'
): string {
  if (!date) return '';
  return dayjs(date).format(format);
}
