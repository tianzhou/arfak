import type { BannerConfig } from '@gen/arfak/v1/service_pb.js';
import { createPromiseClient } from '@connectrpc/connect';
import { ArfakService } from '@gen/arfak/v1/service_connect.js';
import {
  CheckIcon,
  ExternalLinkIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  ZapIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router';
import type { Mode } from './hooks/use-theme.js';
import ChatPage from './chat/ChatPage.js';
import ModelsPage from './models/ModelsPage.js';
import AppSidebar from './components/AppSidebar.js';
import { Button } from './components/ui/button.js';
import { Menu, MenuItem, MenuPopup, MenuTrigger } from './components/ui/menu.js';
import { SidebarInset, SidebarProvider } from './components/ui/sidebar.js';
import { ToastProvider, toastManager } from './components/ui/toast.js';
import { useTheme } from './hooks/use-theme.js';
import { transport } from './lib/connect.js';

const MODES: { value: Mode; label: string; icon: typeof SunIcon }[] = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'system', label: 'System', icon: MonitorIcon },
];

function ThemeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button size="icon-sm" variant="ghost">
            <SunIcon className="dark:hidden" />
            <MoonIcon className="hidden dark:block" />
          </Button>
        }
      />
      <MenuPopup align="end">
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
      style={{ backgroundColor: banner.color || '#0094ad' }}
    >
      {banner.link ? (
        <a
          className="flex items-center gap-1.5 text-white hover:opacity-80"
          href={banner.link}
          rel="noopener noreferrer"
          target="_blank"
        >
          {content}
          <ExternalLinkIcon className="size-3.5" />
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
      .catch((err: unknown) => {
        console.warn('[GetConfig] Failed to fetch config:', err);
      });
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
              <Route element={<ModelsPage />} path="/models" />
            </Routes>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ToastProvider>
  );
}
