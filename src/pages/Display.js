import React, { useEffect, useState, useMemo } from 'react';
import Logger from './Logger';
import Inverter from './Inverter';
import { useAuth } from '../hooks/useAuth';
import { url } from '../constants/serverInfo';
import AdminLinks from '../components/AdminLinks';

const Display = ({ macId, type }) => {
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState('logger');

    const [inverterData, setInverterData] = useState([]);
    const [loggerData, setLoggerData] = useState([]);

    const [loadingLogger, setLoadingLogger] = useState(false);
    const [loadingInverter, setLoadingInverter] = useState(false);

    const [software, setSoftware] = useState(null);
    const isAdmin = user?.role?.toLowerCase().trim() === "admin";

    const formattedType = useMemo(() => {
        return type ? type.split(" ").join("_") : null;
    }, [type]);

    // ✅ Fetch Logger FIRST
    useEffect(() => {
        if (!macId || !formattedType) return;

        const fetchLogger = async () => {
            try {
                setLoadingLogger(true);

                const res = await fetch(`${url}/plants/devices/logger/${macId}/${formattedType}`);
                const data = await res.json();

                const logger = data?.data || [];
                console.log('Fetched Logger Data:', logger);
                setLoggerData(logger);

                setSoftware(
                    logger?.[0]?.MODSOFTVER ||
                    logger?.[0]?.SOFTWARE_VER ||
                    null
                );
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingLogger(false);
            }
        };

        fetchLogger();
    }, [macId, formattedType]);

    // ✅ Fetch Inverter ONLY when tab opens
    useEffect(() => {
        if (activeTab !== 'inverter') return;
        if (!macId || !formattedType || inverterData.length) return;

        const fetchInverter = async () => {
            try {
                setLoadingInverter(true);

                const res = await fetch(`${url}/plants/devices/inverter/${macId}/${formattedType}`);
                const data = await res.json();

                setInverterData(data?.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingInverter(false);
            }
        };

        fetchInverter();
    }, [activeTab, macId, formattedType]);

    console.log("inverterdata in display", inverterData);
    console.log("isadmin in display", isAdmin,inverterData?.length > 0);

    // ✅ Initial loading ONLY depends on logger
    if (!macId || loadingLogger) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="p-10 bg-white rounded-lg shadow-xl text-center">
                    <h2 className="text-2xl font-bold text-blue-600 mb-2">Loading...</h2>
                    <p className="text-gray-600">Fetching logger data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto rounded-lg">

            {/* 🔥 Tabs + AdminLinks (same as original UI) */}
            <div className="flex mb-1 border-b border-gray-200 justify-between items-center">
                
                {/* Tabs */}
                <div>
                    <button
                        onClick={() => setActiveTab('logger')}
                        className={`px-6 text-xl font-bold ${
                            activeTab === 'logger'
                                ? 'border-b-2 border-orange-800 text-orange-800'
                                : 'text-orange-800'
                        }`}
                    >
                        Logger
                    </button>

                    <button
                        onClick={() => setActiveTab('inverter')}
                        className={`px-6 py-2 text-xl font-bold ${
                            activeTab === 'inverter'
                                ? 'border-b-2 border-orange-800 text-orange-800'
                                : 'text-orange-800'
                        }`}
                    >
                        Inverter
                    </button>
                </div>

                {/* ✅ AdminLinks (FIXED) */}
                {isAdmin && activeTab === 'inverter' && inverterData?.length > 0 && (
                        <AdminLinks
                            user={user}
                            inverterData={inverterData}
                            macId={macId}
                        />
                    )}
            </div>

            {/* Content */}
            <div>
                {activeTab === "logger" ? (
                    <Logger
                        loggerData={loggerData}
                        Type={type}
                    />
                ) : loadingInverter ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-500">Loading inverter...</p>
                    </div>
                ) : (
                    <Inverter
                        inverterData={inverterData}
                        loggerData={loggerData}
                        Type={type}
                        version={software}
                        mac={macId}
                    />
                )}
            </div>
        </div>
    );
};

export default Display;