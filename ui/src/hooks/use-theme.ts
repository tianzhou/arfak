import { useCallback, useEffect, useSyncExternalStore } from 'react';

type Mode = 'light' | 'dark' | 'system';

type ColorTheme = 'neutral' | 'blue';

const STORAGE_KEY = 'arfak-appearance';

const VALID_MODES: Mode[] = ['light', 'dark', 'system'];
const VALID_COLORS: ColorTheme[] = ['neutral', 'blue'];
const THEME_CLASSES: ColorTheme[] = ['blue'];

interface Appearance {
  mode: Mode;
  color: ColorTheme;
}

function loadAppearance(): Appearance {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Appearance>;
      return {
        mode: VALID_MODES.includes(parsed.mode as Mode) ? (parsed.mode as Mode) : 'system',
        color: VALID_COLORS.includes(parsed.color as ColorTheme)
          ? (parsed.color as ColorTheme)
          : 'neutral',
      };
    }
  } catch {
    // localStorage unavailable or invalid JSON
  }
  return { mode: 'system', color: 'neutral' };
}

function saveAppearance(appearance: Appearance) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
  } catch {
    // localStorage unavailable
  }
}

function applyMode(mode: Mode) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = mode === 'dark' || (mode === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', dark);
}

function applyColor(color: ColorTheme) {
  const cl = document.documentElement.classList;
  for (const c of THEME_CLASSES) {
    cl.remove(`theme-${c}`);
  }
  if (color !== 'neutral') {
    cl.add(`theme-${color}`);
  }
}

let state: Appearance = loadAppearance();

const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function getSnapshot() {
  return state;
}
function notify() {
  for (const l of listeners) l();
}

export function useTheme() {
  const current = useSyncExternalStore(subscribe, getSnapshot, () => state);

  const setMode = useCallback((mode: Mode) => {
    state = { ...state, mode };
    saveAppearance(state);
    applyMode(mode);
    notify();
  }, []);

  const setColor = useCallback((color: ColorTheme) => {
    state = { ...state, color };
    saveAppearance(state);
    applyColor(color);
    notify();
  }, []);

  useEffect(() => {
    applyMode(current.mode);
    applyColor(current.color);

    if (current.mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyMode('system');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [current.mode, current.color]);

  return {
    mode: current.mode,
    setMode,
    colorTheme: current.color,
    setColor,
  } as const;
}

export type { ColorTheme, Mode };
