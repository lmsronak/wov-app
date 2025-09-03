import { Button } from "@/components/ui/button";
import React from "react";
import * as XLSX from "xlsx";

const readings = [
  {
    _id: "6896e1d058b3e5462d9092a3",
    beforeVal: 23,
    afterVal: 51,
    on: {
      _id: "6896df4dbb5f68fdf4191200",
      name: "Product 1",
      user: "689036abe14c21062a4f7170",
      client: "6896df4cbb5f68fdf41911d2",
      type: "Product",
      __v: 0,
      createdAt: "2025-08-09T05:40:29.007Z",
      updatedAt: "2025-08-09T05:40:29.007Z",
    },
    onModel: "Product",
    createdAt: "2025-08-09T05:51:12.187Z",
    updatedAt: "2025-08-09T05:51:12.187Z",
  },
  {
    _id: "6896e1d058b3e5462d9092a4",
    beforeVal: 54,
    afterVal: 34,
    on: {
      _id: "6896df4dbb5f68fdf4191201",
      name: "Product 2",
      user: "689036abe14c21062a4f7170",
      client: "6896df4cbb5f68fdf41911d2",
      type: "Product",
      __v: 0,
      createdAt: "2025-08-09T05:40:29.007Z",
      updatedAt: "2025-08-09T05:40:29.007Z",
    },
    onModel: "Product",
    createdAt: "2025-08-09T05:51:12.188Z",
    updatedAt: "2025-08-09T05:51:12.188Z",
  },
  {
    _id: "6896e1d058b3e5462d9092a5",
    beforeVal: 35,
    afterVal: 100,
    on: {
      _id: "6896df4dbb5f68fdf4191202",
      name: "Product 3",
      user: "689036abe14c21062a4f7170",
      client: "6896df4cbb5f68fdf41911d2",
      type: "Product",
      __v: 0,
      createdAt: "2025-08-09T05:40:29.007Z",
      updatedAt: "2025-08-09T05:40:29.007Z",
    },
    onModel: "Product",
    createdAt: "2025-08-09T05:51:12.188Z",
    updatedAt: "2025-08-09T05:51:12.188Z",
  },
  {
    _id: "6896e1d058b3e5462d9092a6",
    beforeVal: 51,
    afterVal: 98,
    on: {
      _id: "6896df4dbb5f68fdf4191203",
      name: "Product 4",
      user: "689036abe14c21062a4f7170",
      client: "6896df4cbb5f68fdf41911d2",
      type: "Product",
      __v: 0,
      createdAt: "2025-08-09T05:40:29.007Z",
      updatedAt: "2025-08-09T05:40:29.007Z",
    },
    onModel: "Product",
    createdAt: "2025-08-09T05:51:12.188Z",
    updatedAt: "2025-08-09T05:51:12.188Z",
  },
  {
    _id: "6896e1d058b3e5462d9092a7",
    beforeVal: 99,
    afterVal: 44,
    on: {
      _id: "6896df4dbb5f68fdf4191204",
      name: "Product 5",
      user: "689036abe14c21062a4f7170",
      client: "6896df4cbb5f68fdf41911d2",
      type: "Product",
      __v: 0,
      createdAt: "2025-08-09T05:40:29.007Z",
      updatedAt: "2025-08-09T05:40:29.007Z",
    },
    onModel: "Product",
    createdAt: "2025-08-09T05:51:12.188Z",
    updatedAt: "2025-08-09T05:51:12.188Z",
  },
  {
    _id: "6896e1d058b3e5462d9092a8",
    beforeVal: 34,
    afterVal: 51,
    on: {
      _id: "6896df4dbb5f68fdf4191205",
      name: "Product 6",
      user: "689036abe14c21062a4f7170",
      client: "6896df4cbb5f68fdf41911d2",
      type: "Product",
      __v: 0,
      createdAt: "2025-08-09T05:40:29.007Z",
      updatedAt: "2025-08-09T05:40:29.007Z",
    },
    onModel: "Product",
    createdAt: "2025-08-09T05:51:12.188Z",
    updatedAt: "2025-08-09T05:51:12.188Z",
  },
];

const ReportsScreen = () => {

  const handleDownload = () => {
    const products = [...new Set(readings.map((r) => r.on.name))];

    const grouped: Record<string, any> = {};
    readings.forEach((r) => {
      const timeKey = new Date(r.createdAt).toLocaleString();
      if (!grouped[timeKey]) grouped[timeKey] = { Time: timeKey };
      grouped[timeKey][`${r.on.name}_Before`] = r.beforeVal;
      grouped[timeKey][`${r.on.name}_After`] = r.afterVal;
    });
    const tableRows = Object.values(grouped);

    // Step 3: Build 2-row header
    const headerRow1 = ["Time"];
    const headerRow2 = [""];
    products.forEach((product) => {
      headerRow1.push(product, ""); // main header cell + empty for merge
      headerRow2.push("Before", "After");
    });

    // Step 4: Convert data to rows
    const dataRows = tableRows.map((row) => {
      const rowArray = [row.Time];
      products.forEach((product) => {
        rowArray.push(
          row[`${product}_Before`] || "",
          row[`${product}_After`] || ""
        );
      });
      return rowArray;
    });

    // Step 5: Combine into full sheet data
    const sheetData = [headerRow1, headerRow2, ...dataRows];
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Step 6: Add merges for main product headers
    const merges: XLSX.Range[] = [];
    let col = 1; // start after "Time"
    products.forEach(() => {
      merges.push({ s: { r: 0, c: col }, e: { r: 0, c: col + 1 } }); // merge across 2 cols
      col += 2;
    });
    worksheet["!merges"] = merges;

    // Step 7: Create workbook and trigger download
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Readings");
    XLSX.writeFile(workbook, "readings.xlsx");
  };
  return (
    <div>
      <Button onClick={handleDownload}>Generate Client Report</Button>
    </div>
  );
};

export default ReportsScreen;
