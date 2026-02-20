import type { Agent } from '@gen/arfak/v1/service_pb.js';
import { createPromiseClient } from '@connectrpc/connect';
import { ArfakService } from '@gen/arfak/v1/service_connect.js';
import { BoxIcon, MessageCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar.js';
import { transport } from '@/lib/connect.js';

const NAV_ITEMS = [
  { icon: MessageCircleIcon, label: 'Chat', path: '/' },
  { icon: BoxIcon, label: 'Models', path: '/models' },
];

const client = createPromiseClient(ArfakService, transport);

export default function AppSidebar({ hasBanner }: { hasBanner?: boolean }) {
  const location = useLocation();
  const top = hasBanner ? '!top-[5.25rem]' : '!top-12';
  const height = hasBanner ? '!h-[calc(100svh-5.25rem)]' : '!h-[calc(100svh-3rem)]';

  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    client
      .listAgents({})
      .then((res) => setAgents(res.agents))
      .catch((err: unknown) => console.warn('[ListAgents] Failed:', err));
  }, []);

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
        {agents.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Agents</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {agents.map((agent) => (
                    <SidebarMenuItem key={agent.id}>
                      <SidebarMenuButton tooltip={agent.name}>
                        <span>{agent.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
