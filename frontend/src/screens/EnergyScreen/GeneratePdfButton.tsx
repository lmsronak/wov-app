import { Button } from "@/components/ui/button";
import type {
  Entity,
  MeasurableEntityNames,
  MeasurableEntityType,
  Measurement,
  Reading,
} from "@/types/measurement.type";
import React, { useEffect, useRef, useState } from "react";
import { getMeasurementsList } from "./use-energy-measurements";
import { httpClient } from "@/services/httpClient";
import type {
  Content,
  TableCell,
  TDocumentDefinitions,
} from "pdfmake/interfaces";
import pdfMake from "pdfmake/build/pdfmake";
import html2canvas from "html2canvas";
import { Download, DownloadIcon, Loader2Icon } from "lucide-react";
import * as htmlToImage from "html-to-image";
import ChartCanvas from "./ChartCanvas";
import { flattenToRows } from ".";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { DateRange } from "react-day-picker";
import { toast } from "react-toastify";
import { Grid } from "antd";
import { userInfoAtom, type UserInfo } from "@/atoms/user";
import { format } from "date-fns";
import { useAtomValue } from "jotai";

const { useBreakpoint } = Grid;

// --- helper functions ---
function chunkArray<T>(arr: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  console.log("chunks after: ", chunks);
  return chunks;
}

const getDefaultDoc = (
  entitiesData: Entity[],
  tableBodyRef: React.RefObject<TableCell[][]>,
  type: MeasurableEntityNames,
  clientInfo: UserInfo,
  studentInfo: UserInfo | null
) =>
  ({
    pageOrientation: "landscape",
    pageSize: { width: 1000, height: 580 },
    pageMargins: [15, 15, 15, 30],
    content: [
      {
        text: `Lecher Antenna Practitioner Details: \n Name - ${studentInfo?.name} \n Email - ${studentInfo?.email} \n Phone - ${studentInfo?.phone}`,
        style: "header",
        margin: [0, 0, 10, 10],
      },
      {
        text: `Clients ${type} Report for ${clientInfo.name} \n Client Contact: ${clientInfo.email}, ${clientInfo.phone}`,
        style: "header",
        margin: [0, 0, 10, 10],
      },
      {
        style: "tableExample",
        color: "#444",
        table: {
          widths: [100, ...entitiesData.flatMap(() => ["*", "*"])],
          headerRows: 2,
          body: tableBodyRef.current,
        },
      },
      { text: "", pageBreak: "after" },
    ],
    footer: (currentPage, pageCount) => ({
      text: `${currentPage} / ${pageCount}`,
      alignment: "center",
      fontSize: 10,
      margin: [0, 0, 0, 20], // last number = distance from bottom
    }),
  } as TDocumentDefinitions);

