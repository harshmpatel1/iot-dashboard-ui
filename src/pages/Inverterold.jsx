import { Battery, Zap, Gauge, Thermometer, RefreshCcwIcon, AlertTriangle, Activity, Upload, Sun, Power, BatteryWarning, Settings, Calendar1, SquareSigmaIcon, Radio, Clock, Info, Download } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ParamGraph from './ParamGraph';
import AnimatedPowerFlow from './AnimatedPower';
import { downloadInverterDataCSV } from '../api/mockApis';
import { useNavigate } from 'react-router-dom';
// import UploadForm from './UploadForm';
import { useParams } from 'react-router-dom';
import { url } from '../constants/serverInfo';
import { useAuth } from '../hooks/useAuth';

const typeMapper = {
  'ThinkPower_1_3': 'thinkpower',
  'GTI_1_3': 'deye',
  'GTI_Abore_3phase': 'afor3phase',
  'GTI_Abore_1phase': 'afor1phase'
}



let GTI_Abore_3phase = {
  "0": "Initial power on",
  "1": "Standby",
  "2": "Start",
  "3": "Grid Connected",
  "4": "Off-grid",
  "5": "DG Mode",
  "6": "From grid to off-grid",
  "7": "From Off-grid to grid",
  "8": "Power failure processing",
  "9": "Shutdown",
  "10": "Fault",
  "11": "Upgrading"
}

let GTI_1_3 = {
  "0": "Stand by",
  "1": "Self test",
  "2": "Normal",
  "3": "Alerm",
  "4": "Fault"
}

let ThinkPower_1_3 = {
  "0": "Stand by",
  "1": "Grid Connected",
  "2": "Off Grid backup",
  "3": "Fault"
}
let GTI_Abore_1phase = {
  "0": "Wait",
  "1": "Running",
  "2": "Fault",
  "3": "Burn"
}

// Add non-GTI status mappings
let NonGTI_Status = {
  "0": "Normal",
  "1": "Fault",
  "2": "Charging",
  "3": "Discharging"
}

