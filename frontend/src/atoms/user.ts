import type { PlanInterval } from "@/screens/ManagePlansScreen";
import { atom } from "jotai";
import { Cookies } from "react-cookie";

export interface IPlan {
  name?: string;
  description?: string;
  interval: PlanInterval;
  features: string[];
  priceInRupees: number;
  isDeleted: boolean;
}
export interface Subscription {
  _id: string;
  status: "approved" | "pending" | "rejected";
  remarks: string[];
  isDeleted: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  paymentMethod: "cash";
  transactionId: string | null;
  updatedAt: string;
  plan: IPlan | null;
}

export interface UserInfo {
  _id: string;
  name: string;
  email: string;
  phone: number;
  isAdmin: boolean;
  subscription: Subscription;
  status: "approved" | "pending" | "rejected";
  mfaEnabled: boolean;
}

const cookies = new Cookies();

export const getInitialUserInfo = (): UserInfo | null => {
  if (typeof window !== "undefined") {
    try {
      const userInfo = cookies.get("userInfo");

      // console.log("userinfo from cookies", userInfo);
      // const stored = localStorage.getItem("userInfo");
      return userInfo ?? null;
    } catch (err) {
      console.error("Failed to parse userInfo from localStorage:", err);
      return null;
    }
  }
  return null;
};

export const userInfoAtom = atom<UserInfo | null>(getInitialUserInfo());

export const userInfoWithPersistenceAtom = atom(
  (get) => get(userInfoAtom),
  (_, set, newUserInfo: UserInfo | null) => {
    set(userInfoAtom, newUserInfo);
    if (typeof window !== "undefined") {
      if (newUserInfo) {
        // cookies.set("userInfo", newUserInfo);
        // localStorage.setItem("userInfo", JSON.stringify(newUserInfo));
      } else {
        cookies.remove("userInfo");
        // localStorage.removeItem("userInfo");
      }
    }
  }
);
