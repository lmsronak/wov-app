import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { Button } from "./ui/button";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { httpClient } from "@/services/httpClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PlanInterval } from "@/screens/ManagePlansScreen";
import { MdAdd, MdDelete } from "react-icons/md";
import { toast } from "react-toastify";

const CreateUpdatePlansDialog = ({
  type,
  planId,
}: {
  type: "create" | "update";
  planId?: string;
}) => {
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState(["", ""] as string[]);
  const [price, setPrice] = useState(1000 as number | "");
  const [isVisibleToStudents, setIsVisibleToStudents] = useState(true);
  const [interval, setInterval] = useState("monthly" as PlanInterval);
  const [customInterval, setCustomInterval] = useState(1 as number | "");
  const buttonRef = useRef<HTMLButtonElement>(null);

  const client = httpClient();
  const queryClient = useQueryClient();

  const {
    mutate: createPlan,
    isSuccess,
    data: createPlanData,
  } = useMutation({
    mutationFn: (body: {
      name: string;
      description: string;
      price: number | "";
      interval: PlanInterval;
      features: string[];
      isVisibleToStudents: boolean;
    }) => {
      return client.post("/api/plans", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["plans"],
        exact: false,
      });
      buttonRef.current?.click();
    },
  });

  const {
    mutate: updatePlan,
    isSuccess: isUpdateSuccess,
    data: updatePlanData,
  } = useMutation({
    mutationFn: (body: {
      name: string;
      description: string;
      price: number | "";
      interval: PlanInterval;
      features: string[];
      customInterval: number;
      isVisibleToStudents: boolean;
    }) => {
      return client.put(`/api/plans/${planId}`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["plans"],
        exact: false,
      });
      buttonRef.current?.click();
    },
  });

  const handlePlanSave = (e: MouseEvent<HTMLButtonElement>) => {
    console.log("saving");
    createPlan({
      interval,
      name,
      price,
      features,
      description,
      isVisibleToStudents,
    });
  };

  const handlePlanUpdate = () => {
    console.log("isVisible on update:", isVisibleToStudents);
    updatePlan({
      interval,
      name,
      price,
      features,
      description,
      customInterval: customInterval || 0,
      isVisibleToStudents,
    });
  };

  if (type === "update") {
    console.log("reached here");
    const { isSuccess: isFetchSuccess, data: plan } = useQuery({
      queryFn: async () => {
        return (await client.get(`/api/plans/${planId}`)).data;
      },
      refetchOnMount: "always", // always refetch when component mounts
      refetchOnWindowFocus: "always", // always refetch when window regains focus
      refetchOnReconnect: "always", // always refetch when reconnecting to network
      staleTime: 0, // data is considered stale immediately
      queryKey: ["plans", planId],
    });

    useEffect(() => {
      if (isFetchSuccess) {
        setName(plan.name);
        setDescription(plan.description);
        setFeatures(plan.features);
        setPrice(plan.priceInRupees);
        setInterval(plan.interval);
        setCustomInterval(plan.customInterval);
        setIsVisibleToStudents(plan.isVisibleToStudents);
      }
    }, [isFetchSuccess, plan]);
  }

  useEffect(() => {
    if (isSuccess && createPlanData) {
      setName("");
      setDescription("");
      setFeatures([]);
      setPrice("");
      setInterval("3months");
      setCustomInterval(1);
      setIsVisibleToStudents(true);
      dialogCloseRef.current?.click();
    }
  }, [isSuccess]);

  // useEffect(() => {
  //   if (isUpdateSuccess && updatePlanData) {
  //     setName("");
  //     setDescription("");
  //     setFeatures([]);
  //     setPrice("");
  //     setInterval("3months");
  //     setCustomInterval(1);
  //     setIsVisibleToStudents(true);
  //     dialogCloseRef.current?.click();
  //   }
  // }, [isUpdateSuccess]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          ref={buttonRef}
          variant={type === "update" ? "outline" : "default"}
        >
          {type === "update" ? "Edit" : "Create New Plan"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Plan</DialogTitle>
          <DialogDescription>
            Make changes to your plan here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="name-1">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              id="name-1"
              name="name"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="description">Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              id="description"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="price">Price in Rupees</Label>
            <Input
              id="price"
              name="price"
              value={price}
              type="number"
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => {
                if (e.target.value === "") {
                  setPrice("");
                  return;
                }
                setPrice(+e.target.value);
              }}
            />
          </div>
          <div className="grid gap-3">
            <Label>Features</Label>
            {features.map((f, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  value={f}
                  type="text"
                  onChange={(e) =>
                    setFeatures((prev) => {
                      const cp = [...prev];

                      cp[idx] = e.target.value;
                      return cp;
                    })
                  }
                />
                <Button
                  onClick={() =>
                    setFeatures((prev) => {
                      const cp = [...prev];
                      cp.splice(idx, 1);
                      return cp;
                    })
                  }
                  variant={"outline"}
                  className="text-destructive"
                >
                  <MdDelete />
                </Button>
              </div>
            ))}
            <div className="w-full justify-center flex text-primary">
              <Button
                onClick={() =>
                  setFeatures((prev) => {
                    return prev.concat("");
                  })
                }
                variant={"outline"}
              >
                <MdAdd />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-3">
              <Label htmlFor="interval">Interval</Label>
              <Select
                value={interval}
                onValueChange={(v) => setInterval(v as PlanInterval)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Interval" />
                </SelectTrigger>
                <SelectContent id="interval">
                  <SelectGroup>
                    <SelectLabel>Interval</SelectLabel>
                    <SelectItem value={"monthly" as PlanInterval}>
                      Monthly
                    </SelectItem>
                    <SelectItem value={"3months" as PlanInterval}>
                      3 Months
                    </SelectItem>
                    <SelectItem value={"6months" as PlanInterval}>
                      6 Months
                    </SelectItem>
                    <SelectItem value={"9months" as PlanInterval}>
                      9 Months
                    </SelectItem>
                    <SelectItem value={"yearly" as PlanInterval}>
                      Yearly
                    </SelectItem>
                    <SelectItem value={"custom" as PlanInterval}>
                      Custom
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {interval === "custom" && (
              <div className="grid gap-3">
                <Label htmlFor="interval-in-days">Interval In Days</Label>

                <Input
                  value={customInterval}
                  type="number"
                  id="interval-in-days"
                  min={1}
                  onWheel={(e) => e.currentTarget.blur()}
                  onChange={(e) => {
                    if (e.target.value === "") {
                      setCustomInterval("");
                    } else {
                      setCustomInterval(+e.target.value);
                    }
                  }}
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex gap-3">
              <Input
                type="checkbox"
                checked={isVisibleToStudents}
                onChange={(e) => {
                  console.log("isVisibletostudents: ", e.target.checked);
                  setIsVisibleToStudents(e.target.checked);
                }}
                className="h-4 w-4"
              />
              <Label htmlFor="interval">Is Visible to Students</Label>
            </div>
            {/* {interval === "custom" && (
              <div className="grid gap-3">
                <Label htmlFor="interval-in-days">Interval In Days</Label>

                <Input
                  value={customInterval}
                  type="number"
                  id="interval-in-days"
                  min={1}
                  onWheel={(e) => e.currentTarget.blur()}
                  onChange={(e) => {
                    if (e.target.value === "") {
                      setCustomInterval("");
                    } else {
                      setCustomInterval(+e.target.value);
                    }
                  }}
                />
              </div>
            )} */}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button ref={dialogCloseRef} variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={type === "create" ? handlePlanSave : handlePlanUpdate}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUpdatePlansDialog;
