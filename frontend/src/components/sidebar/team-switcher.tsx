import * as React from "react";
import { SidebarMenu, SidebarMenuButton } from "@/components/ui/sidebar";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
}) {
  const [activeTeam] = React.useState(teams[0]);

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuButton
        size="lg"
        className="hover:bg-sidebar-primary-foreground active:bg-sidebar-primary-foreground "
      >
        <div className="bg-white  text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
          {/* <activeTeam.logo className="size-4" /> */}
          <img src="/logo1.png" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{activeTeam.name}</span>
          <span className="truncate text-xs">{activeTeam.plan}</span>
        </div>
      </SidebarMenuButton>
    </SidebarMenu>
  );
}
