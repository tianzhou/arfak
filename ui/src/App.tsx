import { createPromiseClient } from '@connectrpc/connect';
import { ArfakService } from '@gen/arfak/v1/service_connect.js';
import { BannerConfig } from '@gen/arfak/v1/service_pb.js';
import { CheckIcon, MonitorIcon, MoonIcon, PaletteIcon, SunIcon, ZapIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router';
import type { ColorTheme, Mode } from './hooks/use-theme.js';
import ChatPage from './chat/ChatPage.js';
import AppSidebar from './components/AppSidebar.js';
import { Button } from './components/ui/button.js';
import { Menu, MenuItem, MenuPopup, MenuSeparator, MenuTrigger } from './components/ui/menu.js';
import { SidebarInset, SidebarProvider } from './components/ui/sidebar.js';
import { ToastProvider, toastManager } from './components/ui/toast.js';
import { useTheme } from './hooks/use-theme.js';
import { transport } from './lib/connect.js';

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

const client = createPromiseClient(ArfakService, transport);

function PingButton() {
  const handlePing = async () => {
    try {
      const res = await client.ping({});
      toastManager.add({ title: res.pong, type: 'success' });
    } catch {
      toastManager.add({ title: 'Ping failed', type: 'error' });
    }
  };

  return (
    <Button onClick={handlePing} size="icon-sm" variant="ghost">
      <ZapIcon />
    </Button>
  );
}

function AppHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
      <span className="text-sm font-semibold">Arfak</span>
      <div className="flex items-center gap-1">
        <PingButton />
        <ThemeToggle />
      </div>
    </header>
  );
}

function Banner({ banner }: { banner: BannerConfig }) {
  const content = <span className="text-sm font-medium text-white">{banner.text}</span>;

  return (
    <div
      className="flex h-9 shrink-0 items-center justify-center px-4"
      style={{ backgroundColor: banner.color || undefined }}
    >
      {banner.link ? (
        <a
          className="underline decoration-white/40 hover:decoration-white"
          href={banner.link}
          rel="noopener noreferrer"
          target="_blank"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

export default function App() {
  const [banner, setBanner] = useState<BannerConfig | null>(null);

  useEffect(() => {
    client
      .getConfig({})
      .then((res) => {
        if (res.banner?.text) {
          setBanner(res.banner);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <ToastProvider>
      <div className="relative isolate flex h-svh flex-col">
        {banner && <Banner banner={banner} />}
        <AppHeader />
        <SidebarProvider className="!min-h-0 flex-1">
          <AppSidebar hasBanner={!!banner} />
          <SidebarInset>
            <Routes>
              <Route element={<ChatPage />} path="/" />
            </Routes>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ToastProvider>
  );
}
