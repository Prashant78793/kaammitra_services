import React, { useState } from "react";
import { Send } from "lucide-react";
// We need 'useNavigate' to redirect to the login page
import { useNavigate } from "react-router-dom"; 

const Step1Personal = ({ nextStep, data }) => {
  const [fullName, setFullName] = useState(data.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(data.phoneNumber || "");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Initialize navigate hook

  const handleSendOTP = (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !phoneNumber || phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
      setError("Please enter your full name and a valid 10-digit phone number.");
      return;
    }

    // Optional: Check for existing registration before sending OTP
    const existingProvider = JSON.parse(localStorage.getItem("providerData"));
    if (existingProvider && existingProvider.phoneNumber === phoneNumber) {
        // If registered, show error and suggest login
        setError("This mobile number is already registered. Please login.");
        return;
    }
    
    // Mock OTP sent message (The actual verification happens in Step 2)
    alert(`Mock OTP sent to +91 ${phoneNumber}. (Use '1234' to verify in the next step)`);

    // Move to the next step, carrying the data (Step 2: OTP Verification)
    nextStep({ fullName, phoneNumber });
  };

  return (
    <div className="p-4 rounded-xl">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6 text-center">
        Step 1: Personal Information
      </h2>
      <form onSubmit={handleSendOTP} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name (Mandatory)
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Mobile Number (Mandatory)
          </label>
          <div className="flex mt-1">
            <span className="inline-flex items-center px-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-600 border rounded-l-md">
              +91
            </span>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="10-digit number"
              maxLength="10"
              className="flex-1 block w-full min-w-0 px-3 py-2 border rounded-r-md shadow-sm dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <button
          type="submit"
          className="w-full flex justify-center items-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Send className="w-4 h-4 mr-2" /> NEXT (Send OTP)
        </button>
        
        {/* NEW LOGIN LINK */}
        <p
          className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          onClick={() => navigate("/login")}
        >
          Already registered? <span className="text-blue-600 dark:text-blue-400 font-semibold">Login here</span>
        </p>
        
      </form>
    </div>
  );
};

export default Step1Personal;