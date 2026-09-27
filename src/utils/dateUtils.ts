/**
 * Comprehensive Date & Time calculation utilities
 */

export interface MonthDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function getIsoWeekNumber(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

export function getMonthMatrix(year: number, month: number): MonthDay[][] {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const today = new Date();

  // Day of week: 0 is Sun, 1 is Mon... Adjust so Monday is index 0
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const matrix: MonthDay[][] = [];
  let currentWeek: MonthDay[] = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const d = new Date(year, month - 1, dayNum);
    const dayOfWeek = d.getDay();
    currentWeek.push({
      date: d,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: isSameDay(d, today),
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }

  // Current month days
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const d = new Date(year, month, day);
    const dayOfWeek = d.getDay();
    currentWeek.push({
      date: d,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: isSameDay(d, today),
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });

    if (currentWeek.length === 7) {
      matrix.push(currentWeek);
      currentWeek = [];
    }
  }

  // Next month leading days to complete the grid (up to 42 cells / 6 rows if needed)
  let nextMonthDay = 1;
  while (currentWeek.length > 0 && currentWeek.length < 7) {
    const d = new Date(year, month + 1, nextMonthDay);
    const dayOfWeek = d.getDay();
    currentWeek.push({
      date: d,
      dayNumber: nextMonthDay,
      isCurrentMonth: false,
      isToday: isSameDay(d, today),
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
    nextMonthDay++;
  }
  if (currentWeek.length === 7) {
    matrix.push(currentWeek);
  }

  return matrix;
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function formatTime(
  date: Date,
  format24h: boolean = false,
  showSeconds: boolean = true,
  timezone?: string
): { timeStr: string; period?: string; secondsStr?: string } {
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !format24h,
    timeZone: timezone,
  };

  if (showSeconds) {
    options.second = '2-digit';
  }

  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(date);

  let hour = '';
  let minute = '';
  let second = '';
  let dayPeriod = '';

  for (const part of parts) {
    if (part.type === 'hour') hour = part.value.padStart(2, '0');
    if (part.type === 'minute') minute = part.value;
    if (part.type === 'second') second = part.value;
    if (part.type === 'dayPeriod') dayPeriod = part.value.toUpperCase();
  }

  let timeStr = `${hour}:${minute}`;
  if (showSeconds && second) {
    timeStr += `:${second}`;
  }

  return {
    timeStr,
    period: format24h ? undefined : dayPeriod,
    secondsStr: second,
  };
}

export interface DateDiffResult {
  totalDays: number;
  businessDays: number;
  totalHours: number;
  years: number;
  months: number;
  weeks: number;
  days: number;
  isPast: boolean;
}

export function calculateDateDiff(startDate: Date, endDate: Date): DateDiffResult {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  const isPast = end.getTime() < start.getTime();
  const d1 = isPast ? end : start;
  const d2 = isPast ? start : end;

  const msDiff = d2.getTime() - d1.getTime();
  const totalDays = Math.round(msDiff / (1000 * 60 * 60 * 24));
  const totalHours = totalDays * 24;

  // Calculate business days (Monday-Friday)
  let businessDays = 0;
  const cur = new Date(d1.getTime());
  while (cur < d2) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) {
      businessDays++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  // Exact calendar difference (years, months, days)
  let years = d2.getFullYear() - d1.getFullYear();
  let months = d2.getMonth() - d1.getMonth();
  let days = d2.getDate() - d1.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(d2.getFullYear(), d2.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const weeks = Math.floor(totalDays / 7);
  const remDays = totalDays % 7;

  return {
    totalDays,
    businessDays,
    totalHours,
    years,
    months,
    weeks,
    days: remDays,
    isPast,
  };
}

export function addSubtractDate(
  baseDate: Date,
  amount: number,
  unit: 'days' | 'weeks' | 'months' | 'years',
  operation: 'add' | 'subtract'
): Date {
  const result = new Date(baseDate.getTime());
  const sign = operation === 'add' ? 1 : -1;
  const val = amount * sign;

  if (unit === 'days') {
    result.setDate(result.getDate() + val);
  } else if (unit === 'weeks') {
    result.setDate(result.getDate() + val * 7);
  } else if (unit === 'months') {
    result.setMonth(result.getMonth() + val);
  } else if (unit === 'years') {
    result.setFullYear(result.getFullYear() + val);
  }
  return result;
}

export interface CountdownItem {
  id: string;
  title: string;
  targetDate: string; // ISO string
  isCustom?: boolean;
}

export function getDefaultMilestones(now: Date): CountdownItem[] {
  const currentYear = now.getFullYear();
  const nextYear = currentYear + 1;

  // New Year
  const newYearDate = new Date(nextYear, 0, 1, 0, 0, 0);

  // End of current month
  const endOfMonth = new Date(currentYear, now.getMonth() + 1, 0, 23, 59, 59);

  // Summer Solstice approx June 21
  const summerSolsticeYear = now.getMonth() > 5 ? nextYear : currentYear;
  const summerSolstice = new Date(summerSolsticeYear, 5, 21, 0, 0, 0);

  // End of year
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

  return [
    {
      id: 'new-year',
      title: `New Year's Day ${nextYear}`,
      targetDate: newYearDate.toISOString(),
    },
    {
      id: 'end-of-month',
      title: `End of ${now.toLocaleDateString('en-US', { month: 'long' })}`,
      targetDate: endOfMonth.toISOString(),
    },
    {
      id: 'end-of-year',
      title: `End of ${currentYear}`,
      targetDate: endOfYear.toISOString(),
    },
    {
      id: 'summer-solstice',
      title: `Summer Solstice ${summerSolsticeYear}`,
      targetDate: summerSolstice.toISOString(),
    },
  ];
}
