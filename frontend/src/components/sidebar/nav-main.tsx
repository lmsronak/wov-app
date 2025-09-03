"use client";

import { type LucideIcon } from "lucide-react";

import { Collapsible } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useParams } from "react-router";
import {
  atom,
  useAtom,
  useAtomValue,
  useSetAtom,
  type PrimitiveAtom,
} from "jotai";
import {
  navStateAtom,
  navStateSplitAtoms,
  sidebarStateAtom,
  type NavItem,
} from "./use-sidebar-state";
import { useCurrentClient } from "@/screens/ClientScreen/clientAtom";
import { userInfoAtom } from "@/atoms/user";

export const selectNavItemAtom = atom(null, (_, set, update: string) => {
  set(sidebarStateAtom, (sidebarState) => {
    for (const navItem of sidebarState.navMain) {
      if (navItem.url === update) {
        navItem.isActive = true;
      } else {
        navItem.isActive = false;
      }
    }

    return sidebarState;
  });
});

function NavItem({ navItem }: { navItem: NavItem }) {
  // const [navItem] = useAtom(itemAtom);
  const selectNavItem = useSetAtom(selectNavItemAtom);
  const [currentClient, setCurrentClient] = useCurrentClient();
  const { setOpenMobile } = useSidebar();

  return (
    <Collapsible
      key={navItem.title}
      asChild
      defaultOpen={navItem.isActive}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <Link
          onClick={() => {
            if (navItem.type === "manage") {
              setCurrentClient("");
            }
            selectNavItem(navItem.url);
            setOpenMobile(false);
          }}
          to={
            navItem.type === "readings"
              ? `clients/${currentClient}/${navItem.url}`
              : navItem.url
          }
          className=" w-full"
        >
          <SidebarMenuButton
            isActive={navItem.isActive}
            tooltip={navItem.title}
            className="data-[active=true]:ring-primary data-[active=true]:bg-sidebar-primary-foreground data-[active=true]:ring-1"
          >
            <span className="text-lg leading-none w-4 h-4 flex items-center justify-center">
              {/* {navItem.emoji ? navItem.emoji : <navItem.icon />} */}
              <navItem.icon />
            </span>
            <span>{navItem.title}</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function NavMain() {
  const [nav] = useAtom(navStateSplitAtoms);
  const [sidebar] = useAtom(sidebarStateAtom);
  const [currentClient] = useCurrentClient();
  const userInfo = useAtomValue(userInfoAtom);

  return (
    <>
      {currentClient && (
        <SidebarGroup>
          <SidebarGroupLabel>Readings</SidebarGroupLabel>
          <SidebarMenu>
            {/* {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <Link to={item.url} className=" w-full">
                <SidebarMenuButton
                  isActive={item.isActive}
                  tooltip={item.title}
                  className="data-[active=true]:ring-primary data-[active=true]:bg-sidebar-primary-foreground data-[active=true]:ring-1"
                >
                  <span className="text-lg leading-none w-4 h-4 flex items-center justify-center">
                    {item.emoji}
                  </span>
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </Collapsible>
        ))} */}
            {sidebar.navMain
              .filter((item) => item.type === "readings")
              .map((item, idx) => (
                <NavItem key={idx} navItem={item} />
              ))}
          </SidebarMenu>
        </SidebarGroup>
      )}
      <SidebarGroup>
        <SidebarGroupLabel>Manage</SidebarGroupLabel>
        <SidebarMenu>
          {sidebar.navMain
            .filter((item) => item.type === "manage")
            .map((item, idx) => {
              if (item.admin) {
                if (userInfo?.isAdmin) {
                  return <NavItem key={idx} navItem={item} />;
                } else {
                  return null;
                }
              }
              return <NavItem key={idx} navItem={item} />;
            })}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
