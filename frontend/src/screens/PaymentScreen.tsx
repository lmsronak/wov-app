"use client";

import { useEffect, useState, type FormEventHandler } from "react";
import { useNavigate } from "react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { toast } from "react-toastify";

import { selectPlanAtom } from "@/atoms/subscriptionAtom";
import { paymentMethodAtom } from "@/atoms/paymentMethod";

const PaymentScreen = ({
  onSubmit,
}: {
  onSubmit: FormEventHandler<HTMLFormElement>;
}) => {
  // const navigate = useNavigate();

  // // const subscription = useAtomValue(selectPlanAtom);
  // const setPaymentMethodAtom = useSetAtom(paymentMethodAtom);
  // const [paymentMethod, setPaymentMethod] = useState("");

  // useEffect(() => {
  //   if (!subscription) {
  //     toast.warn("No subscription selected. Redirecting...");
  //     navigate("/subscription");
  //   }
  // }, [subscription, navigate]);

  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   if (paymentMethod === "") {
  //     toast.error("Please Select Payment Method");
  //   } else {
  //     setPaymentMethodAtom(paymentMethod);
  //     navigate("/placeorder");
  //   }
  // };

  return (
    <div className="mt-10">
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="tracking-light mt-10 text-center text-2xl font-bold leading-9 text-slate-900">
            Payment Method
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="mt-6 space-y-6">
              {/* <div className="flex items-center gap-x-3">
                <input
                  type="radio"
                  id="upi"
                  name="payment"
                  value="online"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4"
                />
                <label
                  htmlFor="upi"
                  className="text-sm font-medium text-slate-900"
                >
                  Razorpay / Card
                </label>
              </div> */}

              <div className="flex items-center gap-x-3">
                <input
                  type="radio"
                  id="cash"
                  name="payment"
                  value="cash"
                  // onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4"
                />
                <label
                  htmlFor="cash"
                  className="text-sm font-medium text-slate-900"
                >
                  Cash on Delivery
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm"
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;
