import { Dialog } from "@headlessui/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import {url} from '../../constants/serverInfo'


const CreateEnggmodal = ({ isOpen, closeModal }) => {
    const [isLoading, setisLoading] = useState(false)
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const sendData = async (data) => {
        try {
            const response = await axios.post(`${url}/eng/createEngg`, { data });

            alert(response.data.message);

        } catch (error) {
            // Backend sent readable message in error.response.data.message
            alert(error.response.data.message);
        }
    };


    const submitHandler = async (data) => {

        await sendData(data);
        // data.preventDefault()
        console.log('submitted')
        // setisLoading(true)
        closeModal()

    }

    useEffect(() => {
    if (isOpen) {
        reset(); // Clear form fields on open
    }
}, [isOpen]);
    return (
        <div>
            <Dialog open={isOpen} onClose={closeModal}>
                <div className="fixed inset-0 bg-black/40" />

                <div className="fixed inset-0 flex items-center justify-center">
                    <Dialog.Panel className="  rounded shadow w-1/3 h-[95%]">

                        <form

                            onSubmit={handleSubmit(submitHandler)}
                            className="max-w-md mx-auto bg-white p-6 rounded-lg shadow"
                        >
                            <h2 className="text-2xl font-bold text-orange-800 text-center">Create New Engineer</h2>

                            <hr />
                            <label className="block mb-3 ">
                                <span className="text-sm font-medium text-orange-700">Name</span>
                                <input
                                    {...register("name", { required: "Name is required" })}
                                    className={`mt-1 block w-full rounded-md border p-1 outline-orange-500 ${errors.name ? "border-red-500" : "border-orange-300"}`}
                                    placeholder="Full name"
                                />
                                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
                            </label>


                            <label className="block mb-3">
                                <span className="text-sm font-medium text-orange-700">Email</span>
                                <input
                                    type="email"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Invalid email format",
                                        },
                                    })} className={`mt-1 block w-full rounded-md border p-1 outline-orange-500 ${errors.email ? "border-red-500" : "border-red-500"}`}
                                    placeholder="you@example.com"
                                />
                                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
                            </label>


                            <label className="block mb-3">
                                <span className="text-sm font-medium text-orange-700">Phone</span>
                                <input
                                    inputMode="tel"
                                    {...register("phone", {
                                        required: "Phone is required",
                                        pattern: {
                                            value: /^\+?[0-9]{7,15}$/,
                                            message: "Invalid phone number",
                                        },
                                    })}
                                    className={`mt-1 block w-full rounded-md border p-1 outline-orange-500 ${errors.phone ? "border-red-500" : "border-red-500"}`}
                                    placeholder="+911234567890"
                                />
                                {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
                            </label>
                            <label className="block mb-3">
                                <span className="text-sm font-medium text-orange-700">State</span>
                                <input
                                    {...register("state", { required: "State is required" })}
                                    className={`mt-1 block w-full rounded-md border p-1 outline-orange-500 ${errors.state ? "border-red-500" : "border-red-500"}`}
                                    placeholder="State"
                                />
                                {errors.state && <p className="text-red-600 text-sm mt-1">{errors.state.message}</p>}
                            </label>


                            <label className="block mb-3">
                                <span className="text-sm font-medium text-orange-700">District</span>
                                <input
                                    {...register("district", { required: "District is required" })}
                                    className={`mt-1 block w-full rounded-md border p-1 outline-orange-500 ${errors.district ? "border-red-500" : "border-red-500"}`}
                                    placeholder="District"
                                />
                                {errors.district && <p className="text-red-600 text-sm mt-1">{errors.district.message}</p>}
                            </label><label className="block mb-4">
                                <span className="text-sm font-medium text-orange-700">Password</span>
                                <input
                                    type="password"
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: { value: 6, message: "Password must be at least 6 characters" },
                                    })}
                                    className={`mt-1 block w-full rounded-md border p-1 outline-orange-500 ${errors.password ? "border-red-500" : "border-red-500"}`}
                                    placeholder="Choose a strong password"
                                />
                                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
                            </label>

                            <hr className="m-2" />
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded-md border border-orange-600 text-orange-800 "
                                    onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700">
                                    Submit
                                </button>
                            </div>

                        </form>



                    </Dialog.Panel>
                </div>
            </Dialog >
        </div >
    )
}

export default CreateEnggmodal