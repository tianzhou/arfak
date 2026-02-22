import { BoxIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
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
import { useAgents } from '@/hooks/use-agents.js';

export default function AppSidebar({ hasBanner }: { hasBanner?: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const top = hasBanner ? '!top-[5.25rem]' : '!top-12';
  const height = hasBanner ? '!h-[calc(100svh-5.25rem)]' : '!h-[calc(100svh-3rem)]';

  const { agents, selectedAgent, selectAgent } = useAgents();

  return (
    <Sidebar className={`${top} ${height}`}>
      <SidebarContent>
        {agents.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Agents</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {agents.map((agent) => (
                  <SidebarMenuItem key={agent.id}>
                    <SidebarMenuButton
                      isActive={location.pathname === '/' && agent.id === selectedAgent?.id}
                      onClick={() => {
                        selectAgent(agent.id);
                        navigate('/');
                      }}
                      tooltip={agent.name}
                    >
                      <span>{agent.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location.pathname === '/models'}
                  render={<Link to="/models" />}
                  tooltip="Models"
                >
                  <BoxIcon />
                  <span>Models</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