const GeneratePdfButton = ({
  type,
  entitiesData,
  clientInfo,
  range,
}: {
  type: MeasurableEntityNames;
  entitiesData: Entity[];
  clientInfo: UserInfo;
  range?: DateRange;
}) => {
  const [renderCharts, setRenderCharts] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const screens = useBreakpoint();
  const tableBodyRef = useRef([] as TableCell[][]);
  const userInfo = useAtomValue(userInfoAtom);
  //   const docDefinitionRef = useRef<TDocumentDefinitions>({
  //     pageOrientation: "landscape",
  //     pageSize: { width: 1000, height: 580 },
  //     pageMargins: [15, 15, 15, 20],
  //     content: [
  //       {
  //         text: `Clients ${type} Report for ${clientInfo.name} \n Client Contact: ${clientInfo.email}, ${clientInfo.phone}`,
  //         style: "header",
  //         margin: [0, 0, 10, 10],
  //       },
  //       {
  //         style: "tableExample",
  //         color: "#444",
  //         table: {
  //           widths: [100, ...entitiesData.flatMap(() => ["*", "*"])],
  //           headerRows: 2,
  //           body: tableBodyRef.current,
  //         },
  //       },
  //       { text: "", pageBreak: "after" },
  //     ],
  //     footer: function (currentPage, pageCount) {
  //       return {
  //         text: currentPage.toString() + " / " + pageCount,
  //         alignment: "center",
  //         fontSize: 20,
  //         margin: [0, 0, 10, 0],
  //       };
  //     },
  //   });
  const docDefinitionRef = useRef<TDocumentDefinitions>(
    getDefaultDoc(entitiesData, tableBodyRef, type, clientInfo, userInfo)
  );
  const [energies, setEnergies] = useState(
    [] as Reading<MeasurableEntityType>[][]
  );
  const [chartPages, setChartPages] = useState<any[]>([]);
  const visitedRef = useRef<string[]>([]);
  const client = httpClient();

  const populateCharts = async (measurements: Measurement[]) => {
    // const { data: measurements } = await getMeasurementsList(type, client, {
    //   page: 1,
    //   limit: 1000,
    // });

    // group & chunk as before
    const groupedByEnergy: Record<string, Reading[]> = {};
    for (const m of measurements) {
      for (const r of m.readings) {
        const key = r.on._id;
        if (!groupedByEnergy[key]) groupedByEnergy[key] = [];
        groupedByEnergy[key].push({
          ...r,
          location: m.location,
          measurementFor: m.measurementFor,
        });
      }
    }

    const allChunks: Reading<MeasurableEntityType>[][] = [];
    for (const readings of Object.values(groupedByEnergy)) {
      allChunks.push(...chunkArray(readings, 15));
    }

    console.log("allCHunks: ", allChunks);
    setEnergies(allChunks);
    setRenderCharts(true);
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    // const body: TableCell[][] = [];
    // const docDefinition: TDocumentDefinitions = {
    //   pageOrientation: "landscape",
    //   pageSize: { width: 1000, height: 580 },
    //   content: [
    //     { text: "PDF Table Example", style: "header" },
    //     {
    //       style: "tableExample",
    //       color: "#444",
    //       table: {
    //         widths: [100, ...entitiesData.flatMap(() => ["*", "*"])],
    //         headerRows: 2,
    //         body: body,
    //       },
    //     },
    //   ],
    // };

    const { data: measurements } = await getMeasurementsList(
      type,
      client,
      {
        page: 1,
        limit: 1000,
      },
      range
    );

    if (!measurements.length) {
      setIsDownloading(false);
      toast.info("No Data Received to generate report");
      return;
    }

    const rows = flattenToRows(measurements);

    const headerRow1: any[] = [
      {
        text: "Time",
        style: "tableHeader",
        alignment: "center",
        rowSpan: 2,
        bold: true,
      },
    ];

    const headerRow2: any[] = [{}]; // Empty cell under "Time"

    for (const entity of entitiesData) {
      headerRow1.push(
        {
          text: entity.name,
          style: "tableHeader",
          colSpan: 2,
          alignment: "center",
          bold: true,
        },
        {}
      );
      headerRow2.push(
        {
          text: "Before",
          style: "tableHeader",
          alignment: "center",
          bold: true,
        },
        {
          bold: true,
          text: "After",
          style: "tableHeader",
          alignment: "center",
        }
      );
    }

    // const body = [headerRow1, headerRow2];

    // setTableBody((prev) => {
    //   return [...prev, headerRow1, headerRow2];
    // });

    tableBodyRef.current.push(headerRow1);
    tableBodyRef.current.push(headerRow2);

    for (const row of rows) {
      const bodyRow: any[] = [];
      // Time column with multi-line text
      const timeText = `${format(
        new Date(row.createdAt),
        "hh:mm"
      )}\nLocation: ${row.location}${
        row.measurementFor ? `\nMeasurement For: ${row.measurementFor}` : ""
      }`;
      bodyRow.push(timeText);

      for (const entity of entitiesData) {
        const beforeKey = `${entity._id}_before`;
        const afterKey = `${entity._id}_after`;
        // bodyRow.push(row[beforeKey] ?? "-", row[afterKey] ?? "-");
        bodyRow.push(
          {
            text: row[beforeKey] || "-",
            alignment: "center",
            valign: "middle",
          },
          { text: row[afterKey] || "-", alignment: "center", valign: "middle" }
        );
      }

      tableBodyRef.current.push(bodyRow);
      //   setTableBody((prev) => [...prev, bodyRow]);
    }

    // const docDefinition: TDocumentDefinitions = {
    //   pageOrientation: "landscape",
    //   pageSize: { width: 1000, height: 580 },
    //   content: [
    //     { text: "PDF Table Example", style: "header" },
    //     {
    //       style: "tableExample",
    //       color: "#444",
    //       table: {
    //         widths: [100, ...entitiesData.flatMap(() => ["*", "*"])],
    //         headerRows: 2,
    //         body: body,
    //       },
    //     },
    //   ],
    // };

    pdfMake.vfs = pdfFonts.vfs;

    populateCharts(measurements);
  };

  useEffect(() => {
    // console.log(
    //   "energiesLength: ",
    //   energies.reduce((acc, currVal) => acc + currVal.length, 0)
    // );
    console.log("energies LEngth: ", energies.length);
    console.log("charts Length: ", chartPages);
    if (
      energies.length > 0 &&
      chartPages.length ===
        // energies.reduce((acc, currVal) => acc + currVal.length, 0)
        energies.length
    ) {
      console.log("all pages recieved");
      const content = docDefinitionRef.current.content as Content[];

      content.push(...chartPages);

      const docDefinition: TDocumentDefinitions = {
        //   pageOrientation: "landscape",
        //   pageSize: "A4",
        //   content: [{ text: "Charts PDF", style: "header" }, ...chartPages],
        //   styles: {
        //     header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        //   },
        //   defaultStyle: { fontSize: 10 },
        ...docDefinitionRef.current,
        content: content,
      };

      console.log("docDefinition: ", docDefinition);

      pdfMake.createPdf(docDefinition).getBlob((blob) => {
        const url = URL.createObjectURL(blob);
        // window.open(url);
        console.log("downloading");
        // window.open(url);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${clientInfo?.name ?? "client"}_${type}_${format(
          new Date(),
          "mm-ss_MM-yy"
        )}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });

      visitedRef.current = [];
      setChartPages([]);
      tableBodyRef.current = [];
      setRenderCharts(false);
      docDefinitionRef.current = getDefaultDoc(
        entitiesData,
        tableBodyRef,
        type,
        clientInfo,
        userInfo
      );
      setIsDownloading(false);
    } else {
    }
  }, [chartPages, energies]);

  const handleChartRendered = (dataUrl: string, id: string, name: string) => {
    try {
      //   console.log("reached here");
      //   console.log("dataUrl", dataUrl);
      if (visitedRef.current.includes(id)) {
        console.log("visited");
        return;
      }
      // setChartPages((prev) => [
      //   ...prev,
      //   //   { text: "hello world", style: "header" },
      //   { image: dataUrl, width: 900, margin: [0, 0, 0, 0] }, // pdfmake format
      // ]);

      setChartPages((prev) => [
        ...prev,
        {
          stack: [
            {
              text: `Chart for ${name}`,
              style: "chartHeader",
              bold: true,
              fontSize: 14,
              margin: [10, 10, 0, 0],
            },
            { image: dataUrl, width: 900, margin: [0, 0, 0, 0] },
          ],
          pageBreak: "after",
        },
      ]);

      visitedRef.current.push(id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Button
        disabled={isDownloading}
        className="bg-emerald-500 hover:bg-emerald-700"
        onClick={handleDownloadPdf}
      >
        {isDownloading && <Loader2Icon className="animate-spin" />}
        <DownloadIcon />
        {screens.sm && "Generate Report"}
      </Button>
      {/* <div
        className="min-h-screen absolute 
    //-left-[99999px]
      z-10"
      >
        <div className="bg-white   rounded-lg shadow-lg" ref={containerRef}>
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="border border-gray-200 rounded-lg"
              style={{ maxWidth: "100vw", height: "100vh" }}
            />
          </div>
        </div>
      </div> */}
      <div
        className="absolute 
      -left-[9999px]
      "
      >
        {renderCharts &&
          energies.map((energy, eidx) => {
            // return energy.map((chunk, cIdx) => (
            return (
              <ChartCanvas
                id={`${eidx}-${eidx}`}
                energyData={energy}
                onRendered={handleChartRendered}
                type={type}
              />
            );
            // ));
          })}
      </div>
    </>
  );
};

export default GeneratePdfButton;
