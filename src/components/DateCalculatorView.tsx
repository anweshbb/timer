import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Trash2,
  ArrowRight,
  Clock,
  Sparkles,
  CalendarCheck,
  CalendarPlus,
} from 'lucide-react';
import {
  calculateDateDiff,
  addSubtractDate,
  CountdownItem,
  getDefaultMilestones,
} from '../utils/dateUtils';
import { ThemeMode } from './Header';

interface DateCalculatorViewProps {
  theme: ThemeMode;
}

export const DateCalculatorView: React.FC<DateCalculatorViewProps> = ({ theme }) => {
  // Mode selection: 'between' | 'math' | 'milestones'
  const [subTab, setSubTab] = useState<'between' | 'math' | 'milestones'>('between');

  // SubTab 1: Between Dates
  const todayIso = new Date().toISOString().split('T')[0];
  const nextMonthIso = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [startDateStr, setStartDateStr] = useState<string>(todayIso);
  const [endDateStr, setEndDateStr] = useState<string>(nextMonthIso);

  // SubTab 2: Add / Subtract
  const [baseDateStr, setBaseDateStr] = useState<string>(todayIso);
  const [mathOperation, setMathOperation] = useState<'add' | 'subtract'>('add');
  const [mathAmount, setMathAmount] = useState<number>(30);
  const [mathUnit, setMathUnit] = useState<'days' | 'weeks' | 'months' | 'years'>('days');

  // SubTab 3: Milestones & Countdowns
  const [milestones, setMilestones] = useState<CountdownItem[]>(() => {
    try {
      const saved = localStorage.getItem('chronos_milestones');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return getDefaultMilestones(new Date());
  });

  const [newTitle, setNewTitle] = useState<string>('');
  const [newTargetDate, setNewTargetDate] = useState<string>(nextMonthIso);
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());

  // Save custom milestones
  useEffect(() => {
    try {
      localStorage.setItem('chronos_milestones', JSON.stringify(milestones));
    } catch {
      // ignore
    }
  }, [milestones]);

  // Live ticker for milestones
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isLight = theme === 'light';
  const isOled = theme === 'oled';

  // Calculate Date Diff
  const startD = new Date(startDateStr + 'T00:00:00');
  const endD = new Date(endDateStr + 'T00:00:00');
  const diffResult = calculateDateDiff(startD, endD);

  // Calculate Date Math
  const baseD = new Date(baseDateStr + 'T00:00:00');
  const calculatedDate = addSubtractDate(baseD, mathAmount, mathUnit, mathOperation);
  const calculatedDateFormatted = calculatedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const addCustomMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTargetDate) return;

    const newItem: CountdownItem = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      targetDate: new Date(newTargetDate + 'T00:00:00').toISOString(),
      isCustom: true,
    };

    setMilestones([newItem, ...milestones]);
    setNewTitle('');
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  // Milestone countdown breakdown
  const getMilestoneCountdown = (targetIso: string) => {
    const targetMs = new Date(targetIso).getTime();
    const diffMs = targetMs - nowTimestamp;
    const isPast = diffMs <= 0;
    const absMs = Math.abs(diffMs);

    const totalSeconds = Math.floor(absMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds, isPast };
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Sub-navigation Tabs (Segmented control) */}
      <div className="flex items-center justify-center">
        <div
          className={`flex items-center gap-1 p-1 rounded-xl border text-xs sm:text-sm font-medium ${
            isLight
              ? 'bg-slate-100 border-slate-200'
              : isOled
              ? 'bg-neutral-900 border-neutral-800'
              : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <button
            onClick={() => setSubTab('between')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              subTab === 'between'
                ? isLight
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Days Between Dates
          </button>
          <button
            onClick={() => setSubTab('math')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              subTab === 'math'
                ? isLight
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Add / Subtract Days
          </button>
          <button
            onClick={() => setSubTab('milestones')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              subTab === 'milestones'
                ? isLight
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Event Countdowns
          </button>
        </div>
      </div>

      {/* SubTab 1: Days Between Dates */}
      {subTab === 'between' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs (5 cols) */}
          <section
            className={`lg:col-span-5 rounded-2xl border p-6 transition-colors ${
              isLight
                ? 'bg-white border-slate-200/90 shadow-xs'
                : isOled
                ? 'bg-black border-neutral-900'
                : 'bg-slate-900/60 border-slate-800/80 backdrop-blur-xs'
            }`}
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Date Span Calculation
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Select two dates to calculate elapsed or remaining duration.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDateStr}
                  onChange={(e) => setStartDateStr(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-950/60 border-slate-800 text-slate-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setStartDateStr(todayIso)}
                  className="text-[11px] text-indigo-500 hover:text-indigo-400 mt-1"
                >
                  Set to Today
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDateStr}
                  onChange={(e) => setEndDateStr(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-950/60 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              {/* Quick Jump Buttons */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Quick End Date Jumps
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 7);
                      setEndDateStr(d.toISOString().split('T')[0]);
                    }}
                    className={`py-1.5 px-2 rounded-lg border font-medium transition-colors ${
                      isLight
                        ? 'border-slate-200 hover:bg-slate-100 text-slate-700'
                        : 'border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    +7 Days
                  </button>
                  <button
                    onClick={() => {
                      const d = new Date();
                      d.setMonth(d.getMonth() + 1);
                      setEndDateStr(d.toISOString().split('T')[0]);
                    }}
                    className={`py-1.5 px-2 rounded-lg border font-medium transition-colors ${
                      isLight
                        ? 'border-slate-200 hover:bg-slate-100 text-slate-700'
                        : 'border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    +1 Month
                  </button>
                  <button
                    onClick={() => {
                      const d = new Date();
                      d.setFullYear(d.getFullYear() + 1);
                      setEndDateStr(d.toISOString().split('T')[0]);
                    }}
                    className={`py-1.5 px-2 rounded-lg border font-medium transition-colors ${
                      isLight
                        ? 'border-slate-200 hover:bg-slate-100 text-slate-700'
                        : 'border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    +1 Year
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Results (7 cols) */}
          <section
            className={`lg:col-span-7 rounded-2xl border p-6 sm:p-8 transition-colors ${
              isLight
                ? 'bg-white border-slate-200/90 shadow-xs'
                : isOled
                ? 'bg-black border-neutral-900'
                : 'bg-slate-900/60 border-slate-800/80 backdrop-blur-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Duration Breakdown
              </h3>
              <span className="text-xs text-slate-400">
                {diffResult.isPast ? 'Elapsed time (Past)' : 'Remaining time (Future)'}
              </span>
            </div>

            {/* Main Total Days Highlight */}
            <div
              className={`p-6 rounded-xl border text-center mb-6 ${
                isLight
                  ? 'bg-indigo-50/50 border-indigo-100'
                  : 'bg-indigo-950/20 border-indigo-900/50'
              }`}
            >
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                Total Difference
              </span>
              <span className="font-mono text-5xl sm:text-6xl font-bold tabular-nums text-indigo-500">
                {diffResult.totalDays}
              </span>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-2">
                days {diffResult.isPast ? 'apart (in past)' : 'apart'}
              </span>
            </div>

            {/* Grid of detailed units */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div
                className={`p-3.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
                }`}
              >
                <span className="text-[11px] font-medium text-slate-400 block mb-1">
                  Business Days
                </span>
                <span className="font-mono text-xl font-bold tabular-nums text-slate-800 dark:text-slate-100">
                  {diffResult.businessDays}
                </span>
                <span className="text-[10px] text-slate-500 block">Mon – Fri only</span>
              </div>

              <div
                className={`p-3.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
                }`}
              >
                <span className="text-[11px] font-medium text-slate-400 block mb-1">
                  Weeks & Days
                </span>
                <span className="font-mono text-xl font-bold tabular-nums text-slate-800 dark:text-slate-100">
                  {diffResult.weeks}w {diffResult.days}d
                </span>
                <span className="text-[10px] text-slate-500 block">Calendar measure</span>
              </div>

              <div
                className={`p-3.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
                }`}
              >
                <span className="text-[11px] font-medium text-slate-400 block mb-1">
                  Total Hours
                </span>
                <span className="font-mono text-xl font-bold tabular-nums text-slate-800 dark:text-slate-100">
                  {diffResult.totalHours.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block">Exact duration</span>
              </div>
            </div>

            {/* Exact Year / Month / Day notation */}
            <div className="mt-5 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
              <span>Calendar Span:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {diffResult.years > 0 && `${diffResult.years} year${diffResult.years > 1 ? 's' : ''}, `}
                {diffResult.months > 0 && `${diffResult.months} month${diffResult.months > 1 ? 's' : ''}, `}
                {diffResult.days} day{diffResult.days !== 1 ? 's' : ''}
              </span>
            </div>
          </section>
        </div>
      )}

      {/* SubTab 2: Add or Subtract Time */}
      {subTab === 'math' && (
        <section
          className={`max-w-3xl mx-auto rounded-2xl border p-6 sm:p-10 transition-colors ${
            isLight
              ? 'bg-white border-slate-200/90 shadow-xs'
              : isOled
              ? 'bg-black border-neutral-900'
              : 'bg-slate-900/60 border-slate-800/80 backdrop-blur-xs'
          }`}
        >
          <div className="mb-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Add or Subtract from Date
            </h3>
            <p className="text-xs text-slate-500">
              Calculate future or past deadlines, expiration dates, or milestone dates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Base Date */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Starting Date
              </label>
              <input
                type="date"
                value={baseDateStr}
                onChange={(e) => setBaseDateStr(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-xl border font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900'
                    : 'bg-slate-950/60 border-slate-800 text-slate-100'
                }`}
              />
            </div>

            {/* Operation & Amount */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Operation & Amount
              </label>
              <div className="flex gap-1.5">
                <select
                  value={mathOperation}
                  onChange={(e) => setMathOperation(e.target.value as 'add' | 'subtract')}
                  className={`px-2.5 py-2 text-sm rounded-xl border font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-950/60 border-slate-800 text-slate-100'
                  }`}
                >
                  <option value="add">+ Add</option>
                  <option value="subtract">- Subtract</option>
                </select>

                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={mathAmount}
                  onChange={(e) => setMathAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className={`w-full text-center py-2 text-sm font-mono font-bold rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-950/60 border-slate-800 text-slate-100'
                  }`}
                />
              </div>
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Time Unit</label>
              <select
                value={mathUnit}
                onChange={(e) =>
                  setMathUnit(e.target.value as 'days' | 'weeks' | 'months' | 'years')
                }
                className={`w-full px-3 py-2 text-sm rounded-xl border capitalize font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900'
                    : 'bg-slate-950/60 border-slate-800 text-slate-100'
                }`}
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </div>

          {/* Target Result Banner */}
          <div
            className={`p-6 rounded-2xl border text-center ${
              isLight
                ? 'bg-indigo-50/60 border-indigo-100'
                : 'bg-indigo-950/30 border-indigo-900/40'
            }`}
          >
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-2">
              Calculated Result Date
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white block mb-1">
              {calculatedDateFormatted}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ISO: {calculatedDate.toISOString().split('T')[0]}
            </span>
          </div>
        </section>
      )}

      {/* SubTab 3: Milestones & Countdowns */}
      {subTab === 'milestones' && (
        <div className="space-y-8">
          {/* Create Custom Milestone form */}
          <section
            className={`rounded-2xl border p-6 transition-colors ${
              isLight
                ? 'bg-white border-slate-200/90 shadow-xs'
                : isOled
                ? 'bg-black border-neutral-900'
                : 'bg-slate-900/60 border-slate-800/80 backdrop-blur-xs'
            }`}
          >
            <form onSubmit={addCustomMilestone} className="flex flex-col sm:flex-row items-end gap-3">
              <div className="w-full sm:flex-1">
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Event / Milestone Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Summer Vacation, Product Launch, Exam, Birthday"
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      : 'bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500'
                  }`}
                />
              </div>

              <div className="w-full sm:w-56">
                <label className="block text-xs font-medium text-slate-400 mb-1">Target Date</label>
                <input
                  type="date"
                  required
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-950/60 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Track Event</span>
              </button>
            </form>
          </section>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestones.map((item) => {
              const countdown = getMilestoneCountdown(item.targetDate);
              const targetDateObj = new Date(item.targetDate);

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-colors ${
                    isLight
                      ? 'bg-white border-slate-200/90 shadow-xs'
                      : isOled
                      ? 'bg-neutral-950 border-neutral-900'
                      : 'bg-slate-900/60 border-slate-800/80 backdrop-blur-xs'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {targetDateObj.toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    {item.isCustom && (
                      <button
                        onClick={() => removeMilestone(item.id)}
                        className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                        title="Delete milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* 4 Unit Counters */}
                  <div className="grid grid-cols-4 gap-2 text-center my-3">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-950/60 border-slate-800/70'
                      }`}
                    >
                      <span className="font-mono text-2xl font-bold tabular-nums block text-slate-800 dark:text-slate-100">
                        {countdown.days}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Days</span>
                    </div>

                    <div
                      className={`p-2.5 rounded-xl border ${
                        isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-950/60 border-slate-800/70'
                      }`}
                    >
                      <span className="font-mono text-2xl font-bold tabular-nums block text-slate-800 dark:text-slate-100">
                        {countdown.hours.toString().padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Hours</span>
                    </div>

                    <div
                      className={`p-2.5 rounded-xl border ${
                        isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-950/60 border-slate-800/70'
                      }`}
                    >
                      <span className="font-mono text-2xl font-bold tabular-nums block text-slate-800 dark:text-slate-100">
                        {countdown.minutes.toString().padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Mins</span>
                    </div>

                    <div
                      className={`p-2.5 rounded-xl border ${
                        isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-950/60 border-slate-800/70'
                      }`}
                    >
                      <span className="font-mono text-2xl font-bold tabular-nums block text-indigo-500">
                        {countdown.seconds.toString().padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Secs</span>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-500">
                    {countdown.isPast ? 'Passed' : 'Remaining'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
