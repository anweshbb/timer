import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Sun,
  Moon,
  Calendar as CalendarIcon,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  formatTime,
  getMonthMatrix,
  getDayOfYear,
  getDaysInYear,
  getIsoWeekNumber,
  isSameDay,
  calculateDateDiff,
} from '../utils/dateUtils';
import { ThemeMode } from './Header';

interface ClockViewProps {
  theme: ThemeMode;
}

interface WorldCity {
  city: string;
  country: string;
  timezone: string;
}

const DEFAULT_CITIES: WorldCity[] = [
  { city: 'London', country: 'United Kingdom', timezone: 'Europe/London' },
  { city: 'New York', country: 'United States', timezone: 'America/New_York' },
  { city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
  { city: 'Paris', country: 'France', timezone: 'Europe/Paris' },
  { city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney' },
  { city: 'San Francisco', country: 'United States', timezone: 'America/Los_Angeles' },
];

export const ClockView: React.FC<ClockViewProps> = ({ theme }) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [is24Hour, setIs24Hour] = useState<boolean>(false);
  const [showSeconds, setShowSeconds] = useState<boolean>(true);
  const [showMs, setShowMs] = useState<boolean>(false);
  const [ms, setMs] = useState<string>('00');
  const [copiedDate, setCopiedDate] = useState<boolean>(false);

  // Calendar State
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(new Date());

  // Clock Ticker
  useEffect(() => {
    let animId: number;
    const update = () => {
      const now = new Date();
      setCurrentTime(now);
      if (showMs) {
        setMs(Math.floor(now.getMilliseconds() / 10).toString().padStart(2, '0'));
      }
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [showMs]);

  const isLight = theme === 'light';
  const isOled = theme === 'oled';

  const { timeStr, period } = formatTime(currentTime, is24Hour, showSeconds);

  // Calculations for metadata
  const dayOfYear = getDayOfYear(currentTime);
  const totalDays = getDaysInYear(currentTime.getFullYear());
  const daysRemaining = totalDays - dayOfYear;
  const weekNumber = getIsoWeekNumber(currentTime);
  const yearProgressPercent = ((dayOfYear / totalDays) * 100).toFixed(1);

  // Full date string: "Sunday, September 27, 2026"
  const fullDateString = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Timezone and UTC
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const utcHours = currentTime.getUTCHours().toString().padStart(2, '0');
  const utcMinutes = currentTime.getUTCMinutes().toString().padStart(2, '0');
  const utcSeconds = currentTime.getUTCSeconds().toString().padStart(2, '0');
  const utcString = `${utcHours}:${utcMinutes}:${utcSeconds} UTC`;

  // Calendar handlers
  const prevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  const jumpToToday = () => {
    const today = new Date();
    setCalendarDate(today);
    setSelectedCalendarDate(today);
  };

  const monthMatrix = getMonthMatrix(calendarDate.getFullYear(), calendarDate.getMonth());
  const monthName = calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Selected date diff
  const selectedDiff = selectedCalendarDate
    ? calculateDateDiff(new Date(), selectedCalendarDate)
    : null;

  const handleCopyDate = () => {
    navigator.clipboard.writeText(`${fullDateString} - ${timeStr} ${period || ''} (${userTimezone})`);
    setCopiedDate(true);
    setTimeout(() => setCopiedDate(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Focal Anchor: Master Hero Clock */}
      <section
        className={`relative overflow-hidden rounded-2xl border p-6 sm:p-10 transition-colors ${
          isLight
            ? 'bg-white border-slate-200/90 shadow-xs'
            : isOled
            ? 'bg-black border-neutral-900'
            : 'bg-slate-900/60 border-slate-800/80 backdrop-blur-xs'
        }`}
      >
        {/* Subtle radial backdrop accent */}
        <div
          className={`pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            isLight ? 'bg-indigo-300' : 'bg-indigo-600'
          }`}
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Unboxed Metadata Header (Anti-Slop rule: Clean inline typography) */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
            <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long' })}</span>
            <span aria-hidden="true" className="opacity-40">·</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{fullDateString}</span>
            <span aria-hidden="true" className="opacity-40">·</span>
            <span>Week {weekNumber}</span>
          </div>

          {/* Giant Tabular Clock Display */}
          <div className="my-2 sm:my-4 flex items-baseline justify-center tracking-tight">
            <span
              className={`font-mono text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tabular-nums tracking-tighter transition-colors ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {timeStr}
            </span>

            {showMs && (
              <span className="font-mono text-2xl sm:text-4xl text-slate-400 dark:text-slate-500 font-medium tabular-nums ml-1">
                .{ms}
              </span>
            )}

            {!is24Hour && period && (
              <span
                className={`ml-3 sm:ml-4 font-mono text-lg sm:text-2xl lg:text-3xl font-semibold uppercase tracking-wider ${
                  period === 'AM'
                    ? 'text-amber-500/90 dark:text-amber-400'
                    : 'text-indigo-500/90 dark:text-indigo-400'
                }`}
              >
                {period}
              </span>
            )}
          </div>

          {/* Time & Format Controls (Segmented control) */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <div
              className={`flex items-center gap-1 p-1 rounded-lg border text-xs ${
                isLight
                  ? 'bg-slate-100 border-slate-200'
                  : isOled
                  ? 'bg-neutral-900 border-neutral-800'
                  : 'bg-slate-950/70 border-slate-800'
              }`}
            >
              <button
                onClick={() => setIs24Hour(false)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  !is24Hour
                    ? isLight
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                12-Hour
              </button>
              <button
                onClick={() => setIs24Hour(true)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  is24Hour
                    ? isLight
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                24-Hour
              </button>
            </div>

            <button
              onClick={() => setShowSeconds(!showSeconds)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                showSeconds
                  ? isLight
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-indigo-950/40 border-indigo-700/50 text-indigo-300'
                  : isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-600'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {showSeconds ? 'Seconds: On' : 'Seconds: Off'}
            </button>

            <button
              onClick={() => setShowMs(!showMs)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                showMs
                  ? isLight
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-indigo-950/40 border-indigo-700/50 text-indigo-300'
                  : isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-600'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {showMs ? 'Milliseconds: On' : 'Milliseconds: Off'}
            </button>

            <button
              onClick={handleCopyDate}
              title="Copy current time and date to clipboard"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                copiedDate
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {copiedDate ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedDate ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Year Progress Bar */}
          <div className="mt-8 w-full max-w-lg">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
              <span>Day {dayOfYear} of {totalDays}</span>
              <span className="font-mono tabular-nums">{yearProgressPercent}% of {currentTime.getFullYear()} elapsed</span>
              <span>{daysRemaining} days left</span>
            </div>
            <div
              className={`w-full h-2 rounded-full overflow-hidden ${
                isLight ? 'bg-slate-200' : 'bg-slate-800'
              }`}
            >
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-500"
                style={{ width: `${yearProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Timezone and UTC Info Footnote */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>{userTimezone}</span>
            </div>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{utcString}</span>
          </div>
        </div>
      </section>

      {/* Grid: Interactive Calendar & World Clocks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Interactive Month Calendar (5 cols on desktop) */}
        <section
          className={`lg:col-span-6 rounded-2xl border p-6 transition-colors ${
            isLight
              ? 'bg-white border-slate-200/90 shadow-xs'
              : isOled
              ? 'bg-black border-neutral-900'
              : 'bg-slate-900/60 border-slate-800/80 backdrop-blur-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-500" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {monthName}
              </h2>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={jumpToToday}
                className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                  isLight
                    ? 'border-slate-200 hover:bg-slate-100 text-slate-600'
                    : 'border-slate-800 hover:bg-slate-800 text-slate-300'
                }`}
              >
                Today
              </button>
              <button
                onClick={prevMonth}
                aria-label="Previous month"
                className={`p-1 rounded-md border transition-colors ${
                  isLight
                    ? 'border-slate-200 hover:bg-slate-100 text-slate-600'
                    : 'border-slate-800 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                aria-label="Next month"
                className={`p-1 rounded-md border transition-colors ${
                  isLight
                    ? 'border-slate-200 hover:bg-slate-100 text-slate-600'
                    : 'border-slate-800 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span className="text-indigo-400">Sa</span>
            <span className="text-indigo-400">Su</span>
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {monthMatrix.flatMap((week, weekIdx) =>
              week.map((day, dayIdx) => {
                const isSelected =
                  selectedCalendarDate && isSameDay(day.date, selectedCalendarDate);
                const isCurrentToday = isSameDay(day.date, new Date());

                return (
                  <button
                    key={`${weekIdx}-${dayIdx}`}
                    onClick={() => setSelectedCalendarDate(day.date)}
                    className={`h-9 w-full flex items-center justify-center rounded-lg text-xs font-mono tabular-nums transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : isCurrentToday
                        ? isLight
                          ? 'border border-indigo-500 font-bold text-indigo-700 bg-indigo-50/50'
                          : 'border border-indigo-400 font-bold text-indigo-300 bg-indigo-950/40'
                        : !day.isCurrentMonth
                        ? 'text-slate-400 dark:text-slate-600 hover:bg-slate-800/20'
                        : day.isWeekend
                        ? isLight
                          ? 'text-slate-800 hover:bg-slate-100 font-medium'
                          : 'text-slate-300 hover:bg-slate-800/60 font-medium'
                        : isLight
                        ? 'text-slate-700 hover:bg-slate-100'
                        : 'text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    {day.dayNumber}
                  </button>
                );
              })
            )}
          </div>

          {/* Selected Date Detail Banner */}
          {selectedCalendarDate && selectedDiff && (
            <div
              className={`mt-5 p-3 rounded-xl border text-xs flex items-center justify-between ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                  : 'bg-slate-950/40 border-slate-800/70 text-slate-300'
              }`}
            >
              <div>
                <span className="font-semibold block text-slate-900 dark:text-slate-100">
                  {selectedCalendarDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-slate-500">
                  {selectedDiff.totalDays === 0
                    ? 'Today'
                    : selectedDiff.isPast
                    ? `${selectedDiff.totalDays} day${selectedDiff.totalDays > 1 ? 's' : ''} ago`
                    : `In ${selectedDiff.totalDays} day${selectedDiff.totalDays > 1 ? 's' : ''}`}
                  {selectedDiff.totalDays > 0 && ` (${selectedDiff.businessDays} business days)`}
                </span>
              </div>

              <button
                onClick={() => setSelectedCalendarDate(new Date())}
                className="text-indigo-500 hover:text-indigo-400 text-xs font-medium"
              >
                Reset to today
              </button>
            </div>
          )}
        </section>

        {/* World Time Clocks (6 cols on desktop) */}
        <section
          className={`lg:col-span-6 rounded-2xl border p-6 transition-colors ${
            isLight
              ? 'bg-white border-slate-200/90 shadow-xs'
              : isOled
              ? 'bg-black border-neutral-900'
              : 'bg-slate-900/60 border-slate-800/80 backdrop-blur-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                World Clock
              </h2>
            </div>
            <span className="text-xs text-slate-500">Live major financial & tech hubs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEFAULT_CITIES.map((item) => {
              const { timeStr: cityTime, period: cityPeriod } = formatTime(
                currentTime,
                is24Hour,
                showSeconds,
                item.timezone
              );

              // Get hour in that city to determine day/night
              const cityDate = new Date(
                currentTime.toLocaleString('en-US', { timeZone: item.timezone })
              );
              const hour = cityDate.getHours();
              const isDaytime = hour >= 6 && hour < 19;

              // Calculate relative day/date
              const cityDateString = cityDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={item.city}
                  className={`p-3.5 rounded-xl border transition-colors ${
                    isLight
                      ? 'bg-slate-50/70 border-slate-200 hover:bg-slate-50'
                      : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {item.city}
                      </h3>
                      <p className="text-[11px] text-slate-500">{item.country}</p>
                    </div>
                    {isDaytime ? (
                      <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : (
                      <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
                    )}
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">{cityDateString}</span>
                    <div className="text-right">
                      <span className="font-mono text-base font-bold tabular-nums text-slate-800 dark:text-slate-100">
                        {cityTime}
                      </span>
                      {!is24Hour && cityPeriod && (
                        <span className="ml-1 font-mono text-[10px] text-slate-400 font-semibold">
                          {cityPeriod}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
