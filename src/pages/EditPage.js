import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { url } from "../constants/serverInfo";
import { useForm } from "react-hook-form";

const inputClass =
    "mt-1 block w-full px-3 py-2 text-base border rounded-lg shadow-sm text-gray-800 " +
    "focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm bg-white";

const labelClass = "block text-sm font-medium text-orange-700 mb-1";

const Editpage = () => {
    const { plantId } = useParams();
    const [plant, setPlant] = useState({});
    const [loading, setLoading] = useState(true);
    const [modelList, setModelList] = useState([]);
    const [productTypeList, setProductTypeList] = useState([]);
    const [systemList, setsystemList] = useState([])

    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    // ----------------------------------------------------------
    // 🔥 Function: Fetch model list dynamically
    // ----------------------------------------------------------
    const fetchModelList = async (productType) => {
        if (!productType) return;

        try {
            const response = await fetch(`${url}/plants/combined-data/m-1/${productType}`);
            const combinedJson = await response.json();
            console.log("modals",combinedJson)

            const modelData =
                combinedJson?.data?.inverterModelList?.data?.ModelList || [];

            const systemtype =
                combinedJson?.data?.systemType?.data?.SystemTypeList || [];

            setModelList(modelData.map(item => item.ModelName));
            setsystemList(systemtype.map(item => item.SystemType));
            
        } catch (err) {
            console.log("Model list fetch error:", err);
        }
    };

    // ----------------------------------------------------------
    // 🔥 onChange for ProductType
    // ----------------------------------------------------------
    const handleProductTypeChange = async (e) => {
        const selectedType = e.target.value;

        setPlant(prev => ({ ...prev, ProductType: selectedType }));

        await fetchModelList(selectedType);

        // Reset inverter model field
        reset(prev => ({
            ...prev,
            ProductType: selectedType,
            InverterModel: ""
        }));
    };

    // -------------------------------------------------
    // 🔥 LOAD DATA ON PAGE LOAD
    // -------------------------------------------------
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // Fetch plant & product types in parallel
                const [plantRes, productTypeRes] = await Promise.all([
                    fetch(`${url}/plants/edit-plant/${plantId}`, { method: "POST" }),
                    fetch(`${url}/plants/edit-palnt/product-type`)
                ]);

                /** Parse plant */
                const plantJson = await plantRes.json();
                const plantData = plantJson?.plant || {};

                setPlant(plantData);
                console.log("plannnnntt:",plantData)

                /** Parse product type list */
                const typeJson = await productTypeRes.json();
                const inverterList = typeJson?.data?.InverterList || [];

                setProductTypeList(inverterList.map(item => item.InverterName));

                /** Fetch model list based on existing ProductType */
                if (plantData.ProductType) {
                    await fetchModelList(plantData.ProductType);
                }

                reset(plantData);

            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (plantId) loadData();
    }, [plantId, reset]);

    // -------------------------------------------------
    // SUBMIT
    // -------------------------------------------------
    const onSubmit = async (formData) => {
        try {
            const res = await fetch(`${url}/plants/update-plant/${plantId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const json = await res.json();
            alert("Plant updated successfully!");
            console.log("Updated:", json);

        } catch (err) {
            console.error("Update failed:", err);
            alert("Error updating plant!");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[200px] text-orange-700 text-lg">
                Loading...
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="text-xl font-bold text-orange-900 m-2 p-2">Plant Details</div>

            <div className="w-[80%] bg-white shadow-lg m-2 p-3 rounded border">

                <form onSubmit={handleSubmit(onSubmit)}>

                    {/* BASIC INFO */}
                    <h1 className="font-bold text-sm text-orange-500 m-2">Basic Info</h1>

                    <div className="grid lg:grid-cols-3 grid-cols-1 gap-4 m-2 p-2">

                        {/* PRODUCT TYPE */}
                        <FieldSelect
                            label="Product"
                            name="ProductType"
                            register={register}
                            options={productTypeList}
                            error={errors.ProductType}
                            onChange={handleProductTypeChange}
                        />

                        {/* MODEL LIST */}
                        <FieldSelect
                            label="Model of Product"
                            name="InverterModel"
                            register={register}
                            options={modelList}
                            error={errors.InverterModel}
                        />

                        <FieldInput
                            label="Name of Plant"
                            name="ProductName"
                            register={register}
                            error={errors.ProductName}
                        />

                        <FieldSelect
                            label="Installation Type"
                            name="InstallationType"
                            register={register}
                            options={[
                                "Residential Rooftop",
                                "Commercial Rooftop",
                                "Industrial Rooftop",
                                "Ground Mounted",
                            ]}
                            error={errors.InstallationType}
                        />

                        <FieldSelect
                            label="System Type"
                            name="systemType"
                            register={register}
                            options={systemList}
                            error={errors.systemType}
                        />

                        <FieldInput
                            label="Address"
                            name="Address"
                            register={register}
                            error={errors.Address}
                        />
                    </div>

                    {/* SYSTEM INFO */}
                    <h1 className="font-bold text-sm text-orange-500 m-2">System Info</h1>

                    <div className="grid lg:grid-cols-3 grid-cols-1 gap-4 m-2 p-2">
                        {[
                            ["InstalltionCapacity", "Installation Capacity (KWh)"],
                            ["BatteryAH", "Battery AH"],
                            ["BatteryCount", "No. of Batteries"],
                            ["TotalCost", "Total Cost (INR)"],
                            ["UnitPrice", "Unit Price (KWh)"]
                        ]
                            .filter(([key]) => plant.ProductType === "GTI" || !["BatteryAH", "BatteryCount"].includes(key))
                            .map(([name, label]) => (
                                <FieldInput
                                    key={name}
                                    label={label}
                                    name={name}
                                    type="number"
                                    number
                                    register={register}
                                    error={errors[name]}
                                />
                            ))}
                    </div>

                    <div className="text-end mr-10 mb-10 pb-2">
                        <button className="mt-4 bg-orange-600 text-white px-4 py-2 rounded">
                            Edit Plant
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

// -------------------------------------------------
// REUSABLE COMPONENTS
// -------------------------------------------------

const FieldInput = ({ label, name, type = "text", register, error, number }) => (
    <div>
        <label className={labelClass}>{label}</label>
        <input
            type={type}
            className={inputClass}
            {...register(name, {
                required: `${label} is required`,
                ...(number && { valueAsNumber: true })
            })}
        />
        {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
);

const FieldSelect = ({ label, name, register, options, error, onChange }) => (
    <div>
        <label className={labelClass}>{label}</label>
        <select
            className={`${inputClass} border-orange-300`}
            {...register(name, { required: `${label} is required` })}
            onChange={onChange}
        >
            <option value="">Please Select</option>
            {options?.map((item, idx) => (
                <option key={idx} value={item}>
                    {item}
                </option>
            ))}
        </select>
        {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
);

export default Editpage;
