import { useEffect, useRef, useState, type MouseEvent } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/services/httpClient";
import { Button } from "@/components/ui/button";

import { format } from "date-fns";
import CreateUpdatePlansDialog from "@/components/createUpdatePlansDialog";
import { Eye } from "lucide-react";
import { MdDelete } from "react-icons/md";
import { Badge } from "@/components/ui/badge";

interface ISubscription {
  _id: string;
  user: { _id: string; name: string; email: string };
  plan: string;
  duration: "month" | "year";
  status: "pending" | "active" | "ended" | "suspended" | "rejected";
  transactionId: string;
}

export interface IPlan {
  _id: string;
  name: string;
  description: string;
  interval: PlanInterval;
  customInterval: number;
  features?: string[];
  priceInRupees: number;
  durationInDays: number;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  isVisibleToStudents?: boolean;
}

export type PlanInterval =
  | "monthly"
  | "3months"
  | "6months"
  | "9months"
  | "yearly"
  | "custom";

const ManagePlansScreen = () => {
  const client = httpClient();
  const queryClient = useQueryClient();

  const {
    isPending,
    error,
    data: plans,
    isSuccess: isGetPlansSuccess,
  } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => (await client.get<IPlan[]>("/api/plans")).data,
  });

  const { mutate: deletePlan } = useMutation({
    mutationFn: async (id: string) => await client.delete("/api/plans/" + id),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["plans"],
      });
    },
  });

  // Badge colour helper
  const statusClasses = (s: string) =>
    ({
      active: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      ended: "bg-gray-200 text-gray-600",
      suspended: "bg-red-100 text-red-700",
      rejected: "bg-red-100 text-red-700",
    }[s] || "bg-gray-100 text-gray-600");

  return (
    <div className="bg-white">
      <div className="mx-auto  px-4 pb-24 pt-16 sm:px-6  lg:px-8">
        <h1 className="text-3xl flex items-center justify-between font-bold tracking-tight text-slate-900 sm:text-4xl">
          All Plans
          <CreateUpdatePlansDialog type="create" />
        </h1>

        {isPending && <p className="mt-6">Loading...</p>}
        {isGetPlansSuccess && plans.length === 0 && (
          <p className="mt-6">No plans found.</p>
        )}
        {isGetPlansSuccess && (
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300 text-sm">
                  <thead>
                    <tr>
                      <th className="py-3.5 pr-3 text-left font-semibold text-gray-900">
                        Sr
                      </th>
                      <th className="py-3.5 pr-3 text-left font-semibold text-gray-900">
                        Plan Id
                      </th>
                      <th className="px-3 py-3.5 text-left font-semibold text-gray-900">
                        Name
                      </th>
                      <th className="px-3 py-3.5 text-left font-semibold text-gray-900">
                        Description
                      </th>
                      <th className="px-3 py-3.5 text-left font-semibold text-gray-900">
                        Price
                      </th>
                      <th className="px-3 py-3.5 text-left font-semibold text-gray-900">
                        Interval
                      </th>
                      <th className="px-3 py-3.5 text-left font-semibold text-gray-900">
                        Created At
                      </th>
                      <th className="px-3 py-3.5 text-left font-semibold text-gray-900">
                        Features
                      </th>
                      <th className="py-3.5 pl-3 pr-4 text-right font-semibold text-gray-900">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {plans.map((plan, idx) => (
                      <tr key={plan._id}>
                        <td className="whitespace-nowrap py-4 pr-3 text-gray-900">
                          {idx + 1}
                        </td>
                        <td className="whitespace-nowrap py-4 pr-3 text-gray-900">
                          {plan._id}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-gray-700">
                          {plan.name || "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-gray-800">
                          {plan.description || "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-gray-700">
                          {"₹" + plan.priceInRupees || "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-gray-700">
                          {plan.interval}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-gray-700">
                          {(plan.createdAt &&
                            format(plan.createdAt, "dd/MM/yyyy")) ||
                            "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-gray-700 flex flex-wrap gap-2">
                          {plan.features?.map((f, idx) => (
                            <Badge variant={"secondary"} key={idx}>
                              {f}
                            </Badge>
                          ))}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4  text-end text-gray-700">
                          <div className="flex  items-center justify-end">
                            <CreateUpdatePlansDialog
                              type="update"
                              planId={plan._id}
                            />

                            <Button
                              onClick={() => deletePlan(plan._id)}
                              variant={"ghost"}
                              className="text-destructive"
                            >
                              <MdDelete />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePlansScreen;
