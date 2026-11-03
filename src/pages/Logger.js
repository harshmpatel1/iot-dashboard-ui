import React, { useEffect, useState } from 'react';
import { Wifi, Clock, Zap, Settings, HardDrive, MapPin, Code, Type } from 'lucide-react';
const typeMapperForDisplay = {
  'ThinkPower_1_3': 'TGP',
  'GTI_1_3': 'EGT',
  'GTI_Abore_3phase': 'ES3P',
  'GTI_Abore_1phase': 'ES1P'
}

const Logger = ({ loggerData ,Type}) => {
    // console.log('logger data',loggerData);
    const [data, setData] = useState({});
    const [deviceType, setDeviceType] = useState(null);
    const [isGTI, setIsGTI] = useState(true);
    console.log('dtdt',deviceType);
    useEffect(() => {
        if (loggerData && loggerData.length > 0) {
            const currentData = loggerData[0];
            setData(currentData);
            console.log('l data',data);
            
            // Determine if it's GTI or non-GTI
            const hasGTIFields = currentData.phase !== undefined;
            const hasNonGTIFields = currentData.IMEI !== undefined && currentData.SIM !== undefined;
            
            setIsGTI(hasGTIFields && !hasNonGTIFields);
            setDeviceType(currentData['phase']);
        }
    }, [loggerData]);

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        let dateStr = dateString ? dateString.split('T').join(' ') : '-';
        return dateStr;
    };

    const getSignalStrength = (signal) => {
        if (signal >= 70) return { color: 'text-green-500', label: 'Excellent' };
        if (signal >= 50) return { color: 'text-yellow-500', label: 'Good' };
        if (signal >= 30) return { color: 'text-orange-500', label: 'Fair' };
        return { color: 'text-red-500', label: 'Poor' };
    };
const signal = (() => {
  const signalValue = data?.SIGNAL ?? 0;
  const isFC41 = data?.MODFRMVER?.includes("FC41");

  if (isFC41) {
    return Math.min(signalValue, 100);
  }

  return Math.min((signalValue / 32) * 100, 100);
})();

