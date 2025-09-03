import { atom, useAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { atomWithImmer } from "jotai-immer";
import { splitAtom } from "jotai/utils";
import {
  Flame,
  Flower,
  Activity,
  HeartPulse,
  Sofa,
  Package,
  AudioWaveform,
  type LucideIcon,
  BadgeCheck,
  CreditCard,
  User,
  IndianRupee,
} from "lucide-react";
import type { MeasurableEntityNames } from "@/types/measurement.type";
import { MdManageAccounts } from "react-icons/md";
import type { IconType } from "react-icons/lib";

export type User = {
  name: string;
  email: string;
  avatar: string;
};

export type Team = {
  name: string;
  logo: LucideIcon;
  plan: string;
};

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon | IconType;
  emoji: string;
  isActive?: boolean;
  type: "readings" | "manage";
  admin: boolean;
};

export type AppData = {
  user: User;
  teams: Team[];
  navMain: NavItem[];
  // manage: NavItem[];
};

export const typeToUrlMap: Record<MeasurableEntityNames, string> = {
  Energy: "energies",
  Chakra: "chakras",
  Gland: "glands",
  Organ: "organs",
  Product: "products",
  Space: "spaces",
};
const sidebarStateAtom = atomWithImmer<AppData>({
  user: {
    name: "Kirtish Patil",
    email: "kirtish@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "World On Vastu",
      logo: AudioWaveform,
      plan: "",
    },
  ],
  navMain: [
    {
      title: "Energies",
      url: "energies",
      icon: Flame,
      emoji: "🔥",
      isActive: false,
      type: "readings",
      admin: false,
    },
    {
      title: "Chakras",
      url: "chakras",
      icon: Flower,
      emoji: "🌸",
      isActive: false,
      type: "readings",
      admin: false,
    },
    {
      title: "Organs",
      url: "organs",
      emoji: "🫀",
      icon: Activity,
      isActive: false,
      type: "readings",
      admin: false,
    },
    {
      title: "Gland",
      url: "glands",
      emoji: "🧪",
      icon: HeartPulse,
      isActive: false,
      type: "readings",
      admin: false,
    },
    {
      title: "Space",
      url: "spaces",
      emoji: "🛖",
      icon: Sofa,
      isActive: false,
      type: "readings",
      admin: false,
    },
    {
      title: "Product",
      url: "products",
      icon: Package,
      emoji: "📦",
      isActive: false,
      type: "readings",
      admin: false,
    },
    // {
    //   title: "Report",
    //   url: "reports",
    //   icon: Package,
    //   emoji: "📈",
    //   isActive: false,
    //   type: "readings",
    //   admin: false,
    // },
    {
      title: "Clients",
      url: "/clients",
      isActive: false,
      emoji: "",
      icon: MdManageAccounts,
      type: "manage",
      admin: false,
    },
    {
      title: "Account",
      emoji: "",
      icon: BadgeCheck,
      type: "manage",
      url: "/profile",
      isActive: false,
      admin: false,
    },
    {
      title: "Plans",
      emoji: "",
      icon: CreditCard,
      type: "manage",
      url: "/subscription",
      isActive: false,
      admin: false,
    },
    {
      title: "Manage Plans",
      emoji: "",
      icon: IndianRupee,
      type: "manage",
      url: "/admin/subscriptionlist",
      isActive: false,
      admin: true,
    },

    {
      title: "Users",
      emoji: "",
      icon: User,
      type: "manage",
      url: "/admin/userlist",
      isActive: false,
      admin: true,
    },
  ],
});

const useSidebarState = () => {
  return useAtom(sidebarStateAtom);
};

const navStateAtom = focusAtom(sidebarStateAtom, (optic) =>
  optic.prop("navMain")
);

const navStateSplitAtoms = splitAtom(navStateAtom);

export { sidebarStateAtom, navStateAtom, navStateSplitAtoms };
