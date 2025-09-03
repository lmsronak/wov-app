import { useEffect, useRef, useState, type RefObject } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import axios from "axios";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/services/httpClient";
import type { IPlan } from "./ManagePlansScreen";
import { cn } from "@/lib/utils";
import { CalendarIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { UserInfo } from "@/atoms/user";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addDays, addMonths, addYears, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { DialogClose, DialogHeader } from "@/components/ui/dialog";

type UserStatus = "pending" | "approved" | "rejected";

interface UserResponse {
  name: string;
  email: string;
  phone: number;
  accountStatus: UserStatus;
  isAdmin: boolean;
}

const ALL_STATUS: UserStatus[] = ["pending", "approved", "rejected"];

const fetchUser = async (userId: string) => {
  const { data } = await axios.get<UserInfo>(`/api/users/admin/${userId}`);

  return data;
};

const formSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z
      .string()
      .min(10, "Phone must be 10 digits")
      .max(10, "Phone must be 10 digits"),
    accountStatus: z.enum(ALL_STATUS, {
      // required_error: "Please select a accountStatus",
      error: "Please select a accountStatus",
    }),
    subscriptionStatus: z.enum(ALL_STATUS, {
      // required_error: "Please select a accountStatus",
      error: "Please select a accountStatus",
    }),
    paymentMethod: z.enum(["cash"], {
      error: "Please select a payment method",
    }),
    subscriptionStartDate: z.date().optional(),
    subscriptionEndDate: z.date().optional(),
    isAdmin: z.boolean(),
    mfaEnabled: z.boolean(),
    transactionId: z.string(),
    plan: z
      .object({
        _id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        priceInRupees: z.number(),
        interval: z.string(),
        features: z.array(z.string()).optional(),
      })
      .optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      path: ["confirmPassword"], // <-- attaches error to confirmPassword field
      message: "Passwords do not match",
    }
  );

type FormValues = z.infer<typeof formSchema>;

