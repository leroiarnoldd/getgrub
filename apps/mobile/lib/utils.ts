import { formatInTimeZone } from 'date-fns-tz';

const UK_TZ = 'Europe/London';

export function formatUKDate(date: string | Date): string {
  return formatInTimeZone(new Date(date), UK_TZ, 'dd/MM/yyyy');
}

export function formatUKTime(date: string | Date): string {
  return formatInTimeZone(new Date(date), UK_TZ, 'HH:mm');
}

export function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export function getDayName(date?: Date): string {
  return (date || new Date()).toLocaleDateString('en-GB', { weekday: 'long' }).toLowerCase();
}

export function getTodayTime(): string {
  return new Date().toTimeString().slice(0, 5);
}

export function isDealValidNow(deal: {
  valid_days: string[];
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
}): boolean {
  if (!deal.is_active) return false;
  const today = getDayName();
  if (!deal.valid_days.includes(today)) return false;
  if (!deal.valid_from || !deal.valid_until) return true;
  const now = getTodayTime();
  return now >= deal.valid_from && now <= deal.valid_until;
}

export function formatDaysRange(days: string[]): string {
  const dayAbbr: Record<string, string> = {
    monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
    friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
  };
  return days.map(d => dayAbbr[d] || d).join('–');
}
