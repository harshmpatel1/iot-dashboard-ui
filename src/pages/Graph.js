import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getIMEIFromPlant } from '../api/mockApis';
import { url } from '../constants/serverInfo'
import {
    AreaChart,
    Area,

} from "recharts";
const fillMissingWithAverage = (data) => {
    return data.map((item, index, arr) => {
        if (item.power !== 0) return item;

        const prev = arr[index - 1]?.power;
        const next = arr[index + 1]?.power;

        if (prev > 0 && next > 0) {
            return {
                ...item,
                power: (prev + next) / 2
            };
        }

        return item; // keep 0 if no valid neighbors
    });
};

// An array of month names for display on the chart's X-axis
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const PowerChart = ({ DEVICE_ID, plantId, ProductType }) => {
    console.log("plantid", plantId)
    // Renamed default from 'CURRENT' to 'CURRENT' (but will now only use 3 types)
    const [activeType, setActiveType] = useState('DAY');
    const [chartData, setChartData] = useState([]);
    const [refresh, setRefresh] = React.useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [IMEI, setIMEI] = useState(null);
    // selectedMonth is 0-indexed
    const [day, setDay] = useState(new Date().getDate());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [Graphtype, setGraphtype] = useState("SOLAR")

    // --- EFFECT 1: Get IMEI from DEVICE_ID ---
    useEffect(() => {
        const getIMEI = async () => {
            if (!DEVICE_ID) {
                setIMEI(null);
                return;
            }
            if (!IMEI) {
                setLoading(true);
            }
            setError(null);
            try {
                const getRes = await getIMEIFromPlant({ plantId: DEVICE_ID });
                if (getRes.data && getRes.data.length > 0) {
                    const fetchedIMEI = getRes.data[0].IMEI;
                    console.log('Successfully fetched IMEI:', fetchedIMEI);
                    setIMEI(fetchedIMEI);
                } else {
                    throw new Error("No IMEI found for the given device ID.");
                }
            } catch (err) {
                console.error('Error fetching IMEI:', err);
                setError('Could not fetch device details (IMEI).');
                setLoading(false);
            }
        };

        getIMEI();
    }, [DEVICE_ID]);

    // Generate year options (current year and previous years)
    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = currentYear; year >= currentYear - 5; year--) {
            years.push(year);
        }
        return years;
    };

    // --- EFFECT 2: Fetch Graph Data ---
    useEffect(() => {
        const formatDate = (date) => date.toISOString().split('T')[0];

        const getApiParams = () => {
            const params = {
                IMEI: IMEI,
                activeType: activeType,
                FromDate: null,
                ToDate: null,
                plantId: plantId,
                GraphType: Graphtype
            };

            switch (activeType) {
                case 'DAY':
                    console.log("selectedDay:", day);

                    // Create selected day in UTC
                    const selectedDate = new Date(
                        Date.UTC(selectedYear, selectedMonth, day)
                    );

                    // SAME date for FromDate and ToDate
                    params.FromDate = formatDate(selectedDate);
                    params.ToDate = formatDate(selectedDate);

                    params.activeType = 'CURRENT';
                    break;

                case 'MONTH':
                    console.log("selectedmonth:", selectedMonth)
                    // Monthly Summary (Day-wise data for a selected month)
                    const firstDayOfSelectedMonth = new Date(Date.UTC(selectedYear, selectedMonth, 1));
                    const lastDayOfSelectedMonth = new Date(Date.UTC(selectedYear, selectedMonth + 1, 0));
                    //api need only month so we send same date for from and to
                    params.FromDate = formatDate(firstDayOfSelectedMonth);
                    params.ToDate = formatDate(lastDayOfSelectedMonth);
                    // Assuming the API uses 'DAY' for day-wise data
                    params.activeType = 'DAY';
                    break;
                case 'YEAR':
                    // Yearly Summary (Month-wise data for a selected year)
                    const yearStart = new Date(selectedYear, 1, 1); // Jan 1 of selected year
                    const yearEnd = new Date(selectedYear, 11, 31); // Dec 31 of selected year
                    params.FromDate = formatDate(yearStart);
                    params.ToDate = formatDate(yearEnd);
                    // Assuming the API uses 'MONTH' for month-wise data
                    params.activeType = 'MONTH';
                    break;
                default:
                    break;
            }
            return params;
        };

        const fetchGraphData = async () => {
            if (!IMEI) {
                if (!DEVICE_ID) {
                    setLoading(false);
                }
                return;
            }
            // Set loading to true when a fetch is initiated
            setLoading(true);
            setError(null);

            const USER_AUTH_TOKEN = 'mySuperSecretToken123!@#11';

            try {
                let finalData = [];
                let totalGen = '';

                // Get parameters based on the UI activeType, which maps to API type
                const params = getApiParams();

                console.log('API Params:', params);

                const response = await fetch(`${url}/display/fetch-graph-data`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${USER_AUTH_TOKEN}`
                    },
                    body: JSON.stringify(params),
                });

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                console.log("Graph data:", data)
                if (data.success !== "1" || !data.PowerList) throw new Error('API returned an error or invalid data');

                // Determine data processing based on the UI activeType
                if (activeType === 'MONTH') {
                    // Day-wise data for the month (API activeType was 'DAY')
                    finalData = data.PowerList.map(item => ({
                        INTERVAL: `${item.value}`, // Day number
                        power: parseFloat(item.power),
                    }));
                } else if (activeType === 'YEAR') {
                    // Month-wise data for the year (API activeType was 'MONTH')
                    finalData = data.PowerList.map(item => ({
                        // item.KEY is 1-12 for month view, so -1 to get 0-11 index for MONTH_NAMES
                        INTERVAL: MONTH_NAMES[item.value - 1],
                        power: parseFloat(item.power),
                    }));
                } else {
                    // CURRENT view
                    finalData = data.PowerList.map(item => ({
                        // Assuming CURRENT key is time/hour
                        INTERVAL: item.value,
                        power: parseFloat(item.power),
                    }));
                }

                console.log('finalData', finalData);
                totalGen = data.TotalGeneration || '';

                const processedData =
                    activeType === "DAY"
                        ? fillMissingWithAverage(finalData)
                        : finalData;

                setChartData(processedData);

            } catch (err) {
                console.error('Error fetching graph data:', err);
                setError(err.message);
                setChartData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchGraphData();
    }, [IMEI, activeType, DEVICE_ID, selectedMonth, selectedYear, refresh, day, Graphtype]);


    const handleDayChange = (dayindex) => {
        setDay(dayindex)

    }

    // Handler keeps selectedMonth 0-indexed (0-11)
    const handleMonthChange = (monthIndex) => {
        setSelectedMonth(monthIndex);
    };

    const handleYearChange = (year) => {
        setSelectedYear(year);
    };


    function downloadCSV(data, filename = "data.csv") {
        if (!data || !data.length) {
            console.error("No data provided to generate CSV.");
            return;
        }

        // Extract headers from object keys
        const headers = Object.keys(data[0]);

        // Convert rows to CSV format
        const rows = data.map(obj =>
            headers.map(header => {
                let value = obj[header] ?? "";
                // Escape quotes by doubling them
                value = String(value).replace(/"/g, '""');
                return `"${value}"`;
            }).join(",")
        );

        // Create full CSV string
        const csvContent = [headers.join(","), ...rows].join("\n");

        // Create Blob and download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.style.display = "none";

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    }

    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center items-center h-full text-gray-500">Loading data... ⏳</div>;
        }
        if (error) {
            return <div className="flex justify-center items-center h-full text-red-500">Error: {error} 😟</div>;
        }
        if (chartData.length === 0) {
            return <div className="flex justify-center items-center h-full text-gray-500">No data available for this period.</div>;
        }



        return (
            <ResponsiveContainer width="100%" height="100%">
                {activeType === "DAY" ? (
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" vertical={false} />

                        <XAxis dataKey="INTERVAL" />

                        <YAxis
                            label={{ value: "Power (kWh)", angle: -90, position: "insideLeft" }}
                        />

                        <Tooltip />

                        <Area
                            type="monotone"
                            dataKey="power"
                            stroke="#f97316"
                            fillOpacity={1}
                            fill="url(#colorPower)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </AreaChart>
                ) : (
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="INTERVAL" tick={{ fontSize: 10 }}   />
                         <YAxis tick={{ fontSize: 10 }} label={{ value: "Power (kWh)", angle: -90, position: "insideLeft", style: { fontSize: 10 } }} />
                        <Tooltip />
                        
                        <Bar dataKey="power" fill="#4ade80" radius={[4, 4, 0, 0]} />
                    </BarChart>
                )}
            </ResponsiveContainer>

        );
    };
    function getDaysInMonth(monthName, year) {
        if (monthName === null || monthName === undefined || year === null || year === undefined) {
            return 0;
        }

        // If monthName is a number (0–11)
        if (typeof monthName === "number") {
            return new Date(year, monthName + 1, 0).getDate();
        }

        // If monthName is not a string
        if (typeof monthName !== "string") {
            console.error("Invalid monthName:", monthName);
            return 0;
        }

        const normalizedMonth =
            monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase();

        const monthIndex = new Date(`${normalizedMonth} 1, ${year}`).getMonth();

        // Invalid month name check
        if (isNaN(monthIndex)) {
            console.error("Invalid month name:", monthName);
            return 0;
        }

        return new Date(year, monthIndex + 1, 0).getDate();
    }


    const days = getDaysInMonth(selectedMonth, selectedYear)
    console.log("Total Days:", days)
    console.log("Total Days:", day)



    // Updated view types array to only include the 3 required tabs
    const viewTypes = ['DAY', 'MONTH', 'YEAR'];

    return (
        <>
            <div className='mt-6 sm:p-6 md:p-8 bg-gray-50 rounded-lg shadow-lg font-sans'>
                {ProductType === "HYBRID" && <div className="flex justify-center w-full p-2">
                    <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner w-full justify-center gap-2">

                        <button
                            onClick={() => setGraphtype("SOLAR")}
                            className={`px-5 py-2 text-sm md:text-base rounded-lg transition-all duration-200 w-1/2 
          ${Graphtype === "SOLAR"
                                    ? "bg-white text-blue-600 shadow-md"
                                    : "text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            Solar
                        </button>

                        <button
                            onClick={() => setGraphtype("CONSUMPTION")}
                            className={`px-5 py-2 text-sm md:text-base rounded-lg transition-all duration-200 w-1/2
          ${Graphtype === "CONSUMPTION"
                                    ? "bg-white text-blue-600 shadow-md"
                                    : "text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            Consumption
                        </button>

                    </div>
                </div>}

                <div className='flex justify-between items centre'>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Power Generation Dashboard 📊</h2>
                    <button
                        onClick={() => setRefresh(!refresh)}
                        className="px-4 h-8  bg-orange-500 text-white rounded-md hover:bg-orange-700 flex gap-2 justify-center items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="#ffffff" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.4879 15C19.2524 18.4956 15.9187 21 12 21C7.02943 21 3 16.9706 3 12C3 7.02943 7.02943 3 12 3C15.7292 3 18.9286 5.26806 20.2941 8.5" />
                            <path d="M15 9H18C19.4142 9 20.1213 9 20.5607 8.56066C21 8.12132 21 7.41421 21 6V3" />
                        </svg>
                        <p>Refresh</p>
                    </button>
                </div>

                {IMEI && !loading && !error && (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between gap-2 mb-4">

                            <div className='flex gap-4'>
                                {viewTypes.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setActiveType(type)}
                                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${activeType === type
                                            ? 'bg-orange-500 text-white shadow'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border'
                                            }`}
                                    >
                                        {type.charAt(0) + type.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>

                            <button onClick={() => { downloadCSV(chartData) }} className="px-4 py-2 bg-orange-500 text-white text-[14px] rounded-md hover:bg-orange-700 flex items-center w-44 ">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Export CSV
                            </button>
                        </div>

                        {/* Month and Year Selectors - Show for MONTH and YEAR views */}
                        {(activeType === 'DAY' || activeType === 'MONTH' || activeType === 'YEAR') && (
                            <div className="flex flex-wrap gap-4 mb-6 items-center">
                                {activeType === 'DAY' && (
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium text-gray-700">Day:</label>
                                        <select
                                            value={day}
                                            onChange={(e) => handleDayChange(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            {Array.from({ length: days }, (_, index) => (
                                                <option key={index + 1} value={index + 1}>
                                                    {index + 1}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {/* Only show Month selector for the MONTH view (Day-wise data) */}
                                {(activeType === 'MONTH' || activeType === 'DAY') && (
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium text-gray-700">Month:</label>
                                        <select
                                            value={selectedMonth}
                                            onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            {MONTH_NAMES.map((month, index) => (
                                                <option key={index} value={index}>
                                                    {month}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700">Year:</label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => handleYearChange(parseInt(e.target.value))}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        {generateYearOptions().map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Display selected period info */}
                                <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded border">
                                    <span className="font-medium">Viewing: </span>
                                    {activeType === 'MONTH'
                                        ? `${MONTH_NAMES[selectedMonth]} ${selectedYear} (Day-wise)`
                                        : `${selectedYear} (Month-wise)`
                                    }
                                </div>
                            </div>
                        )}
                    </>
                )}

                <div className="w-full h-[50vh] min-h-[300px] bg-white p-4 rounded-md shadow-inner">
                    {renderContent()}
                </div>
            </div>
        </>

    );
};

export default PowerChart;