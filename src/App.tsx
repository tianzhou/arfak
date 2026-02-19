import { Route, Routes } from 'react-router';
import ChatPage from './chat/ChatPage.js';
import AppSidebar from './components/AppSidebar.js';
import { SidebarInset, SidebarProvider } from './components/ui/sidebar.js';

function AppHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
      <span className="text-sm font-semibold">Arfak</span>
    </header>
  );
}

export default function App() {
  return (
    <div className="flex h-svh flex-col">
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
