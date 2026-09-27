/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header, NavTab, ThemeMode } from './components/Header';
import { ClockView } from './components/ClockView';
import { TimerView } from './components/TimerView';
import { StopwatchView } from './components/StopwatchView';
import { DateCalculatorView } from './components/DateCalculatorView';
import { SoundType } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('clock');
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('chronos_theme') as ThemeMode;
      if (saved && ['dark', 'light', 'oled'].includes(saved)) return saved;
    } catch {
      // ignore
    }
    return 'dark';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('chronos_sound_enabled');
      if (saved !== null) return saved === 'true';
    } catch {
      // ignore
    }
    return true;
  });

  const [soundType, setSoundType] = useState<SoundType>(() => {
    try {
      const saved = localStorage.getItem('chronos_sound_type') as SoundType;
      if (saved) return saved;
    } catch {
      // ignore
    }
    return 'chime';
  });

  const [soundVolume, setSoundVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('chronos_sound_vol');
      if (saved !== null) return parseFloat(saved);
    } catch {
      // ignore
    }
    return 0.8;
  });

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('chronos_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('chronos_sound_enabled', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('chronos_sound_type', soundType);
  }, [soundType]);

  useEffect(() => {
    localStorage.setItem('chronos_sound_vol', String(soundVolume));
  }, [soundVolume]);

  // Fullscreen tracking
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Error attempting to enable fullscreen:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.warn('Error attempting to exit fullscreen:', err);
        });
      }
    }
  }, []);

  // Keyboard shortcut navigation (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === '1') setActiveTab('clock');
      else if (e.key === '2') setActiveTab('timer');
      else if (e.key === '3') setActiveTab('stopwatch');
      else if (e.key === '4') setActiveTab('date-calculator');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isLight = theme === 'light';
  const isOled = theme === 'oled';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isLight
          ? 'bg-slate-50 text-slate-800'
          : isOled
          ? 'bg-black text-neutral-100'
          : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Top Bar Header Contract */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        soundType={soundType}
        onChangeSoundType={setSoundType}
        soundVolume={soundVolume}
        onChangeVolume={setSoundVolume}
        theme={theme}
        onToggleTheme={setTheme}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'clock' && <ClockView theme={theme} />}
        {activeTab === 'timer' && (
          <TimerView
            theme={theme}
            soundEnabled={soundEnabled}
            soundType={soundType}
            soundVolume={soundVolume}
          />
        )}
        {activeTab === 'stopwatch' && <StopwatchView theme={theme} />}
        {activeTab === 'date-calculator' && <DateCalculatorView theme={theme} />}
      </main>

      {/* Clean, Quiet Footer (Zero fake telemetry) */}
      <footer
        className={`w-full border-t py-4 text-xs transition-colors ${
          isLight
            ? 'border-slate-200 text-slate-500 bg-white/50'
            : isOled
            ? 'border-neutral-900 text-neutral-500 bg-black'
            : 'border-slate-800/80 text-slate-500 bg-slate-950/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span>Chronos Time & Date Suite</span>
            <span aria-hidden="true">·</span>
            <span>Tabular High-Precision Engine</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Keys 1–4 switch modes</span>
            <span aria-hidden="true">·</span>
            <span>Zero drift Web Audio & Animation Frame</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
