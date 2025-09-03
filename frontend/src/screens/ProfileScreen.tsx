import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAtomValue } from "jotai";
import {
  userInfoWithPersistenceAtom,
  type Subscription,
  type UserInfo,
} from "@/atoms/user";
import { useSetAtom } from "jotai";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/services/httpClient";
import { Input } from "@/components/ui/input";

const ProfileScreen = () => {
  const setUserInfo = useSetAtom(userInfoWithPersistenceAtom);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const client = httpClient();

  const {
    data: userData,
    isSuccess,
    isLoading,
  } = useQuery({
    queryFn: async () =>
      (await client.get<UserInfo>("/api/users/profile")).data,
    queryKey: ["profile"],
  });

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const payload: Record<string, any> = { name, email };
      if (password) payload.password = password;

      const { data } = await axios.put("/api/users/profile", payload);

      toast.success("Profile updated successfully");

      setUserInfo(data);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || "Update failed"
      );
    }
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-10 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Your Profile
        </h1>

        {isLoading && <p>Loading...</p>}
        {/* Profile Update Form */}
        {isSuccess && (
          <form onSubmit={submitHandler}>
            <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 border-b border-slate-900/10 pb-12 md:grid-cols-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Personal Information
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Update your personal information.
                </p>
              </div>

              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
                <div className="sm:col-span-full">
                  <label
                    htmlFor="full-name"
                    className="block text-sm font-medium text-slate-900"
                  >
                    Full Name
                  </label>
                  <Input
                    value={userData.name}
                    onChange={(e) => setName(e.target.value)}
                    id="full-name"
                    type="text"
                  />
                </div>

                <div className="sm:col-span-full">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-900"
                  >
                    Email address
                  </label>
                  <Input
                    value={userData.email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="email"
                    type="email"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-900"
                  >
                    Password
                  </label>
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    id="password"
                    type="password"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-slate-900"
                  >
                    Confirm Password
                  </label>
                  <Input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    id="confirmPassword"
                    type="password"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-800"
              >
                Update
              </button>
            </div>
          </form>
        )}

        {/* Subscriptions */}
        {isSuccess && !userData.isAdmin && (
          <>
            <div className="max-w-xl mt-20">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                My Subscriptions
              </h1>
            </div>

            {isLoading && <p className="mt-6">Loading subscriptions...</p>}
            {isSuccess && userData.subscription ? (
              <div className="mt-10 space-y-8">
                <div className="p-6 bg-green-50 border border-green-200 rounded-lg shadow-md">
                  <div className="flex justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Current Membership
                    </h2>
                    <span
                      className={`${
                        userData.subscription.status === "approved"
                          ? "text-green-600"
                          : userData.subscription.status === "pending"
                          ? "text-yellow-600"
                          : "text-gray-500"
                      } text-sm font-medium capitalize`}
                    >
                      {userData.subscription.status}
                    </span>
                  </div>
                  <SubscriptionDetails sub={userData.subscription} />
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm text-gray-600">
                No subscriptions found. <br />
                <a href="/subscription" className="text-indigo-600 underline">
                  Click here to subscribe
                </a>
              </p>
            )}
          </>
        )}

        {/* {subscriptions.length > 1 && (
              <div className="p-6 bg-gray-100 rounded-lg shadow">
                <h2 className="text-md font-semibold text-gray-800 mb-4">
                  Subscription History
                </h2>
                <div className="space-y-6">
                  {subscriptions
                    .filter((s) => s._id !== latest?._id)
                    .map((sub) => {
                      const statusColor =
                        sub.status === "active"
                          ? "text-green-600"
                          : sub.status === "pending"
                          ? "text-yellow-600"
                          : "text-red-500";

                      return (
                        <div
                          key={sub._id}
                          className="border-t pt-4 border-gray-300 text-sm text-gray-700"
                        >
                          <dl className="space-y-2 text-sm text-gray-600 mb-2">
                            <div className="flex justify-between">
                              <dt className="font-medium text-gray-900">
                                Status
                              </dt>
                              <dd className={`${statusColor} font-medium`}>
                                {sub.status}
                              </dd>
                            </div>
                          </dl>
                          <SubscriptionDetails sub={sub} />
                        </div>
                      );
                    })}
                </div>
              </div>
            )} */}
      </div>
      {/* )} */}
    </div>
    // </div>
  );
};

const SubscriptionDetails = ({ sub }: { sub: Subscription }) => {
  const startDate = sub.startDate ? new Date(sub.startDate) : null;
  const endDate = sub.endDate ? new Date(sub.endDate) : null;
  const remainingDays =
    startDate &&
    endDate &&
    Math.ceil(
      (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

  const dayColor =
    remainingDays &&
    (remainingDays > 20
      ? "text-green-600"
      : remainingDays > 7
      ? "text-yellow-600"
      : "text-red-600");
  return (
    <dl className="space-y-2 text-sm text-gray-600">
      <div className="flex justify-between">
        <dt className="font-medium text-gray-900">Plan</dt>
        <dd className="text-gray-900">{sub.plan?.name || "Free Tier"}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="font-medium text-gray-900">Amount</dt>
        <dd className="text-gray-900">{sub.plan?.priceInRupees || "-"}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="font-medium text-gray-900">Start Date</dt>
        <dd className="text-gray-900">
          {(startDate && startDate.toLocaleDateString()) ?? "-"}
        </dd>
      </div>
      <div className="flex justify-between">
        <dt className="font-medium text-gray-900">End Date</dt>
        <dd className="text-gray-900">
          {(endDate && endDate.toLocaleDateString()) ?? "-"}
        </dd>
      </div>
      <div className="flex justify-between">
        <dt className="font-medium text-gray-900">Transaction ID</dt>
        <dd className="text-gray-900">{sub.transactionId}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="font-medium text-gray-900">Remarks</dt>
        <dd className="text-gray-900">{sub.remarks?.join(", ") || "-"}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="font-medium text-gray-900 text-lg">Days Remaining</dt>
        <dd className={`font-bold ${dayColor} text-lg`}>
          {(remainingDays &&
            (remainingDays > 0 ? `${remainingDays} days` : "Expired")) ??
            "-"}
        </dd>
      </div>
    </dl>
  );
};

export default ProfileScreen;
