import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Bell,
  CheckCircle2,
  Maximize,
  Minimize,
  Sliders,
  Volume2,
} from 'lucide-react';
import { ThemeMode } from './Header';
import { SoundType, playSound } from '../utils/audio';

export interface TimerInstance {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isCompleted: boolean;
  createdAt: number;
}

const PRESETS = [
  { label: '1 min', seconds: 60 },
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '25 min (Pomo)', seconds: 1500 },
  { label: '30 min', seconds: 1800 },
  { label: '45 min', seconds: 2700 },
  { label: '1 hour', seconds: 3600 },
];

interface TimerViewProps {
  theme: ThemeMode;
  soundEnabled: boolean;
  soundType: SoundType;
  soundVolume: number;
}

export const TimerView: React.FC<TimerViewProps> = ({
  theme,
  soundEnabled,
  soundType,
  soundVolume,
}) => {
  // Primary active timer (Main focus display)
  const [hoursInput, setHoursInput] = useState<number>(0);
  const [minutesInput, setMinutesInput] = useState<number>(5);
  const [secondsInput, setSecondsInput] = useState<number>(0);
  const [labelInput, setLabelInput] = useState<string>('Focus Timer');

  // Timers list
  const [timers, setTimers] = useState<TimerInstance[]>(() => {
    return [
      {
        id: 'default-timer',
        label: 'Focus Timer',
        totalSeconds: 300,
        remainingSeconds: 300,
        isRunning: false,
        isCompleted: false,
        createdAt: Date.now(),
      },
    ];
  });

  const [activeTimerId, setActiveTimerId] = useState<string>('default-timer');
  const [isFocusModalOpen, setIsFocusModalOpen] = useState<boolean>(false);

  // Interval reference for counting down accurately
  const lastTickRef = useRef<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setTimers((prev) =>
        prev.map((timer) => {
          if (!timer.isRunning || timer.remainingSeconds <= 0) {
            return timer;
          }

          const nextRemaining = Math.max(0, timer.remainingSeconds - delta);

          // Did it just finish?
          if (nextRemaining === 0 && !timer.isCompleted) {
            if (soundEnabled) {
              playSound(soundType, soundVolume);
              // Repeat chime once after 1s for emphasis
              setTimeout(() => {
                if (soundEnabled) playSound(soundType, soundVolume);
              }, 1200);
            }
            return {
              ...timer,
              remainingSeconds: 0,
              isRunning: false,
              isCompleted: true,
            };
          }

          return {
            ...timer,
            remainingSeconds: nextRemaining,
          };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [soundEnabled, soundType, soundVolume]);

  const activeTimer =
    timers.find((t) => t.id === activeTimerId) || timers[0] || null;

  // Actions for active timer
  const togglePlayActive = () => {
    if (!activeTimer) return;
    lastTickRef.current = Date.now();

    // If completed, reset first
    if (activeTimer.isCompleted || activeTimer.remainingSeconds <= 0) {
      setTimers((prev) =>
        prev.map((t) =>
          t.id === activeTimer.id
            ? {
                ...t,
                remainingSeconds: t.totalSeconds,
                isRunning: true,
                isCompleted: false,
              }
            : t
        )
      );
    } else {
      setTimers((prev) =>
        prev.map((t) =>
          t.id === activeTimer.id ? { ...t, isRunning: !t.isRunning } : t
        )
      );
    }
  };

  const resetTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              remainingSeconds: t.totalSeconds,
              isRunning: false,
              isCompleted: false,
            }
          : t
      )
    );
  };

  const addTimeSeconds = (id: string, secs: number) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              totalSeconds: t.totalSeconds + secs,
              remainingSeconds: t.remainingSeconds + secs,
              isCompleted: false,
            }
          : t
      )
    );
  };

  const createTimerFromInputs = () => {
    const total = hoursInput * 3600 + minutesInput * 60 + secondsInput;
    if (total <= 0) return;

    const newTimer: TimerInstance = {
      id: `timer-${Date.now()}`,
      label: labelInput.trim() || 'Custom Timer',
      totalSeconds: total,
      remainingSeconds: total,
      isRunning: false,
      isCompleted: false,
      createdAt: Date.now(),
    };

    setTimers((prev) => [...prev, newTimer]);
    setActiveTimerId(newTimer.id);
  };

  const applyPreset = (seconds: number, label: string) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    setHoursInput(hours);
    setMinutesInput(mins);
    setSecondsInput(secs);
    setLabelInput(label);

    const newTimer: TimerInstance = {
      id: `timer-${Date.now()}`,
      label,
      totalSeconds: seconds,
      remainingSeconds: seconds,
      isRunning: true,
      isCompleted: false,
      createdAt: Date.now(),
    };
    lastTickRef.current = Date.now();
    setTimers((prev) => [...prev, newTimer]);
    setActiveTimerId(newTimer.id);
  };

  const deleteTimer = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (timers.length <= 1) {
      // Just reset the single timer
      resetTimer(id);
      return;
    }
    const filtered = timers.filter((t) => t.id !== id);
    setTimers(filtered);
    if (activeTimerId === id) {
      setActiveTimerId(filtered[0].id);
    }
  };

  const dismissCompleted = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    resetTimer(id);
  };

  // Time format calculations
  const formatTimerDigits = (totalSecs: number) => {
    const s = Math.ceil(totalSecs);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;

    const hStr = h.toString().padStart(2, '0');
    const mStr = m.toString().padStart(2, '0');
    const sStr = sec.toString().padStart(2, '0');

    if (h > 0) {
      return { main: `${hStr}:${mStr}:${sStr}`, showHours: true };
    }
    return { main: `${mStr}:${sStr}`, showHours: false };
  };

  const isLight = theme === 'light';
  const isOled = theme === 'oled';

  // SVG Circular progress math for the active timer
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = activeTimer
    ? activeTimer.totalSeconds > 0
      ? Math.max(0, Math.min(1, activeTimer.remainingSeconds / activeTimer.totalSeconds))
      : 0
    : 1;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Focal Anchor: Master Circular Timer Card */}
      {activeTimer && (
        <section
          className={`relative overflow-hidden rounded-2xl border p-6 sm:p-10 transition-colors ${
            isLight
              ? 'bg-white border-slate-200/90 shadow-xs'
              : isOled
              ? 'bg-black border-neutral-900'
              : 'bg-slate-900/60 border-slate-800/80 backdrop-blur-xs'
          } ${activeTimer.isCompleted ? 'ring-2 ring-emerald-500/50' : ''}`}
        >
          {/* Header row inside card */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {activeTimer.label}
              </span>
              {activeTimer.isCompleted && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-500">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Finished!
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsFocusModalOpen(true)}
                title="Fullscreen Focus Timer"
                className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  isLight
                    ? 'border-slate-200 hover:bg-slate-100 text-slate-600'
                    : 'border-slate-800 hover:bg-slate-800 text-slate-400'
                }`}
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-4">
            {/* SVG Circular Dial */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 320 320">
                {/* Background Ring */}
                <circle
                  cx="160"
                  cy="160"
                  r={radius}
                  className={`transition-colors ${
                    isLight ? 'stroke-slate-100' : 'stroke-slate-800/60'
                  }`}
                  strokeWidth="12"
                  fill="transparent"
                />
                {/* Animated Progress Ring */}
                <circle
                  cx="160"
                  cy="160"
                  r={radius}
                  className={`transition-all duration-300 ${
                    activeTimer.isCompleted
                      ? 'stroke-emerald-500'
                      : activeTimer.isRunning
                      ? 'stroke-indigo-500'
                      : 'stroke-indigo-400/60'
                  }`}
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Center Digital Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span
                  className={`font-mono text-5xl sm:text-6xl font-bold tabular-nums tracking-tight transition-colors ${
                    activeTimer.isCompleted
                      ? 'text-emerald-500 animate-pulse'
                      : isLight
                      ? 'text-slate-900'
                      : 'text-white'
                  }`}
                >
                  {formatTimerDigits(activeTimer.remainingSeconds).main}
                </span>

                <span className="text-xs font-medium text-slate-400 mt-1">
                  {activeTimer.isCompleted
                    ? 'Time Expired'
                    : activeTimer.isRunning
                    ? 'Counting Down'
                    : 'Paused / Ready'}
                </span>
              </div>
            </div>

            {/* Quick Time Adders while running (+1m, +5m) */}
            <div className="mt-6 flex items-center gap-2">
              <button
                onClick={() => addTimeSeconds(activeTimer.id, 60)}
                className={`px-3 py-1 rounded-lg border text-xs font-mono font-medium transition-colors ${
                  isLight
                    ? 'border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                +1 min
              </button>
              <button
                onClick={() => addTimeSeconds(activeTimer.id, 300)}
                className={`px-3 py-1 rounded-lg border text-xs font-mono font-medium transition-colors ${
                  isLight
                    ? 'border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                +5 min
              </button>
            </div>

            {/* Main Action Buttons (Zero Pill Discipline: Standard rectangular action buttons) */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={togglePlayActive}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-sm ${
                  activeTimer.isCompleted
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : activeTimer.isRunning
                    ? isLight
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {activeTimer.isCompleted ? (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Restart</span>
                  </>
                ) : activeTimer.isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start</span>
                  </>
                )}
              </button>

              <button
                onClick={() => resetTimer(activeTimer.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isLight
                    ? 'border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Grid: Quick Presets & Custom Timer Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Presets (5 cols) */}
        <section
          className={`lg:col-span-5 rounded-2xl border p-6 transition-colors ${
            isLight
              ? 'bg-white border-slate-200/90 shadow-xs'
              : isOled
              ? 'bg-black border-neutral-900'
              : 'bg-slate-900/60 border-slate-800/80 backdrop-blur-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Quick Presets
            </h3>
            <span className="text-xs text-slate-500">Tap to start instantly</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset.seconds, preset.label)}
                className={`p-3 rounded-xl border text-center font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 text-slate-800'
                    : 'bg-slate-950/50 border-slate-800 hover:bg-indigo-950/40 hover:border-indigo-500/40 text-slate-200'
                }`}
              >
                <span className="block text-sm font-semibold">{preset.label}</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {Math.floor(preset.seconds / 60)} min
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Custom Timer Input (7 cols) */}
        <section
          className={`lg:col-span-7 rounded-2xl border p-6 transition-colors ${
            isLight
              ? 'bg-white border-slate-200/90 shadow-xs'
              : isOled
              ? 'bg-black border-neutral-900'
              : 'bg-slate-900/60 border-slate-800/80 backdrop-blur-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Create Custom Timer
            </h3>
            <span className="text-xs text-slate-500">Hours : Minutes : Seconds</span>
          </div>

          <div className="space-y-4">
            {/* Timer Label Input */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Timer Label (Optional)
              </label>
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="e.g. Deep Work Sprint, Pasta, Exercise"
                className={`w-full px-3.5 py-2 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    : 'bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500'
                }`}
              />
            </div>

            {/* Time Number Pickers */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1 text-center font-medium">
                  Hours
                </label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={hoursInput}
                  onChange={(e) => setHoursInput(Math.max(0, parseInt(e.target.value) || 0))}
                  className={`w-full text-center py-2.5 text-lg font-mono font-bold rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-950/60 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 text-center font-medium">
                  Minutes
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutesInput}
                  onChange={(e) =>
                    setMinutesInput(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))
                  }
                  className={`w-full text-center py-2.5 text-lg font-mono font-bold rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-950/60 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 text-center font-medium">
                  Seconds
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={secondsInput}
                  onChange={(e) =>
                    setSecondsInput(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))
                  }
                  className={`w-full text-center py-2.5 text-lg font-mono font-bold rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-950/60 border-slate-800 text-slate-100'
                  }`}
                />
              </div>
            </div>

            <button
              onClick={createTimerFromInputs}
              disabled={hoursInput === 0 && minutesInput === 0 && secondsInput === 0}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add & Select Timer</span>
            </button>
          </div>
        </section>
      </div>

      {/* Concurrent Active Timers Shelf */}
      {timers.length > 1 && (
        <section
          className={`rounded-2xl border p-6 transition-colors ${
            isLight
              ? 'bg-white border-slate-200/90 shadow-xs'
              : isOled
              ? 'bg-black border-neutral-900'
              : 'bg-slate-900/60 border-slate-800/80 backdrop-blur-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Active Timers ({timers.length})
            </h3>
            <span className="text-xs text-slate-500">
              Switch or manage simultaneous running timers
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {timers.map((timer) => {
              const isSelected = timer.id === activeTimerId;
              const formatted = formatTimerDigits(timer.remainingSeconds);
              const progress =
                timer.totalSeconds > 0
                  ? (timer.remainingSeconds / timer.totalSeconds) * 100
                  : 0;

              return (
                <div
                  key={timer.id}
                  onClick={() => setActiveTimerId(timer.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? isLight
                        ? 'border-indigo-500 bg-indigo-50/40 shadow-xs'
                        : 'border-indigo-500 bg-indigo-950/30'
                      : isLight
                      ? 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">
                      {timer.label}
                    </span>
                    <button
                      onClick={(e) => deleteTimer(timer.id, e)}
                      title="Delete timer"
                      className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-baseline justify-between mb-2">
                    <span
                      className={`font-mono text-xl font-bold tabular-nums ${
                        timer.isCompleted
                          ? 'text-emerald-500'
                          : isLight
                          ? 'text-slate-900'
                          : 'text-white'
                      }`}
                    >
                      {formatted.main}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {timer.isCompleted
                        ? 'Done'
                        : timer.isRunning
                        ? 'Running'
                        : 'Paused'}
                    </span>
                  </div>

                  {/* Progress line */}
                  <div
                    className={`w-full h-1.5 rounded-full overflow-hidden ${
                      isLight ? 'bg-slate-200' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`h-full transition-all duration-300 ${
                        timer.isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Fullscreen Zen Mode Overlay */}
      {isFocusModalOpen && activeTimer && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
              {activeTimer.label}
            </span>
            <button
              onClick={() => setIsFocusModalOpen(false)}
              className="p-2 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-300"
            >
              <Minimize className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            <span
              className={`font-mono text-7xl sm:text-9xl md:text-[13rem] font-bold tabular-nums tracking-tighter ${
                activeTimer.isCompleted ? 'text-emerald-400 animate-pulse' : 'text-white'
              }`}
            >
              {formatTimerDigits(activeTimer.remainingSeconds).main}
            </span>
            <span className="text-sm sm:text-base text-slate-400 mt-4">
              {activeTimer.isCompleted
                ? 'Time is up!'
                : activeTimer.isRunning
                ? 'Focus session in progress'
                : 'Paused'}
            </span>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={togglePlayActive}
              className={`px-8 py-3 rounded-xl font-semibold text-base transition-colors ${
                activeTimer.isRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {activeTimer.isRunning ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={() => resetTimer(activeTimer.id)}
              className="px-6 py-3 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 text-base font-medium"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