const UserEditScreen = ({
  type = "create",
  userId,
}: // buttonRef,
{
  type: "create" | "update";
  // buttonRef: RefObject<HTMLButtonElement | null>;
  userId?: string;
}) => {
  // const { id: userId } = useParams();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const client = httpClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null as Error | null);
  const [plan, setPlan] = useState(null as IPlan | null);

  if (type === "update") {
    const {
      data,
      isLoading,
      isSuccess: isFetchSuccess,
      isError,
      error,
    } = useQuery({
      queryFn: async () => await fetchUser(userId as string),
      queryKey: ["user", userId],
    });

    useEffect(() => {
      if (isFetchSuccess && data) {
        form.reset({
          name: data.name,
          email: data.email,
          phone: data.phone.toString(),
          accountStatus: data.status as UserStatus,
          subscriptionStatus: data.subscription.status,
          isAdmin: data.isAdmin,
          plan: data.subscription.plan || undefined,
          mfaEnabled: data.mfaEnabled,
          transactionId: data.subscription.transactionId ?? "",
          paymentMethod: data.subscription.paymentMethod,
          subscriptionStartDate: data.subscription.startDate
            ? new Date(data.subscription.startDate)
            : undefined,
          subscriptionEndDate: data.subscription.endDate
            ? new Date(data.subscription.endDate)
            : undefined,
        });
      }
    }, [isFetchSuccess, data]);

    useEffect(() => {
      setError(error);
      setIsLoading(isLoading);
      setIsError(isError);
    }, [isError, isLoading, error]);
  }

  const {
    isPending,
    error: fetchPlansError,
    data: plans,
    isSuccess: isGetPlansSuccess,
  } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => (await client.get<IPlan[]>("/api/plans")).data,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      accountStatus: "pending",
      subscriptionStatus: "pending",
      isAdmin: false,
      plan: undefined,
      password: "",
      confirmPassword: "",
      mfaEnabled: false,
      paymentMethod: "cash",
      transactionId: "",
    },
  });

  const handlePlanSelect = (tier: IPlan) => {
    const startDate = new Date();
    let endDate = startDate;

    switch (tier.interval) {
      case "monthly":
        endDate = addMonths(startDate, 1);
        break;
      case "3months":
        endDate = addMonths(startDate, 3);
        break;
      case "6months":
        endDate = addMonths(startDate, 6);
        break;
      case "9months":
        endDate = addMonths(startDate, 9);
        break;
      case "yearly":
        endDate = addYears(startDate, 1);
        break;
      case "custom":
        if (tier.customInterval) {
          endDate = addDays(startDate, tier.customInterval);
        } else {
          throw new Error(
            "Custom interval requires tier.customInterval (days)."
          );
        }
        break;
      default:
        throw new Error(`Unknown plan interval: ${tier.interval}`);
    }

    // setPlan(tier);
    form.setValue("plan", tier);
    form.setValue("subscriptionStartDate", startDate);
    form.setValue("subscriptionEndDate", endDate);
    toast.success("Plan selected");
    sheetRef.current?.click();
  };

  const queryClient = useQueryClient();

  async function handleUpdate(values: FormValues) {
    try {
      const payload = {
        ...values,
        phone: Number(values.phone),
        planId: values.plan?._id,
      };

      if (!values.password) {
        delete payload.password;
        delete payload.confirmPassword;
      }

      await axios.put(`/api/users/admin/${userId}`, payload);
      queryClient.invalidateQueries({
        queryKey: ["adminUsers"],
      });
      buttonRef.current?.click();
      toast.success("User updated successfully");
      // navigate("/admin/userlist");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || "Update failed"
      );
    }
  }

  async function handleCreate(values: FormValues) {
    try {
      const payload = {
        ...values,
        phone: Number(values.phone),
        planId: values.plan?._id,
      };

      if (!values.password) {
        delete payload.password;
        delete payload.confirmPassword;
      }

      await axios.post(`/api/users/admin`, payload);
      queryClient.invalidateQueries({
        queryKey: ["adminUsers"],
      });
      buttonRef.current?.click();
      toast.success("User created successfully");
      navigate("/admin/userlist");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || "Update failed"
      );
    }
  }

  const isAdmin = form.watch("isAdmin");

  return (
    <>
      <DialogHeader>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {type === "update" ? "Edit" : "Create"} User
        </h1>
      </DialogHeader>
      <ScrollArea className="h-[80vh]">
        <div className="bg-white">
          <div className="mx-auto max-w-2xl px-4 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
            {isLoading ? (
              <p className="mt-10 text-sm text-gray-600">Loading…</p>
            ) : isError && error ? (
              <p className="mt-10 text-sm text-red-600">{error.message}</p>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={
                    type === "update"
                      ? form.handleSubmit(handleUpdate)
                      : form.handleSubmit(handleCreate)
                  }
                  className="mx-auto mt-10 max-w-3xl space-y-6"
                >
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="
        [appearance:textfield] 
        [&::-webkit-outer-spin-button]:appearance-none 
        [&::-webkit-inner-spin-button]:appearance-none"
                            onWheel={(e) => e.currentTarget.blur()}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password Field */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Status */}
                  <FormField
                    control={form.control}
                    name="accountStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={(v) => {
                            if (!v) {
                              return;
                            }
                            field.onChange(v);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Change Status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Status</SelectLabel>
                              {ALL_STATUS.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* isAdmin */}
                  <FormField
                    control={form.control}
                    name="isAdmin"
                    render={({ field, formState }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => {
                              if (!e.target.checked) {
                                form.setValue("mfaEnabled", false, {
                                  shouldValidate: true,
                                });
                              }
                              field.onChange(e.target.checked);
                            }}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel>Is Administrator</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isAdmin && (
                    <FormField
                      control={form.control}
                      name="mfaEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Input
                              type="checkbox"
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="h-4 w-4"
                            />
                          </FormControl>
                          <FormLabel>Is Mfa Enabled</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Plan */}
                  <FormField
                    control={form.control}
                    name="plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan</FormLabel>
                        <div className="flex gap-2 flex-col">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button variant="outline">Select Plan</Button>
                            </SheetTrigger>
                            <FormDescription>
                              {field.value && (
                                <span>
                                  {field.value.name} <br />{" "}
                                  {field.value.description}
                                </span>
                              )}
                            </FormDescription>
                            <SheetContent>
                              <SheetHeader>
                                <SheetTitle>Select Plan</SheetTitle>
                              </SheetHeader>
                              <ScrollArea className="h-[90vh]">
                                {isGetPlansSuccess &&
                                  plans.map((plan) => (
                                    <div
                                      key={plan._id}
                                      className={cn(
                                        "relative flex flex-col bg-white shadow-2xl sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none",
                                        "rounded-3xl p-8 mx-4 my-2 ring-1 ring-gray-900/10 sm:p-10"
                                      )}
                                    >
                                      <h3 className="text-base font-semibold text-primary">
                                        {plan.name}
                                      </h3>
                                      <p className="mt-2 text-sm text-gray-600">
                                        {plan.description}
                                      </p>
                                      <p className="mt-4 flex items-baseline gap-x-2">
                                        <span className="text-5xl font-semibold text-gray-900">
                                          ₹{plan.priceInRupees}
                                        </span>
                                        <span className="text-base text-gray-500">
                                          /
                                          {plan.interval === "custom"
                                            ? `${plan.customInterval} days`
                                            : plan.interval}
                                        </span>
                                      </p>

                                      <ul className="mt-8 space-y-3 text-sm text-gray-600 sm:mt-10">
                                        {plan.features?.map((feature, idx) => (
                                          <li
                                            key={idx}
                                            className="flex gap-x-3"
                                          >
                                            <CheckIcon className="h-6 w-5 text-primary" />
                                            {feature}
                                          </li>
                                        ))}
                                      </ul>

                                      <div className="flex flex-col pt-4 h-full">
                                        <Button
                                          onClick={() => handlePlanSelect(plan)}
                                          className="w-full mt-auto"
                                          type="button"
                                        >
                                          Select Plan
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                              </ScrollArea>
                              <SheetFooter>
                                <SheetClose asChild>
                                  <Button ref={sheetRef} variant="outline">
                                    Close
                                  </Button>
                                </SheetClose>
                              </SheetFooter>
                            </SheetContent>
                          </Sheet>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subscriptionStartDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Subscription Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              // disabled={(date) =>
                              //   date > new Date() || date < new Date("1900-01-01")
                              // }
                              captionLayout="dropdown"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Start date will be set automatically after selecting
                          plan, if changed manually then must be set correctly
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subscriptionEndDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Subscription End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              // disabled={(date) =>
                              //   date > new Date() || date < new Date("1900-01-01")
                              // }
                              captionLayout="dropdown"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          End date will be set automatically after selecting
                          plan, if changed manually then must be set correctly.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subscriptionStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subscription Status</FormLabel>
                        <Select
                          onValueChange={(v) => {
                            if (!v) {
                              return;
                            }
                            field.onChange(v);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Change Status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Status</SelectLabel>
                              {ALL_STATUS.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select
                          onValueChange={(v) => {
                            if (!v) {
                              return;
                            }
                            field.onChange(v);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Change Payment Method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Payment Method</SelectLabel>
                              <SelectItem value={"cash"}>Cash</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => {
                  console.log("payment method field value: ", field.value);
                  return (
                    <FormItem className="">
                      <FormLabel>Payment Method</FormLabel>
                      <div className="flex items-center gap-x-3">
                        <FormControl>
                          <input
                            type="radio"
                            id="cash"
                            value="cash"
                            checked={field.value === "cash"}
                            onChange={() => field.onChange("cash")}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel
                          htmlFor="cash"
                          className="text-sm font-medium text-slate-900"
                        >
                          Cash on Delivery
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              /> */}

                  <FormField
                    control={form.control}
                    name="transactionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transaction Id</FormLabel>
                        <FormControl>
                          <Input placeholder="Transation Id" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit */}
                  <div className="flex gap-2">
                    <Button type="submit">Submit</Button>
                    <DialogClose>
                      <Button ref={buttonRef} type="button" variant={"outline"}>
                        Cancel
                      </Button>
                    </DialogClose>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </div>
      </ScrollArea>
    </>
  );
};

export default UserEditScreen;
