/**
 * Utility functions for local date handling in TaskFlow.
 * All date-only strings are YYYY-MM-DD format based on the user's local timezone.
 */

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return new Date(year, month, day);
}

export function formatDisplayDate(dateStr: string | null): string {
  if (!dateStr) return 'No due date';
  const d = parseLocalDate(dateStr);
  if (!d) return dateStr;
  
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = parseLocalDate(dateStr);
  if (!d) return dateStr;
  
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(isoStr: string | null): string {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '—';
  }
}

export function isDateToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return dateStr === getTodayString();
}

export function isDateOverdue(dateStr: string | null, status: string): boolean {
  if (!dateStr || status === 'done') return false;
  const today = getTodayString();
  return dateStr < today;
}

export function isDateWithinDays(dateStr: string | null, days: number): boolean {
  if (!dateStr) return false;
  const todayStr = getTodayString();
  if (dateStr < todayStr) return false;

  const targetDate = parseLocalDate(dateStr);
  const todayDate = parseLocalDate(todayStr);
  if (!targetDate || !todayDate) return false;

  const diffTime = targetDate.getTime() - todayDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
}

export function getDaysDifference(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const targetDate = parseLocalDate(dateStr);
  const todayDate = parseLocalDate(getTodayString());
  if (!targetDate || !todayDate) return null;

  const diffTime = targetDate.getTime() - todayDate.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function formatRelativeDueDate(dateStr: string | null, status: string): { label: string; tone: 'overdue' | 'today' | 'upcoming' | 'normal' } {
  if (!dateStr) return { label: 'No date', tone: 'normal' };
  if (status === 'done') {
    return { label: formatShortDate(dateStr), tone: 'normal' };
  }

  const days = getDaysDifference(dateStr);
  if (days === null) return { label: formatShortDate(dateStr), tone: 'normal' };

  if (days < 0) {
    const abs = Math.abs(days);
    return { label: `${abs}d overdue`, tone: 'overdue' };
  }
  if (days === 0) {
    return { label: 'Today', tone: 'today' };
  }
  if (days === 1) {
    return { label: 'Tomorrow', tone: 'upcoming' };
  }
  if (days <= 7) {
    return { label: `In ${days}d`, tone: 'upcoming' };
  }

  return { label: formatShortDate(dateStr), tone: 'normal' };
}
