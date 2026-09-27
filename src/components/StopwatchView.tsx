import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Copy, Check, Trash2 } from 'lucide-react';
import { ThemeMode } from './Header';

interface LapRecord {
  lapNumber: number;
  lapDurationMs: number;
  totalElapsedMs: number;
}

interface StopwatchViewProps {
  theme: ThemeMode;
}

export const StopwatchView: React.FC<StopwatchViewProps> = ({ theme }) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [laps, setLaps] = useState<LapRecord[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  const startTimeRef = useRef<number>(0);
  const accumulatedMsRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now();
      const tick = () => {
        const now = performance.now();
        const delta = now - startTimeRef.current;
        setElapsedMs(accumulatedMsRef.current + delta);
        animFrameRef.current = requestAnimationFrame(tick);
      };
      animFrameRef.current = requestAnimationFrame(tick);
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    accumulatedMsRef.current = elapsedMs;
  };

  const handleReset = () => {
    setIsRunning(false);
    accumulatedMsRef.current = 0;
    setElapsedMs(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (!isRunning && elapsedMs === 0) return;

    const previousTotal = laps.length > 0 ? laps[0].totalElapsedMs : 0;
    const lapDuration = elapsedMs - previousTotal;

    const newLap: LapRecord = {
      lapNumber: laps.length + 1,
      lapDurationMs: lapDuration,
      totalElapsedMs: elapsedMs,
    };

    setLaps([newLap, ...laps]);
  };

  const formatMilliseconds = (msTotal: number) => {
    const totalCentis = Math.floor(msTotal / 10);
    const centis = totalCentis % 100;
    const totalSecs = Math.floor(totalCentis / 100);
    const secs = totalSecs % 60;
    const totalMins = Math.floor(totalSecs / 60);
    const mins = totalMins % 60;
    const hours = Math.floor(totalMins / 60);

    const hStr = hours.toString().padStart(2, '0');
    const mStr = mins.toString().padStart(2, '0');
    const sStr = secs.toString().padStart(2, '0');
    const cStr = centis.toString().padStart(2, '0');

    if (hours > 0) {
      return { main: `${hStr}:${mStr}:${sStr}`, centis: `.${cStr}`, hasHours: true };
    }
    return { main: `${mStr}:${sStr}`, centis: `.${cStr}`, hasHours: false };
  };

  const isLight = theme === 'light';
  const isOled = theme === 'oled';

  const { main, centis } = formatMilliseconds(elapsedMs);

  // Identify fastest and slowest laps
  let fastestLapNumber: number | null = null;
  let slowestLapNumber: number | null = null;

  if (laps.length >= 2) {
    let minTime = Infinity;
    let maxTime = -Infinity;
    for (const lap of laps) {
      if (lap.lapDurationMs < minTime) {
        minTime = lap.lapDurationMs;
        fastestLapNumber = lap.lapNumber;
      }
      if (lap.lapDurationMs > maxTime) {
        maxTime = lap.lapDurationMs;
        slowestLapNumber = lap.lapNumber;
      }
    }
  }

  const copyLaps = () => {
    if (laps.length === 0) return;
    const text = laps
      .map(
        (l) =>
          `Lap ${l.lapNumber}: ${formatMilliseconds(l.lapDurationMs).main}${formatMilliseconds(l.lapDurationMs).centis} (Total: ${formatMilliseconds(l.totalElapsedMs).main}${formatMilliseconds(l.totalElapsedMs).centis})`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Focal Anchor: Master Stopwatch Display */}
      <section
        className={`relative overflow-hidden rounded-2xl border p-6 sm:p-10 transition-colors ${
          isLight
            ? 'bg-white border-slate-200/90 shadow-xs'
            : isOled
            ? 'bg-black border-neutral-900'
            : 'bg-slate-900/60 border-slate-800/80 backdrop-blur-xs'
        }`}
      >
        <div className="flex flex-col items-center justify-center py-6 sm:py-10 text-center">
          {/* Subtitle Metadata */}
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Precision Stopwatch
          </span>

          {/* Huge Monospace Timer Display */}
          <div className="flex items-baseline justify-center tracking-tight">
            <span
              className={`font-mono text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tabular-nums tracking-tighter transition-colors ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {main}
            </span>
            <span className="font-mono text-2xl sm:text-4xl md:text-5xl text-indigo-500 font-semibold tabular-nums ml-1">
              {centis}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center gap-3">
            {isRunning ? (
              <button
                onClick={handlePause}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-sm"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{elapsedMs > 0 ? 'Resume' : 'Start'}</span>
              </button>
            )}

            <button
              onClick={handleLap}
              disabled={!isRunning && elapsedMs === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed ${
                isLight
                  ? 'border-slate-200 text-slate-700 hover:bg-slate-100'
                  : 'border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Flag className="w-4 h-4 text-indigo-400" />
              <span>Lap</span>
            </button>

            <button
              onClick={handleReset}
              disabled={elapsedMs === 0}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed ${
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

      {/* Lap Times Table */}
      {laps.length > 0 && (
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
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-indigo-500" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Recorded Laps ({laps.length})
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyLaps}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  copied
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : isLight
                    ? 'border-slate-200 hover:bg-slate-100 text-slate-600'
                    : 'border-slate-800 hover:bg-slate-800 text-slate-300'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy All'}</span>
              </button>
              <button
                onClick={() => setLaps([])}
                className={`p-1.5 rounded-lg border text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors ${
                  isLight ? 'border-slate-200 hover:bg-slate-100' : 'border-slate-800 hover:bg-slate-800'
                }`}
                title="Clear laps"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">Lap</th>
                  <th className="py-2.5 px-3">Split Time</th>
                  <th className="py-2.5 px-3 text-right">Total Time</th>
                  <th className="py-2.5 px-3 text-right">Analysis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {laps.map((lap) => {
                  const isFastest = lap.lapNumber === fastestLapNumber;
                  const isSlowest = lap.lapNumber === slowestLapNumber;
                  const lapFormatted = formatMilliseconds(lap.lapDurationMs);
                  const totalFormatted = formatMilliseconds(lap.totalElapsedMs);

                  return (
                    <tr
                      key={lap.lapNumber}
                      className={`transition-colors ${
                        isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-semibold text-slate-500">
                        #{lap.lapNumber.toString().padStart(2, '0')}
                      </td>
                      <td
                        className={`py-2.5 px-3 font-semibold tabular-nums ${
                          isFastest
                            ? 'text-emerald-500'
                            : isSlowest
                            ? 'text-amber-500'
                            : isLight
                            ? 'text-slate-800'
                            : 'text-slate-200'
                        }`}
                      >
                        {lapFormatted.main}
                        <span className="text-[11px] opacity-70">{lapFormatted.centis}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">
                        {totalFormatted.main}
                        <span className="text-[11px] opacity-70">{totalFormatted.centis}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        {isFastest && (
                          <span className="text-emerald-500 text-[11px] font-semibold">
                            Fastest
                          </span>
                        )}
                        {isSlowest && (
                          <span className="text-amber-500 text-[11px] font-semibold">
                            Slowest
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
