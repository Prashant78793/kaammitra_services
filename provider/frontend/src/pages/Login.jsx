import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";


const normalizePhone = (input) => {
  if (!input) return "";
  const digits = String(input).replace(/\D/g, "");
  // handle +91 or leading 0
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(-10);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(-10);
  if (digits.length === 10) return digits;
  return digits; // fallback (may be invalid length)
};

const Login = ({ setIsAuthenticated }) => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  const handleSendOtp = (e) => {
    e.preventDefault();
    setError("");

    const sanitized = normalizePhone(phone);
    if (!sanitized || sanitized.length !== 10) {
      setError("Please enter a valid 10-digit phone number (you can use +91 or 0 prefix).");
      return;
    }

    // keep displayed value normalized so backend lookup matches DB
    setPhone(sanitized);
    setStep(2);
  };

  const handleOtpChange = (value, idx) => {
    if (!/^\d?$/.test(value)) return; // Only allow single digit
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);

    // Move focus to next input if filled
    if (value && idx < 3 && otpRefs[idx + 1]?.current) {
      otpRefs[idx + 1].current.focus();
    }
    // Move focus to previous input if deleted
    if (!value && idx > 0 && otpRefs[idx - 1]?.current) {
      otpRefs[idx - 1].current.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const otpValue = otp.join("");
    if (otpValue.length !== 4 || otpValue !== "1234") {
      setError("Please enter the correct 4-digit OTP (demo: 1234)");
      setLoading(false);
      return;
    }

    try {
      const sanitized = normalizePhone(phone);
      if (!sanitized || sanitized.length !== 10) {
        setError("Invalid phone number. Please go back and enter a valid 10-digit phone number.");
        setLoading(false);
        return;
      }

      // Fetch provider details from backend using normalized phone number
      const res = await axios.get(
        `http://localhost:5000/api/providers/phone/${sanitized}`
      );

     if (res.data) {
  const providerData = res.data.provider;
  const token = res.data.token;

  console.log("JWT Token:", token);  //  ✅ SHOW TOKEN IN CONSOLE
  console.log("Provider login successful:", providerData);

  // save token
  localStorage.setItem("providerToken", token);

  // save provider data
  localStorage.setItem("providerData", JSON.stringify(providerData));
  localStorage.setItem("providerId", providerData._id || providerData.id);
  localStorage.setItem("providerPhone", sanitized);

  setIsAuthenticated(true);
  navigate("/profile");

      } else {
        setError("Provider not found. Please register first.");
      }
    } catch (err) {
      // Log full error for debugging and surface a user-friendly message
      console.error("Login error (full):", err);

      // Prefer server message, fall back to other possible fields
      const serverMsg = err?.response?.data?.message || err?.response?.data;
      const msg = serverMsg
        ? (typeof serverMsg === "string" ? serverMsg : JSON.stringify(serverMsg))
        : err?.message || "Login failed. Please try again.";

      // show readable message in UI
      setError(msg);

      // keep developer console useful
      console.debug("Login error details:", {
        status: err?.response?.status,
        headers: err?.response?.headers,
        data: err?.response?.data,
        message: err?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 w-full max-w-md mx-4 relative">
        {/* Left Arrow Icon */}
        <button
          className="absolute left-4 top-4 text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
          onClick={() => navigate(-1)}
          aria-label="Go Back"
        >
          <FaArrowLeft size={24} />
        </button>

        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700 dark:text-blue-400">
          Provider Login
        </h1>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your 10-digit phone number"
                maxLength={15}
                inputMode="numeric"
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
            >
              Send OTP
            </button>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Register here
              </button>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
              Enter 4-digit OTP (Demo: 1234)
            </label>
            <div className="flex space-x-4 justify-center mb-4">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={otpRefs[idx]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  autoFocus={idx === 0}
                />
              ))}
            </div>
            {error && (
              <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp(["", "", "", ""]);
                setError("");
              }}
              className="w-full py-2 px-4 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md font-medium transition"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;