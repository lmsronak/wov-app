import { Button } from "@/components/ui/button";
import type {
  Entity,
  MeasurableEntityNames,
  Measurement,
} from "@/types/measurement.type";
import { Grid, Row, Table, type TablePaginationConfig } from "antd";
import Column from "antd/es/table/Column";
import ColumnGroup from "antd/es/table/ColumnGroup";
import { format } from "date-fns";
import { useEffect, useMemo, type RefObject } from "react";
import { AiFillEdit } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import { useMeasurement } from "./use-energy-measurements";
import { useEntities } from "./use-energy-entities";
import CreateUpdateMeasurementDialog from "./CreateMeasurementDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/services/httpClient";
import { Loader2Icon } from "lucide-react";

export interface DataType {
  key: string;
  createdAt: string;
  location: string;
  [reading: string]: string | boolean | null | undefined;
}

const { useBreakpoint } = Grid;

export const entitiesOrder: Record<MeasurableEntityNames, string[]> = {
  Chakra: [
    "Crown (Sahasrara)",
    "Third Eye (Ajna)",
    "Throat (Vishuddha)",
    "Heart (Anahata)",
    "Solar Plexus (Manipura)",
    "Sacral (Svadhisthana)",
    "Root (Muladhara)",
  ],
  Energy: ["Cosmic Energy", "Telluric Energy", "Global Energy"],
  Gland: [
    "Pineal Gland",
    "Pituitary Gland",
    "Thyroid Gland",
    "Thymus Gland",
    "Pancreas Gland",
    "Sexual Gland",
    "Adrenaline Gland",
  ],
  Organ: [
    "Heart",
    "Lungs",
    "Stomach",
    "Liver",
    "Pancreas",
    "Gallbladder",
    "Kidneys",
    "Bladder",
    "Ureters",
    "Thyroid gland",
    "Brain",
    "Pancreas",
    "Spinal cord",
    "Bones",
    "Ligaments",
    "Muscles",
  ],
  Product: [
    "Product 1",
    "Product 2",
    "Product 3",
    "Product 4",
    "Product 5",
    "Product 6",
  ],
  Space: ["Main Door", "Kitchen", "Bedroom", "Room 1", "Room 2", "Room 3"],
};

const MeasurementsTable = ({
  type,
  maxTableWidth,
  isLoading,
  rows,
  entitiesData,
  pagination,
  onChangePagination,
}: {
  type: MeasurableEntityNames;
  maxTableWidth: number;
  isLoading: boolean;
  rows: DataType[];
  entitiesData: Entity[];
  pagination: TablePaginationConfig;
  onChangePagination: (pag: TablePaginationConfig) => void;
}) => {
  const screens = useBreakpoint();
  const queryClient = useQueryClient();
  const client = httpClient();

  const {
    mutate: deleteMeasurementById,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: (id: string) => {
      return client.delete(`/api/measurements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["measurements", type],
        exact: false,
      });
    },
  });

  const handleDelete = async (id: string) => {
    await deleteMeasurementById(id);
    const currentPage = pagination.current ?? 1;
    const pageSize = pagination.pageSize ?? 10;

    const itemsOnPage = rows.length;

    if (itemsOnPage === 1 && currentPage > 1) {
      // console.log("no ")
      onChangePagination({ ...pagination, current: currentPage - 1 });
    } else {
      onChangePagination({ ...pagination });
    }
  };

  const order = entitiesOrder[type];

  const sortedEntities = [
    ...order
      .map((name) => entitiesData.find((e) => e.name === name))
      .filter(Boolean),
    ...entitiesData.filter((e) => !order.includes(e.name)),
  ];

  return (
    <Table<DataType>
      bordered
      scroll={{ x: "max-content", y: "65vh" }}
      dataSource={rows}
      loading={isLoading || isPending}
      style={{ width: maxTableWidth, maxWidth: "100%" }}
      pagination={pagination}
      onChange={onChangePagination}
    >
      <Column
        width={100}
        title={"Time"}
        dataIndex={"createdAt"}
        render={(val, record) => (
          <div>
            {format(new Date(val), "PPpp")}
            <p>
              <strong>Location:</strong> {record.location}
              <br />
              {type === "Energy" && (
                <>
                  <strong>Measurement For: </strong>{" "}
                  {record.measurementFor || "-"}
                </>
              )}
            </p>
          </div>
        )}
        fixed={screens.sm ? "left" : undefined}
      />
      {sortedEntities.map((entity) => (
        <ColumnGroup key={entity?._id} title={entity?.name}>
          <Column
            title="Before"
            dataIndex={`${entity?._id}_before`}
            key={`${entity?._id}_before`}
            render={(val) => val ?? "-"}
            width={80}
          />
          <Column
            title="After"
            dataIndex={`${entity?._id}_after`}
            key={`${entity?._id}_after`}
            render={(val) => val ?? "-"}
            width={80}
          />
        </ColumnGroup>
      ))}
      <Column
        title={null}
        key="actions"
        fixed="right"
        width={5}
        render={(_, record) => (
          <div className="flex gap-2 flex-col">
            <CreateUpdateMeasurementDialog
              entityType={type}
              actionType="update"
              dialogTrigger={
                <Button
                  size={"icon"}
                  variant={"outline"}
                  className="bg-blue-500 text-white"
                >
                  <AiFillEdit />
                </Button>
              }
              updateId={record.measurementId}
            />
            <Button
              size={"icon"}
              variant={"outline"}
              className="bg-red-500 text-white"
              onClick={async () => await handleDelete(record.measurementId)}
              disabled={isPending}
            >
              {/* {isPending ? (
                <Loader2Icon className="animate-spin" />
              ) : ( */}
              <MdDelete />
              {/* )} */}
            </Button>
          </div>
        )}
      />
    </Table>
  );
};

export default MeasurementsTable;
