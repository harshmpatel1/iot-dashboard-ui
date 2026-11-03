import { useState, useEffect } from "react";
import UploadFormModel from "./UploadFormModel";
import { fetchInverterLoggerDataWithMacId } from '../api/mockApis';
// import UploadFormModeltemp from "./UploadFormModeltemp";
import { useParams } from "react-router-dom";
import { url } from "../constants/serverInfo";
import InverterUpdateLogTable from "./InverterUpdateLogTable ";

const UploadForm = () => {
  const { macId } = useParams()
  const [InverterData, setInverterData] = useState()
  const [selectedData, setselectedData] = useState(null)
  // console.log("maccc id", macId)
  const [date, setdate] = useState(new Date());
  const [LoggerData, setLoggerData] = useState()
  const [Upgrade, setUpgrade] = useState(true)
  const [log, setlog] = useState(false)
  const [btnDisabled, setBtnDisabled] = useState(false);



  useEffect(() => {

    async function fetchData() {
      try {
        if (!macId) {
          console.log('No macId provided');
          return;
        }
        // console.log('maccamca', macId);
        let m = await fetchInverterLoggerDataWithMacId(macId);
        // console.log("m hu tera data:", m)

        // setInverterData(m.inverterData);
        setLoggerData(m.loggerData);
        // console.log("Loggerdata",LoggerData)
        // setSoftware(m.loggerData[0].MODSOFTVER);
        // setMcId(macId)
      } catch (err) {
        console.error('Failed to fetch devices:', err);
      }
    }
    fetchData();
    const interval = setInterval(() => {
      setdate(new Date());
    }, 1000);




    return () => clearInterval(interval);
  }, []);

  const currentDateTime =
    date.toLocaleDateString() + "  " + date.toLocaleTimeString();

  const [isOpen, setIsOpen] = useState(false);
  // const [temp, settemp] = useState(false);

  // const closetemp = () => settemp(false);

  const closemodel = (selectedData) => {
    setIsOpen(false)
    console.log("selected data:", selectedData)
    if (selectedData?._targetInst === null) {
      setselectedData(null)
      return
    }
    setselectedData(selectedData)
  };


  const LastUpgrade = () => (
    <div className=" w-full h-[30vh] mt-3 bg-gray-100  rounded-xl border">
      <div className="p-2 text-sm">Last Upgrade Record</div>
      <div className="grid grid-cols-3 gap-4 p-2 text-[10px]">
        <div>
          <div className="text-gray-600">Target Vision: </div>
          <div>1234</div>
        </div>
        <div>
          <div className="text-gray-600">Related Vision: </div>
          <div>Communication CPU Software Vision</div>
        </div>

      </div>
      <div className="grid grid-cols-3 gap-4 p-2 text-[10px]">
        <div>
          <div className="text-gray-600">Upgrade Phase: </div>
          <div className="flex gap-2 text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              color="#2eaf37"
              fill="none"
            >
              <path
                d="M21.8966 6.63081C22.2168 7.52828 21.7678 8.14274 20.8986 8.748C20.1973 9.23636 19.3039 9.76542 18.3572 10.6699C17.4291 11.5566 16.5234 12.6246 15.7184 13.6758C14.743 14.9496 13.8206 16.2801 13.0087 17.6655C12.7026 18.1902 12.1521 18.5078 11.5619 18.4999C10.9716 18.4919 10.4293 18.1597 10.1364 17.6267C9.38765 16.264 8.80986 15.7259 8.5443 15.5326C7.8075 14.9963 7 14.9035 7 13.7335C7 12.7762 7.74623 12.0002 8.66675 12.0002C9.32548 12.0266 9.92854 12.3088 10.4559 12.6927C10.7981 12.9418 11.1605 13.2711 11.5375 13.7047C11.9799 13.051 12.5131 12.2968 13.1107 11.5163C13.9787 10.3829 15.0032 9.16689 16.1019 8.11719C17.1819 7.08531 18.4306 6.11941 19.7542 5.60872C20.6172 5.27573 21.5764 5.73333 21.8966 6.63081Z"
                stroke="#2eaf37"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M4.43961 12.0755C4.28117 12.0236 4.13796 11.9909 4.01252 11.9713C3.94995 11.9615 3.89226 11.955 3.83976 11.951L3.69887 11.9454C2.76061 11.9454 2 12.728 2 13.6933C2 14.5669 2.62294 15.2908 3.43675 15.4205C3.4652 15.4355 3.51137 15.4624 3.57407 15.5076C3.84474 15.7025 4.43367 16.2452 5.19686 17.6193C5.49542 18.1569 6.04811 18.4918 6.64983 18.4999C7.06202 18.5054 7.45518 18.3567 7.76226 18.0924M15 5.5C13.6509 6.015 12.3781 6.98904 11.2773 8.02963C10.8929 8.39299 10.5174 8.77611 10.1542 9.16884"
                stroke="#2eaf37"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>{" "}
            succeeded
          </div>
        </div>
        <div>
          <div className="text-gray-600">Upgrade Time: </div>
          <div>{currentDateTime}</div>
        </div>
        <div>
          <div className="text-gray-600">Timeout: </div>
          <div>20 Min</div>
        </div>
      </div>
    </div>
  );

  const CurrentRecord = () => (
    <div className=" w-full h-[30vh] mt-3 bg-gray-100  rounded-xl border">
      <div className="p-2 text-sm">Current Version Info</div>
      <div className="grid grid-cols-3 gap-4 p-2 text-[10px]">
        <div>
          <div className="text-gray-600">Protocol Version: </div>
          <div>1234</div>
        </div>
        <div>
          <div className="text-gray-600">Control Software Version 1: </div>
          <div>Communication CPU Software Vision</div>
        </div>
        <div>
          <div className="text-gray-600">HMI: </div>
          <div>Communication CPU Software Vision</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 p-2 text-[10px]">
        <div>
          <div className="text-gray-600">Communication CPU Software version: </div>
          <div className="flex gap-2 text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              color="#2eaf37"
              fill="none"
            >
              <path
                d="M21.8966 6.63081C22.2168 7.52828 21.7678 8.14274 20.8986 8.748C20.1973 9.23636 19.3039 9.76542 18.3572 10.6699C17.4291 11.5566 16.5234 12.6246 15.7184 13.6758C14.743 14.9496 13.8206 16.2801 13.0087 17.6655C12.7026 18.1902 12.1521 18.5078 11.5619 18.4999C10.9716 18.4919 10.4293 18.1597 10.1364 17.6267C9.38765 16.264 8.80986 15.7259 8.5443 15.5326C7.8075 14.9963 7 14.9035 7 13.7335C7 12.7762 7.74623 12.0002 8.66675 12.0002C9.32548 12.0266 9.92854 12.3088 10.4559 12.6927C10.7981 12.9418 11.1605 13.2711 11.5375 13.7047C11.9799 13.051 12.5131 12.2968 13.1107 11.5163C13.9787 10.3829 15.0032 9.16689 16.1019 8.11719C17.1819 7.08531 18.4306 6.11941 19.7542 5.60872C20.6172 5.27573 21.5764 5.73333 21.8966 6.63081Z"
                stroke="#2eaf37"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M4.43961 12.0755C4.28117 12.0236 4.13796 11.9909 4.01252 11.9713C3.94995 11.9615 3.89226 11.955 3.83976 11.951L3.69887 11.9454C2.76061 11.9454 2 12.728 2 13.6933C2 14.5669 2.62294 15.2908 3.43675 15.4205C3.4652 15.4355 3.51137 15.4624 3.57407 15.5076C3.84474 15.7025 4.43367 16.2452 5.19686 17.6193C5.49542 18.1569 6.04811 18.4918 6.64983 18.4999C7.06202 18.5054 7.45518 18.3567 7.76226 18.0924M15 5.5C13.6509 6.015 12.3781 6.98904 11.2773 8.02963C10.8929 8.39299 10.5174 8.77611 10.1542 9.16884"
                stroke="#2eaf37"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>{" "}
            succeeded
          </div>
        </div>
        <div>
          <div className="text-gray-600">Control Software Version 2: </div>
          <div>{currentDateTime}</div>
        </div>
        <div>
          <div className="text-gray-600">MAIN: </div>
          <div>20 Min</div>
        </div>
      </div>
    </div>
  );

  console.log("Loggerdata", LoggerData)
  // console.log("InverterData", InverterData)


  console.log("phase:", LoggerData?.[0]?.phase)



  const storeupdaterecord = async (param) => {
    try {
      const res = await fetch(`${url}/upload/firm_ware/successupgrade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(param)   // Add if sending data
      });

      const data = await res.json();
      console.log("API Response of after update:", data);
      if (data.success === true) {
        alert("Updated..")
      }

    } catch (error) {
      alert("don't Updated")
      console.error("API Error:", error);
    }
  }

  const call1stapi = async () => {
    setBtnDisabled(true)
    // console.log("firwmware selected :", selectedData)
    // console.log("macccc",LoggerData?.[0].MAC)
    const now = new Date();

    // 5 hours 30 minutes = 5.5 * 60 * 60 * 1000 ms
    const istDate = new Date(now.getTime() + (5 * 60 + 30) * 60 * 1000);
    console.log("time",istDate)
    const param = {
      macId: LoggerData?.[0]?.MAC,
      startdate: istDate,
      software_package_name: selectedData?.file_name,
      old_INVCPLDSOFT: LoggerData?.[0]?.INVCPLDSOFT,
      old_INVHMISOFT: LoggerData?.[0]?.INVHMISOFT,
      old_INVMSTRFWVR: LoggerData?.[0]?.INVMSTRFWVR,
      old_INVPROTVR: LoggerData?.[0]?.INVPROTVR,
      old_INVSLAVFWVR: LoggerData?.[0]?.INVSLAVFWVR,
      old_CNTFWVR: LoggerData?.[0]?.CNTFWVR,
      old_COMFWVR: LoggerData?.[0]?.COMFWVR,
      old_PROVER: LoggerData?.[0]?.PROVER,
    }

    // console.log("param",param)
    try {
      const res = await fetch(`${url}/upload/firm_ware/api1`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(param)   // Add if sending data
      });

      const data = await res.json();
      console.log("API Response 1st DB:", data);
      if (data.success === true) {
        console.log("data.insertedId", data.insertedId)
        const row = data.insertedId
        // setrowno(row)
        startupgrading(row)
      }

    } catch (error) {
      console.error("API Error:", error);
    }
  };


  const startupgrading = async (row) => {
    try {
      // const raw = JSON.stringify({
      //   "mac": macId,
      //   "fileName": selectedData?.file_name,
      //   "type": selectedData?.Controller
      // });
      // const row=row;


      const raw = JSON.stringify({
        "mac": "acd929a73195",
        "fileName": "MCU2-3KV8341-0116-0607.hex",
        "type": "1"
      })
      const res = await fetch("http://eastmanone.com:3001/change-firmware", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: raw
      });

      const data = await res.json();
      console.log("API Response:", data);

      if (data.success === true) {
        // setapistatus(true)
        monitoring(row, data)
      }
      else {
        const now = new Date();

        // 5 hours 30 minutes = 5.5 * 60 * 60 * 1000 ms
        const istDate = new Date(now.getTime() + (5 * 60 + 30) * 60 * 1000);
        
        const param = {
          id: row,
          enddate:istDate,
          status: 'FAIL',
          reason_of_failure: data?.error,
          new_INVCPLDSOFT: LoggerData?.[0]?.INVCPLDSOFT,
          new_INVHMISOFT: LoggerData?.[0]?.INVHMISOFT,
          new_INVMSTRFWVR: LoggerData?.[0]?.INVMSTRFWVR,
          new_INVPROTVR: LoggerData?.[0]?.INVPROTVR,
          new_INVSLAVFWVR: LoggerData?.[0]?.INVSLAVFWVR,
          new_CNTFWVR: LoggerData?.[0]?.CNTFWVR,
          new_COMFWVR: LoggerData?.[0]?.COMFWVR,
          new_PROVER: LoggerData?.[0]?.PROVER
        }
        storeupdaterecord(param)
      }

    } catch (error) {
      console.error("API Error:", error);
    }
  };


  const monitoring = async (row, status) => {
    const data = await storeresponse(row);
    console.log("API Data:", data);
    console.log("status:", status);

    if (!data?.body?.[0]) {
      console.log("Invalid API data. Stopping.");
      return;
    }

    // ------------------------
    // START MATCHING FUNCTION  
    // ------------------------
    const startMatching = () => {
      console.log("Monitoring Started...");
      let param;

      const intervalId = setInterval(() => {
        console.log("Checking every 5 sec...");

        const oldVal = data.body[0];
        const newVal = LoggerData?.[0];

        const isNotUpdated =
          oldVal.old_INVCPLDSOFT === newVal?.INVCPLDSOFT ||
          oldVal.old_INVHMISOFT === newVal?.INVHMISOFT ||
          oldVal.old_INVMSTRFWVR === newVal?.INVMSTRFWVR ||
          oldVal.old_INVPROTVR === newVal?.INVPROTVR ||
          oldVal.old_INVSLAVFWVR === newVal?.INVSLAVFWVR ||
          oldVal.old_CNTFWVR === newVal?.CNTFWVR ||
          oldVal.old_COMFWVR === newVal?.COMFWVR ||
          oldVal.old_PROVER === newVal?.PROVER;


        if (isNotUpdated) {
          console.log("❌ Not Updated");
          param = {
            id: row,
            enddate: newVal?.server_datetime,
            status: "FAIL",
            reason_of_failure: "No Response From IOT Device",
            new_INVCPLDSOFT: newVal?.INVCPLDSOFT,
            new_INVHMISOFT: newVal?.INVHMISOFT,
            new_INVMSTRFWVR: newVal?.INVMSTRFWVR,
            new_INVPROTVR: newVal?.INVPROTVR,
            new_INVSLAVFWVR: newVal?.INVSLAVFWVR,
            new_CNTFWVR: newVal?.CNTFWVR,
            new_COMFWVR: newVal?.COMFWVR,
            new_PROVER: newVal?.PROVER,
          };
        } else {
          console.log("✅ Updated Successfully");
          param = {
            id: row,
            enddate: newVal?.server_datetime,
            status: "PASS",
            reason_of_failure: "-",
            new_INVCPLDSOFT: newVal?.INVCPLDSOFT,
            new_INVHMISOFT: newVal?.INVHMISOFT,
            new_INVMSTRFWVR: newVal?.INVMSTRFWVR,
            new_INVPROTVR: newVal?.INVPROTVR,
            new_INVSLAVFWVR: newVal?.INVSLAVFWVR,
            new_CNTFWVR: newVal?.CNTFWVR,
            new_COMFWVR: newVal?.COMFWVR,
            new_PROVER: newVal?.PROVER,
          };
        }

        console.log("param:", param);
      }, 10000); // every 10 seconds


      // STOP AFTER 20 MINUTES
      setTimeout(() => {
        clearInterval(intervalId);
        console.log("⏹ Stopped monitoring after 20 minutes");
        storeupdaterecord(param)
      }, 60 * 1000);
    };

    startMatching();
  };


  const storeresponse = async (row) => {
    console.log("sending id:", row)
    try {
      const res = await fetch(`${url}/upload/firm_ware/api2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ row })  // Correct
      });

      const data = await res.json();
      console.log("API Response from db:", data);

      if (data.success) return data;

    } catch (error) {
      console.error("API Error:", error);
    }
  };



  const handleupgrade = () => {

    setUpgrade(true)
    setlog(false)
  }

  const handlelog = () => {
    setUpgrade(false)
    setlog(true)
  }

  return (
    <div className="relative z-0 ">
      <div className="flex justify-between items-center sticky top-0 ">
        <div>
          <p className="text-sm">Inverter:{LoggerData && LoggerData.length > 0 && LoggerData[0].INVTRSRNO}</p>
          <p className="flex  items-center gap-2 text-[10px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="12"
              height="12"
              color="#2eaf37"
              fill="none"
            >
              <path
                d="M12 11L12 20"
                stroke="#2eaf37"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M14 9C14 10.1046 13.1046 11 12 11C10.8954 11 10 10.1046 10 9C10 7.89543 10.8954 7 12 7C13.1046 7 14 7.89543 14 9Z"
                stroke="#2eaf37"
                strokeWidth="1.5"
              />
              <path
                d="M16.9588 6C17.6186 6.86961 18 7.89801 18 9C18 10.102 17.6186 11.1304 16.9588 12M7.04117 6C6.38143 6.86961 6 7.89801 6 9C6 10.102 6.38143 11.1304 7.04117 12"
                stroke="#2eaf37"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20.3159 4C21.3796 5.43008 22 7.14984 22 9C22 10.8502 21.3796 12.5699 20.3159 14M3.68409 4C2.62036 5.43008 2 7.14984 2 9C2 10.8502 2.62036 12.5699 3.68409 14"
                stroke="#2eaf37"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Online
          </p>
          <div className="flex justify-start items-center gap-6">
            <div>
              <h1 className="font-bold text-blue-600 cursor-pointer" onClick={handleupgrade}>Firmware upgrade</h1>
              {Upgrade && <div className="border-[1px] border-blue-600 w-36"></div>}
            </div>
            <div>
              <h1 className="font-bold text-blue-600 cursor-pointer" onClick={handlelog}>Upgrade Log</h1>
              {log && <div className="border-[1px] border-blue-600 w-24"></div>}
            </div>
          </div>

        </div>
        <div className="text-sm">{currentDateTime}</div>
      </div>
      <hr className="m-2" />
      <div className="h-[80%] ">
        {Upgrade && <div className=" absolute h-[75vh] w-[100%]">
          <CurrentRecord />
          <LastUpgrade />
          {/* <UpgradeRecord /> */}
          <div className=" w-full h-[30vh] mt-3 mb-3 border rounded-xl  bg-gray-100">
            <div className="p-2 text-sm">Upgrade Options</div>
            <div className="text-[10px] ml-2 ">
              <div className="text-gray-600 p-2">Select Firmware Package:</div>
              <button
                className="border-2  border-gray-300 px-5 py-2"
                onClick={() => setIsOpen(true)}
              >
                click Select Firmware Package
              </button>
              {/* popup after clicking the button */}
              {isOpen && <UploadFormModel closemodel={closemodel} />}
            </div>
            <div className="flex justify-between p-2 items-center ">
              {/* <button className="bg-blue-500 px-5 py-1 rounded-full text-white mr-5" 
            onClick={() => settemp(true)}>
              Start Adding
            </button> */}
              {/* popup after clicking the button */}
              {/* {temp && <UploadFormModeltemp closetemp={closetemp} />} */}
              <div>
                <p className="text-gray-600 text-[10px]">Timeout: </p>
                <input type="number" className="border w-16 pl-1 outline-none" defaultValue={20}></input>
              </div>
              <div>
                {
                  (selectedData != null) && <button className={`${btnDisabled == false ? "bg-blue-500 px-5 py-1 rounded-full text-white ": "bg-blue-500 px-5 py-1 rounded-full text-white cursor-not-allowed opacity-60"} px-5 py-1 rounded-full text-white`} onClick={call1stapi} disabled={btnDisabled}>
                    Start Upgrading
                  </button>
                }

              </div>
            </div>
          </div>
        </div>}
        {log && <InverterUpdateLogTable LoggerData={LoggerData} />}
      </div>

    </div>
  );
};

export default UploadForm;