const Inverter = ({ inverterData, version, mac, onRefresh, loggerData }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  // const [handleupload, sethandleupload] = useState(false)
  const [type, setType] = useState(null);
  const [fault, setfault] = useState()
  const [softVer, setVersion] = useState(null);
  const [macId, setMacId] = useState(mac);
  const [power, setPower] = useState({ inputActivePower: null, outputActivePower: null });
  const [data, setData] = useState({});
  const [isGTI, setIsGTI] = useState(true);
  const { plantId, merchantId } = useParams();
  const { user } = useAuth();
  // console.log("palnmtid:", plantId)

  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const callAPI = async () => {
      try {
        // if you want to log the current state 'data' (from useState) you can,
        // but note it may be stale inside this closure depending on timing:
        // console.log("state data (before):", data);
        const id = data.FAULT;
        const phase = data.phase;

        // console.log("idphase",id,phase)

        const res = await fetch(`${url}/fault/desc?id=${id}&phase=${phase}`, { signal });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);

        const json = await res.json();
        setfault(json?.data[0])
        console.log("API result:", json);

        // do something with json if needed, e.g. set some state
        // setFaultDesc(json);

      } catch (err) {
        if (err.name === "AbortError") {
          console.log("Fetch aborted");
        } else {
          console.error("callAPI error:", err);
        }
      }
    };

    if (inverterData && inverterData.length > 0) {
      const currentData = inverterData[0];
      setData(currentData);             // update your state 'data'
      callAPI();                        // fire the fetch (no need to await here)

      // Determine if it's GTI or non-GTI based on available fields
      const hasGTIFields = currentData.INATPW !== undefined || currentData.OTATPW !== undefined;
      const hasNonGTIFields = currentData.PVOLT !== undefined || currentData.PCURR !== undefined;
      setIsGTI(hasGTIFields && !hasNonGTIFields);

      if (currentData.phase) setType(currentData.phase);
      if (version) setVersion(version);

      // Set MAC ID - prioritize from data, then from props
      if (currentData.MAC) setMacId(currentData.MAC);
      else if (mac) setMacId(mac);
      else if (currentData.SRNO) setMacId(currentData.SRNO);

      // Calculate power based on type
      let inputActivePower = null;
      let outputActivePower = null;

      if (hasGTIFields) {
        if (currentData.phase === "GTI_1_3") {
          inputActivePower = currentData.INATPW;
          outputActivePower = currentData.OTATPW;
        } else if (currentData.phase === "GTI_Abore_3phase") {
          inputActivePower = (Number(currentData?.INATPW) / 1000)?.toFixed(2);
          outputActivePower = (Number(currentData?.TTATPW) / 1000)?.toFixed(2);
        } else if (currentData.phase === "ThinkPower_1_3") {
          inputActivePower = currentData.INATPW;
          outputActivePower = currentData.OTATPW;
        }
      } else {
        inputActivePower = currentData.PPOW || "N/A";
        outputActivePower = currentData.ACOUTVOLT ? `${currentData.ACOUTVOLT}V` : "N/A";
      }

      setPower({ inputActivePower, outputActivePower });
    }

    // cleanup to abort outstanding fetch if component unmounts / inverterData changes
    return () => controller.abort();
  }, [inverterData, version, mac, url, data]);



  const handleDownload = async () => {
    if (!macId) {
      alert('No MAC ID available for download');
      return;
    }

    setIsDownloading(true);
    try {
      await downloadInverterDataCSV(macId);
      console.log('Download completed successfully');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download data. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRefreshClick = () => {
    onRefresh();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    let dateStr = dateString ? dateString.split('T').join(' ') : '-';
    return dateStr;
  };

  const formatTitle = (key) => key.replace(/([A-Z])/g, ' $1').trim();

  const renderDataSection = (title, items) => (
    <div className="border-orange-300 border-2 rounded-lg p-3 text-sm text-black bg-white">
      <h3 className="font-bold text-gray-600 text-xl mb-2">{title}</h3>
      <div className="grid grid-cols-1 gap-x-4 gap-y-1">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-400 font-bold text-sm">{formatTitle(item.key)}</span>
            <span className="font-semibold text-[12px] text-gray-800">
              {item.value !== null && item.value !== undefined ?
                `${item.value} ${item.unit || ''}`.trim() : 'N/A'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // Helper function to get run status
  const getRunStatus = () => {
    if (!data.RUNSTATE && !data.WRKMOD) return "-";

    if (isGTI) {
      return (
        data.phase === "GTI_Abore_3phase" && GTI_Abore_3phase[data.RUNSTATE] ||
        data.phase === "GTI_1_3" && GTI_1_3[data.RUNSTATE] ||
        data.phase === "ThinkPower_1_3" && ThinkPower_1_3[data.RUNSTATE] ||
        data.phase === "GTI_Abore_1phase" && GTI_Abore_1phase[data.RUNSTATE] ||
        "-"
      );
    } else {
      // Non-GTI inverters
      return NonGTI_Status[data.WRKMOD] || data.WRKMOD || "-";
    }
  };

  if (!macId) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-center">
          <p className="text-gray-500">Loading inverter data...</p>
        </div>
      </div>
    );
  }


  const handleuploadclick = () => {
    // navigate(`/merchants/${merchantId}/plants/${plantId}/allDevices/uploadform/${macId}`)
  }

  if (user.role == "admin") {
    var ROLE = "admin"
  } else {
    var ROLE = "Merchant"
  }


  return (
    <div className="px-2 font-sans overflow-hidden">
      <div className="mx-auto">
        <div className="mb-2 ml-4 flex  lg:justify-between justify-start  flex-col lg:flex-row gap-4">
          <div>
            <p className="text-xs text-black mt-1 ">
              ID: {data.id} | MAC: {data.MAC || data.SRNO} | Type: {isGTI ? 'GTI' : 'Non-GTI'}
            </p>
          </div>
          <div>
            <p className="text-xs text-black mt-1 ">Updated: {formatDate(data.server_datetime)}</p>
          </div>
          <div className='flex gap-2 self-end'>
            <button
              className='px-2 bg-white rounded-md py-1 text-sm text-gray-600 shadow-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
              title="Download all logs as CSV"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <div className='flex items-center justify-center text-center gap-1'>
                {isDownloading ? (
                  <span className="h-4 w-4 text-gray-400">⏳</span>
                ) : (
                  <Download className='h-6 w-6 text-gray-400' />
                )}
              </div>
            </button>

            {isGTI && (
              <button
                className='px-2 bg-white rounded-md py-1 text-sm text-gray-600 shadow-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                title="configuration"
              >
                <a
                  href={`http://eastmanone.com:5000/?macId=${macId}&inverterSerialNo=${macId}&Type=${typeMapper[data.phase]}&Version=${softVer}&Role=${ROLE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-link"
                >
                  <div className='flex items-center justify-center text-center gap-1'>
                    <Settings className='h-4 w-4 text-gray-400' />
                  </div>
                </a>
              </button>
            )}

            <button
              className='px-2 bg-white rounded-md py-1 text-sm text-gray-600 shadow-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
              title="Upload"
              onClick={handleuploadclick}
            >

              <div className='flex items-center justify-center text-center gap-1'>
                <Upload className='h-4 w-4 text-gray-400' />
              </div>

            </button>

            <button
              className='px-2 bg-white rounded-md py-1 text-sm text-gray-600 shadow-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
              title="Refresh"
              onClick={handleRefreshClick}
            >
              <div className='flex items-center justify-center text-center gap-1'>
                <RefreshCcwIcon className='h-4 w-4 text-gray-400' />
              </div>
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {/* Today's Generation */}
          <div className="bg-yellow-100 rounded-lg p-2 text-center transition-all duration-300 ease-in-out hover:bg-yellow-100 hover:scale-[1.03] cursor-pointer">
            <Calendar1 size={16} className="text-yellow-600 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-600">Today's Gen</p>
            <p className="text-sm font-bold text-gray-800">
              {isGTI ? (data.TODYGEN || '0') : (data.TOTENGR || '0')} kWh
            </p>
          </div>

          {/* Total Generation */}
          <div className="bg-green-100 rounded-lg p-2 text-center transition-all duration-300 ease-in-out hover:bg-green-100 hover:scale-[1.03] cursor-pointer">
            <SquareSigmaIcon size={16} className="text-green-600 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-600">Total Gen</p>
            <p className="text-sm font-bold text-gray-800">
              {isGTI ? (data.CUMGEN || '0') : (data.CUMENGR || '0')} kWh
            </p>
          </div>

          {/* Input Active Power */}
          <div className="bg-blue-100 rounded-lg p-2 text-center transition-all duration-300 ease-in-out hover:bg-blue-100 hover:scale-[1.03] cursor-pointer">
            <Zap size={16} className="text-blue-600 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-600">Input Power</p>
            <p className="text-sm font-bold text-gray-800">
              {isGTI ? (
                <>
                  {type === "GTI_1_3" && <span>{data.INATPW} kW</span>}
                  {type === "GTI_Abore_3phase" && <span>{(Number(data?.INATPW) / 1000)?.toFixed(2)} kW</span>}
                  {type === "ThinkPower_1_3" && <span>{data.INATPW} kW</span>}
                  {type === "GTI_Abore_1phase" && <span>{(((data?.DCVOLT1 * data?.DCCURR1) + (data?.DCCURR3 * data?.DCVOLT2)) / 1000).toFixed(2)} kW</span>}
                </>
              ) : (
                <span>{data.PPOW || '0'} kW</span>
              )}
            </p>
          </div>

          {/* Output Active Power */}
          <div className="bg-purple-100 rounded-lg p-2 text-center transition-all duration-300 ease-in-out hover:bg-purple-100 hover:scale-[1.03] cursor-pointer">
            <Zap size={16} className="text-purple-600 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-600">Output Power</p>
            <p className="text-sm font-bold text-gray-800">
              {isGTI ? (
                <>
                  {type === "GTI_1_3" && <span>{data.OTATPW} kW</span>}
                  {type === "GTI_Abore_3phase" && <span>{(Number(data?.TTATPW) / 1000)?.toFixed(2)} kW</span>}
                  {type === "ThinkPower_1_3" && <span>{data.OTATPW} kW</span>}
                  {type === "GTI_Abore_1phase" && <span>{data.TTGRDPW} kW</span>}

                </>
              ) : (
                <span>{data.TDYPOWERCUT ? `${data.TDYPOWERCUT} W` : '0'}</span>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {/* Grid Frequency */}
          <div className="bg-purple-100 rounded-lg p-2 text-center transition-all duration-300 ease-in-out hover:bg-purple-100 hover:scale-[1.03] cursor-pointer">
            <Radio size={16} className="text-purple-600 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-600">Grid Freq</p>
            <p className="text-sm font-bold text-gray-800">
              {data.GRIDFREQ || data.GRDFQA || data.ACOUTFREQ || '0'} Hz
            </p>
          </div>

          {/* Working Time */}
          <div className="bg-yellow-100 rounded-lg p-2 text-center transition-all duration-300 ease-in-out hover:bg-yellow-100 hover:scale-[1.03] cursor-pointer">
            <Clock size={16} className="text-green-600 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-600">Working Time</p>
            <p className="text-sm font-bold text-gray-800">
              {data.TOTWRKTM ? `${(Number(data?.TOTWRKTM) / 60)?.toFixed(0)} hrs` : 'N/A'}
            </p>
          </div>

          {/* Run Status */}
          <div className="bg-green-100 rounded-lg p-2 text-center transition-all duration-300 ease-in-out hover:bg-green-100 hover:scale-[1.03] cursor-pointer">
            <Info size={16} className="text-blue-600 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-600">Run Status</p>
            <p className="text-sm font-bold text-gray-800">{getRunStatus()}</p>
          </div>

          {/* Fault */}
          <div className="bg-blue-100 rounded-lg p-2 text-center transition-all duration-300 ease-in-out hover:bg-blue-100 hover:scale-[1.03] cursor-pointer">
            <BatteryWarning size={16} className="text-blue-600 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-600">Fault</p>
            <p className="text-sm font-bold text-gray-800">{fault?.Description || "NO FAULT"}</p>
          </div>
        </div>

        {/* Detailed Data Sections - Conditionally render based on inverter type */}
        {isGTI ? (
          /* GTI Inverter Details */
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {renderDataSection("DC Voltage", [
                { key: "voltage 1", value: data.DCVOLT1, unit: 'V' },
                { key: "voltage 2", value: data.DCVOLT2, unit: 'V' },
                { key: "voltage 3", value: data.DCVOLT3, unit: 'V' },
                { key: "voltage 4", value: data.DCVOLT4, unit: 'V' },
              ])}

              {renderDataSection("DC Current", [
                { key: "current 1", value: data.DCCURR1, unit: 'A' },
                { key: "current 2", value: data.DCCURR2, unit: 'A' },
                { key: "current 3", value: data.DCCURR3, unit: 'A' },
                { key: "current 4", value: data.DCCURR4, unit: 'A' },
              ])}

              {renderDataSection("DC Power", [
                { key: "power 1", value: data.DCP1|| ((data?.DCVOLT1 * data?.DCCURR1)/1000)?.toFixed(2), unit: 'kW' },
                { key: "power 2", value: data.DCP2|| ((data?.DCVOLT2 * data?.DCCURR2)/1000)?.toFixed(2), unit: 'kW' },
                { key: "power 3", value: data.DCP3 || ((data?.DCVOLT3 * data?.DCCURR3)/1000)?.toFixed(2), unit: 'kW' },
                { key: "power 4", value: data.DCP4|| ((data?.DCVOLT4 * data?.DCCURR4)/1000)?.toFixed(2), unit: 'kW' },
              ])}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-2 mt-2'>
              {type === "GTI_Abore_3phase" ? (
                <>
                  {renderDataSection("AC grid A output", [
                    { key: "grid voltage", value: data.GRIDVOLTA, unit: 'V' },
                    { key: "grid current", value: data.GRIDCURRA, unit: 'A' },
                    { key: "grid power", value: data.GRDPWL1 , unit: 'W' },
                    { key: "grid Frequency", value: data.GRDFQA, unit: 'Hz' },
                  ])}
                  {renderDataSection("AC grid B output", [
                    { key: "grid voltage", value: data.GRIDVOLTB, unit: 'V' },
                    { key: "grid current", value: data.GRIDCURRB, unit: 'A' },
                    { key: "grid power", value: data.GRDPWL2, unit: 'W' },
                    { key: "grid Frequency", value: data.GRDFQB, unit: 'Hz' },
                  ])}
                  {renderDataSection("AC grid C output", [
                    { key: "grid voltage", value: Number(data?.GRIDVOLTC)?.toFixed(2), unit: 'V' },
                    { key: "grid current", value: data.GRIDCURRC, unit: 'A' },
                    { key: "grid power", value: data.GRDPWL3, unit: 'W' },
                    { key: "grid Frequency", value: data.GRDFQC, unit: 'Hz' },
                  ])}
                </>
              ) : (
                <>
                  {renderDataSection("AC grid A output", [
                    { key: "grid voltage", value: data.GRIDVOLTA, unit: 'V' },
                    { key: "grid current", value: data.GRIDCURRA, unit: 'A' },
                    { key: "grid power", value: data.GRDPWL1 || data.OTATPW ||data.TTGRDPW, unit: 'W' },
                    { key: "grid Frequency", value: data.GRIDFREQ, unit: 'Hz' },
                  ])}
                  {renderDataSection("AC grid B output", [
                    { key: "grid voltage", value: data.GRIDVOLTB, unit: 'V' },
                    { key: "grid current", value: data.GRIDCURRB, unit: 'A' },
                    { key: "grid power", value: data.GRDPWL2 || data.OTATPW, unit: 'W' },
                  ])}
                  {renderDataSection("AC grid C output", [
                    { key: "grid voltage", value: data.GRIDVOLTC, unit: 'V' },
                    { key: "grid current", value: data.GRIDCURRC, unit: 'A' },
                    { key: "grid power", value: data.GRDPWL3 || data.OTATPW, unit: 'W' },
                  ])}
                </>
              )}
            </div>
          </>
        ) : (
          /* Non-GTI Inverter Details */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {renderDataSection("Battery Info", [
              { key: "Battery Voltage", value: data?.BVOLT, unit: 'V' },
              { key: "Battery Current", value: data?.BCURR, unit: 'A' },
              { key: "Battery Type", value: data?.BATTYP, unit: '' },
              { key: "Battery Backup Percentage", value: data?.BatteryBackup_Charging?.toFixed(2), unit: '%' },
            ])}

            {renderDataSection("PV Info", [
              { key: "PV Voltage", value: data.PVOLT, unit: 'V' },
              { key: "PV Current", value: data.PCURR, unit: 'A' },
              { key: "PV Power", value: data.PPOW, unit: 'kW' },
            ])}

            {renderDataSection("AC Output", [
              { key: "AC Output Volt", value: data.ACOUTVOLT, unit: 'V' },
              { key: "AC Output Freq", value: data.ACOUTFREQ, unit: 'Hz' },
              { key: "Load Percent", value: data.LOADPER, unit: '%' },
            ])}
          </div>
        )}

        {data?.PHASE === "Afore_Hybrid" &&<>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
            {renderDataSection("Battery 1", [
              { key: "Battery Status", value: data.BVOLT, unit: 'V' },
              { key: "Battery soc", value: data.BCURR, unit: 'A' },
              { key: "Battery Voltage", value: data.BATTYP, unit: '' },
              { key: "Battery Power", value: data?.BatteryBackup_Charging?.toFixed(2), unit: '%' },
              { key: "Battery Current", value: data?.BatteryBackup_Charging?.toFixed(2), unit: '%' },
            ])}

            {renderDataSection("Battery 2", [
              { key: "Battery Status", value: data.BVOLT, unit: 'V' },
              { key: "Battery soc", value: data.BCURR, unit: 'A' },
              { key: "Battery Voltage", value: data.BATTYP, unit: '' },
              { key: "Battery Power", value: data?.BatteryBackup_Charging?.toFixed(2), unit: '%' },
              { key: "Battery Current", value: data?.BatteryBackup_Charging?.toFixed(2), unit: '%' },
            ])}

            {renderDataSection("EPS Information", [
              { key: "EPS R Phase Voltage", value: data.ACOUTVOLT, unit: 'V' },
              { key: "EPS S Phase Voltage", value: data.ACOUTVOLT, unit: 'V' },
              { key: "EPS T Phase Voltage", value: data.ACOUTVOLT, unit: 'V' },
              { key: "EPS R Phase Current", value: data.ACOUTVOLT, unit: 'V' },
              { key: "EPS S Phase Current", value: data.ACOUTVOLT, unit: 'V' },
              { key: "EPS T Phase Current", value: data.ACOUTVOLT, unit: 'V' },
              { key: "EPS Frequency", value: data.ACOUTVOLT, unit: 'V' },
              { key: "EPS R Phase Active Power", value: data.ACOUTVOLT, unit: 'V' },
              { key: "EPS S Phase Active Power", value: data.ACOUTVOLT, unit: 'V' },
              { key: "EPS T Phase Active Power", value: data.ACOUTVOLT, unit: 'V' },
              { key: "EPS Total  Active Power", value: data.ACOUTVOLT, unit: 'V' },
              { key: "EPS Total  Reactive Power", value: data.ACOUTVOLT, unit: 'V' },
              { key: "EPS Total Apparent Power", value: data.ACOUTVOLT, unit: 'V' },
              { key: "EPS Day Charging", value: data.ACOUTVOLT, unit: 'V' },
              { key: "EPS Total Charging", value: data.ACOUTVOLT, unit: 'V' },
              { key: "EPS Day Discharging", value: data.ACOUTVOLT, unit: 'V' },
              { key: "EPS Total Discharging", value: data.ACOUTVOLT, unit: 'V' },

              
            ])}
          </div>
        </>
         }

        <AnimatedPowerFlow
          inputActivePower={power.inputActivePower || 'N/A'}
          outPutActivePower={power.outputActivePower || "N/A"}
        />

        <ParamGraph mac={macId} isGTI={isGTI} />

      </div>
    </div>
  );
};

export default Inverter;