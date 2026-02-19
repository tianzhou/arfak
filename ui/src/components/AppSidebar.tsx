import { MessageCircleIcon } from 'lucide-react';
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
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location.pathname === '/'}
                  render={<Link to="/" />}
                  tooltip="Chat"
                >
                  <MessageCircleIcon />
                  <span>Chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
