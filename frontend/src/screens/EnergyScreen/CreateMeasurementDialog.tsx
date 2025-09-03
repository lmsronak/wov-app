import { useAtom, useSetAtom } from "jotai";
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
import {
  appendMeasurementsAtom,
  getMeasurementById,
  measurementsAtom,
  updateOneMeasurementAtom,
} from "./use-energy-measurements";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type {
  MeasurableEntityNames,
  MeasurableEntityType,
  Measurement,
  Reading,
} from "@/types/measurement.type";
import { useEffect, useRef, useState } from "react";
import { entitiesAtom } from "./use-energy-entities";
import { atomWithImmer } from "jotai-immer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { httpClient } from "@/services/httpClient";
import { Loader2Icon } from "lucide-react";
import { Grid } from "antd";
import { entitiesOrder } from "./MeasurementsTable";

const defaultMeasurementAtom = atomWithImmer<Measurement>({
  _id: "",
  client: "",
  createdAt: "",
  readings: [],
  type: "Energy",
  updatedAt: "",
  user: "",
  description: "",
  location: "",
  person: "",
});
export function isMeasurableEntity(
  entity: any
): entity is MeasurableEntityType {
  const validTypes: MeasurableEntityNames[] = [
    "Energy",
    "Chakra",
    "Organ",
    "Gland",
    "Space",
    "Product",
  ];

  return (
    entity &&
    typeof entity === "object" &&
    typeof entity._id === "string" &&
    typeof entity.name === "string" &&
    typeof entity.user === "string" &&
    typeof entity.client === "string" &&
    typeof entity.type === "string" &&
    validTypes.includes(entity.type) &&
    typeof entity.createdAt === "string" &&
    typeof entity.updatedAt === "string"
  );
}

