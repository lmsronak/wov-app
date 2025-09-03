import * as React from "react";
import {
  Activity,
  AudioWaveform,
  Flame,
  Flower,
  HeartPulse,
  Package,
  Sofa,
} from "lucide-react";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAtom } from "jotai";
import { sidebarStateAtom } from "./use-sidebar-state";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [sidebar] = useAtom(sidebarStateAtom);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebar.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebar.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
