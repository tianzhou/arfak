import { useCallback, useEffect, useSyncExternalStore } from 'react';

type Mode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'arfak-mode';

const VALID_MODES: Mode[] = ['light', 'dark', 'system'];

function loadMode(): Mode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && VALID_MODES.includes(raw as Mode)) {
      return raw as Mode;
    }
  } catch {
    // localStorage unavailable
  }
  return 'system';
}

function saveMode(mode: Mode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // localStorage unavailable
  }
}

function applyMode(mode: Mode) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = mode === 'dark' || (mode === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', dark);
}

let state: Mode = loadMode();

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
  const mode = useSyncExternalStore(subscribe, getSnapshot, () => state);

  const setMode = useCallback((m: Mode) => {
    state = m;
    saveMode(m);
    applyMode(m);
    notify();
  }, []);

  useEffect(() => {
    applyMode(mode);

    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyMode('system');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [mode]);

  return { mode, setMode } as const;
}

export type { Mode };
