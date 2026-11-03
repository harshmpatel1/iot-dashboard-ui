import React, { useEffect, useState } from "react";
import { url } from "../constants/serverInfo";
import { useParams } from "react-router-dom";

const InverterUpdateLogTable = ({ LoggerData }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const { macId } = useParams();

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${url}/upload/inverter/logs/${macId}`);
      const data = await res.json();

      if (data?.success) {
        setLogs(data.data || []);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setLogs([]);
    } finally {
      setLoading(false); // ✅ REQUIRED
    }
  };

  useEffect(() => {
    if (macId) {
      fetchLogs();
    }
  }, [macId, refresh]);

  const handleRefresh = () => {
    setRefresh(prev => !prev); // ✅ Force re-fetch
  };

  return (
    <div className="p-5">
      <div className="flex justify-between items">
        <h2 className="text-xl font-bold mb-2">Inverter Update Log</h2>

        <button
          onClick={handleRefresh}
          className="mb-3 px-4 py-1 rounded bg-blue-500 text-white"
        >
          Refresh
        </button>
      </div>

      {
        loading ?
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            {/* Spinner */}
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>

            {/* Text */}
            <p className="text-sm text-gray-500 tracking-wide">
              Loading data, please wait…
            </p>
          </div>
          :
          <div className="rounded-lg border border-gray-300  overflow-scroll">
            <table className="min-w-full bg-white text-[10px] h-80">
              <thead className="bg-gray-100 border-b sticky top-0 h-10">
                <tr>
                  <th className="py-1 px-1 text-left">Start Date</th>
                  <th className="py-1 px-3 text-left">Package Name</th>
                  <th className="py-1 px-1 text-left">Status</th>
                  <th className="py-1 px-1 text-left">Reason of Failure</th>
                  <th className="py-1 px-1 text-left">End Date</th>

                  {LoggerData?.[0]?.phase === "GTI_1_3" && (
                    <>
                      <th>old CNTFWVR</th>
                      <th>old COMFWVR</th>
                      <th>new CNTFWVR</th>
                      <th>new COMFWVR</th>
                    </>
                  )}

                  {LoggerData?.[0]?.phase === "GTI_Abore_3phase" && (
                    <>
                      <th>old INVCPLDSOFT</th>
                      <th>old INVHMISOFT</th>
                      <th>old INVMSTRFWVR</th>
                      <th>old INVPROTVR</th>
                      <th>old INVSLAVFWVR</th>
                      <th>new INVCPLDSOFT</th>
                      <th>new INVHMISOFT</th>
                      <th>new INVMSTRFWVR</th>
                      <th>new INVPROTVR</th>
                      <th>new INVSLAVFWVR</th>
                    </>
                  )}

                  {LoggerData?.[0]?.phase === "ThinkPower_1_3" && (
                    <>
                      <th>old CNTFWVR</th>
                      <th>old PROVER</th>
                      <th>new CNTFWVR</th>
                      <th>new PROVER</th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody>
                {logs.length > 0 ? (
                  logs.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-2 px-3">{row.startdate}</td>
                      <td className="py-2 px-3">
                        {row.software_package_name}
                      </td>

                      <td
                        className={`py-2 px-3 font-semibold ${row.status === "PASS"
                          ? "text-green-600"
                          : "text-red-600"
                          }`}
                      >
                        {row.status || "Processing..."}
                      </td>

                      <td className="py-2 px-3">
                        {row.reason_of_failure || "-"}
                      </td>

                      <td className="py-2 px-3">{row.enddate}</td>

                      {LoggerData?.[0]?.phase === "GTI_1_3" && (
                        <>
                          <td>{row.old_CNTFWVR}</td>
                          <td>{row.old_COMFWVR}</td>
                          <td>{row.new_CNTFWVR}</td>
                          <td>{row.new_COMFWVR}</td>
                        </>
                      )}

                      {LoggerData?.[0]?.phase === "GTI_Abore_3phase" && (
                        <>
                          <td>{row.old_INVCPLDSOFT}</td>
                          <td>{row.old_INVHMISOFT}</td>
                          <td>{row.old_INVMSTRFWVR}</td>
                          <td>{row.old_INVPROTVR}</td>
                          <td>{row.old_INVSLAVFWVR}</td>
                          <td>{row.new_INVCPLDSOFT}</td>
                          <td>{row.new_INVHMISOFT}</td>
                          <td>{row.new_INVMSTRFWVR}</td>
                          <td>{row.new_INVPROTVR}</td>
                          <td>{row.new_INVSLAVFWVR}</td>
                        </>
                      )}

                      {LoggerData?.[0]?.phase === "ThinkPower_1_3" && (
                        <>
                          <td>{row.old_CNTFWVR}</td>
                          <td>{row.old_PROVER}</td>
                          <td>{row.new_CNTFWVR}</td>
                          <td>{row.new_PROVER}</td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={12}
                      className="py-4 text-center"
                    >
                      No Records Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      }
    </div>
  )
};

export default InverterUpdateLogTable;
