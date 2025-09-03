import axios, { type AxiosInstance } from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./EnergyScreen.css";
import type {
  MeasurableEntityNames,
  Measurement,
  Reading,
} from "@/types/measurement.type";
import { appendEntityAtom, useEntities } from "./use-energy-entities";
import { Button } from "@/components/ui/button";
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
import { useSetAtom } from "jotai";
import * as XLSX from "xlsx";
import MeasurementsTable, { type DataType } from "./MeasurementsTable";
import CreateUpdateMeasurementDialog from "./CreateMeasurementDialog";
import { selectNavItemAtom } from "@/components/sidebar/nav-main";
import { typeToUrlMap } from "@/components/sidebar/use-sidebar-state";
import { useParams } from "react-router";
import { setCurrentClientAtom } from "../ClientScreen/clientAtom";
import { httpClient } from "@/services/httpClient";
import {
  getMeasurementsList,
  useMeasurement,
  useMeasurementV2,
} from "./use-energy-measurements";
import Calendar04 from "@/components/calendar-04";
import Calendar30 from "@/components/calendar-30";
import type { DateRange } from "react-day-picker";
import { MeasurementsCharts } from "./MeasurementsCharts";
import { format } from "date-fns";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import html2canvas from "html2canvas";
import GeneratePdfButton from "./GeneratePdfButton";
import type { UserInfo } from "@/atoms/user";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader } from "@/components/ui/card";
import Paragraph from "antd/es/typography/Paragraph";
import { Grid } from "antd";

const docDefinition: TDocumentDefinitions = {
  pageOrientation: "landscape",
  pageSize: { width: 1000, height: 595.28 },
  content: [
    { text: "PDF Table Example", style: "header" },
    {
      style: "tableExample",
      color: "#444",
      table: {
        widths: [
          100,
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
          "*",
        ],
        headerRows: 2,
        body: [
          [
            {
              text: "Time",
              style: "tableHeader",
              alignment: "center",
              rowSpan: 2,
            },
            {
              text: "Cosmic Energy",
              style: "tableHeader",
              colSpan: 2,
              alignment: "center",
            },
            {},
            {
              text: "Telluric Energy",
              style: "tableHeader",
              colSpan: 2,
              alignment: "center",
            },
            {},
            {
              text: "Telluric Energy",
              style: "tableHeader",
              colSpan: 2,
              alignment: "center",
            },
            {},
            {
              text: "Telluric Energy",
              style: "tableHeader",
              colSpan: 2,
              alignment: "center",
            },
            {},
            {
              text: "Telluric Energy",
              style: "tableHeader",
              colSpan: 2,
              alignment: "center",
            },
            {},
            {
              text: "Telluric Energy",
              style: "tableHeader",
              colSpan: 2,
              alignment: "center",
            },
            {},
            {
              text: "Telluric Energy",
              style: "tableHeader",
              colSpan: 2,
              alignment: "center",
            },
            {},
            {
              text: "Telluric Energy",
              style: "tableHeader",
              colSpan: 2,
              alignment: "center",
            },
            {},
            {
              text: "Telluric Energy",
              style: "tableHeader",
              colSpan: 2,
              alignment: "center",
            },
            {},
            {
              text: "Telluric Energy",
              style: "tableHeader",
              colSpan: 2,
              alignment: "center",
            },
            {},
            {
              text: "Telluric Energy",
              style: "tableHeader",
              colSpan: 2,
              alignment: "center",
            },
            {},
            {
              text: "Telluric Energy",
              style: "tableHeader",
              colSpan: 2,
              alignment: "center",
            },
            {},
            {
              text: "Telluric Energy",
              style: "tableHeader",
              colSpan: 2,
              alignment: "center",
            },
            {},
          ],
          [
            {},
            { text: "B", style: "tableHeader", alignment: "center" },
            { text: "A", style: "tableHeader", alignment: "center" },
            { text: "B", style: "tableHeader", alignment: "center" },
            { text: "A", style: "tableHeader", alignment: "center" },
            { text: "B", style: "tableHeader", alignment: "center" },
            { text: "A", style: "tableHeader", alignment: "center" },
            { text: "B", style: "tableHeader", alignment: "center" },
            { text: "A", style: "tableHeader", alignment: "center" },
            { text: "B", style: "tableHeader", alignment: "center" },
            { text: "A", style: "tableHeader", alignment: "center" },
            { text: "B", style: "tableHeader", alignment: "center" },
            { text: "A", style: "tableHeader", alignment: "center" },
            { text: "B", style: "tableHeader", alignment: "center" },
            { text: "A", style: "tableHeader", alignment: "center" },
            { text: "B", style: "tableHeader", alignment: "center" },
            { text: "A", style: "tableHeader", alignment: "center" },
            { text: "B", style: "tableHeader", alignment: "center" },
            { text: "A", style: "tableHeader", alignment: "center" },
            { text: "B", style: "tableHeader", alignment: "center" },
            { text: "A", style: "tableHeader", alignment: "center" },
            { text: "B", style: "tableHeader", alignment: "center" },
            { text: "A", style: "tableHeader", alignment: "center" },
            { text: "B", style: "tableHeader", alignment: "center" },
            { text: "A", style: "tableHeader", alignment: "center" },
            { text: "B", style: "tableHeader", alignment: "center" },
            { text: "A", style: "tableHeader", alignment: "center" },
          ],
          // Dummy rows
          [
            "06:00 \n Hello world \n Hello universe",
            "-100",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "7",
            "8",
            "7",
            "8",
            "7",
            "8",
            "7",
            "8",
            "7",
            "8",
            "7",
            "8",
            "7",
            "8",
            "7",
            "8",
            "7",
            "8",
          ],
          ...Array.from({ length: 100 }).map(() => [
            "06:00 \n Hello world \n Hello universe",
            "-100",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "7",
            "8",
            "7",
            "8",
            "7",
            "8",
            "7",
            "8",
            "7",
            "8",
            "7",
            "8",
            "7",
            "8",
            "7",
            "8",
            "7",
            "8",
          ]),
          // ["07:00", "2", "3", "4", "5", "6", "7", "8", "9"],
          // ["08:00", "3", "4", "5", "6", "7", "8", "9", "10"],
          // ["09:00", "4", "5", "6", "7", "8", "9", "10", "11"],
          // ["10:00", "5", "6", "7", "8", "9", "10", "11", "12"],
        ],
      },
      layout: {
        fillColor: (rowIndex) => (rowIndex % 2 === 0 ? "#f3f3f3" : null),
      },
    },
  ],
  styles: {
    header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
    tableExample: { margin: [0, 5, 0, 15] },
    tableHeader: { bold: true, fontSize: 13, color: "black" },
  },
};

