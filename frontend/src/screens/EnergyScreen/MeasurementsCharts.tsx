"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Text,
  XAxis,
  YAxis,
} from "recharts";
import { TfiReload } from "react-icons/tfi";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type {
  MeasurableEntityNames,
  Measurement,
  Reading,
} from "@/types/measurement.type";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
// import { Button } from "antd"
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { httpClient } from "@/services/httpClient";
import type { AxiosInstance } from "axios";
import { LucideChevronLeft, LucideChevronRight } from "lucide-react";

export const description = "A multiple bar chart";

const chartData = [
  { name: "January", beforeVal: 186, afterVal: 80 },
  { name: "February", beforeVal: 305, afterVal: 200 },
  { name: "March", beforeVal: 237, afterVal: 120 },
  { name: "April", beforeVal: 73, afterVal: 190 },
  { name: "May", beforeVal: 209, afterVal: 130 },
  { name: "June", beforeVal: 214, afterVal: 140 },
];

const chartConfig = {
  afterVal: {
    label: "After",
    color: "var(--chart-1)",
  },
  beforeVal: {
    label: "Before",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const CustomTick = ({ x, y, payload }: any) => {
  const date = new Date(payload.value);
  const day = format(date, "dd/MM");
  const time = format(date, "hh:mm a");

  return (
    // <g transform={`translate(${x},${y})`}>
    //   <text x={0} y={0} dy={-6} textAnchor="middle" fill="#666">
    //     {day}
    //   </text>
    //   <text x={0} y={0} dy={10} textAnchor="middle" fill="#999">
    //     {time}
    //   </text>
    // </g>
    <Text>H</Text>
  );
};

export interface EntityAverage {}

const getEntityAverage = async ({
  entityType,
  client,
}: {
  entityType: MeasurableEntityNames;
  client: AxiosInstance;
}) => {
  const { data } = await client.get("/api/measurements/average", {
    params: {
      entityType,
    },
  });
  return data;
};

export function MeasurementsCharts({
  measurementData,
  entityType,
  start,
  setStart,
}: {
  measurementData: Measurement[];
  entityType: MeasurableEntityNames;
  start: number;
  setStart: React.Dispatch<React.SetStateAction<number>>;
}) {
  // const [start, setStart] = useState(0);
  const [end, setEnd] = useState(5);
  const [diff, setDiff] = useState(15);
  const allReadings = measurementData.flatMap((m) => ({
    readings: m.readings,
    location: m.location,
    measurementFor: m.measurementFor,
  }));

  const groupedByEnergy: Record<string, Reading[]> = {};
  for (const measurement of allReadings) {
    for (const reading of measurement.readings) {
      if (!reading.on || !reading.on._id) {
        continue;
      }
      const key = reading.on._id;
      if (!groupedByEnergy[key]) groupedByEnergy[key] = [];
      groupedByEnergy[key].push({
        ...reading,
        location: measurement.location,
        measurementFor: measurement.measurementFor,
      });
    }
  }
  return (
    <div>
      {/* <div className="grid">
        <EntityAverageChart entityType={entityType} />
      </div> */}

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className={cn("grid grid-cols-1  gap-2")}>
          {Object.entries(groupedByEnergy).map(([energyId, readings]) => {
            const energyName = readings[0]?.on.name ?? "Unknown Energy";
            const top = readings.slice(start, start + diff);

            const chartData = top.map((r, idx) => ({
              //   createdAt: `${new Date(r.createdAt!).toLocaleDateString()}`,
              // createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
              createdAt: JSON.stringify(r),
              name: energyName,
              beforeVal: r.beforeVal,
              afterVal: r.afterVal,
              location: r.location,
              measurementFor: r.measurementFor,
            }));

            while (chartData.length < diff) {
              chartData.push({
                createdAt: "",
                name: energyName,
                beforeVal: null,
                afterVal: null,
                location: "",
                measurementFor: "",
              });
            }

            return (
              <Card key={energyId}>
                <CardHeader>
                  <CardTitle>{energyName}</CardTitle>
                  <CardDescription>
                    <div className="flex mt-1 justify-start sm:justify-end gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 aspect-square bg-chart-3" />
                        <span>Before {entityType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 aspect-square bg-chart-1" />
                        <span>After {entityType}</span>
                      </div>
                    </div>
                  </CardDescription>
                  {/* <CardDescription>
                {format(new Date(top[top.length - 1].createdAt!), "do MMM")}
                  {top.length &&
                    format(
                      new Date(top[top.length - 1].createdAt!),
                      "MMM yyyy"
                    )}
                </CardDescription> */}
                </CardHeader>
                {/* <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={true} />
                    <XAxis
                      dataKey="createdAt"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      // tick={<CustomTick />}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return format(date, "dd/MM");
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      width={40}
                      // interval={9}
                      domain={[-100, 100]}
                      ticks={Array.from({ length: 21 }, (_, i) => i * 10 - 100)}
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dashed" />}
                    />
                    <Bar
                      dataKey="beforeVal"
                      fill="var(--color-beforeVal)"
                      radius={4}
                    />
                    <Bar
                      dataKey="afterVal"
                      fill="var(--color-afterVal)"
                      radius={4}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent> */}
                <CardContent>
                  <div className="flex max-h-[1000px]">
                    <div
                      className="shrink-0 overflow-x-hidden"
                      style={{ width: "40px" }}
                    >
                      {/* <div className="w-[100px] min-h-[600px] overflow-hidden"> */}
                      <ChartContainer
                        // className="p-0 m-0"
                        config={chartConfig}
                        className="aspect-auto h-[850px] "
                      >
                        <BarChart
                          accessibilityLayer
                          data={chartData}
                          width={Math.max(chartData.length * 100, 600)}
                          height={350}
                          margin={{ bottom: 80 }}
                          syncId="syncCharts"
                        >
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            width={40}
                            interval={0}
                            domain={[-102, 102]}
                            ticks={Array.from(
                              { length: 21 },
                              (_, i) => i * 10 - 100
                            )}
                            tick={{ fontSize: 12 }}
                          />
                          <Bar
                            dataKey="beforeVal"
                            fill="transparent"
                            radius={4}
                          />
                          <Bar
                            dataKey="afterVal"
                            fill="transparent"
                            radius={4}
                          />
                        </BarChart>
                      </ChartContainer>
                      {/* </div> */}
                    </div>
                    <div className="flex-1 overflow-x-auto">
                      {/* <div className="min-w-[1500px] max-h-[1000px]  "> */}
                      {/* 👈 sets minimum width */}
                      <ChartContainer
                        className="aspect-auto h-[850px] min-w-[1500px] overflow-x-auto"
                        config={chartConfig}
                      >
                        <BarChart
                          accessibilityLayer
                          data={chartData}
                          width={Math.max(chartData.length * 100, 600)}
                          height={350}
                          margin={{ bottom: 50 }}
                          // style={{
                          //   maxHeight: 700,
                          //   position: "absolute",
                          //   left: 0,
                          // }}
                          syncId="syncCharts"
                        >
                          {/* <ChartLegend
                          verticalAlign="top"
                          align="right"
                          // wrapperStyle={{ paddingBottom: "1rem" }}
                        /> */}
                          <CartesianGrid vertical={true} horizontal />
                          <XAxis
                            dataKey="createdAt"
                            tickLine={false}
                            tickMargin={10}
                            alignmentBaseline="middle"
                            axisLine={false}
                            interval={0}
                            tick={(data) => {
                              const row = data.payload.value
                                ? JSON.parse(data.payload.value)
                                : null;
                              const date = row
                                ? format(new Date(row.createdAt), "hh:mm dd/MM")
                                : null;

                              if (!row) {
                                return <></>;
                              }
                              return (
                                <text
                                  x={data.x}
                                  y={data.y}
                                  textAnchor="middle"
                                  fill="#374151"
                                  fontSize={12}
                                >
                                  <tspan x={data.x} dy="0">
                                    {date}
                                  </tspan>
                                  {row.location && (
                                    <tspan x={data.x} dy="1.2em">
                                      Loc: {row.location}
                                    </tspan>
                                  )}
                                  {row.measurementFor && (
                                    <tspan x={data.x} dy="1.2em">
                                      For: {row.measurementFor}
                                    </tspan>
                                  )}
                                </text>
                              );
                            }}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            width={40}
                            interval={0}
                            domain={[-102, 102]}
                            ticks={Array.from(
                              { length: 21 },
                              (_, i) => i * 10 - 100
                            )}
                            tick={{ fontSize: 12 }}
                            hide
                          />
                          {/* <YAxis domain={[-102, 102]} hide={true} /> */}
                          <ChartTooltip
                            cursor={false}
                            content={
                              <ChartTooltipContent
                                indicator="dashed"
                                hideLabel
                              />
                            }
                            // formatter={(val, name) => {
                            //   if (name === "meta") {
                            //     return null;
                            //   }
                            //   return [val, name];
                            // }}
                          />
                          <Bar
                            dataKey="beforeVal"
                            fill="var(--color-beforeVal)"
                            radius={4}
                          />
                          <Bar
                            dataKey="afterVal"
                            fill="var(--color-afterVal)"
                            radius={4}
                          />
                        </BarChart>
                      </ChartContainer>
                      {/* </div> */}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex items-start gap-2 text-sm">
                  <Button
                    onClick={(e) => {
                      if (start >= diff) {
                        setStart(start - diff);
                        // setEnd(start + 5)
                      } else {
                        setStart(0);
                      }
                    }}
                    variant="outline"
                    disabled={start <= 0}
                  >
                    <LucideChevronLeft />
                  </Button>
                  <Button
                    onClick={(e) => {
                      if (start + diff < readings.length) {
                        setStart(start + diff);
                      }
                    }}
                    variant="outline"
                    disabled={start + diff >= readings.length}
                  >
                    <LucideChevronRight />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// export const EntityAverageChart = ({
//   entityType,
// }: {
//   entityType: MeasurableEntityNames;
// }) => {
//   // const chartData = [
//   //   { month: "January", desktop: 186, mobile: 80 },
//   //   { month: "February", desktop: 305, mobile: 200 },
//   //   { month: "March", desktop: 237, mobile: 120 },
//   //   { month: "April", desktop: 73, mobile: 190 },
//   //   { month: "May", desktop: 209, mobile: 130 },
//   //   { month: "June", desktop: 214, mobile: 140 },
//   // ]

//   // const entityAvgData = [
//   //   {
//   //     _id: "687f3205363bbfbac82096ba",
//   //     name: "Energy 1",
//   //     avgBeforeVal: 112.63636363636364,
//   //     avgAfterVal: 137.0909090909091,
//   //     totalReadings: 11,
//   //     createdAt: "2025-07-22T06:39:01.887Z",
//   //   },
//   //   {
//   //     _id: "687f3208363bbfbac82096bd",
//   //     name: "Energy 2",
//   //     avgBeforeVal: 101.45454545454545,
//   //     avgAfterVal: 196.0909090909091,
//   //     totalReadings: 11,
//   //     createdAt: "2025-07-22T06:39:04.398Z",
//   //   },
//   //   {
//   //     _id: "687f320a363bbfbac82096c0",
//   //     name: "Energy 3",
//   //     avgBeforeVal: 134.36363636363637,
//   //     avgAfterVal: 232.72727272727272,
//   //     totalReadings: 11,
//   //     createdAt: "2025-07-22T06:39:06.466Z",
//   //   },
//   //   {
//   //     _id: "687f320c363bbfbac82096c3",
//   //     name: "Energy 4",
//   //     avgBeforeVal: 175.0909090909091,
//   //     avgAfterVal: 126.9090909090909,
//   //     totalReadings: 11,
//   //     createdAt: "2025-07-22T06:39:08.058Z",
//   //   },
//   //   {
//   //     _id: "6884ac0359c8440778f1f23d",
//   //     name: "Energy 5",
//   //     avgBeforeVal: 526.8181818181819,
//   //     avgAfterVal: 143.1818181818182,
//   //     totalReadings: 11,
//   //     createdAt: "2025-07-26T10:20:51.957Z",
//   //   },
//   // ]

//   const client = httpClient();

//   const { data, isSuccess, isLoading, refetch, isFetching } = useQuery<{
//     message: string;
//     data: EntityAverage[];
//   }>({
//     queryKey: ["entitiesAverage", entityType],
//     queryFn: () => getEntityAverage({ entityType, client }),
//   });

//   const chartConfig = {
//     avgBeforeVal: {
//       label: "Before",
//       color: "var(--chart-1)",
//     },
//     avgAfterVal: {
//       label: "After",
//       color: "var(--chart-2)",
//     },
//   } satisfies ChartConfig;

//   return (
//     <>
//       {isSuccess && data.data.length > 0 && (
//         <Card>
//           <CardHeader className="grid-cols-2 ">
//             <CardHeader className="p-0">
//               <CardTitle>{entityType} Chart - Before After</CardTitle>
//               <CardDescription>January - June 2024</CardDescription>
//             </CardHeader>
//             <div className="flex ">
//               <Button
//                 onClick={() => refetch()}
//                 variant={"outline"}
//                 className="ml-auto"
//                 disabled={isLoading || isFetching}
//               >
//                 {isLoading || isFetching ? (
//                   <Loader2Icon className="animate-spin" />
//                 ) : (
//                   <TfiReload />
//                 )}
//               </Button>
//             </div>
//           </CardHeader>
//           <CardContent className="px-2 sm:p-6">
//             <ChartContainer
//               config={chartConfig}
//               className="aspect-auto h-[250px] w-full"
//             >
//               <LineChart
//                 accessibilityLayer
//                 data={data.data}
//                 margin={{
//                   left: 20,
//                   right: 12,
//                 }}
//               >
//                 <CartesianGrid vertical={true} horizontal={true} />
//                 <YAxis
//                   tickLine={false}
//                   axisLine={false}
//                   tickMargin={10}
//                   width={40}
//                   domain={[-100, 100]}
//                   tick={{ fontSize: 12 }}
//                 />
//                 <XAxis
//                   dataKey="name"
//                   tickLine={false}
//                   axisLine={false}
//                   tickMargin={8}
//                   textAnchor="middle"
//                   padding={{ left: 20, right: 20 }}
//                   // tickFormatter={(value) => value.slice(0, 3)}
//                 />
//                 <ChartTooltip
//                   cursor={false}
//                   content={<ChartTooltipContent />}
//                   formatter={(value, name) => {
//                     if (name === "meta") {
//                       return null;
//                     }
//                     return [value, name];
//                   }}
//                 />
//                 <Line
//                   dataKey="avgBeforeVal"
//                   type="linear"
//                   stroke="var(--color-avgBeforeVal)"
//                   strokeWidth={2}
//                   dot={false}
//                 />
//                 <Line
//                   dataKey="avgAfterVal"
//                   type="linear"
//                   stroke="var(--color-avgAfterVal)"
//                   strokeWidth={2}
//                   dot={false}
//                 />
//               </LineChart>
//             </ChartContainer>
//           </CardContent>
//           {/* <CardFooter>
//             <div className="flex w-full items-start gap-2 text-sm">
//               <div className="grid gap-2">
//                 <div className="flex items-center gap-2 leading-none font-medium">
//                   Trending up by 5.2% this month{" "}
//                   <TrendingUp className="h-4 w-4" />
//                 </div>
//                 <div className="text-muted-foreground flex items-center gap-2 leading-none">
//                   Showing total visitors for the last 6 months
//                 </div>
//               </div>
//             </div>
//           </CardFooter> */}
//         </Card>
//       )}
//     </>
//   );
// };

{
  /* <BarChart accessibilityLayer data={chartData}>
      <CartesianGrid vertical={false} />
      <XAxis
        dataKey="name"
        tickLine={false}
        tickMargin={10}
        axisLine={false}
        tickFormatter={(value) => value.slice(0, 3)}
      />
      <ChartTooltip
        cursor={false}
        content={<ChartTooltipContent indicator="dashed" />}
      />
      <Bar dataKey="beforeVal" fill="var(--color-beforeVal)" radius={4} />
      <Bar dataKey="afterVal" fill="var(--color-afterVal)" radius={4} />
    </BarChart> */
}
