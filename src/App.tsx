import { CheckIcon, MonitorIcon, MoonIcon, PaletteIcon, SunIcon } from 'lucide-react';
import { Route, Routes } from 'react-router';
import type { ColorTheme, Mode } from './hooks/use-theme.js';
import ChatPage from './chat/ChatPage.js';
import AppSidebar from './components/AppSidebar.js';
import { Button } from './components/ui/button.js';
import { Menu, MenuItem, MenuPopup, MenuSeparator, MenuTrigger } from './components/ui/menu.js';
import { SidebarInset, SidebarProvider } from './components/ui/sidebar.js';
import { useTheme } from './hooks/use-theme.js';

const COLOR_THEMES: { value: ColorTheme; label: string; swatch: string }[] = [
  { value: 'neutral', label: 'Neutral', swatch: 'bg-neutral-600' },
  { value: 'blue', label: 'Blue', swatch: 'bg-blue-600' },
];

const MODES: { value: Mode; label: string; icon: typeof SunIcon }[] = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'system', label: 'System', icon: MonitorIcon },
];

function ThemeToggle() {
  const { mode, setMode, colorTheme, setColor } = useTheme();

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button size="icon-sm" variant="ghost">
            <PaletteIcon />
          </Button>
        }
      />
      <MenuPopup align="end">
        {COLOR_THEMES.map((t) => (
          <MenuItem key={t.value} onClick={() => setColor(t.value)}>
            <span className={`size-3.5 shrink-0 rounded-full ${t.swatch}`} />
            {t.label}
            {colorTheme === t.value && <CheckIcon className="ml-auto size-3.5 opacity-60" />}
          </MenuItem>
        ))}
        <MenuSeparator />
        {MODES.map((m) => (
          <MenuItem key={m.value} onClick={() => setMode(m.value)}>
            <m.icon />
            {m.label}
            {mode === m.value && <CheckIcon className="ml-auto size-3.5 opacity-60" />}
          </MenuItem>
        ))}
      </MenuPopup>
    </Menu>
  );
}

function AppHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
      <span className="text-sm font-semibold">Arfak</span>
      <ThemeToggle />
    </header>
  );
}

export default function App() {
  return (
    <div className="relative isolate flex h-svh flex-col">
      <AppHeader />
      <SidebarProvider className="!min-h-0 flex-1">
        <AppSidebar />
        <SidebarInset>
          <Routes>
            <Route element={<ChatPage />} path="/" />
          </Routes>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
