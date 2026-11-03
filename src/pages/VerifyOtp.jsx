import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { url } from "../constants/serverInfo";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { email, role } = location.state || {};

  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!email || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-xl font-semibold text-red-600">
            Invalid Request
          </h2>

          <p className="mt-2 text-gray-600">Please request a new OTP first.</p>

          <button
            onClick={() => navigate("/forgot-password")}
            className="mt-5 w-full bg-blue-600 text-white py-2 rounded-lg"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (formData.newPassword !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);

    try {
      const res = await axios.post(`${url}/auth/reset-password`, {
        email,
        role,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });

      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center">Reset Password</h2>

        <p className="text-gray-500 text-center mt-2">OTP sent to</p>

        <p className="text-blue-600 font-semibold text-center mb-6">{email}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 font-medium">OTP</label>

            <input
              type="text"
              name="otp"
              maxLength={6}
              value={formData.otp}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  otp: e.target.value.replace(/\D/g, ""),
                }))
              }
              placeholder="Enter OTP"
              required
              className="w-full border rounded-lg px-4 py-3 text-center text-xl tracking-[8px] outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">New Password</label>

            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              required
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Confirm Password</label>

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              required
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {message && (
            <div className="bg-green-100 text-green-700 rounded-lg p-3">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600  hover:bg-orange-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