const CreateUpdateMeasurementForm = ({
  entityType,
  actionType,
  updateId,
}: {
  entityType: MeasurableEntityNames;
  actionType: "create" | "update";
  updateId?: string;
}) => {
  const [readings, setReadings] = useState([] as Reading[]);
  const [location, setLocation] = useState("");
  const [measurementFor, setMeasurementFor] = useState("");
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  const [entitiesState] = useAtom(entitiesAtom);
  const { data: entities } = entitiesState;

  const appendItems = useSetAtom(appendMeasurementsAtom);
  const updateOneMeasurement = useSetAtom(updateOneMeasurementAtom);
  const client = httpClient();

  const queryClient = useQueryClient();

  const {
    mutate: createMeasurement,
    isSuccess,
    data,
    isPending: isCreatePending,
  } = useMutation({
    mutationFn: ({
      readings,
      entityType,
      location,
      measurementFor,
    }: {
      readings: Reading[];
      entityType: MeasurableEntityNames;
      location: string;
      measurementFor?: string;
    }) => {
      return client.post<Measurement>("/api/measurements", {
        entityType,
        readings,
        location,
        ...(entityType === "Energy" ? { measurementFor } : {}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["measurements", entityType],
        exact: false,
      });
    },
  });

  const {
    mutate: updateMeasurement,
    isSuccess: isUpdateSuccess,
    data: updatedMeasurement,
    isPending: isUpdatePending,
  } = useMutation({
    mutationFn: ({
      readings,
      type,
      location,
      measurementFor,
    }: {
      readings: Reading[];
      type: MeasurableEntityNames;
      location: string;
      measurementFor?: string;
    }) => {
      return axios.patch<Measurement>(`/api/measurements/${updateId}`, {
        type,
        readings,
        location,
        measurementFor,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["measurements"],
        exact: false,
      });
    },
  });

  const SaveChanges = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (actionType === "create") {
      createMeasurement({ readings, entityType, location, measurementFor });
    } else {
      updateMeasurement({
        readings,
        type: entityType,
        location,
        measurementFor,
      });
    }
  };

  useEffect(() => {
    if (entities && entities.length) {
      console.log("entities: ", entities);
      setReadings(
        entities.map((entity) => ({
          beforeVal: 0,
          afterVal: 0,
          on: entity,
          onModel: entity.type,
        }))
      );

      console.log("readings: ", readings);
    }
  }, [entities]);

  useEffect(() => {
    if (actionType === "update") {
      if (!updateId) {
        throw new Error("update id should be provided for action type update.");
      }

      const fetchAndSet = async () => {
        try {
          const measurement = await getMeasurementById(updateId, client);
          setLocation(measurement.location ?? "");
          setReadings(measurement.readings ?? []);
          setMeasurementFor(measurement.measurementFor ?? "");
        } catch (error) {
          console.error("Failed to fetch measurement:", error);
        }
      };

      fetchAndSet();
    }
  }, []);

  useEffect(() => {
    if (isSuccess && data) {
      appendItems([data.data]);
      dialogCloseRef.current?.click();
    }
  }, [isSuccess, data]);

  useEffect(() => {
    if (isUpdateSuccess && updatedMeasurement) {
      console.log("reached here");
      updateOneMeasurement(updatedMeasurement.data);
      dialogCloseRef.current?.click();
    }
  }, [updatedMeasurement, isUpdateSuccess]);

  const onReadingsBeforeValueChange = (value: number | "", index: number) => {
    setReadings(
      readings.map((reading, idx) => {
        if (idx === index) {
          return {
            ...reading,
            beforeVal: value === "" ? "" : value,
          };
        } else {
          return {
            ...reading,
          };
        }
      })
    );
  };

  const onReadingsAfterValueChange = (value: number | "", index: number) => {
    setReadings(
      readings.map((reading, idx) => {
        if (idx === index) {
          return {
            ...reading,
            afterVal: value,
          };
        } else {
          return reading;
        }
      })
    );
  };

  let isLoading = isCreatePending || isUpdatePending;

  const fixedOrder = entitiesOrder[entityType];

  const sortedReadings: any = [
    // first, the fixed order ones (if they exist)
    ...fixedOrder
      .map((name) => readings.find((r) => r.on?.name === name))
      .filter(Boolean),
    // then all others not in fixed order
    ...readings.filter((r) => !fixedOrder.includes(r.on?.name)),
  ];

  return (
    <form onSubmit={(e) => SaveChanges(e)} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Add new Measurement</DialogTitle>
        <DialogDescription>
          Enter the details for your Measurement. Click save when you&apos;re
          done.
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="max-h-[70vh]">
        <div className="grid gap-4 p-4">
          <div className="grid gap-3">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Enter Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Separator />
          </div>
          {entityType === "Energy" && (
            <div className="grid gap-3">
              <Label htmlFor="measurement-for">Measurement For: </Label>
              <Input
                id="measurement-for"
                placeholder="Place / Person / Object"
                value={measurementFor}
                onChange={(e) => setMeasurementFor(e.target.value)}
              />
              <Separator />
            </div>
          )}
          {sortedReadings.map(
            (reading: Reading<MeasurableEntityType>, idx: number) => {
              if (isMeasurableEntity(reading.on)) {
                return (
                  <div key={reading.on._id} className="grid gap-2">
                    <p>{reading.on.name}</p>
                    <div className="grid gap-3">
                      <Label htmlFor={`${reading.on._id}_beforeVal`}>
                        Before Value:
                      </Label>
                      <Input
                        id={`${reading.on._id}_beforeVal`}
                        name="beforeVal"
                        type="number"
                        onWheel={(e) => e.currentTarget.blur()}
                        min={-100}
                        max={100}
                        value={reading.beforeVal ?? 0}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = e.target.value;
                          onReadingsBeforeValueChange(
                            val === "" ? val : +val,
                            idx
                          );
                        }}
                      />
                      <Label htmlFor={`${reading.on._id}_afterVal`}>
                        After Value:
                      </Label>
                      <Input
                        id={`${reading.on._id}_afterVal`}
                        name="afterVal"
                        type="number"
                        onWheel={(e) => e.currentTarget.blur()}
                        min={-100}
                        max={100}
                        onFocus={(e) => e.target.select()}
                        value={reading.afterVal ?? 0}
                        onChange={(e) => {
                          const val = e.target.value;
                          onReadingsAfterValueChange(
                            val === "" ? "" : +val,
                            idx
                          );
                        }}
                      />
                    </div>
                    <Separator className="my-1" />
                  </div>
                );
              } else {
                return null;
              }
            }
          )}
        </div>
      </ScrollArea>
      <DialogFooter>
        <DialogClose asChild>
          <Button ref={dialogCloseRef} variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2Icon className="animate-spin" />} Save changes
        </Button>
      </DialogFooter>
    </form>
  );
};

const { useBreakpoint } = Grid;

const CreateUpdateMeasurementDialog = ({
  entityType,
  actionType,
  updateId,
  dialogTrigger,
}: {
  entityType: MeasurableEntityNames;
  actionType: "create" | "update";
  updateId?: string;
  dialogTrigger?: React.ReactElement;
}) => {
  const [measurementState, setMeasurementState] = useAtom(measurementsAtom);

  const [entitiesState, setEntitiesState] = useAtom(entitiesAtom);
  const screens = useBreakpoint();

  const { data: measurements } = measurementState;
  const { data: entities } = entitiesState;

  return (
    <Dialog>
      {/* <DialogTrigger asChild>
        <Button variant="default">+ Add New Measurement</Button>
      </DialogTrigger> */}
      <DialogTrigger asChild>
        {dialogTrigger ? (
          dialogTrigger
        ) : (
          <Button variant="default">
            + {screens.sm && "Add New Measurement"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <CreateUpdateMeasurementForm
          actionType={actionType}
          entityType={entityType}
          updateId={updateId}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateUpdateMeasurementDialog;
