import React from 'react';
import {
  Clock,
  Timer as TimerIcon,
  TimerReset,
  CalendarDays,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
} from 'lucide-react';
import { SoundType, playSound } from '../utils/audio';

export type NavTab = 'clock' | 'timer' | 'stopwatch' | 'date-calculator';
export type ThemeMode = 'dark' | 'light' | 'oled';

interface HeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  soundType: SoundType;
  onChangeSoundType: (type: SoundType) => void;
  soundVolume: number;
  onChangeVolume: (vol: number) => void;
  theme: ThemeMode;
  onToggleTheme: (theme: ThemeMode) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  soundEnabled,
  onToggleSound,
  soundType,
  onChangeSoundType,
  soundVolume,
  onChangeVolume,
  theme,
  onToggleTheme,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const [showSoundMenu, setShowSoundMenu] = React.useState(false);
  const soundMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (soundMenuRef.current && !soundMenuRef.current.contains(event.target as Node)) {
        setShowSoundMenu(false);
      }
    }
    if (showSoundMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSoundMenu]);

  const navItems = [
    { id: 'clock' as NavTab, label: 'Clock & Date', icon: Clock },
    { id: 'timer' as NavTab, label: 'Countdown Timer', icon: TimerIcon },
    { id: 'stopwatch' as NavTab, label: 'Stopwatch', icon: TimerReset },
    { id: 'date-calculator' as NavTab, label: 'Date Calculator', icon: CalendarDays },
  ];

  const isLight = theme === 'light';

  return (
    <header
      className={`w-full border-b transition-colors duration-200 z-30 ${
        isLight
          ? 'bg-white/90 border-slate-200 text-slate-800'
          : theme === 'oled'
          ? 'bg-black border-neutral-900 text-neutral-100'
          : 'bg-slate-900/80 border-slate-800/80 text-slate-100 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('clock');
            }}
            className="flex items-center gap-2.5 font-bold tracking-tight text-lg group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                isLight ? 'bg-indigo-600' : 'bg-indigo-400'
              }`}
            />
            <span
              className={`transition-colors font-semibold ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Chronos
            </span>
          </a>
        </div>

        {/* Zone 2: Navigation Links / Segmented Control */}
        <nav
          aria-label="Application navigation"
          className={`flex items-center p-1 rounded-xl border transition-colors ${
            isLight
              ? 'bg-slate-100/90 border-slate-200/80'
              : theme === 'oled'
              ? 'bg-neutral-950 border-neutral-800'
              : 'bg-slate-950/60 border-slate-800/80'
          }`}
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isActive
                    ? isLight
                      ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                      : 'bg-slate-800/90 text-white shadow-xs font-semibold'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">{item.label}</span>
                <span className="md:hidden">
                  {item.id === 'clock'
                    ? 'Clock'
                    : item.id === 'timer'
                    ? 'Timer'
                    : item.id === 'stopwatch'
                    ? 'Stopwatch'
                    : 'Date'}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Sound, Theme, Fullscreen) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Sound Settings Dropdown */}
          <div className="relative" ref={soundMenuRef}>
            <button
              onClick={() => setShowSoundMenu(!showSoundMenu)}
              title={soundEnabled ? 'Sound options' : 'Sound muted'}
              className={`p-2 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  : theme === 'oled'
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {showSoundMenu && (
              <div
                className={`absolute right-0 mt-2 w-64 p-4 rounded-xl shadow-xl border z-50 transition-all ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
                    : 'bg-slate-900 border-slate-800 text-slate-200 shadow-black/60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Audio Alerts
                  </span>
                  <button
                    onClick={onToggleSound}
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      soundEnabled
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}
                  >
                    {soundEnabled ? 'Enabled' : 'Muted'}
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">Alert Melody</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['chime', 'digital', 'gong', 'soft'] as SoundType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            onChangeSoundType(type);
                            playSound(type, soundVolume);
                          }}
                          className={`px-2.5 py-1.5 text-xs rounded-md capitalize transition-colors text-left flex items-center justify-between border ${
                            soundType === type
                              ? isLight
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                                : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300 font-semibold'
                              : isLight
                              ? 'border-slate-200 hover:bg-slate-50 text-slate-600'
                              : 'border-slate-800 hover:bg-slate-800/60 text-slate-400'
                          }`}
                        >
                          <span>{type}</span>
                          <span className="text-[10px] opacity-60">▶</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Volume</span>
                      <span className="tabular-nums font-mono">{Math.round(soundVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={soundVolume}
                      onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme Selector Button */}
          <button
            onClick={() => {
              if (theme === 'dark') onToggleTheme('oled');
              else if (theme === 'oled') onToggleTheme('light');
              else onToggleTheme('dark');
            }}
            title={`Current theme: ${theme}. Click to switch.`}
            className={`p-2 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                : theme === 'oled'
                ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : theme === 'oled' ? (
              <div className="w-4 h-4 rounded-full border border-neutral-500 bg-black flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className={`p-2 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                : theme === 'oled'
                ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
