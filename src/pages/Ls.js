import React, { useState, useEffect, useCallback } from "react";
import DataTable from "react-data-table-component";
import { useAuth } from "../hooks/useAuth";
import { url } from "../constants/serverInfo";

// --------------------------
// Reusable Energy Card
// --------------------------
const EnergyCard = ({ label, value, color, unit = "kWh" }) => (
  <div
    className={`bg-white rounded-lg p-4 shadow-sm border border-${color}-200 text-center 
        transition-all duration-300 hover:scale-105 hover:shadow-md`}
  >
    <div className={`text-sm font-medium text-${color}-600 mb-1`}>{label}</div>
    <div className={`text-2xl font-bold text-${color}-800`}>
      {Number(value || 0).toFixed(1)}
    </div>
    <div className="text-xs text-gray-500 mt-1">{unit}</div>
  </div>
);

const Ls = () => {
    console.log('redering merchant dashboard')
  const [devices, setDevices] = useState([]);
  const [totals, setTotals] = useState({
    today: 0,
    monthly: 0,
    yearly: 0,
    lifetime: 0,
  });

  const { user } = useAuth();
  const MerchantID = user?.ID;

  // --------------------------
  // Fetch API (Optimized)
  // --------------------------
  const fetchDeviceDashboardData = useCallback(async () => {
    if (!MerchantID) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${url}/merchants/fetch-device-dashboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ MerchantID }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const res = await response.json();
      const list = res?.data?.devices || [];
      console.log("Data",list)

      setDevices(list);

      // Compute totals in one pass
      const totalsMerged = list.reduce(
        (acc, item) => ({
          today: acc.today + parseInt(item.TodayGeneration || 0),
          monthly: acc.monthly + parseInt(item.MonthlyGeneration || 0),
          yearly: acc.yearly + parseInt(item.YearlyGeneration || 0),
          lifetime: acc.lifetime + parseInt(item.LifetimeGeneration || 0),
        }),
        { today: 0, monthly: 0, yearly: 0, lifetime: 0 }
      );

      setTotals(totalsMerged);
    } catch (error) {
      if (error.name !== "AbortError") console.error("Fetch Error:", error);
    } finally {
      clearTimeout(timeout);
    }
  }, [MerchantID]);

  useEffect(() => {
    fetchDeviceDashboardData();
  }, [fetchDeviceDashboardData]);

  // --------------------------
  // Table Columns
  // --------------------------
  const numericCol = (name, selector) => ({
    name,
    selector,
    sortable: true,
    right: true,
    width: "170px",
  });

  const columns = [
    {
      name: "Device ID",
      selector: (row) => row.DeviceID || row.deviceId || "-",
      sortable: true,
    },
    {
      name: "Plant Name",
      selector: (row) => row.ProductName || row.productName || "-",
      sortable: true,
    },
    numericCol("Today Generation", (row) => row.TodayGeneration),
    numericCol("Monthly Generation", (row) => row.MonthlyGeneration),
    numericCol("Yearly Generation", (row) => row.YearlyGeneration),
    numericCol("Lifetime Generation", (row) => row.LifetimeGeneration),
  ];

  // --------------------------
  // CSV Export (Optimized)
  // --------------------------
  const exportToCSV = () => {
    if (!devices.length) return;

    const headers = [
      "Device ID",
      "Plant Name",
      "Today Generation",
      "Monthly Generation",
      "Yearly Generation",
      "Lifetime Generation",
    ];

    const rows = devices.map((d) => [
      d.DeviceID || "",
      d.ProductName|| "",
      d.TodayGeneration || "",
      d.MonthlyGeneration || "",
      d.YearlyGeneration || "",
      d.LifetimeGeneration || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = `plants-generation-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    link.click();
  };

  // --------------------------
  // Table Action Button
  // --------------------------
  const CustomActions = () => (
    <button
      onClick={exportToCSV}
      disabled={!devices.length}
      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 
                 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Export CSV
    </button>
  );

  return (
    <>
      {/* TOP CARDS */}
      <div className="grid grid-cols-2 m-4 gap-6 lg:grid-cols-4">
        <EnergyCard label="Today" value={totals.today} color="blue" />
        <EnergyCard label="Monthly" value={totals.monthly} color="green" />
        <EnergyCard label="Yearly" value={totals.yearly} color="amber" unit="MWh" />
        <EnergyCard label="Lifetime" value={totals.lifetime} color="purple" unit="MWh" />
      </div>

      {/* DATA TABLE */}
      <div className="m-4">
        <DataTable
          columns={columns}
          data={devices}
          pagination
          highlightOnHover
          striped
          responsive
          fixedHeader
          fixedHeaderScrollHeight="270px"
          actions={<CustomActions />}
        />
      </div>
    </>
  );
};

export default Ls;
