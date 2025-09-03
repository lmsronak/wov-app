import { CheckIcon } from "@heroicons/react/20/solid";
import { useAtomValue, useSetAtom } from "jotai";
import { useNavigate } from "react-router";
import { selectPlanAtom } from "@/atoms/subscriptionAtom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { httpClient } from "@/services/httpClient";
import type { IPlan } from "./ManagePlansScreen";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import PaymentScreen from "./PaymentScreen";
import PlaceOrderScreen from "./PlaceOrderScreen";
import {
  userInfoWithPersistenceAtom,
  type Subscription,
  type UserInfo,
} from "@/atoms/user";
import { toast } from "react-toastify";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export type OrderStep =
  | "select-plan"
  | "select-method"
  | "enter-tx-id"
  | "order-complete"
  | "plan-active";

export default function SubscriptionScreen() {
  // const setSubscription = useSetAtom(selectPlanAtom);
  const [plan, setPlan] = useState(null as null | IPlan);
  const userInfo = useAtomValue(userInfoWithPersistenceAtom);
  const [orderStep, setOrderStep] = useState("select-plan" as OrderStep);
  const [paymentMethod, setPaymentMethod] = useState("");

  const navigate = useNavigate();

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

  const {
    isPending,
    error,
    data: plans,
    isSuccess: isGetPlansSuccess,
  } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => (await client.get<IPlan[]>("/api/plans")).data,
  });

  const {
    data,
    mutate: applySubscription,
    isSuccess: isApplySubSuccess,
  } = useMutation({
    mutationFn: async (body: {
      planId: string;
      userId: string;
      paymentMethod: string;
      transactionId: string;
    }) => {
      return (
        await client.post<{ message: string; subscription: Subscription }>(
          "/api/subscription/apply",
          body
        )
      ).data;
    },
  });

  const handlePlanSelect = (tier: IPlan) => {
    setPlan(tier);
    setOrderStep("select-method");
    // navigate("/subscription/payment");
  };

  const handlePaymentMethodSelect = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (!formData.get("payment")) {
      toast.error("Please Select Payment Method");
    } else {
      setPaymentMethod(formData.get("payment")?.toString() || "cash");
      setOrderStep("enter-tx-id");
    }
  };

  const handleTrasactionIdSubmit = (id: string) => {
    if (!id) {
      toast.error("Please your transaction Id:");
    }

    if (!userInfo) {
      toast.error("Something went wrong");
      return;
    }

    applySubscription({
      paymentMethod,
      planId: plan!._id,
      transactionId: id,
      userId: userInfo._id,
    });
  };

  useEffect(() => {
    if (userData?.subscription.plan) {
      if (
        userData.subscription.status === "approved" &&
        Boolean(userData.subscription.endDate) &&
        new Date(userData.subscription.endDate!.toString()) > new Date()
      ) {
        setOrderStep("plan-active");
      }
    }
  }, [userData]);

  useEffect(() => {
    if (isApplySubSuccess) {
      setOrderStep("plan-active");
    }
  }, [isApplySubSuccess]);

  return (
    <>
      {orderStep === "select-plan" && (
        <div className="relative isolate bg-white px-6 py-10 sm:py-12 lg:px-8">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary to-primary opacity-30"
            />
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <p className="mt-2 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-6xl">
              Membership Plans
            </p>
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-gray-600 sm:text-xl">
            Choose an affordable plan that’s packed with the best features for
            engaging your audience.
          </p>

          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-stretch gap-y-6 sm:mt-20 sm:gap-y-6 lg:max-w-4xl lg:grid-cols-2 lg:auto-rows-fr gap-4">
            {isGetPlansSuccess &&
              plans
                .filter((plan) => plan.isVisibleToStudents)
                .map((plan, planIdx) => (
                  <div
                    key={plan._id}
                    className={classNames(
                      "relative flex flex-col bg-white shadow-2xl sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none",
                      "rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10"
                    )}
                  >
                    <h3
                      id={plan._id}
                      className="text-base font-semibold text-primary"
                    >
                      {plan.name}
                    </h3>
                    <p className="mt-2 text-sm/6 text-pretty text-gray-600">
                      {plan.description}
                    </p>
                    <p className="mt-4 flex items-baseline gap-x-2">
                      <span className="text-5xl font-semibold tracking-tight text-gray-900">
                        ₹{plan.priceInRupees}
                      </span>
                      <span className="text-base text-gray-500">
                        /{" "}
                        {plan.interval === "custom"
                          ? `${plan.customInterval} days`
                          : plan.interval}
                      </span>
                    </p>

                    <ul className="mt-8 space-y-3 text-sm text-gray-600 sm:mt-10">
                      {plan.features?.map((feature, idx) => (
                        <li key={idx} className="flex gap-x-3">
                          <CheckIcon className="h-6 w-5 flex-none text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-col pt-4  h-full ">
                      <Button
                        onClick={() => handlePlanSelect(plan)}
                        className="w-full mt-auto"
                      >
                        Buy Plan
                      </Button>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      )}
      {orderStep === "select-method" && (
        <PaymentScreen onSubmit={handlePaymentMethodSelect} />
      )}
      {orderStep === "enter-tx-id" && (
        <PlaceOrderScreen
          plan={plan}
          handleTrasactionIdSubmit={handleTrasactionIdSubmit}
        />
      )}
      {orderStep === "plan-active" && <div>You have an active plan</div>}
    </>
  );
}
