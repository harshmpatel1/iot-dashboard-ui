import React from 'react';

const AdminLinks = ({ user, inverterData, macId }) => {
    // console.log("inverterdata in adminlinks", inverterData);
    // console.log("user in adminlinks", user);
    if (user?.role !== 'admin' || !inverterData?.length) return null;

    const phase = inverterData[0]?.phase || inverterData[0]?.PHASE;

    let link = null;

    if (phase === "GTI_1_3") {
        link = `http://eastmanone.com/eastmanapp/user/Eastmen_Get/EastmanGTIData_new.php?cid=${macId}`;
    } else if (phase === "GTI_Abore_3phase") {
        link = `http://eastmanone.com/eastmanapp/user/Eastmen_Get/EastmanGTIAforeData3phase_new.php?cid=${macId}`;
    } else if (phase === "ThinkPower_1_3") {
        link = `http://eastmanone.com/eastmanapp/user/Eastmen_Get/EastmanThinkPower_Inveter_new.php?cid=${macId}`;
    }else if (phase === "Afore_Hybrid") {
        link = `http://eastmanone.com/eastmanapp/user/EastmanHybrid_new.php?cid=${macId}`;
    }else if (phase === "WATECH") {
        link = `http://eastmanone.com/eastmanapp/user/Eastmen_Get/EastmanGTIWatech.php?cid=${macId}`;
    }else if (phase === "GTI_Abore_1phase") {
        link = `http://eastmanone.com/eastmanapp/user/Eastmen_Get/EastmanGTIAforeData1phase_new.php?cid=${macId}`;
    }
    if (!link) return null;

    return (
        <div className=" text-sm font-semibold  rounded-lg  flex items-center gap-2">
            {/* Icon */}
          

            {/* Link */}
            <a
                href={link}
                target="_blank"
                // rel="noopener noreferrer"
                className="hover:underline underline"
            >
                open Logs
            </a>
        </div>
    );
};

export default AdminLinks;