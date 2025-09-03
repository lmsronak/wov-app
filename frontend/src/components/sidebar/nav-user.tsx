"use client";

import { useCallback } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import axios from "axios";
import { useSetAtom, useAtomValue } from "jotai";

import {
  BadgeCheck,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  User,
  IndianRupee,
} from "lucide-react";

import { userInfoAtom, userInfoWithPersistenceAtom } from "@/atoms/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const setUserInfo = useSetAtom(userInfoWithPersistenceAtom);
  const userInfo = useAtomValue(userInfoAtom);

  const getInitials = useCallback((name: string) => {
    if (!name) return "";
    const split = name.trim().split(" ");
    return split.length > 1
      ? split[0][0] + split[split.length - 1][0]
      : split[0][0];
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/api/users/logout");
      setUserInfo(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {getInitials(userInfo!.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userInfo!.name}</span>
                <span className="truncate text-xs">{userInfo!.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
                  <AvatarFallback className="rounded-lg">
                    {getInitials(userInfo!.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userInfo!.name}</span>
                  <span className="truncate text-xs">{userInfo!.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            {/* <DropdownMenuSeparator /> */}

            {/* <DropdownMenuGroup>
              <Link to="/profile">
                <DropdownMenuItem>
                  <BadgeCheck />
                  <span>Account</span>
                </DropdownMenuItem>
              </Link>

              <Link to="/subscription">
                <DropdownMenuItem>
                  <CreditCard />
                  <span>Subscription</span>
                </DropdownMenuItem>
              </Link>

              {userInfo?.isAdmin && (
                <>
                  <Link to="/admin/userlist">
                    <DropdownMenuItem>
                      <User />
                      <span>All Users</span>
                    </DropdownMenuItem>
                  </Link>

                  <Link to="/admin/subscriptionlist">
                    <DropdownMenuItem>
                      <IndianRupee />
                      <span>All Subscriptions</span>
                    </DropdownMenuItem>
                  </Link>
                </>
              )}
            </DropdownMenuGroup> */}

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
