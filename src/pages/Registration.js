import { useState } from "react";
import { url as org } from "../constants/serverInfo";

export default function App() {
  const [formData, setFormData] = useState({ type: "NON GTI", imei: "", serial: "", phase: "", csvFile: null });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper to update state
  const update = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e, isCsv = false) => {
    e.preventDefault();
    setLoading(true);
    
    // Switch between URLSearchParams (Normal) and FormData (Files)
    let body, url, contentType;

    if (isCsv) {
      url = `${org}/iot/upload-iot-csv`;
      // url = `${url}/upload/firm_ware/successupgrade`;
      body = new FormData();
      body.append("type", formData.type);
      body.append("csvFile", formData.csvFile);
      // Fetch automatically sets multipart/form-data for FormData
    } else {
      url = `${org}/iot/register-iot-master`;
      body = new URLSearchParams({
        type: formData.type,
        imei_no: formData.imei,
        serial_no: formData.serial,
        ...(formData.type === "GTI" || formData.type === "HYBRID") && { phase: formData.phase }
      });
      contentType = "application/x-www-form-urlencoded";
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: contentType ? { "Content-Type": contentType } : {},
        body: body.toString() && !isCsv ? body.toString() : body,
      });
      setMessage(await res.text());
    } catch (err) {
      setMessage("Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center gap-6">
      <div className="w-full max-w-xl space-y-6">
        
        {/* Unified Card */}
        <section className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl text-orange-500 font-bold mb-4">Register MAC</h2>
          
          <div className="space-y-4">
            <select className="w-full border p-2 rounded " value={formData.type} onChange={e => update("type", e.target.value)}>
              <option value="NON GTI" className="bg-orange-500 text-white">NON GTI</option>
              <option value="GTI" className="bg-orange-500 text-white">GTI</option>
              <option value="HYBRID" className="bg-orange-500 text-white">HYBRID</option>
            </select>

            {/* Direct Registration Form */}
            <form onSubmit={e => handleSubmit(e, false)} className="grid grid-cols-1 gap-3 border-t pt-4">
              <input placeholder="IMEI No" className="border p-2 rounded" required onChange={e => update("imei", e.target.value)} />
              <input placeholder="Serial No" className="border p-2 rounded" required onChange={e => update("serial", e.target.value)} />
              {formData.type === "GTI" && (
                <select className="border p-2 rounded" required onChange={e => update("phase", e.target.value)}>
                  <option value="">Select Model</option>
                  <option value="GTI_1_3">GTI DEYE</option>
                  <option value="GTI_Abore_1phase">Afore Single Phase</option>
                  <option value="GTI_Abore_3phase">Afore Three Phase</option>
                  <option value="ThinkPower_1_3">Thinkpower</option>
                  <option value="WATECH">Watech</option>
                </select>
              )}
               {formData.type === "HYBRID" && (
                <select className="border p-2 rounded" required onChange={e => update("phase", e.target.value)}>
                  <option value="">Select Model</option>
                  <option value="Afore_Hybrid">Afore Hybrid</option>
                  <option value="SRNE_Hybrid">SRNE Hybrid</option>
                </select>
              )}
              <button disabled={loading} className="bg-orange-500 text-white p-2 rounded hover:bg-orange-600 disabled:opacity-50">
                {loading ? "Processing..." : "Register Single Device"}
              </button>
            </form>

            {/* Bulk Upload Form */}
            <form onSubmit={e => handleSubmit(e, true)} className="grid grid-cols-1 gap-3 border-t pt-4">
              <p className="text-sm font-semibold text-gray-500">Bulk Upload (CSV)</p>
              <input type="file" accept=".csv" required onChange={e => update("csvFile", e.target.files[0])} />
              <button disabled={loading} className="bg-orange-500 text-white p-2 rounded hover:bg-orange-600 disabled:opacity-50">
                Upload CSV
              </button>
            </form>
          </div>
        </section>

        {message && <div className="p-4 bg-black text-green-400 font-mono text-sm rounded-lg break-all">{message}</div>}
      </div>
    </div>
  );
}