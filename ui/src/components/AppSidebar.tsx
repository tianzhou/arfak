import { BoxIcon, MessageCircleIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar.js';

const NAV_ITEMS = [
  { icon: MessageCircleIcon, label: 'Chat', path: '/' },
  { icon: BoxIcon, label: 'Models', path: '/models' },
];

export default function AppSidebar({ hasBanner }: { hasBanner?: boolean }) {
  const location = useLocation();
  const top = hasBanner ? '!top-[5.25rem]' : '!top-12';
  const height = hasBanner ? '!h-[calc(100svh-5.25rem)]' : '!h-[calc(100svh-3rem)]';

  return (
    <Sidebar className={`${top} ${height}`}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
                <SidebarMenuItem key={path}>
                  <SidebarMenuButton
                    isActive={location.pathname === path}
                    render={<Link to={path} />}
                    tooltip={label}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