const signalInfo = getSignalStrength(Math.round(signal));

    // A compact row for displaying a single data point
    const CompactDataRow = ({ label, value, icon: Icon, highlight = false }) => {
        const displayValue = value === null || value === '' ? 'N/A' : value;
        return (
            <div className="flex items-center text-md py-0.5 px-1 md:py-1">
                <div className="flex items-center gap-2 text-sm  mr-2">
                    {Icon && <Icon className="w-3 h-3 text-gray-500 mr-1" />}
                    <span className="font-bold text-gray-400 truncate">{label}:</span>
                </div>
                <span className={`font-mono truncate ${highlight ? 'text-blue-600 font-semibold' : 'text-gray-800'}`}>
                    {displayValue}
                </span>
            </div>
        );
    };

    // A compact card to group related data
    const CompactCard = ({ title, children, icon: Icon, className = "" }) => (
        <div className={`bg-white  border-2  backdrop-blur-md rounded-lg shadow-sm p-2  border-gray-100 h-full ${className}`}>
            <div className="flex items-center mb-1 border-b pb-1">
                <Icon className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-500 truncate">{title}</h3>
            </div>
            {children}
        </div>
    );

    return (
        <div className="h-screen text-gray-800 flex flex-col font-sans p-2">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-2 rounded-lg shadow-sm mb-2 border border-gray-100">
                <div className="flex items-center space-x-2">
                    <h1 className="text-md md:text-md font-bold text-gray-900 truncate">
                        Logger Detail : 
                    </h1>
                    <span className="text-md text-blue-600 bg-blue-100 rounded-full px-2 py-0.5 font-semibold hidden sm:inline">
                        ID: {data.id}
                    </span>
                    <span className="text-md text-green-600 bg-green-100 rounded-full px-2 py-0.5 font-semibold hidden sm:inline">
                        {Type}
                    </span>
                </div>
                <div className="text-right text-md text-gray-600 truncate">
                    <p className="font-semibold">Last Updated</p>
                    <p className="font-mono">{formatDateTime(data.server_datetime)}</p>
                </div>
            </div>

            {/* Quick Stats - made more compact */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                <div className="flex flex-col items-center justify-center p-2 bg-orange-100 rounded-lg shadow-sm border border-gray-100 text-center">
                    <Wifi className={`w-5 h-5 ${signalInfo.color}`} />
                    <span className="text-md font-semibold mt-1 truncate">{Math.round(signal)}%</span>
                    <span className="text-md text-gray-500 leading-none truncate">{signalInfo.label}</span>
                </div>
                
                <div className="flex flex-col items-center justify-center p-2 bg-blue-100 rounded-lg shadow-sm border border-gray-100 text-center">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span className="text-md font-semibold mt-1 truncate">{(data?.INTRVL/60)?.toFixed(2) || 'N/A'} Min</span>
                    <span className="text-md text-gray-500 leading-none truncate">Interval</span>
                </div>
                
                <div className="flex flex-col items-center justify-center p-2 bg-purple-100 rounded-lg shadow-sm border border-gray-100 text-center">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <span className="text-md font-semibold mt-1 truncate">{data.INVTRSRNO || data.SRNO || 'N/A'}</span>
                    <span className="text-md text-gray-500 leading-none truncate">Inverter S/N</span>
                </div>
                
                <div className="flex flex-col items-center justify-center p-2 bg-green-100 rounded-lg shadow-sm border border-gray-100 text-center">
                    <HardDrive className="w-5 h-5 text-indigo-500" />
                    <span className="text-md font-semibold mt-1 truncate">{data.MAC || data.IMEI || 'N/A'}</span>
                    <span className="text-md text-gray-500 leading-none truncate">{data.MAC ? 'MAC' : 'IMEI'}</span>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex-1  p-1 m-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    {/* Network & Device */}
                    <CompactCard title="Network & Device" icon={HardDrive}>
                        <CompactDataRow label="ID" value={data.id} />
                        <CompactDataRow label={data.MAC ? "MAC" : "IMEI"} value={data.MAC || data.IMEI} highlight />
                        {data.SIM && <CompactDataRow label="SIM" value={data.SIM} />}
                        <CompactDataRow label="SSID" value={data.SSID} />
                        <CompactDataRow label="Signal" value={data.SIGNAL ? `${((data?.MODFRMVER =="FC41A0")?(data?.SIGNAL):((data?.SIGNAL/32)*100)?.toFixed(0))}%` : 'N/A'} />
                        <CompactDataRow label="Interval" value={data.INTRVL ? `${data.INTRVL}s` : 'N/A'} />
                        <CompactDataRow label="Model" value={isGTI ? deviceType == "GTI_Abore_3phase" ? "GTI_ES_3phase" : deviceType == "WATECH" ? "GTI_WT" : deviceType == "GTI_Abore_1phase" ? "GTI_ES_1phase" : deviceType == "ThinkPower_1_3" ? "GTI_TGT" : deviceType : 'Non-GTI'} />
                        <CompactDataRow label="MODEL FORM" value={data.MODFRMVER || "N/A"} />
                        <CompactDataRow label="MODSOFTVER" value={data.MODSOFTVER || "N/A"} />
                    </CompactCard>

                    {((isGTI && deviceType === "GTI_Abore_1phase") ) && (
                        <CompactCard title="Firmware" icon={Code}>
                            <CompactDataRow label="INV Protocol Ver" value={data.PROVER} />
                            <CompactDataRow label="INV Master Ver" value={data.PRFWVER} />
                            <CompactDataRow label="INV Master Build Version" value={data.PRBDVER} />
                            <CompactDataRow label="INV Slave Form Version" value={data.SBFWVER} />
                            <CompactDataRow label="INV Slave Build Version" value={data.SBBDVER} />
                            <CompactDataRow label="INV Communication Version" value={data.CMFWVER} />
                            <CompactDataRow label="INV Communication Build Version" value={data.CMBLDVER} />
                        </CompactCard>
                    )}

                    {/* GTI Firmware Versions */}
                    {isGTI && deviceType === "ThinkPower_1_3" && (
                        <CompactCard title="Firmware" icon={Code}>
                            <CompactDataRow label="Protocol Ver" value={data.PROVER} />
                            <CompactDataRow label="Controller Form Ver" value={data.CNTFWVR} />
                            <CompactDataRow label="Hardware Ver" value={data.HARDVR} />
                        </CompactCard>
                    )}

                     {isGTI && deviceType === "ThinkPower_1_3" && (
                       <CompactCard title="Firmware" icon={Code}>
                            <CompactDataRow label="INV Hardware Ver" value={data.INVHWDVR} />
                            <CompactDataRow label="INV Protocol Ver" value={data.INVPROTVR} />
                            <CompactDataRow label="INV Master Ver" value={data.INVMSTRFWVR} />
                            <CompactDataRow label="INV Slave Ver" value={data.INVSLAVFWVR} />
                            <CompactDataRow label="INV HMI Ver" value={data.INVHMISOFT} />
                            <CompactDataRow label="INV CPCL Ver" value={data.INVCPLDSOFT} />
                        </CompactCard>
                    )}

                    {((isGTI && deviceType === "GTI_Abore_3phase") || Type == "HYBRID") && (
                        <CompactCard title="Firmware" icon={Code}>
                            <CompactDataRow label="INV Hardware Ver" value={data.INVHWDVR} />
                            <CompactDataRow label="INV Protocol Ver" value={data.INVPROTVR} />
                            <CompactDataRow label="INV Master Ver" value={data.INVMSTRFWVR} />
                            <CompactDataRow label="INV Slave Ver" value={data.INVSLAVFWVR} />
                            <CompactDataRow label="INV HMI Ver" value={data.INVHMISOFT} />
                            <CompactDataRow label="INV CPCL Ver" value={data.INVCPLDSOFT} />
                        </CompactCard>
                    )}

                    {(isGTI && deviceType === "WATECH") && (
                        <CompactCard title="Firmware" icon={Code}>
                            <CompactDataRow label="Master Firmware" value={data.INVMSTRFWVR} />
                            <CompactDataRow label="HMI Firmware" value={data.INVHMISOFT} />
                            <CompactDataRow label="Protocol Ver" value={data.INVPROTVR} />
                            <CompactDataRow label="Hardware Ver" value={data.INVHWDVR} />
                        </CompactCard>
                    )}

                    {isGTI && deviceType === "GTI_1_3" && (
                        <CompactCard title="Firmware" icon={Code}>
                            <CompactDataRow label="Protocol Ver" value={data.PROVER} />
                            <CompactDataRow label="Controller Ver" value={data.CNTFWVR} />
                            <CompactDataRow label="Communication Ver" value={data.COMFWVR} />
                        </CompactCard>
                    )}

                    {/* Non-GTI Information */}
                    {(!isGTI ) && (
                        <CompactCard title="Device Info" icon={Settings}>
                            <CompactDataRow label="IMEI" value={data.IMEI} highlight />
                            <CompactDataRow label="SIM" value={data.SIM} />
                            <CompactDataRow label="Operator" value={data.OPERATOR} />
                            <CompactDataRow label="Module FW" value={data.MODULE_FW} />
                            <CompactDataRow label="Software Ver" value={data.SOFTWARE_VER} />
                        </CompactCard>
                    )}

                    {/* Timestamps */}
                    <CompactCard title="Timestamps" icon={Clock}>
                        <CompactDataRow label="GSM Time" value={formatDateTime(data.gsm_datetime)} />
                        <CompactDataRow label="Server Time" value={formatDateTime(data.server_datetime)} />
                        {data.LAT && data.LON && (
                            <>
                                <CompactDataRow label="Lat" value={data.LAT} />
                                <CompactDataRow label="Lon" value={data.LON} />
                            </>
                        )}
                    </CompactCard>
                </div>
            </div>
        </div>
    );
};

export default Logger;