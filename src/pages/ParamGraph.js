import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Calendar, Clock } from 'lucide-react';
import { url } from '../constants/serverInfo';

const InverterDashboard = ({ mac, isGTI, Type }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParams, setSelectedParams] = useState([]);
  const [timeRange, setTimeRange] = useState('week');
  const [error, setError] = useState(null);
  const [inverterType, setInverterType] = useState('gti'); // 'gti' or 'non-gti'


  let gtiParameterGroups = {};

  // Parameter groups for GTI inverters
  if (Type == "GTI") {
    gtiParameterGroups = {
      'AC Data': [
      { key: 'GRIDVOLTA', label: 'AC Voltage A', color: '#3b82f6', unit: 'V' },
      { key: 'GRIDVOLTB', label: 'AC Voltage B', color: '#6366f1', unit: 'V' },
      { key: 'GRIDVOLTC', label: 'AC Voltage C', color: '#0ea5e9', unit: 'V' },
      { key: 'GRIDCURRA', label: 'AC Current A', color: '#10b981', unit: 'A' },
      { key: 'GRIDCURRB', label: 'AC Current B', color: '#34d399', unit: 'A' },
      { key: 'GRIDCURRC', label: 'AC Current C', color: '#6ee7b7', unit: 'A' },
      { key: 'GRDFQA', label: 'Grid Frequency', color: '#8b5cf6', unit: 'Hz' },
      ],
      'DC Current': [
      { key: 'DCCURR1', label: 'DC Current 1', color: '#ef4444', unit: 'A' },
      { key: 'DCCURR2', label: 'DC Current 2', color: '#06b6d4', unit: 'A' },
      { key: 'DCCURR3', label: 'DC Current 3', color: '#84cc16', unit: 'A' },
      { key: 'DCCURR4', label: 'DC Current 4', color: '#f97316', unit: 'A' }
      ],
      'DC Voltage': [
      { key: 'DCVOLT1', label: 'DC Voltage 1', color: '#ec4899', unit: 'V' },
      { key: 'DCVOLT2', label: 'DC Voltage 2', color: '#14b8a6', unit: 'V' },
      { key: 'DCVOLT3', label: 'DC Voltage 3', color: '#a855f7', unit: 'V' },
      { key: 'DCVOLT4', label: 'DC Voltage 4', color: '#eab308', unit: 'V' }
      ],
      
      'Power Data': [
      { key: 'INATPW', label: 'Input Active Power', color: '#06b6d4', unit: 'kW' },
      { key: 'TTATPW', label: 'Total Active Power', color: '#84cc16', unit: 'kW' },
      { key: 'TODYGEN', label: 'Today Generation', color: '#f59e0b', unit: 'kWh' },
      ...(data.length > 0 && data[data.length - 1]?.CUMGEN <= 100000 ? [{ key: 'CUMGEN', label: 'Cumulative Generation', color: '#8b5cf6', unit: 'kWh' }] : []),
      { key: 'OTATPW', label: 'AC Output Power', color: '#f59e0b', unit: 'kW' }
      ]
    };
  } else if (Type == "HYBRID") {
    gtiParameterGroups = {
      'AC Data': [
        { key: 'GRIDVOLTA', label: 'AC Voltage A', color: '#3b82f6', unit: 'V' },
        { key: 'GRIDVOLTB', label: 'AC Voltage B', color: '#6366f1', unit: 'V' },
        { key: 'GRIDVOLTC', label: 'AC Voltage C', color: '#0ea5e9', unit: 'V' },
        { key: 'GRIDCURRA', label: 'AC Current A', color: '#10b981', unit: 'A' },
        { key: 'GRIDCURRB', label: 'AC Current B', color: '#34d399', unit: 'A' },
        { key: 'GRIDCURRC', label: 'AC Current C', color: '#6ee7b7', unit: 'A' },
        { key: 'GRDFQA', label: 'Grid Frequency', color: '#8b5cf6', unit: 'Hz' },
        { key: 'OTATPW', label: 'AC Output Power', color: '#f59e0b', unit: 'kW' }
      ],
      'DC Current': [
        { key: 'DCCURR1', label: 'DC Current 1', color: '#ef4444', unit: 'A' },
        { key: 'DCCURR2', label: 'DC Current 2', color: '#06b6d4', unit: 'A' },
        { key: 'DCCURR3', label: 'DC Current 3', color: '#84cc16', unit: 'A' },
        { key: 'DCCURR4', label: 'DC Current 4', color: '#f97316', unit: 'A' }
      ],
      'DC Voltage': [
        { key: 'DCVOLT1', label: 'DC Voltage 1', color: '#ec4899', unit: 'V' },
        { key: 'DCVOLT2', label: 'DC Voltage 2', color: '#14b8a6', unit: 'V' },
        { key: 'DCVOLT3', label: 'DC Voltage 3', color: '#a855f7', unit: 'V' },
        { key: 'DCVOLT4', label: 'DC Voltage 4', color: '#eab308', unit: 'V' }
      ],
      'Power': [
        { key: 'INATPW', label: 'Input Active Power', color: '#06b6d4', unit: 'kW' },
        { key: 'TTATPW', label: 'Total Active Power', color: '#84cc16', unit: 'kW' },
        { key: 'TODYGEN', label: 'Today Generation', color: '#f59e0b', unit: 'kWh' },
        { key: 'CUMGEN', label: 'Cumulative Generation', color: '#8b5cf6', unit: 'kWh' }
      ],
      'Battery': [
        { key: 'BATVOLT', label: 'Battery Voltage', color: '#06b6d4', unit: 'V' },
        { key: 'BATTTPW', label: 'Battery Power', color: '#84cc16', unit: 'W' },
        { key: 'BATCUR', label: 'Battery Current', color: '#f59e0b', unit: 'A' },
        { key: 'BATSOC', label: 'Battery SOC', color: '#84cc16', unit: '%' },

      ],

      'EPS': [
        { key: 'EPSRV', label: 'R Phase Voltage', color: '#06b6d4', unit: 'V' },
        { key: 'EPSSV', label: 'S Phase Voltage', color: '#06b6d4', unit: 'V' },
        { key: 'EPSTV', label: 'T Phase Voltage', color: '#84cc16', unit: 'V' },
        { key: 'EPSRC', label: 'R Phase Current', color: '#f59e0b', unit: 'A' },
        { key: 'EPSSC', label: 'S Phase Current', color: '#84cc16', unit: 'A' },
        { key: 'EPSTC', label: 'T Phase Current', color: '#06b6d4', unit: 'A' },
        { key: 'EPSRATPW', label: 'R Active Power', color: '#84cc16', unit: 'W' },
        { key: 'EPSSATPW', label: 'S Active Power', color: '#f59e0b', unit: 'W' },
        { key: 'EPSTATPW', label: 'T Active Power', color: '#8b5cf6', unit: 'W' },

        { key: 'EPSFRQ', label: 'Frequency', color: '#06b6d4', unit: 'Hz' },
        { key: 'EPSTTATPW', label: 'Total Active Power', color: '#06b6d4', unit: 'V' },
        { key: 'EPSTTATPW', label: 'Total Reactive Power', color: '#84cc16', unit: 'Var' },
        { key: 'EPSTTAPPW', label: 'Total Apparent Power', color: '#f59e0b', unit: 'VA' },
        { key: 'TTLDATPW', label: 'Total load Active Power', color: '#06b6d4', unit: 'W' },

      ]
    };
  }

  // Parameter groups for non-GTI inverters
  const nonGtiParameterGroups = {
    'Battery Data': [
      { key: 'BVOLT', label: 'Battery Voltage', color: '#3b82f6', unit: 'V' },
      { key: 'BCURR', label: 'Battery Current', color: '#10b981', unit: 'A' },
      { key: 'BatteryBackup_Charging', label: 'Battery Backup', color: '#8b5cf6', unit: 'hrs' },
      { key: 'TimeToCharge', label: 'Time to Charge', color: '#f59e0b', unit: 'hrs' }
    ],
    'PV Data': [
      { key: 'PVOLT', label: 'PV Voltage', color: '#ef4444', unit: 'V' },
      { key: 'PCURR', label: 'PV Current', color: '#06b6d4', unit: 'A' },
      { key: 'PPOW', label: 'PV Power', color: '#84cc16', unit: 'kW' },
      { key: 'LoadPer_Kwh', label: 'Load per kWh', color: '#f97316', unit: 'kWh' }
    ],
    'AC Output': [
      { key: 'ACOUTVOLT', label: 'AC Output Voltage', color: '#ec4899', unit: 'V' },
      { key: 'ACOUTFREQ', label: 'AC Output Frequency', color: '#14b8a6', unit: 'Hz' },
      { key: 'LOADPER', label: 'Load Percentage', color: '#a855f7', unit: '%' },
      { key: 'ACINVOLT', label: 'AC Input Voltage', color: '#eab308', unit: 'V' }
    ],
    'Energy Data': [
      { key: 'TOTENGR', label: 'Total Energy', color: '#06b6d4', unit: 'kWh' },
      { key: 'CUMENGR', label: 'Cumulative Energy', color: '#84cc16', unit: 'kWh' },
      { key: 'TDYPOWERCUT', label: 'Today Power Cut', color: '#f59e0b', unit: 'min' },
      { key: 'TOTPOWERCUT', label: 'Total Power Cut', color: '#8b5cf6', unit: 'min' }
    ]
  };

  // Determine which parameter groups to use based on inverter type
  // const parameterGroups = inverterType === 'gti' ? gtiParameterGroups : nonGtiParameterGroups;
  const parameterGroups = (Type == 'GTI' || Type == 'HYBRID') ? gtiParameterGroups : nonGtiParameterGroups;


  // Set inverter type based on isGTI prop
  useEffect(() => {
    if (isGTI !== undefined && isGTI !== null) {
      setInverterType(isGTI ? 'gti' : 'non-gti');
    }
  }, [isGTI]);

  // Reset selected parameters when inverter type changes
  useEffect(() => {
    if (inverterType === 'gti') {
      setSelectedParams(['AC Data']);
    } else {
      setSelectedParams(['Battery Data']);
    }
  }, [inverterType]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [timeRange, mac, inverterType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${url}/iot/exampleInv?range=${timeRange}&mac=${mac}`);
      const result = await response.json();
      console.log("grapth data of inverter page:", result)

      if (result.success && result.data && result.data.length > 0) {
        // Use the inverterType from state (which is set by isGTI prop)
        // No need to auto-detect since we get the type from parent component
        console.log('Server Datetime values:', result.data.map(item => item?.server_datetime));
        // console.log('Time range:', timeRange);
        // Format data for chart
        const formattedData = result.data.map(item => ({
          ...item,
          timestamp: formatTimestamp(item?.server_datetime || item?.SERVER_DATETIME, timeRange),
          fullTime: new Date(item?.server_datetime || item?.SERVER_DATETIME).toLocaleString()
        }));

        // console.log('Fetched data:', formattedData.length, 'Type:', inverterType);
        console.log('Sample data point:', formattedData);
        setData(formattedData);
        setError(null);
      } else {
        setError('No data available');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // const formatTimestamp = (timestamp, range) => {
  //   const date = new Date(timestamp);
  //   if (range === 'today') {
  //     return date.toLocaleTimeString('en-US', { 
  //       hour: '2-digit', 
  //       minute: '2-digit',
  //       hour12: true 
  //     });
  //   } else {
  //     return date.toLocaleDateString('en-US', { 
  //       month: 'short', 
  //       day: 'numeric',
  //       hour: '2-digit',
  //       hour12: true
  //     });
  //   }
  // };
  const formatTimestamp = (timestamp, range) => {
    const date = new Date(timestamp);

    const opts = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC' // 👈 FORCE UTC
    };

    return range === 'today'
      ? date.toLocaleTimeString('en-US', opts)
      : date.toLocaleString('en-US', {
        ...opts,
        month: 'short',
        day: 'numeric'
      });
  };



  const handleParamToggle = (param) => {
    setSelectedParams((prev = []) => {
      // 👉 If EPS is clicked
      if (param === "EPS") {
        return prev.includes("EPS") ? [] : ["EPS"];
      }

      // 👉 If any other tab is clicked
      // Remove EPS if it exists
      const withoutEPS = prev.filter(p => p !== "EPS");

      // Toggle the clicked param
      return withoutEPS.includes(param)
        ? withoutEPS.filter(p => p !== param)
        : [...withoutEPS, param];
    });
  };

  const getActiveParameters = () => {
    return selectedParams.flatMap(group => parameterGroups[group] || []);
  };

  const getLatestValue = (key) => {
    if (data.length === 0) return 'N/A';
    const latest = data[data.length - 1];
    const value = latest[key];

    // Handle null/undefined values
    if (value === null || value === undefined) return 'N/A';

    // Format specific values if needed
    if (key === 'TimeToCharge' || key === 'BatteryBackup_Charging') {
      return Number(value).toFixed(2);
    }
    if (key === 'LOADPER' || key === 'LoadPer_Kwh') {
      return Number(value).toFixed(1);
    }

    // Format numeric values to 2 decimal places
    if (typeof value === 'number') {
      return Number(value).toFixed(2);
    }

    return value;
  };

  // Get available parameters based on actual data fields
  const getAvailableParameterGroups = () => {
    if (data.length === 0) return Object.keys(parameterGroups);

    const availableGroups = {};
    const sampleData = data[0];

    Object.keys(parameterGroups).forEach(group => {
      const availableParams = parameterGroups[group].filter(param =>
        sampleData[param.key] !== undefined && sampleData[param.key] !== null
      );

      if (availableParams.length > 0) {
        availableGroups[group] = availableParams;
      }
    });

    return availableGroups;
  };

  const availableParameterGroups = getAvailableParameterGroups();

  return (
    (data.length > 0) ? <div className="  from-slate-100 via-white to-slate-100 ">
      <div className="max-w-7xl mx-auto">
        {/* Header with Inverter Type Indicator */}
        {/* <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-300 shadow-md">
          <div className="flex justify-between items-center">
            <div>
             
              <p className="text-gray-600">
                MAC/IMEI: <span className="font-mono text-gray-800">{mac}</span> | 
                Type: <span className={`font-semibold ${inverterType === 'gti' ? 'text-blue-600' : 'text-green-600'}`}>
                  {inverterType === 'gti' ? 'GTI Inverter' : 'Non-GTI Inverter'}
                </span>
              </p>
            </div>
           
          </div>
        </div> */}

        {/* Time Range Selection */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-300 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Time Range</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange('today')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${timeRange === 'today'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                <Clock className="w-4 h-4" />
                Today
              </button>
              <button
                onClick={() => setTimeRange('week')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${timeRange === 'week'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                <Calendar className="w-4 h-4" />
                This Week
              </button>
            </div>
          </div>

          {/* Parameter Selection */}
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Select Parameters ({Type})
          </h2>
          <div className="flex flex-wrap gap-3">
            {Object.keys(availableParameterGroups).map(param => (
              <button
                key={param}
                onClick={() => handleParamToggle(param)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${selectedParams.includes(param)
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {param} ({availableParameterGroups[param].length})
              </button>
            ))}
          </div>
          {Object.keys(availableParameterGroups).length === 0 && data.length > 0 && (
            <p className="text-yellow-600 text-sm mt-2">
              No parameters available for the selected inverter type and data.
            </p>
          )}
        </div>

        {/* Stats Cards */}
        {selectedParams.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {getActiveParameters().slice(0, 4).map(param => (
              <div key={param.key} className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-300 shadow-md">
                <div className="text-gray-600 text-sm mb-1">{param.label}</div>
                <div className="text-2xl font-bold text-gray-800">
                  {getLatestValue(param.key)}
                  <span className="text-sm text-gray-500 ml-1">{param.unit}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Latest reading
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-300 shadow-md">
          {loading && data.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-red-600 mb-2">{error}</p>
                <button
                  onClick={fetchData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : selectedParams.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <p className="text-gray-600">Please select at least one parameter to display</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <p className="text-gray-600">No data available for the selected time range</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12, angle: timeRange === 'today' ? 0 : -45, textAnchor: timeRange === 'today' ? 'middle' : 'end' }}
                  height={80}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  labelStyle={{ color: '#334155', fontWeight: 'bold' }}
                  formatter={(value, name) => {
                    const param = getActiveParameters().find(p => p.label === name);
                    return [value, param ? `${param.label} (${param.unit})` : name];
                  }}
                />
                <Legend
                  className='mt-4'
                  iconSize={10}
                  fontSize={10}
                  wrapperStyle={{ color: '#334155', fontSize: '10px' }}
                />
                {getActiveParameters().map(param => (
                  <Line
                    key={param.key}
                    type="monotone"
                    dataKey={param.key}
                    stroke={param.color}
                    name={param.label}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                    connectNulls={true}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Last updated: {data.length > 0 ? data[data.length - 1]?.fullTime : 'N/A'}</p>
          <p>
            Showing {timeRange === 'today' ? "today's" : "this week's"} data ({data.length} readings) |
            Inverter Type: <span className="font-semibold">{inverterType === 'gti' ? 'GTI' : 'Non-GTI'}</span>
          </p>
        </div>
      </div>
    </div> : (
      <div className="animate-pulse space-y-6">

        {/* Time Range Skeleton */}
        <div className="bg-white/70 rounded-xl p-6 border border-gray-300 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <div className="h-5 w-32 bg-gray-300 rounded"></div>
            <div className="flex gap-2">
              <div className="h-10 w-24 bg-gray-300 rounded-lg"></div>
              <div className="h-10 w-28 bg-gray-300 rounded-lg"></div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 w-28 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/70 rounded-xl p-4 border border-gray-300 shadow-md">
              <div className="h-4 w-20 bg-gray-300 rounded mb-2"></div>
              <div className="h-6 w-24 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 w-16 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="bg-white/70 rounded-xl p-6 border border-gray-300 shadow-md">
          <div className="h-[400px] w-full bg-gray-300 rounded-lg ">

          </div>

        </div>

      </div>
    )
  );
};

export default InverterDashboard;