// Usage:
// pdfMake.createPdf(docDefinition).download("example.pdf");

const createEntity = async (
  type: string,
  name: string,
  client: AxiosInstance
) => {
  const { data } = await client.post("/api/measurements/entity", {
    entityType: type,
    name,
    // clientId: "687b3c78b462e98c6d262157",
  });

  return data;
};

export const flattenToRows = (measurementData?: Measurement[]) => {
  if (!measurementData) return [];

  const rows = measurementData.map((m) => {
    const row: DataType = {
      key: m._id,
      measurementId: m._id,
      createdAt: m.createdAt,
      location: m.location ?? "<No Location>",
      measurementFor: m.measurementFor,
    };

    for (const reading of m.readings) {
      if (!reading.on || !reading.on._id) {
        continue;
      }
      //@ts-ignore
      const readingId = reading.on._id;
      let beforeRowKey = `${readingId}_before`;
      let afterRowKey = `${readingId}_after`;
      row[beforeRowKey] = reading.beforeVal?.toString() ?? null;
      row[afterRowKey] = reading.afterVal?.toString() ?? null;
    }

    return row;
  });
  return rows;
};

const { useBreakpoint } = Grid;

const EnergiesScreen = ({ type }: { type: MeasurableEntityNames }) => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [start, setStart] = useState(0);

  const screens = useBreakpoint();

  const [maxTableWidth, setMaxTableWidth] = useState(1000);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  const [entitiesState] = useEntities(type);
  const { data: entitiesData, isSuccess } = entitiesState;

  const {
    data: measurementData,
    isLoading,
    total,
  } = useMeasurementV2(type, pagination.current, pagination.pageSize, range);

  const rows = useMemo(() => flattenToRows(measurementData), [measurementData]);

  const appendEntity = useSetAtom(appendEntityAtom);
  const selectNavItem = useSetAtom(selectNavItemAtom);
  const { clientId } = useParams();

  const {
    data: clientData,
    isSuccess: isClientSuccess,
    isLoading: isClientLoading,
  } = useQuery({
    queryFn: async () =>
      (await client.get<UserInfo>(`/api/clients/${clientId}`)).data,
    queryKey: ["profile", clientId],
  });

  const client = httpClient();

  const createNewEntity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const name = formData.get("name")?.toString() || "";

    const { data } = await createEntity(type, name, client);

    appendEntity(data);
    dialogCloseRef.current?.click();
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setMaxTableWidth(entry.contentRect.width);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    selectNavItem(typeToUrlMap[type]);
  }, []);

  const handleDownloadReport = async () => {
    const { data: measurements } = await getMeasurementsList(type, client, {
      page: 1,
      limit: 1000,
    });

    const products = [
      ...new Set(measurements.flatMap((m) => m.readings.map((r) => r.on.name))),
    ];

    // Step 2: Build table rows from measurements
    const tableRows: any[] = [];

    measurements.forEach((m) => {
      const timeStr = new Date(m.createdAt).toLocaleString();
      const locationStr = m.location ? `\nLocation: ${m.location}` : "";
      const measurementForStr = m.measurementFor
        ? `\nMeasurement For: ${m.measurementFor}`
        : "";
      const timeCell = timeStr + locationStr + measurementForStr;

      const row: Record<string, any> = { Time: timeCell };

      // Fill before/after for each product in this measurement
      m.readings.forEach((r) => {
        row[`${r.on.name}_Before`] = r.beforeVal;
        row[`${r.on.name}_After`] = r.afterVal;
      });

      tableRows.push(row);
    });

    // Step 3: Build 2-row header
    const headerRow1 = ["Time"];
    const headerRow2 = [""];
    products.forEach((product) => {
      headerRow1.push(product, "");
      headerRow2.push("Before", "After");
    });

    // Step 4: Convert tableRows into array of arrays
    const dataRows = tableRows.map((row) => {
      const rowArray = [row.Time];
      products.forEach((product) => {
        rowArray.push(
          row[`${product}_Before`] ?? "",
          row[`${product}_After`] ?? ""
        );
      });
      return rowArray;
    });

    // Step 5: Combine into full sheet data
    const sheetData = [headerRow1, headerRow2, ...dataRows];
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Step 6: Merge product name cells
    const merges: XLSX.Range[] = [];
    let col = 1;
    products.forEach(() => {
      merges.push({ s: { r: 0, c: col }, e: { r: 0, c: col + 1 } });
      col += 2;
    });
    worksheet["!merges"] = merges;

    // Step 7: Enable wrap text for the Time column so location shows nicely
    worksheet["!cols"] = [
      { wch: 25 },
      ...products.flatMap(() => [{ wch: 10 }, { wch: 10 }]),
    ];
    Object.keys(worksheet).forEach((cell) => {
      if (cell.startsWith("A") && cell !== "A1" && cell !== "A2") {
        if (!worksheet[cell].s) worksheet[cell].s = {};
        worksheet[cell].s.alignment = { wrapText: true, vertical: "top" };
      }
    });

    // Step 8: Create workbook and download
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Readings");
    const fileName = `${type}-${format(
      new Date(),
      "yyyy-MM-dd_HH-mm-ss"
    )}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleDownloadPdf = async () => {
    const { data: measurements } = await getMeasurementsList(type, client, {
      page: 1,
      limit: 1000,
    });

    const rows = flattenToRows(measurements);

    const headerRow1: any[] = [
      { text: "Time", style: "tableHeader", alignment: "center", rowSpan: 2 },
    ];

    const headerRow2: any[] = [{}]; // Empty cell under "Time"

    for (const entity of entitiesData) {
      headerRow1.push(
        {
          text: entity.name,
          style: "tableHeader",
          colSpan: 2,
          alignment: "center",
        },
        {}
      );
      headerRow2.push(
        { text: "Before", style: "tableHeader", alignment: "center" },
        { text: "After", style: "tableHeader", alignment: "center" }
      );
    }

    const body = [headerRow1, headerRow2];

    for (const row of rows) {
      const bodyRow: any[] = [];
      // Time column with multi-line text
      const timeText = `${new Date(
        row.createdAt
      ).toLocaleString()}\nLocation: ${row.location}${
        row.measurementFor ? `\nMeasurement For: ${row.measurementFor}` : ""
      }`;
      bodyRow.push(timeText);

      for (const entity of entitiesData) {
        const beforeKey = `${entity._id}_before`;
        const afterKey = `${entity._id}_after`;
        bodyRow.push(row[beforeKey] ?? "-", row[afterKey] ?? "-");
      }

      body.push(bodyRow);
    }

    const docDefinition: TDocumentDefinitions = {
      pageOrientation: "landscape",
      pageSize: { width: 1000, height: 580 },
      content: [
        { text: "PDF Table Example", style: "header" },
        {
          style: "tableExample",
          color: "#444",
          table: {
            widths: [100, ...entitiesData.flatMap(() => ["*", "*"])],
            headerRows: 2,
            body: body,
          },
        },
      ],
    };

    pdfMake.vfs = pdfFonts.vfs;

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);

    // Browser download using getBlob
    pdfDocGenerator.getBlob((blob) => {
      const url = URL.createObjectURL(blob);
      // window.open(url);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${clientData?.name ?? "client"}-${type}-${format(
        new Date(),
        "mm:ss_MM-YY"
      )}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="w-[99%]  " style={{ maxWidth: "99%" }} ref={containerRef}>
      <div className="flex flex-col md:flex-row justify-between items-center md:px-3">
        {isClientSuccess && (
          // <Card className="mb-2">

          <div className="flex flex-col   gap-1">
            <span>
              <b>Client Contact: </b>
              {clientData.email}, {clientData.phone}
            </span>
            <span>
              <b>Client Name: </b>
              {clientData.name}
            </span>
          </div>
        )}
        <div className="flex flex-wrap w-full  gap-1  justify-end my-1">
          {/* <Button
          className="bg-emerald-500 hover:bg-emerald-700"
          onClick={handleDownloadCharts}
        >
          Generate Report
        </Button> */}
          {isClientSuccess && isSuccess && entitiesData && (
            <GeneratePdfButton
              clientInfo={clientData}
              range={range}
              entitiesData={entitiesData}
              type={type}
            />
          )}
          <Calendar30 range={range} setRange={setRange} />

          {(type === "Organ" || type === "Product" || type === "Space") && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  + {screens.sm && `Add New ${type}`}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form
                  onSubmit={(e) => {
                    createNewEntity(e);
                  }}
                  className="grid gap-4"
                >
                  <DialogHeader>
                    <DialogTitle>Add new {type}</DialogTitle>
                    <DialogDescription>
                      Enter the details for your '{type}'. Click save when
                      you&apos;re done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="name-1">Name</Label>
                      <Input
                        id="name-1"
                        name="name"
                        minLength={4}
                        defaultValue={`${type} ${entitiesData.length + 1}`}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button ref={dialogCloseRef} variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit">Save changes</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
          <CreateUpdateMeasurementDialog
            actionType="create"
            entityType={type}
          />
        </div>
      </div>

      {isSuccess && entitiesData && (
        <div>
          <MeasurementsTable
            entitiesData={entitiesData}
            isLoading={isLoading}
            rows={rows}
            maxTableWidth={maxTableWidth}
            type={type}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total,
              showSizeChanger: true,
              pageSizeOptions: ["20", "50", "100"],
            }}
            onChangePagination={(pag) => {
              console.log("page changed");
              setPagination({
                current: pag.current!,
                pageSize: pag.pageSize!,
              });
              setStart(0);
            }}
          />
          <MeasurementsCharts
            measurementData={measurementData}
            entityType={type}
            setStart={setStart}
            start={start}
          />
        </div>
      )}
    </div>
  );
};

export default EnergiesScreen;
