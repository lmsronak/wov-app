// import { useState } from 'react'
// import { loadRazorpay } from '@/hooks/loadRazorpay'

// const PlaceOrderScreen = () => {
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   const handlePayment = async () => {
//     setLoading(true)
//     const res = await loadRazorpay()

//     if (!res) {
//       setError('Failed to load Razorpay SDK. Are you online?')
//       setLoading(false)
//       return
//     }

//     const options = {
//       key: 'rzp_test_eeZ2xyBeSFUzB7',
//       amount: 50000,
//       currency: 'INR',
//       name: 'Test Company',
//       description: 'Test Transaction',
//       handler: function (response: any) {
//         console.log(response)
//         alert('Payment Successful!')
//       },
//       prefill: {
//         name: 'John Doe',
//         email: 'john.doe@example.com',
//         contact: '9999999999',
//       },
//       theme: {
//         color: '#F37254',
//       },
//     }

//     const paymentObject = new (window as any).Razorpay(options)
//     paymentObject.open()
//     setLoading(false)
//   }

//   return (
//     <div>
//       <h1>Payment Page</h1>
//       {loading && <p>Loading Razorpay...</p>}
//       {error && <p style={{ color: 'red' }}>{error}</p>}
//       <button onClick={handlePayment} disabled={loading}>
//         Pay Now
//       </button>
//     </div>
//   )
// }

// export default PlaceOrderScreen

import { useAtomValue } from "jotai";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

import { selectPlanAtom } from "@/atoms/subscriptionAtom";
import { paymentMethodAtom } from "@/atoms/paymentMethod";
import type { IPlan } from "./ManagePlansScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PlaceOrderScreen({
  handleTrasactionIdSubmit,
  plan,
}: {
  handleTrasactionIdSubmit: (id: string) => void;
  plan: IPlan | null;
}) {
  const [txId, setTxId] = useState("");

  return (
    <main className="relative grid w-full  lg:grid-cols-2 grid-cols-1 gap-10 h-screen justify-around items-center">
      {/* QR Image (left) */}
      <div className="relative h-full  ">
        <div className="h-full overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Thanks for ordering
            </p>
            <p className="mt-2 text-base text-gray-500">
              We appreciate your order. We’re currently processing it.
            </p>

            {/* Txn Form */}

            {/* Order Summary */}
            {plan && (
              <dl className="space-y-6 pt-6 text-sm font-medium text-gray-500">
                <div className="flex justify-between">
                  <dt>Plan Name</dt>
                  <dd className="text-gray-900">{plan.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Plan Description</dt>
                  <dd className="text-gray-900">{plan.description}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Interval</dt>
                  <dd className="text-gray-900">
                    {plan.interval === "custom"
                      ? `Every ${plan.customInterval} days`
                      : plan.interval}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Price</dt>
                  <dd className="text-gray-900">
                    ₹{plan.priceInRupees.toFixed(2)}
                  </dd>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
                  <dt className="text-base">Total</dt>
                  <dd className="text-base">
                    ₹{plan.priceInRupees.toFixed(2)}
                  </dd>
                </div>
              </dl>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleTrasactionIdSubmit(txId);
              }}
              className="mt-6 flex items-center gap-3"
            >
              <Input
                type="text"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                placeholder="Enter Transaction ID"
                // className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <Button
                type="submit"
                // className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                Submit
              </Button>
            </form>
          </div>
        </div>
      </div>
      <div className="w-full ">
        <img
          alt="Payment Scanner"
          src="qr.jpeg"
          className="aspect-auto w-96 mx-auto object-cover"
        />
      </div>

      {/* Right Section */}
    </main>
  );
}
