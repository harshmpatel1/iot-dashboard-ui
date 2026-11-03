import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import {
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import { url } from "../../constants/serverInfo";

export default function ChangePassword() {
  const navigate = useNavigate();

  const { role } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!role || !email) {
      navigate("/login");
    }
  }, [role, email, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!form.currentPassword.trim()) {
      return setError("Current password is required.");
    }

    if (!form.newPassword.trim()) {
      return setError("New password is required.");
    }

    if (form.newPassword.length < 8) {
      return setError("New password must be at least 8 characters.");
    }

    if (form.newPassword !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setLoading(true);

      const { data } = await axios.post(`${url}/auth/change-password`, {
        email,
        role,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setMessage(data.message || "Password changed successfully.");

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-orange-200 p-8">

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
            <Lock className="text-white" size={30} />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800">
          Change Password
        </h2>

        <p className="text-center text-gray-500 mt-2 mb-8">
          {email}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Current Password */}
          <div className="relative">
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Current Password
            </label>

            <input
              type={showCurrent ? "text" : "password"}
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-orange-300 focus:border-orange-500 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-4 top-11 text-gray-500"
            >
              {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              New Password
            </label>

            <input
              type={showNew ? "text" : "password"}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-orange-300 focus:border-orange-500 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-4 top-11 text-gray-500"
            >
              {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Confirm Password
            </label>

            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-orange-300 focus:border-orange-500 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-11 text-gray-500"
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-xl">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 transition text-white py-3 rounded-xl font-semibold shadow-lg"
          >
            {loading ? "Changing Password..." : "Change Password"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-orange-500 hover:text-orange-600 font-semibold"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}