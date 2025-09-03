import type {
  MeasurableEntityNames,
  MeasurableEntityType,
  Reading,
} from "@/types/measurement.type";
import React, { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { format } from "date-fns";

// const ChartCanvas = ({
//   energyData,
//   onRendered,
//   id,
//   type,
// }: {
//   energyData: Reading<MeasurableEntityType>[];
//   onRendered: (dataUrl: string, id: string, name: string) => void;
//   id: string;
//   type: MeasurableEntityNames;
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const containerRef = useRef<HTMLDivElement>(null);

//   function truncateText(
//     ctx: CanvasRenderingContext2D,
//     text: string,
//     maxWidth: number
//   ) {
//     let ellipsis = "...";
//     let width = ctx.measureText(text).width;
//     if (width <= maxWidth) return text;

//     while (
//       text.length > 0 &&
//       ctx.measureText(text + ellipsis).width > maxWidth
//     ) {
//       text = text.slice(0, -1);
//     }
//     return text + ellipsis;
//   }

//   const [isRendered, setIsRendered] = useState(false);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     // Set canvas size
//     canvas.width = 1000;
//     canvas.height = 550;

//     // Chart dimensions and margins
//     const margin = { top: 50, right: 50, bottom: 150, left: 80 };
//     const chartWidth = canvas.width - margin.left - margin.right;
//     const chartHeight = canvas.height - margin.top - margin.bottom;
//     const chartX = margin.left;
//     const chartY = margin.top;

//     // Clear canvas
//     ctx.fillStyle = "white";
//     ctx.fillRect(0, 0, canvas.width, canvas.height);

//     // Chart background
//     ctx.fillStyle = "white";
//     ctx.fillRect(chartX, chartY, chartWidth, chartHeight);

//     // Y-axis range: -100 to 100
//     const yMin = -100;
//     const yMax = 100;
//     const yRange = yMax - yMin;

//     // Draw Y-axis
//     ctx.strokeStyle = "#333";
//     ctx.lineWidth = 2;
//     ctx.beginPath();
//     ctx.moveTo(chartX, chartY);
//     ctx.lineTo(chartX, chartY + chartHeight);
//     ctx.stroke();

//     // Draw X-axis (at y=0)
//     const zeroY = chartY + chartHeight - ((0 - yMin) / yRange) * chartHeight;
//     ctx.beginPath();
//     ctx.moveTo(chartX, zeroY);
//     ctx.lineTo(chartX + chartWidth, zeroY);
//     ctx.stroke();

//     // Draw Y-axis labels and grid lines
//     ctx.font = "12px Arial";
//     ctx.fillStyle = "#666";
//     ctx.textAlign = "right";
//     ctx.textBaseline = "middle";

//     for (let y = yMin; y <= yMax; y += 10) {
//       const yPos = chartY + chartHeight - ((y - yMin) / yRange) * chartHeight;

//       // Grid lines
//       ctx.strokeStyle = y === 0 ? "#333" : "#e0e0e0";
//       ctx.lineWidth = y === 0 ? 2 : 1;
//       ctx.beginPath();
//       ctx.moveTo(chartX, yPos);
//       ctx.lineTo(chartX + chartWidth, yPos);
//       ctx.stroke();

//       // Y-axis labels
//       ctx.fillStyle = "#333";
//       ctx.fillText(y.toString(), chartX - 10, yPos);
//     }

//     // Calculate bar positions
//     const barCount = energyData.length;
//     const barGroupWidth = chartWidth / barCount;
//     const barWidth = Math.min(40, barGroupWidth * 0.3);
//     const barSpacing = 5;

//     // Draw vertical grid lines
//     ctx.strokeStyle = "#e0e0e0";
//     ctx.lineWidth = 1;
//     energyData.forEach((_, index) => {
//       const centerX = chartX + (index + 0.5) * barGroupWidth;
//       ctx.beginPath();
//       ctx.moveTo(centerX, chartY);
//       ctx.lineTo(centerX, chartY + chartHeight);
//       ctx.stroke();
//     });

//     // Draw bars for each data point
//     energyData.forEach((data, index) => {
//       const centerX = chartX + (index + 0.5) * barGroupWidth;
//       const beforeBarX = centerX - barWidth - barSpacing / 2;
//       const afterBarX = centerX + barSpacing / 2;

//       const beforeVal = data.beforeVal || 0;
//       const afterVal = data.afterVal || 0;
//       // Calculate bar heights and positions
//       const beforeHeight = (Math.abs(beforeVal) / yRange) * chartHeight;
//       const afterHeight = (Math.abs(afterVal) / yRange) * chartHeight;

//       // Before value bar (blue)
//       ctx.fillStyle = "#4169E1"; // Royal blue
//       if (beforeVal >= 0) {
//         // Positive value - bar goes up from zero line
//         const barY = zeroY - beforeHeight;
//         ctx.fillRect(beforeBarX, barY, barWidth, beforeHeight);
//       } else {
//         // Negative value - bar goes down from zero line
//         ctx.fillRect(beforeBarX, zeroY, barWidth, beforeHeight);
//       }

//       // After value bar (orange)
//       ctx.fillStyle = "#FF6B35"; // Orange-red
//       if (afterVal >= 0) {
//         // Positive value - bar goes up from zero line
//         const barY = zeroY - afterHeight;
//         ctx.fillRect(afterBarX, barY, barWidth, afterHeight);
//       } else {
//         // Negative value - bar goes down from zero line
//         ctx.fillRect(afterBarX, zeroY, barWidth, afterHeight);
//       }

//       // Add value labels on bars
//       ctx.fillStyle = "#333";
//       ctx.font = "bold 11px Arial";
//       ctx.textAlign = "center";

//       // Before value label
//       const beforeLabelY =
//         beforeVal >= 0 ? zeroY - beforeHeight - 5 : zeroY + beforeHeight + 15;
//       ctx.fillText(
//         beforeVal.toString(),
//         beforeBarX + barWidth / 2,
//         beforeLabelY
//       );

//       // After value label
//       const afterLabelY =
//         afterVal >= 0 ? zeroY - afterHeight - 5 : zeroY + afterHeight + 15;
//       ctx.fillText(afterVal.toString(), afterBarX + barWidth / 2, afterLabelY);

//       // X-axis labels (multi-line)
//       ctx.font = "11px Arial";
//       ctx.fillStyle = "#333";
//       ctx.textAlign = "center";

//       const date = data.createdAt ? new Date(data.createdAt) : null;

//       //   const timeLabel = date?.toLocaleString("en-GB", {
//       //     day: "2-digit",
//       //     month: "2-digit",
//       //     year: "2-digit",
//       //     hour: "2-digit",
//       //     minute: "2-digit",
//       //   });

//       const timeLabel = date && format(date, "MM:SS");
//       const dateLabel = date && format(date, "mm/yy");

//       // Time
//       ctx.fillText(timeLabel ?? "", centerX, chartY + chartHeight + 20);
//       ctx.fillText(dateLabel ?? "", centerX, chartY + chartHeight + 35);

//       // Location
//       //   if (data.location) {
//       //     ctx.font = "10px Arial";
//       //     ctx.fillStyle = "#666";
//       //     const locationText =
//       //       data.location.length > 15
//       //         ? data.location.substring(0, 15) + "..."
//       //         : data.location;
//       //     ctx.fillText(locationText, centerX, chartY + chartHeight + 50);
//       //   }

//       //   // Measurement For
//       //   if (data.measurementFor) {
//       //     ctx.font = "10px Arial";
//       //     ctx.fillStyle = "#888";
//       //     const measurementText =
//       //       data.measurementFor.length > 20
//       //         ? data.measurementFor.substring(0, 20) + "..."
//       //         : data.measurementFor;
//       //     ctx.fillText(measurementText, centerX, chartY + chartHeight + 65);
//       //   }

//       if (data.location) {
//         ctx.font = "10px Arial";
//         ctx.fillStyle = "#666";
//         const safeLocation = truncateText(ctx, data.location, 50);
//         ctx.fillText(safeLocation, centerX, chartY + chartHeight + 50);
//       }

//       if (data.measurementFor) {
//         ctx.font = "10px Arial";
//         ctx.fillStyle = "#888";
//         const safeMeasurement = truncateText(ctx, data.measurementFor, 50);
//         ctx.fillText(safeMeasurement, centerX, chartY + chartHeight + 65);
//       }
//     });

//     // Chart title
//     // ctx.font = "bold 18px Arial";
//     // ctx.fillStyle = "#333";
//     // ctx.textAlign = "center";
//     // ctx.fillText("Global Energy Measurements", canvas.width / 2, 30);

//     // Legend
//     const legendX = chartX + chartWidth - 100;
//     const legendY = chartY;

//     // Before Energy (blue)
//     ctx.fillStyle = "#4169E1";
//     ctx.fillRect(legendX, legendY, 15, 15);
//     ctx.fillStyle = "#333";
//     ctx.font = "12px Arial";
//     ctx.textAlign = "left";
//     ctx.fillText("Before Energy", legendX + 20, legendY + 12);

//     // After Energy (orange)
//     ctx.fillStyle = "#FF6B35";
//     ctx.fillRect(legendX, legendY + 25, 15, 15);
//     ctx.fillStyle = "#333";
//     ctx.fillText("After Energy", legendX + 20, legendY + 37);

//     setIsRendered(true);

//     const dataUrl = canvas.toDataURL("image/png");
//     console.log("energy Data: ", energyData[0]);
//     onRendered(dataUrl, id, energyData[0].on.name);
//   }, []);

//   return (
//     <div
//       className="
//     //-left-[99999px]
//       z-10"
//     >
//       <div className="rounded-lg bg-green-300" ref={containerRef}>
//         <div className="flex mt-1 justify-start sm:justify-end gap-4">
//           <div className="flex items-center gap-2">
//             <div className="w-3 aspect-square bg-chart-3" />
//             <span>Before {type}</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-3 aspect-square bg-chart-1" />
//             <span>After {type}</span>
//           </div>
//         </div>
//         <div className="flex justify-center">
//           <canvas
//             ref={canvasRef}
//             className=""
//             style={{ maxWidth: "100vw", height: "100vh" }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

const ChartCanvas = ({
  energyData,
  onRendered,
  id,
  type,
}: {
  energyData: Reading<MeasurableEntityType>[];
  onRendered: (dataUrl: string, id: string, name: string) => void;
  id: string;
  type: MeasurableEntityNames;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function truncateText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ) {
    let ellipsis = "...";
    let width = ctx.measureText(text).width;
    if (width <= maxWidth) return text;

    while (
      text.length > 0 &&
      ctx.measureText(text + ellipsis).width > maxWidth
    ) {
      text = text.slice(0, -1);
    }
    return text + ellipsis;
  }

  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = 1;
    canvas.width = 1000 * scale;
    canvas.height = 550 * scale;
    ctx.scale(scale, scale);

    // Chart dimensions and margins
    const margin = { top: 70, right: 50, bottom: 150, left: 80 };
    const chartWidth = canvas.width - margin.left - margin.right;
    const chartHeight = canvas.height - margin.top - margin.bottom;
    const chartX = margin.left;
    const chartY = margin.top;

    // Clear canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // =========================
    // Draw Legend at the Top
    // =========================
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const legendTop = 20; // y position
    const legendPadding = 30; // gap between items

    // Measure text width to center legend
    const beforeText = `Before ${type}`;
    const afterText = `After ${type}`;
    const totalLegendWidth =
      12 +
      6 +
      ctx.measureText(beforeText).width +
      legendPadding +
      12 +
      6 +
      ctx.measureText(afterText).width;

    let legendXPos = (canvas.width - totalLegendWidth) / 2; // center horizontally

    // Before {type}
    ctx.fillStyle = "#4169E1"; // blue
    ctx.fillRect(legendXPos, legendTop, 12, 12);
    legendXPos += 18;
    ctx.fillStyle = "#333";
    ctx.fillText(beforeText, legendXPos, legendTop + 6);

    legendXPos += ctx.measureText(beforeText).width + legendPadding;

    // After {type}
    ctx.fillStyle = "#FF6B35"; // orange
    ctx.fillRect(legendXPos, legendTop, 12, 12);
    legendXPos += 18;
    ctx.fillStyle = "#333";
    ctx.fillText(afterText, legendXPos, legendTop + 6);

    // =========================
    // Chart background
    // =========================
    ctx.fillStyle = "white";
    ctx.fillRect(chartX, chartY, chartWidth, chartHeight);

    // Y-axis range: -100 to 100
    const yMin = -100;
    const yMax = 100;
    const yRange = yMax - yMin;

    // Draw Y-axis
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(chartX, chartY);
    ctx.lineTo(chartX, chartY + chartHeight);
    ctx.stroke();

    // Draw X-axis (at y=0)
    const zeroY = chartY + chartHeight - ((0 - yMin) / yRange) * chartHeight;
    ctx.beginPath();
    ctx.moveTo(chartX, zeroY);
    ctx.lineTo(chartX + chartWidth, zeroY);
    ctx.stroke();

    // Draw Y-axis labels and grid lines
    ctx.font = "12px Arial";
    ctx.fillStyle = "#666";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let y = yMin; y <= yMax; y += 10) {
      const yPos = chartY + chartHeight - ((y - yMin) / yRange) * chartHeight;

      ctx.strokeStyle = y === 0 ? "#333" : "#e0e0e0";
      ctx.lineWidth = y === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(chartX, yPos);
      ctx.lineTo(chartX + chartWidth, yPos);
      ctx.stroke();

      ctx.fillStyle = "#333";
      ctx.fillText(y.toString(), chartX - 10, yPos);
    }

    // Calculate bar positions
    const barCount = energyData.length;
    const barGroupWidth = chartWidth / barCount;
    const barWidth = Math.min(40, barGroupWidth * 0.3);
    const barSpacing = 5;

    // Vertical grid lines
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    energyData.forEach((_, index) => {
      const centerX = chartX + (index + 0.5) * barGroupWidth;
      ctx.beginPath();
      ctx.moveTo(centerX, chartY);
      ctx.lineTo(centerX, chartY + chartHeight);
      ctx.stroke();
    });

    // Bars
    energyData.forEach((data, index) => {
      const centerX = chartX + (index + 0.5) * barGroupWidth;
      const beforeBarX = centerX - barWidth - barSpacing / 2;
      const afterBarX = centerX + barSpacing / 2;

      const beforeVal = data.beforeVal || 0;
      const afterVal = data.afterVal || 0;

      const beforeHeight = (Math.abs(beforeVal) / yRange) * chartHeight;
      const afterHeight = (Math.abs(afterVal) / yRange) * chartHeight;

      // Before (blue)
      ctx.fillStyle = "#4169E1";
      if (beforeVal >= 0) {
        ctx.fillRect(beforeBarX, zeroY - beforeHeight, barWidth, beforeHeight);
      } else {
        ctx.fillRect(beforeBarX, zeroY, barWidth, beforeHeight);
      }

      // After (orange)
      ctx.fillStyle = "#FF6B35";
      if (afterVal >= 0) {
        ctx.fillRect(afterBarX, zeroY - afterHeight, barWidth, afterHeight);
      } else {
        ctx.fillRect(afterBarX, zeroY, barWidth, afterHeight);
      }

      // Value labels
      ctx.fillStyle = "#333";
      ctx.font = "bold 11px Arial";
      ctx.textAlign = "center";

      const beforeLabelY =
        beforeVal >= 0 ? zeroY - beforeHeight - 5 : zeroY + beforeHeight + 15;
      ctx.fillText(
        beforeVal.toString(),
        beforeBarX + barWidth / 2,
        beforeLabelY
      );

      const afterLabelY =
        afterVal >= 0 ? zeroY - afterHeight - 5 : zeroY + afterHeight + 15;
      ctx.fillText(afterVal.toString(), afterBarX + barWidth / 2, afterLabelY);

      // X-axis labels
      ctx.font = "11px Arial";
      ctx.fillStyle = "#333";
      ctx.textAlign = "center";

      const date = data.createdAt ? new Date(data.createdAt) : null;
      const timeLabel = date && format(date, "hh:mm");
      const dateLabel = date && format(date, "MM/yy");

      ctx.fillText(timeLabel ?? "", centerX, chartY + chartHeight + 20);
      ctx.fillText(dateLabel ?? "", centerX, chartY + chartHeight + 35);

      // Extra info
      if (data.location) {
        ctx.font = "10px Arial";
        ctx.fillStyle = "#666";
        const safeLocation = truncateText(ctx, data.location, 50);
        ctx.fillText(safeLocation, centerX, chartY + chartHeight + 50);
      }

      if (data.measurementFor) {
        ctx.font = "10px Arial";
        ctx.fillStyle = "#888";
        const safeMeasurement = truncateText(ctx, data.measurementFor, 50);
        ctx.fillText(safeMeasurement, centerX, chartY + chartHeight + 65);
      }
    });

    setIsRendered(true);

    const dataUrl = canvas.toDataURL("image/png");
    onRendered(dataUrl, id, energyData[0].on.name);
  }, []);

  return (
    <div className="z-10">
      <div className="rounded-lg bg-green-300">
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            style={{ maxWidth: "100vw", height: "100vh" }}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartCanvas;
